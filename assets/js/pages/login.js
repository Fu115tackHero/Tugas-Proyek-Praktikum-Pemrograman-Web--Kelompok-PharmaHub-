/**
 * PharmaHub Login Page JavaScript
 * File ini berisi logika khusus untuk halaman login
 */

// Initialize form validation
function initializeFormValidation() {
    const form = document.querySelector("form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const inputs = document.querySelectorAll("input");
        let isValid = true;

        inputs.forEach((input) => {
            if (!input.value && input.type !== 'checkbox') {
                input.classList.add("border-red-500");
                isValid = false;
            } else {
                input.classList.remove("border-red-500");
            }
        });

        if (isValid) {
            handleLogin();
        }
    });
}

// Handle login process
function handleLogin() {
    const button = document.querySelector('button[type="submit"]');
    if (!button) return;

    const originalText = button.textContent;

    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Signing in...';
    button.disabled = true;

    // Simulate login process
    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
        alert("Login successful! (This is a demo)");
    }, 1500);
}

// Initialize input focus effects
function initializeInputEffects() {
    document.querySelectorAll("input").forEach((input) => {
        input.addEventListener("focus", function () {
            this.parentElement.classList.add("ring-2", "ring-blue-200", "rounded-lg");
        });

        input.addEventListener("blur", function () {
            this.parentElement.classList.remove("ring-2", "ring-blue-200", "rounded-lg");
        });
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeFormValidation();
    initializeInputEffects();
});