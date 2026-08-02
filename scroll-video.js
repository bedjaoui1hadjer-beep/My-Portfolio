
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

    function getReservedHeight() {
        if (window.innerWidth > 1100) return 0;
        const gap = 12; // matches the mobile .scroll-video-sticky gap
        const padding = 20; // matches the mobile .scroll-video-sticky padding
        const visibleCard =
            skillsLeft && skillsLeft.style.display !== "none"
                ? skillsLeft
                : skillsRight;
        const cardH = visibleCard ? visibleCard.offsetHeight : 0;
        return cardH + gap + padding;
    }

    function getBoxSize() {
        const availableH = window.innerHeight - navbarHeight;
        const isCompact = window.innerWidth <= 1100;
        // On mobile only one skill card shows at a time (see
        // updateSkillsFromProgress), so reserve exactly its real height
        // instead of guessing a fixed percentage — that guessing is what
        // was causing the card to get clipped.
        const reserved = isCompact ? getReservedHeight() : 0;
        const maxH = isCompact
            ? Math.max(availableH - reserved, availableH * 0.35)
            : availableH * 0.9;
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

    function getScrollProgress() {
        const scrollableDistance = section.offsetHeight - window.innerHeight;
        if (scrollableDistance <= 0) return 0;
        const rect = section.getBoundingClientRect();
        const scrolled = -rect.top;
        return Math.min(Math.max(scrolled / scrollableDistance, 0), 1);
    }

    function updateFrameFromScroll() {
        const progress = getScrollProgress();

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
    let currentPanelKey = null;

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

    function setCardVisibility(isCompact, visibleSide) {
        if (!isCompact) {
            if (skillsLeft) skillsLeft.style.display = "";
            if (skillsRight) skillsRight.style.display = "";
            return;
        }
        if (skillsLeft) {
            skillsLeft.style.display = visibleSide === "left" ? "" : "none";
        }
        if (skillsRight) {
            skillsRight.style.display = visibleSide === "right" ? "" : "none";
        }
    }

    function updateSkillsFromProgress(progress) {
        if (!skillsLeft && !skillsRight) return;
        const isCompact = window.innerWidth <= 1100;

        if (!isCompact) {
            const stageIndex = Math.min(
                SKILL_STAGES.length - 1,
                Math.floor(progress * SKILL_STAGES.length)
            );
            const key = `desktop-${stageIndex}`;
            if (key === currentPanelKey) return;
            currentPanelKey = key;
            setCardVisibility(false, null);
            const stage = SKILL_STAGES[stageIndex];
            renderPanel(skillsLeft, stage.left);
            renderPanel(skillsRight, stage.right);
            return;
        }

        // Mobile: each card gets its own slide instead of both showing
        // stacked at once — that's what was leaving the top card clipped.
        const totalSlides = SKILL_STAGES.length * 2;
        const slideIndex = Math.min(
            totalSlides - 1,
            Math.floor(progress * totalSlides)
        );
        const key = `mobile-${slideIndex}`;
        if (key === currentPanelKey) return;
        currentPanelKey = key;

        const stageIndex = Math.floor(slideIndex / 2);
        const side = slideIndex % 2 === 0 ? "left" : "right";
        setCardVisibility(true, side);
        const stage = SKILL_STAGES[stageIndex];
        renderPanel(side === "left" ? skillsLeft : skillsRight, stage[side]);

        // The newly-visible card likely has a different height, so give the
        // video the correctly-sized remaining space and redraw at that size.
        resizeCanvas();
        drawFrame(Math.max(currentFrame, 0));
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
        updateSkillsFromProgress(getScrollProgress());
        drawFrame(Math.max(currentFrame, 0));
    }

    updateNavbarHeight();
    resizeCanvas();
    preloadImages();
    updatePinState();
    updateSkillsFromProgress(getScrollProgress());

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("load", () => {
        updateNavbarHeight();
        resizeCanvas();
        updatePinState();
        updateFrameFromScroll();
    });
})();
