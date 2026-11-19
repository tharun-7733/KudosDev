const form = document.getElementById("loginForm")
const emailInput = document.getElementById("email")
const passwordInput = document.getElementById("password")
const message = document.getElementById("message")

form.addEventListener("submit", function (event) {
    event.preventDefault()

    const email = emailInput.value.trim()
    const pass = passwordInput.value;

    if (email == "") {
        message.textContent = "Please Enter Your Email";
        message.style.color = "#dc2626"
        emailInput.focus();
        return;
    }

    if (pass.length < 8) {
        message.textContent = "Password must be minimum 8 length";
        message.style.color = "#dc2525"
        passwordInput.focus()
        return;
    }

    message.textContent = "Login Submmitted Successfully"
    message.style.color = "#16a34a"
});