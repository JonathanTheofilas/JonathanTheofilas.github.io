// Jonathan Theofilas · personal site — light interactions, no dependencies.

// Current year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// Reveal-on-scroll
const revealEls = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  // Fallback: just show everything
  revealEls.forEach((el) => el.classList.add("is-visible"));
}
