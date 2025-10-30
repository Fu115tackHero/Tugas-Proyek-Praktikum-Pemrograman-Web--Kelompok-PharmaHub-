// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard (no auth required)
    initializeDashboard();
    updateStats();
    loadRecentActivity();
    
    // Display user info
    displayUserInfo(currentUser);
});

function displayUserInfo(user) {
    // Find places to display user name (could add to header)
    const userElements = document.querySelectorAll('.admin-user-name');
    userElements.forEach(element => {
        element.textContent = user.name;
    });
}

function initializeDashboard() {
    console.log('Dashboard initialized');
}

function updateStats() {
    // Get statistics from localStorage or API
    const stats = getDashboardStats();
    
    // Update stat cards
    document.getElementById('totalDrugs').textContent = stats.totalDrugs;
    document.getElementById('todayOrders').textContent = stats.todayOrders;
    document.getElementById('pendingOrders').textContent = stats.pendingOrders;
    document.getElementById('monthlySales').textContent = formatCurrency(stats.monthlySales);
}

function getDashboardStats() {
    // Mock data - in real app, this would come from API
    const drugs = JSON.parse(localStorage.getItem('adminDrugs')) || [];
    const orders = JSON.parse(localStorage.getItem('adminOrders')) || [];
    
    const today = new Date().toDateString();
    const todayOrders = orders.filter(order => 
        new Date(order.date).toDateString() === today
    ).length;
    
    const pendingOrders = orders.filter(order => 
        order.status === 'pending'
    ).length;
    
    // Calculate monthly sales (mock calculation)
    const monthlySales = orders
        .filter(order => order.status === 'completed')
        .reduce((total, order) => total + order.total, 0);
    
    return {
        totalDrugs: drugs.length || 15,
        todayOrders: todayOrders || 8,
        pendingOrders: pendingOrders || 3,
        monthlySales: monthlySales || 12500000
    };
}

function loadRecentActivity() {
    const activities = getRecentActivities();
    const container = document.getElementById('recentActivity');
    
    if (!container) return;
    
    container.innerHTML = activities.map(activity => `
        <div class="flex items-center">
            <div class="w-2 h-2 bg-${activity.color}-500 rounded-full mr-3"></div>
            <div class="flex-1">
                <p class="text-sm text-gray-800">${activity.text}</p>
                <p class="text-xs text-gray-500">${activity.time}</p>
            </div>
        </div>
    `).join('');
}

function getRecentActivities() {
    // Mock activities data
    return [
        {
            text: 'Pesanan #12345 telah selesai',
            time: '5 menit yang lalu',
            color: 'green'
        },
        {
            text: 'Obat Paracetamol ditambahkan',
            time: '15 menit yang lalu',
            color: 'blue'
        },
        {
            text: 'Pesanan #12344 sedang disiapkan',
            time: '30 menit yang lalu',
            color: 'yellow'
        }
    ];
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount).replace('IDR', 'Rp');
}