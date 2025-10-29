/**
 * PharmaHub Register Page JavaScript
 */
import { showToast } from "../components/utils.js";

// Toggle password visibility
function togglePasswordVisibility(inputId, buttonId) {
  const input = document.getElementById(inputId);
  const button = document.getElementById(buttonId);
  const icon = button.querySelector("i");
  if (!input || !button || !icon) return;

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

// Initialize page
function initRegisterPage() {
  const togglePassword = document.getElementById("togglePassword");
  const toggleConfirmPassword = document.getElementById(
    "toggleConfirmPassword"
  );
  const form = document.getElementById("registerForm");

  if (togglePassword) {
    togglePassword.addEventListener("click", () =>
      togglePasswordVisibility("password", "togglePassword")
    );
  }

  if (toggleConfirmPassword) {
    toggleConfirmPassword.addEventListener("click", () =>
      togglePasswordVisibility("confirmPassword", "toggleConfirmPassword")
    );
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = new FormData(this);
      const data = Object.fromEntries(formData.entries());

      // Validate password match
      if (data.password !== data.confirmPassword) {
        showToast("Password dan konfirmasi password tidak cocok!", "error");
        return;
      }

      // Validate password strength
      if (data.password.length < 8) {
        showToast("Password minimal 8 karakter!", "error");
        return;
      }

      // Success simulation - Save registration data
      const users = JSON.parse(localStorage.getItem("pharmahub-users")) || [];
      users.push({
        fullName: data.fullName,
        email: data.email,
        registeredAt: new Date().toISOString(),
      });
      localStorage.setItem("pharmahub-users", JSON.stringify(users));

      // Auto login after register
      localStorage.setItem("pharmahub-logged-in", "true");
      localStorage.setItem("pharmahub-user-email", data.email);
      localStorage.setItem("pharmahub-user-name", data.fullName);

      showToast("Pendaftaran berhasil! Mengarahkan ke beranda...", "success");

      // Redirect to index after 2 seconds
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    });
  }

  // Real-time password confirmation
  const confirmEl = document.getElementById("confirmPassword");
  if (confirmEl) {
    confirmEl.addEventListener("input", function () {
      const password = document.getElementById("password")?.value || "";
      const confirmPassword = this.value;
      if (confirmPassword && password !== confirmPassword) {
        this.setCustomValidity("Password tidak cocok");
      } else {
        this.setCustomValidity("");
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", initRegisterPage);
