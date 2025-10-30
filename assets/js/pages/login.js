// Login page functionality with authentication
document.addEventListener('DOMContentLoaded', function() {
    initializeLogin();
    setupEventListeners();
});

// Demo user accounts
const demoAccounts = {
    'customer@pharmahub.com': {
        password: 'customer123',
        role: 'customer',
        name: 'Customer Demo',
        redirectUrl: 'index.html'
    },
    'admin@pharmahub.com': {
        password: 'admin123',
        role: 'admin',
        name: 'Admin PharmaHub',
        redirectUrl: 'admin/index.html'
    }
};

function initializeLogin() {
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
        // Redirect based on role
        if (currentUser.role === 'admin') {
            window.location.href = 'admin/index.html';
        } else {
            window.location.href = 'index.html';
        }
        return;
    }
}

function setupEventListeners() {
    const loginForm = document.getElementById('loginForm');
    const togglePasswordBtn = document.getElementById('togglePassword');
    
    // Form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Password toggle (if exists)
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    }
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('loginPassword');
    const toggleIcon = document.querySelector('#togglePassword i');
    
    if (!passwordInput || !toggleIcon) return;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'fas fa-eye';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const remember = document.getElementById('remember').checked;
    
    // Validate inputs
    if (!email || !password) {
        showToast('Harap isi semua field!', 'error');
        return;
    }
    
    // Show loading state
    setLoginButtonState(true);
    
    try {
        // Check against demo accounts
        const account = demoAccounts[email];
        
        if (!account) {
            throw new Error('Email tidak ditemukan!');
        }
        
        if (account.password !== password) {
            throw new Error('Password salah!');
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create user session
        const userSession = {
            email: account.email || email,
            name: account.name,
            role: account.role,
            loginTime: new Date().toISOString(),
            sessionId: generateSessionId()
        };
        
        // Save to localStorage using the same key as main.js
        localStorage.setItem('pharmaHubUser', JSON.stringify(userSession));
        
        if (remember) {
            localStorage.setItem('pharmahub-remember-user', 'true');
        }
        
        showToast(`Selamat datang, ${userSession.name}!`, 'success');
        
        // Redirect after success
        setTimeout(() => {
            window.location.href = account.redirectUrl;
        }, 1500);
        
    } catch (error) {
        showToast(error.message, 'error');
        setLoginButtonState(false);
    }
}

function setLoginButtonState(loading) {
    const button = document.getElementById('loginButton');
    const buttonText = document.getElementById('loginButtonText');
    const spinner = document.getElementById('loginSpinner');
    
    if (loading) {
        button.disabled = true;
        button.classList.add('opacity-75', 'cursor-not-allowed');
        buttonText.textContent = 'Memproses...';
        spinner.classList.remove('hidden');
    } else {
        button.disabled = false;
        button.classList.remove('opacity-75', 'cursor-not-allowed');
        buttonText.textContent = 'Masuk ke Dashboard';
        spinner.classList.add('hidden');
    }
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getCurrentUser() {
    try {
        const userStr = localStorage.getItem('pharmaHubUser');
        
        if (!userStr) {
            return null;
        }
        
        const user = JSON.parse(userStr);
        
        // Check if session is still valid (24 hours)
        const loginTime = new Date(user.loginTime);
        const now = new Date();
        const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
            clearUserSession();
            return null;
        }
        
        return user;
    } catch (error) {
        clearUserSession();
        return null;
    }
}

function clearUserSession() {
    localStorage.removeItem('pharmaHubUser');
    localStorage.removeItem('userProfile');
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    
    // Set toast color based on type
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 z-50 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
    } text-white`;
    
    // Show toast
    toast.classList.remove('translate-x-full');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full');
    }, 3000);
}

// Authentication guard function for admin pages
function requireAuth(allowedRoles = []) {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        window.location.href = '../Login.html';
        return false;
    }
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
        showToast('Anda tidak memiliki akses ke halaman ini!', 'error');
        setTimeout(() => {
            if (currentUser.role === 'admin') {
                window.location.href = 'index.html';
            } else {
                window.location.href = '../index.html';
            }
        }, 2000);
        return false;
    }
    
    return true;
}