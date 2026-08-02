(function initLanguageSwitcher() {
    const STORAGE_KEY = "portfolio-lang";
    const savedLang = localStorage.getItem(STORAGE_KEY);
    window.currentLang = savedLang === "fr" ? "fr" : "en";

    const textNodes = document.querySelectorAll("[data-fr]");
    const placeholderNodes = document.querySelectorAll("[data-fr-placeholder]");

    // Cache the original English text/placeholder once, so we can always
    // toggle back cleanly regardless of how many times the button is used.
    textNodes.forEach(el => {
        if (!el.dataset.en) el.dataset.en = el.textContent;
    });
    placeholderNodes.forEach(el => {
        if (!el.dataset.enPlaceholder) el.dataset.enPlaceholder = el.placeholder;
    });

    function applyLanguage(lang) {
        window.currentLang = lang;
        document.documentElement.lang = lang === "fr" ? "fr" : "en";

        textNodes.forEach(el => {
            el.textContent = lang === "fr" ? el.dataset.fr : el.dataset.en;
        });
        placeholderNodes.forEach(el => {
            el.placeholder = lang === "fr" ? el.dataset.frPlaceholder : el.dataset.enPlaceholder;
        });

        const label = document.getElementById("langSwitcherLabel");
        if (label) label.textContent = lang === "fr" ? "EN" : "FR";

        const langBtn = document.getElementById("langSwitcher");
        if (langBtn) {
            langBtn.setAttribute(
                "aria-label",
                lang === "fr" ? "Switch to English" : "Traduire en français"
            );
            langBtn.setAttribute(
                "title",
                lang === "fr" ? "Switch to English" : "Traduire en français"
            );
        }

        // Re-render the scroll-synced skill cards and re-run any pending
        // contact-form status text in the newly selected language.
        if (typeof window.refreshSkillPanelsLanguage === "function") {
            window.refreshSkillPanelsLanguage();
        }
    }

    applyLanguage(window.currentLang);

    const langSwitcher = document.getElementById("langSwitcher");
    if (langSwitcher) {
        langSwitcher.addEventListener("click", () => {
            const next = window.currentLang === "fr" ? "en" : "fr";
            localStorage.setItem(STORAGE_KEY, next);
            applyLanguage(next);
        });
    }
})();

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

initScrollAnimations();

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
                top: target.offsetTop+50,
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

    const FORM_MESSAGES = {
        en: {
            sending: "Sending...",
            success: "Message sent! I'll get back to you soon.",
            error: "Something went wrong. Please try again or email me directly."
        },
        fr: {
            sending: "Envoi...",
            success: "Message envoyé ! Je vous répondrai bientôt.",
            error: "Une erreur s'est produite. Veuillez réessayer ou m'envoyer un email directement."
        }
    };

    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const lang = window.currentLang === "fr" ? "fr" : "en";
        const messages = FORM_MESSAGES[lang];

        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = messages.sending;
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
                    statusEl.textContent = messages.success;
                    statusEl.className = "form-status success";
                }
                contactForm.reset();
            } else {
                throw new Error("Request failed");
            }
        } catch (err) {
            if (statusEl) {
                statusEl.textContent = messages.error;
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