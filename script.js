window.addEventListener("load", () => {

    const animations = [
        { selector: ".top-tags", class: "from-top", delay: 0 },
        { selector: ".left h1", class: "from-left", delay: 0.3 },
        { selector: ".desc", class: "from-left", delay: 0.6 },
        { selector: ".live-line", class: "from-bottom", delay: 0.9 },
        { selector: ".buttons", class: "zoom-in", delay: 1.2 },
        { selector: ".site-link", class: "from-bottom", delay: 1.5 },
        { selector: ".right", class: "from-right", delay: 0.6 },
        { selector: ".stats", class: "from-bottom", delay: 1.8 },
    ];

    animations.forEach(item => {
        const el = document.querySelector(item.selector);
        if (el) {
            el.style.animationDelay = `${item.delay}s`;
            el.classList.add(item.class);
        }
    });

  const button = document.getElementById("enter-btn");

button.addEventListener("click", () => {
    const intro = document.getElementById("intro");
    const site = document.getElementById("real-site");

    intro.classList.add("smooth-out");

    setTimeout(() => {
        intro.style.display = "none";
        site.style.display = "block";
        initScrollAnimations();
    }, 1200);
});
});

function initScrollAnimations() {
    const elements = document.querySelectorAll(
        ".slide-in-left, .slide-in-right, .slide-in-up"
    );

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translate(0)";
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.2 }
    );

    elements.forEach(el => observer.observe(el));
}

const sections = document.querySelectorAll("section");
const navItems = document.querySelectorAll(".ul-list li");

window.addEventListener("scroll", () => {
    let current = "";

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 200;
        const sectionHeight = section.clientHeight;

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute("id");
        }
    });

    navItems.forEach(item => {
        item.classList.remove("active");

        const link = item.querySelector("a");
        if (link && link.getAttribute("href") === `#${current}`) {
            item.classList.add("active");
        }
    });
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));

        if (target) {
            window.scrollTo({
                top: target.offsetTop - 120,
                behavior: "smooth"
            });
        }
    });
});

const downloadBtn = document.getElementById("downloadCvBtn");
if (downloadBtn) {
    downloadBtn.addEventListener("click", (e) => {
        e.preventDefault();
        
        const link = document.createElement("a");
        link.href = "Resume_Bedjaoui_Hadjer.pdf"; 
        link.download = "Hadjer_Bedjaoui_CV.pdf";
        link.click();
    });
}

const contactForm = document.getElementById("contact-form");
if (contactForm) {
    const statusEl = document.getElementById("contact-form-status");
    const submitBtn = document.getElementById("contact-submit-btn");

    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = "Sending...";
        if (statusEl) {
            statusEl.textContent = "";
            statusEl.className = "";
        }

        try {
            const response = await fetch(contactForm.action, {
                method: "POST",
                body: new FormData(contactForm),
                headers: { Accept: "application/json" }
            });

            if (response.ok) {
                if (statusEl) {
                    statusEl.textContent = "Message sent! I'll get back to you soon.";
                    statusEl.className = "form-status success";
                }
                contactForm.reset();
            } else {
                throw new Error("Request failed");
            }
        } catch (err) {
            if (statusEl) {
                statusEl.textContent = "Something went wrong. Please try again or email me directly.";
                statusEl.className = "form-status error";
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

const hireBtn = document.getElementById("hireMeBtn");
if (hireBtn) {
    hireBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "mailto:bedjaoui1hadjer@gmail.com?subject=Hiring%20Opportunity%20-%20Hadjer&body=Hi%20Hadjer,%0D%0A%0D%0AI%20came%20across%20your%20portfolio%20and%20would%20love%20to%20discuss%20a%20potential%20opportunity.%0D%0A%0D%0ABest%20regards,";
    });
}