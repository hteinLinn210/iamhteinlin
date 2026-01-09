// 2. Initialize Lenis
const lenis = new Lenis({
    duration: 1.5, // Speed (higher = smoother/slower)
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Physics for the "heavy" feel
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false, // Default: false (Keep native scroll on mobile for better feel)
    touchMultiplier: 2,
});

// 3. Connect Lenis to GSAP ScrollTrigger (CRITICAL FOR YOU)
// This tells GSAP: "Hey, Lenis is handling the scroll, update your triggers based on Lenis."
lenis.on('scroll', ScrollTrigger.update);

// 4. Create the Animation Loop
// This ensures Lenis updates exactly when GSAP updates
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

// Turn off GSAP's internal lag smoothing to prevent stutters
gsap.ticker.lagSmoothing(0);

// (Optional) Reset scroll to top on refresh prevents weird jumpiness
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
}

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, ScrollToPlugin);

window.addEventListener("DOMContentLoaded", () => {
    const headings = document.querySelectorAll('[data-animation="chars"]');
    const paragraphs = document.querySelectorAll('[data-animation="lines"]');

    // 1. Define a GSAP Context variable to handle cleanup
    let ctx;

    function createSplits() {
        // 2. Kill all old animations and revert SplitText instantly
        if (ctx) ctx.revert();

        // 3. Create a new Context
        ctx = gsap.context(() => {
            // --- HERO HEADINGS (CHARS) ---
            headings.forEach((heading) => {
                // Split text
                const split = new SplitText(heading, {
                    type: "lines,words,chars",
                    mask: heading.getAttribute("data-animation-mask") || "chars",
                    tag: "span",
                    linesClass: "split-line",
                    wordsClass: "split-word",
                    charsClass: "split-char",
                });

                // Ensure parent is visible (so we can see the animation happen)
                gsap.set(heading, { autoAlpha: 1 });

                // Animate
                gsap.from(split.chars, {
                    scrollTrigger: {
                        trigger: heading,
                        start: heading.getAttribute("data-animation-start") || "top 80%",
                        end: heading.getAttribute("data-animation-end") || "100% top",
                        toggleActions:
                            heading.getAttribute("data-animation-actions") ||
                            "play none none none",
                    },
                    y: heading.getAttribute("data-animation-y") || "1em",
                    x: heading.getAttribute("data-animation-x") || "0",
                    // FIX: Default opacity must be 0 for a fade-in
                    opacity: heading.getAttribute("data-animation-opacity") || 0,
                    duration: heading.getAttribute("data-animation-duration") || 1.5,
                    delay: heading.getAttribute("data-animation-delay") || 0,
                    ease:
                        heading.getAttribute("data-animation-ease") ||
                        CustomEase.create("custom", "M0,0 C0.047,0.752 0.082,1 1,1 "),
                    stagger: heading.getAttribute("data-animation-stagger") || 0.07,
                });
            });

            // --- PARAGRAPHS (LINES) ---
            paragraphs.forEach((paragraph) => {
                const splitParagraphs = new SplitText(paragraph, {
                    type: "lines",
                    mask: paragraph.getAttribute("data-animation-mask") || "lines",
                    tag: "span",
                    linesClass: "split-line",
                });

                gsap.set(paragraph, { autoAlpha: 1 });

                gsap.from(splitParagraphs.lines, {
                    scrollTrigger: {
                        trigger: paragraph,
                        start: paragraph.getAttribute("data-animation-start") || "top 80%",
                        toggleActions:
                            paragraph.getAttribute("data-animation-actions") ||
                            "play none none none",
                    },
                    y: paragraph.getAttribute("data-animation-y") || "1em",
                    x: paragraph.getAttribute("data-animation-x") || 0,
                    // FIX: Default opacity must be 0
                    opacity: paragraph.getAttribute("data-animation-opacity") || 0,
                    duration: paragraph.getAttribute("data-animation-duration") || 1,
                    delay: paragraph.getAttribute("data-animation-delay") || 0,
                    ease:
                        paragraph.getAttribute("data-animation-ease") ||
                        CustomEase.create("custom", "M0,0 C0.102,0.667 0.2,1 1,1 "),
                    stagger: paragraph.getAttribute("data-animation-stagger") || 0.1,
                });
            });
        });
    }

    // 4. Wait for fonts before running
    document.fonts.ready.then(() => {
        createSplits();
    });

    // 5. Image Loading
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
        if (img.complete) return;
        img.addEventListener("load", () => {
            ScrollTrigger.refresh();
        });
    });

    // 6. Resize Event
    let resizeTimeout;
    let lastWindowWidth = window.innerWidth;

    window.addEventListener("resize", () => {
        const currentWindowWidth = window.innerWidth;
        if (currentWindowWidth !== lastWindowWidth) {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                createSplits(); // ctx.revert() inside here cleans everything up automatically!
                lastWindowWidth = currentWindowWidth;
            }, 250);
        }
    });
});

const topLinks = document.querySelectorAll('.scroll-to-top');

topLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        gsap.to(window, {
            duration: 2,
            scrollTo: 0,
            ease: "power2.inOut"
        });
    });
});