/**
 * PharmaHub Notifications Page JavaScript
 * File ini berisi logika khusus untuk halaman notifikasi
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
            
            // Filter notifications based on the selected tab
            const tabType = this.dataset.tab;
            filterNotifications(tabType);
        });
    });
}

// Filter notifications based on tab
function filterNotifications(tabType) {
    // Here you would implement the notifications filtering logic
    console.log('Selected tab:', tabType);
}

// Initialize notifications functionality
function initializeNotifications() {
    const markAllReadBtn = document.getElementById('mark-all-read');
    const clearAllBtn = document.getElementById('clear-all');

    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', () => {
            // Implement mark all as read functionality
        });
    }

    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            // Implement clear all notifications functionality
        });
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize tabs
    initTabs();

    // Initialize notifications
    initializeNotifications();
});