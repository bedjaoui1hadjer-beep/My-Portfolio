
(function () {
    const TOTAL_FRAMES = 240;
    const FRAME_PATH = (i) =>
        `images/scroll-frames/frame_${String(i).padStart(4, "0")}.jpg`;

    const section = document.getElementById("scroll-video");
    const sticky = document.querySelector(".scroll-video-sticky");
    const canvas = document.getElementById("scrollVideoCanvas");
    const header = document.querySelector("header");
    if (!section || !sticky || !canvas) return;

    const ctx = canvas.getContext("2d");
    const images = new Array(TOTAL_FRAMES);
    let currentFrame = -1;
    let navbarHeight = 0;

    // The nav bar wraps onto extra lines on narrow screens, so its height
    // isn't fixed — measure it for real instead of hardcoding a value.
    function updateNavbarHeight() {
        navbarHeight = header ? header.offsetHeight : 0;
        document.documentElement.style.setProperty(
            "--navbar-height",
            `${navbarHeight}px`
        );
    }

    function preloadImages() {
        let loaded = 0;
        for (let i = 0; i < TOTAL_FRAMES; i++) {
            const img = new Image();
            img.src = FRAME_PATH(i + 1);
            img.onload = () => {
                loaded++;
                if (loaded === 1) drawFrame(0);
            };
            images[i] = img;
        }
    }

    const ASPECT_W = 9;
    const ASPECT_H = 16;

    function getBoxSize() {
        const availableH = window.innerHeight - navbarHeight;
        const isCompact = window.innerWidth <= 1100;
        // On mobile the skill cards stack above/below the video instead of
        // beside it, so the canvas needs to leave room for them.
        const maxH = availableH * (isCompact ? 0.56 : 0.9);
        const maxW = window.innerWidth * (isCompact ? 0.86 : 0.92);

        let h = maxH;
        let w = (h * ASPECT_W) / ASPECT_H;

        if (w > maxW) {
            w = maxW;
            h = (w * ASPECT_H) / ASPECT_W;
        }

        return { w, h };
    }

    function resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const { w, h } = getBoxSize();

        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
    }

    function drawFrame(index) {
        const img = images[index];
        if (!img || !img.complete || !img.naturalWidth) return;

        const cw = canvas.width;
        const ch = canvas.height;
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;

        const scale = Math.max(cw / iw, ch / ih);
        const nw = iw * scale;
        const nh = ih * scale;
        const nx = (cw - nw) / 2;
        const ny = (ch - nh) / 2;

        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, nx, ny, nw, nh);
    }

    function updatePinState() {
        const rect = section.getBoundingClientRect();
        const viewportH = window.innerHeight;

        if (rect.top > 0) {
            // Section hasn't reached the top of the viewport yet
            sticky.classList.remove("is-pinned", "is-bottom");
        } else if (rect.bottom <= viewportH) {
            // Scrolled past the section's bottom — park at the bottom
            sticky.classList.remove("is-pinned");
            sticky.classList.add("is-bottom");
        } else {
            // Actively scrolling through the section — pin in place
            sticky.classList.remove("is-bottom");
            sticky.classList.add("is-pinned");
        }
    }

    function updateFrameFromScroll() {
        const rect = section.getBoundingClientRect();
        const scrollableDistance = section.offsetHeight - window.innerHeight;
        if (scrollableDistance <= 0) return;

        const scrolled = -rect.top;
        let progress = scrolled / scrollableDistance;
        progress = Math.min(Math.max(progress, 0), 1);

        const frameIndex = Math.min(
            TOTAL_FRAMES - 1,
            Math.floor(progress * (TOTAL_FRAMES - 1))
        );

        if (frameIndex !== currentFrame) {
            currentFrame = frameIndex;
            drawFrame(frameIndex);
        }

        updateSkillsFromProgress(progress);
    }

    const skillsLeft = document.getElementById("scrollSkillsLeft");
    const skillsRight = document.getElementById("scrollSkillsRight");
    const SKILL_STAGES = [
        {
            left: { icon: "fa-code", title: "Languages", skills: ["JavaScript", "PHP", "Java", "Python", "Dart", "SQL"] },
            right: { icon: "fa-toolbox", title: "Tools", skills: ["Git & GitHub", "Docker", "VS Code", "XAMPP", "n8n"] },
        },
        {
            left: { icon: "fa-server", title: "Backend", skills: ["Laravel", "PHP", "MySQL", "REST APIs", "Authentication"] },
            right: { icon: "fa-display", title: "Frontend", skills: ["HTML5 & CSS3", "React", "Flutter", "Responsive Design"] },
        },
        {
            left: { icon: "fa-lightbulb", title: "Concepts", skills: ["OOP", "MVC", "Clean Architecture", "API Design", "Data Structures"] },
            right: { icon: "fa-bullseye", title: "Focus", skills: ["UI/UX", "Full-Stack Apps", "Mobile Development"] },
        },
    ];
    let currentStage = -1;

    // Renders the same skill-category card markup used in the static
    // skills grid below, so the scroll-synced panels match its design.
    function renderPanel(el, data) {
        if (!el || !data) return;
        el.innerHTML =
            `<h3><i class="fa-solid ${data.icon}"></i> ${data.title}</h3>` +
            `<div class="skill-tags">${data.skills.map((s) => `<span>${s}</span>`).join("")}</div>`;
        el.classList.remove("is-transitioning");
        // Force reflow so the animation can retrigger on repeated stage changes
        void el.offsetWidth;
        el.classList.add("is-transitioning");
    }

    function updateSkillsFromProgress(progress) {
        if (!skillsLeft && !skillsRight) return;
        const stageIndex = Math.min(
            SKILL_STAGES.length - 1,
            Math.floor(progress * SKILL_STAGES.length)
        );
        if (stageIndex === currentStage) return;
        currentStage = stageIndex;
        const stage = SKILL_STAGES[stageIndex];
        renderPanel(skillsLeft, stage.left);
        renderPanel(skillsRight, stage.right);
    }

    let ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            updatePinState();
            updateFrameFromScroll();
            ticking = false;
        });
    }

    function onResize() {
        updateNavbarHeight();
        resizeCanvas();
        updatePinState();
        drawFrame(Math.max(currentFrame, 0));
    }

    updateNavbarHeight();
    resizeCanvas();
    preloadImages();
    updatePinState();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("load", () => {
        updateNavbarHeight();
        resizeCanvas();
        updatePinState();
        updateFrameFromScroll();
    });
})();
