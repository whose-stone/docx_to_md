// ------------------------------
// Mobile Menu
// ------------------------------
const hamburgerBtn = document.getElementById("hamburgerBtn");
const mobileMenu = document.getElementById("mobileMenu");
const backdrop = document.getElementById("backdrop");

hamburgerBtn.addEventListener("click", () => {
    hamburgerBtn.classList.toggle("active");
    mobileMenu.classList.toggle("open");
    backdrop.classList.toggle("show");
});

backdrop.addEventListener("click", () => {
    hamburgerBtn.classList.remove("active");
    mobileMenu.classList.remove("open");
    backdrop.classList.remove("show");
});


// ------------------------------
// Contact Form Submission
// ------------------------------
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        formStatus.textContent = "Sending...";
        formStatus.style.color = "#0a3d62";

        const data = {
            name: contactForm.name.value.trim(),
            email: contactForm.email.value.trim(),
            agency: contactForm.agency.value.trim(),
            message: contactForm.message.value.trim()
        };

        try {
            const res = await fetch("/send.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (result.success) {
                formStatus.textContent = "Message sent successfully.";
                formStatus.style.color = "green";
                contactForm.reset();
            } else {
                formStatus.textContent = "There was an error sending your message.";
                formStatus.style.color = "red";
            }
        } catch (err) {
            formStatus.textContent = "Unable to connect to server.";
            formStatus.style.color = "red";
        }
    });
}
