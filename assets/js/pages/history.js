/**
 * PharmaHub History Page JavaScript
 * File ini berisi logika khusus untuk halaman riwayat transaksi
 */

import { initializeMobileMenu } from '../components/utils.js';

// Tab functionality
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all tabs
            document.querySelectorAll('.tab-btn').forEach(tab => {
                tab.classList.remove('active', 'border-blue-500', 'text-blue-600');
                tab.classList.add('border-transparent', 'text-gray-500');
            });
            
            // Add active class to clicked tab
            this.classList.add('active', 'border-blue-500', 'text-blue-600');
            this.classList.remove('border-transparent', 'text-gray-500');
            
            // Filter history based on the selected tab
            const tabType = this.dataset.tab;
            filterHistory(tabType);
        });
    });
}

// Filter history based on tab
function filterHistory(tabType) {
    // Here you would implement the history filtering logic
    console.log('Selected tab:', tabType);
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize tabs
    initTabs();
});