/**
 * PharmaHub Checkout Page JavaScript
 */
import { initializeMobileMenu, updateCartCount } from '../components/utils.js';

function initPaymentToggle() {
  document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', function() {
      const creditCardForm = document.getElementById('credit-card-form');
      if (this.value === 'credit-card') {
        creditCardForm.classList.remove('hidden');
      } else {
        creditCardForm.classList.add('hidden');
      }
    });
  });
}

function initQuantityControls() {
  // plus buttons
  document.querySelectorAll('.fa-plus').forEach(icon => {
    const btn = icon.parentElement;
    if (!btn) return;
    btn.addEventListener('click', function() {
      const span = this.querySelector && this.querySelector('span') ? this.querySelector('span') : this.previousElementSibling;
      // try to find the number span nearby
      const qtySpan = this.parentElement.querySelector('span') || span;
      const current = parseInt(qtySpan.textContent) || 0;
      qtySpan.textContent = current + 1;
      updateItemTotal(this);
    });
  });

  // minus buttons
  document.querySelectorAll('.fa-minus').forEach(icon => {
    const btn = icon.parentElement;
    if (!btn) return;
    btn.addEventListener('click', function() {
      const qtySpan = this.parentElement.querySelector('span');
      const current = parseInt(qtySpan.textContent) || 0;
      if (current > 1) {
        qtySpan.textContent = current - 1;
        updateItemTotal(this);
      }
    });
  });
}

function updateItemTotal(element) {
  // Placeholder: put real calculation here using price data
  console.log('Updating totals...');
}

function initPage() {
  initializeMobileMenu();
  initPaymentToggle();
  initQuantityControls();
  updateCartCount();
}

document.addEventListener('DOMContentLoaded', initPage);
