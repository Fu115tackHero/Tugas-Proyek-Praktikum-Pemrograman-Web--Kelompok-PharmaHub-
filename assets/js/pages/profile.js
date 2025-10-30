// ==========================================
// PROFILE PAGE FUNCTIONALITY
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeProfilePage();
});

function initializeProfilePage() {
    loadProfileData();
    setupEventListeners();
    updateAuthState();
}

function loadProfileData() {
    const currentUser = JSON.parse(localStorage.getItem('pharmahub-current-user')) || null;
    
    if (currentUser) {
        // Update profile display
        document.getElementById('profileName').textContent = currentUser.name || 'Nama Pengguna';
        document.getElementById('profileEmail').textContent = currentUser.email || 'user@email.com';
        document.getElementById('profileRole').textContent = currentUser.role === 'admin' ? 'Admin' : 'Customer';
        
        // Update form fields
        document.getElementById('fullName').value = currentUser.name || '';
        document.getElementById('email').value = currentUser.email || '';
        document.getElementById('phone').value = currentUser.phone || '';
        document.getElementById('birthDate').value = currentUser.birthDate || '';
        document.getElementById('address').value = currentUser.address || '';
        
        // Update profile image if available
        if (currentUser.profileImage) {
            document.getElementById('profileImage').src = currentUser.profileImage;
        } else {
            const name = currentUser.name || 'User';
            document.getElementById('profileImage').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=80&rounded=true`;
        }
        
        // Update statistics
        updateAccountStatistics(currentUser);
    } else {
        // Guest user defaults
        resetToGuestView();
    }
}

function updateAccountStatistics(user) {
    // Mock data - in real app this would come from server
    document.getElementById('totalOrders').textContent = user.totalOrders || '0';
    document.getElementById('joinDate').textContent = user.joinDate || new Date().toLocaleDateString('id-ID');
    document.getElementById('accountStatus').textContent = 'Aktif';
}

function resetToGuestView() {
    document.getElementById('profileName').textContent = 'Tamu';
    document.getElementById('profileEmail').textContent = 'Silakan login untuk mengakses profil';
    document.getElementById('profileRole').textContent = 'Guest';
    
    // Clear form fields
    document.getElementById('fullName').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('birthDate').value = '';
    document.getElementById('address').value = '';
    
    // Reset statistics
    document.getElementById('totalOrders').textContent = '0';
    document.getElementById('joinDate').textContent = '-';
    document.getElementById('accountStatus').textContent = 'Tidak Aktif';
}

function updateAuthState() {
    const currentUser = JSON.parse(localStorage.getItem('pharmahub-current-user')) || null;
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (currentUser) {
        // User is logged in
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
    } else {
        // User is not logged in
        loginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
    }
}

function setupEventListeners() {
    // Profile form submission
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    
    // Change password button
    document.getElementById('changePasswordBtn').addEventListener('click', openPasswordModal);
    
    // Password form submission
    document.getElementById('passwordForm').addEventListener('submit', handlePasswordChange);
    
    // Login button
    document.getElementById('loginBtn').addEventListener('click', function() {
        window.location.href = 'Login.html';
    });
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Change photo button
    document.getElementById('changePhotoBtn').addEventListener('click', handlePhotoChange);
}

function handleProfileUpdate(e) {
    e.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('pharmahub-current-user')) || {};
    
    // Get form data
    const formData = {
        name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        birthDate: document.getElementById('birthDate').value,
        address: document.getElementById('address').value
    };
    
    // Validate required fields
    if (!formData.name || !formData.email) {
        showAlert('Nama dan email wajib diisi!', 'error');
        return;
    }
    
    // Update current user data
    const updatedUser = { ...currentUser, ...formData };
    localStorage.setItem('pharmahub-current-user', JSON.stringify(updatedUser));
    
    // Update display
    loadProfileData();
    
    showAlert('Profil berhasil diperbarui!', 'success');
}

function handlePasswordChange(e) {
    e.preventDefault();
    
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
        showAlert('Konfirmasi password tidak cocok!', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showAlert('Password baru minimal 6 karakter!', 'error');
        return;
    }
    
    // In real app, this would validate old password against server
    const currentUser = JSON.parse(localStorage.getItem('pharmahub-current-user')) || {};
    
    // Update password (in real app, this would be sent to server)
    currentUser.password = newPassword;
    localStorage.setItem('pharmahub-current-user', JSON.stringify(currentUser));
    
    // Close modal and reset form
    closePasswordModal();
    document.getElementById('passwordForm').reset();
    
    showAlert('Password berhasil diubah!', 'success');
}

function handleLogout() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        // Clear user session
        localStorage.removeItem('pharmahub-current-user');
        localStorage.removeItem('pharmahub-auth-token');
        localStorage.removeItem('pharmahub-login-time');
        
        showAlert('Logout berhasil!', 'success');
        
        // Redirect to home page after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

function handlePhotoChange() {
    // Create file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showAlert('Ukuran file terlalu besar! Maksimal 5MB.', 'error');
                return;
            }
            
            // Create file reader
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageData = e.target.result;
                
                // Update profile image
                document.getElementById('profileImage').src = imageData;
                
                // Save to localStorage
                const currentUser = JSON.parse(localStorage.getItem('pharmahub-current-user')) || {};
                currentUser.profileImage = imageData;
                localStorage.setItem('pharmahub-current-user', JSON.stringify(currentUser));
                
                showAlert('Foto profil berhasil diperbarui!', 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    
    fileInput.click();
}

function openPasswordModal() {
    document.getElementById('passwordModal').classList.remove('hidden');
}

function closePasswordModal() {
    document.getElementById('passwordModal').classList.add('hidden');
    document.getElementById('passwordForm').reset();
}

function showAlert(message, type = 'success') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'
    } text-white`;
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 3000);
}

// Global function for modal close (called from HTML)
window.closePasswordModal = closePasswordModal;