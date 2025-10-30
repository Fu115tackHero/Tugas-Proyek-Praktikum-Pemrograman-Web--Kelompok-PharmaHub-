// Order Management functionality
let allOrders = [];
let currentOrderForStatusUpdate = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize order management (no auth required)
    initializeOrderManagement();
    loadOrders();
    setupEventListeners();
});

function initializeOrderManagement() {
    // Initialize orders data if not exists
    if (!localStorage.getItem('adminOrders')) {
        const defaultOrders = getDefaultOrders();
        localStorage.setItem('adminOrders', JSON.stringify(defaultOrders));
    }
}

function setupEventListeners() {
    // Search and filter
    document.getElementById('searchOrder').addEventListener('input', filterOrders);
    document.getElementById('statusFilter').addEventListener('change', filterOrders);
    document.getElementById('dateFilter').addEventListener('change', filterOrders);
}

function loadOrders() {
    allOrders = JSON.parse(localStorage.getItem('adminOrders')) || [];
    renderOrders(allOrders);
    updateStatusCounts();
}

function renderOrders(orders) {
    const container = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow p-8 text-center">
                <i class="fas fa-shopping-cart text-gray-400 text-4xl mb-4"></i>
                <p class="text-gray-500">Tidak ada pesanan ditemukan</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="bg-white rounded-lg shadow">
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">Pesanan #${order.id}</h3>
                        <p class="text-sm text-gray-600">${formatDate(order.date)} • ${order.customerName}</p>
                        <p class="text-sm text-gray-600">${order.customerPhone}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-lg font-semibold text-gray-900">${formatCurrency(order.total)}</p>
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(order.status)}">
                            ${getStatusText(order.status)}
                        </span>
                    </div>
                </div>
                
                <div class="border-t pt-4">
                    <h4 class="font-medium text-gray-900 mb-2">Item Pesanan:</h4>
                    <div class="space-y-2">
                        ${order.items.map(item => `
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-600">${item.name} x${item.quantity}</span>
                                <span class="text-gray-900">${formatCurrency(item.price * item.quantity)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                ${order.notes ? `
                    <div class="border-t pt-4 mt-4">
                        <h4 class="font-medium text-gray-900 mb-2">Catatan:</h4>
                        <p class="text-sm text-gray-600">${order.notes}</p>
                    </div>
                ` : ''}
                
                <div class="flex justify-between items-center mt-6 pt-4 border-t">
                    <button onclick="viewOrderDetail('${order.id}')" 
                            class="text-blue-600 hover:text-blue-800 font-medium">
                        <i class="fas fa-eye mr-1"></i>
                        Lihat Detail
                    </button>
                    <div class="flex gap-2">
                        ${order.status !== 'completed' && order.status !== 'cancelled' ? `
                            <button onclick="updateOrderStatus('${order.id}')" 
                                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                                <i class="fas fa-edit mr-1"></i>
                                Update Status
                            </button>
                        ` : ''}
                        ${order.status === 'pending' ? `
                            <button onclick="cancelOrder('${order.id}')" 
                                    class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm">
                                <i class="fas fa-times mr-1"></i>
                                Batalkan
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function filterOrders() {
    const searchTerm = document.getElementById('searchOrder').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    let filteredOrders = allOrders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchTerm) ||
                            order.customerName.toLowerCase().includes(searchTerm) ||
                            order.customerPhone.includes(searchTerm);
        const matchesStatus = !statusFilter || order.status === statusFilter;
        const matchesDate = filterByDate(order.date, dateFilter);
        
        return matchesSearch && matchesStatus && matchesDate;
    });
    
    renderOrders(filteredOrders);
}

function filterByDate(orderDate, filter) {
    const orderDay = new Date(orderDate);
    const today = new Date();
    
    switch (filter) {
        case 'today':
            return orderDay.toDateString() === today.toDateString();
        case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDay >= weekAgo;
        case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return orderDay >= monthAgo;
        default:
            return true;
    }
}

function updateStatusCounts() {
    const counts = {
        pending: 0,
        preparing: 0,
        ready: 0,
        completed: 0
    };
    
    allOrders.forEach(order => {
        if (counts.hasOwnProperty(order.status)) {
            counts[order.status]++;
        }
    });
    
    document.getElementById('pendingCount').textContent = counts.pending;
    document.getElementById('preparingCount').textContent = counts.preparing;
    document.getElementById('readyCount').textContent = counts.ready;
    document.getElementById('completedCount').textContent = counts.completed;
}

function viewOrderDetail(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    
    const modalContent = document.getElementById('orderDetailContent');
    modalContent.innerHTML = `
        <div class="space-y-6">
            <!-- Customer Info -->
            <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-3">Informasi Pelanggan</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="text-gray-600">Nama:</span>
                        <span class="ml-2 font-medium">${order.customerName}</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Telepon:</span>
                        <span class="ml-2 font-medium">${order.customerPhone}</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Email:</span>
                        <span class="ml-2 font-medium">${order.customerEmail || '-'}</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Alamat:</span>
                        <span class="ml-2 font-medium">${order.customerAddress || 'Ambil di apotek'}</span>
                    </div>
                </div>
            </div>
            
            <!-- Order Info -->
            <div>
                <h4 class="font-semibold text-gray-900 mb-3">Informasi Pesanan</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span class="text-gray-600">ID Pesanan:</span>
                        <span class="ml-2 font-medium">#${order.id}</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Tanggal:</span>
                        <span class="ml-2 font-medium">${formatDate(order.date)}</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Status:</span>
                        <span class="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(order.status)}">
                            ${getStatusText(order.status)}
                        </span>
                    </div>
                </div>
            </div>
            
            <!-- Items -->
            <div>
                <h4 class="font-semibold text-gray-900 mb-3">Detail Item</h4>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Obat</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${order.items.map(item => `
                                <tr>
                                    <td class="px-4 py-2">
                                        <div class="text-sm font-medium text-gray-900">${item.name}</div>
                                        ${item.requiresPrescription ? '<div class="text-xs text-yellow-600">Resep Dokter</div>' : ''}
                                    </td>
                                    <td class="px-4 py-2 text-sm text-gray-900">${formatCurrency(item.price)}</td>
                                    <td class="px-4 py-2 text-sm text-gray-900">${item.quantity}</td>
                                    <td class="px-4 py-2 text-sm font-medium text-gray-900">${formatCurrency(item.price * item.quantity)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Total -->
            <div class="border-t pt-4">
                <div class="flex justify-between items-center">
                    <span class="text-lg font-semibold text-gray-900">Total:</span>
                    <span class="text-xl font-bold text-gray-900">${formatCurrency(order.total)}</span>
                </div>
            </div>
            
            ${order.notes ? `
                <div class="border-t pt-4">
                    <h4 class="font-semibold text-gray-900 mb-2">Catatan Pesanan:</h4>
                    <p class="text-sm text-gray-600 bg-gray-50 p-3 rounded">${order.notes}</p>
                </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('orderDetailModal').classList.remove('hidden');
}

function updateOrderStatus(orderId) {
    currentOrderForStatusUpdate = allOrders.find(o => o.id === orderId);
    if (!currentOrderForStatusUpdate) return;
    
    document.getElementById('newStatus').value = currentOrderForStatusUpdate.status;
    document.getElementById('statusNote').value = '';
    document.getElementById('statusUpdateModal').classList.remove('hidden');
}

function confirmStatusUpdate() {
    if (!currentOrderForStatusUpdate) return;
    
    const newStatus = document.getElementById('newStatus').value;
    const note = document.getElementById('statusNote').value;
    
    // Update order status
    const orderIndex = allOrders.findIndex(o => o.id === currentOrderForStatusUpdate.id);
    if (orderIndex !== -1) {
        allOrders[orderIndex].status = newStatus;
        if (note) {
            allOrders[orderIndex].statusHistory = allOrders[orderIndex].statusHistory || [];
            allOrders[orderIndex].statusHistory.push({
                status: newStatus,
                note: note,
                date: new Date().toISOString()
            });
        }
        
        // Save to localStorage
        localStorage.setItem('adminOrders', JSON.stringify(allOrders));
        
        // Refresh display
        renderOrders(allOrders);
        updateStatusCounts();
        
        // Close modal
        closeStatusUpdateModal();
        
        // Show success message
        showToast(`Status pesanan #${currentOrderForStatusUpdate.id} berhasil diperbarui!`, 'success');
    }
}

function cancelOrder(orderId) {
    if (confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
        const orderIndex = allOrders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            allOrders[orderIndex].status = 'cancelled';
            localStorage.setItem('adminOrders', JSON.stringify(allOrders));
            renderOrders(allOrders);
            updateStatusCounts();
            showToast(`Pesanan #${orderId} berhasil dibatalkan!`, 'success');
        }
    }
}

function closeOrderDetailModal() {
    document.getElementById('orderDetailModal').classList.add('hidden');
}

function closeStatusUpdateModal() {
    document.getElementById('statusUpdateModal').classList.add('hidden');
    currentOrderForStatusUpdate = null;
}

function getStatusClass(status) {
    const classes = {
        pending: 'bg-yellow-100 text-yellow-800',
        preparing: 'bg-blue-100 text-blue-800',
        ready: 'bg-green-100 text-green-800',
        completed: 'bg-purple-100 text-purple-800',
        cancelled: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
}

function getStatusText(status) {
    const texts = {
        pending: 'Pending',
        preparing: 'Sedang Disiapkan',
        ready: 'Siap Diambil',
        completed: 'Selesai',
        cancelled: 'Dibatalkan'
    };
    return texts[status] || status;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount).replace('IDR', 'Rp');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}

function getDefaultOrders() {
    return [
        {
            id: 'ORD001',
            date: new Date().toISOString(),
            customerName: 'Ahmad Wijaya',
            customerPhone: '08123456789',
            customerEmail: 'ahmad@email.com',
            customerAddress: 'Jl. Merdeka No. 123, Jakarta',
            items: [
                { name: 'Paracetamol 500mg', price: 5000, quantity: 2, requiresPrescription: false },
                { name: 'Vitamin C 1000mg', price: 15000, quantity: 1, requiresPrescription: false }
            ],
            total: 25000,
            status: 'pending',
            notes: 'Mohon disiapkan sebelum jam 15:00'
        },
        {
            id: 'ORD002',
            date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            customerName: 'Siti Nurhaliza',
            customerPhone: '08987654321',
            customerEmail: 'siti@email.com',
            items: [
                { name: 'Amoxicillin 500mg', price: 25000, quantity: 1, requiresPrescription: true }
            ],
            total: 25000,
            status: 'preparing',
            notes: 'Sudah ada resep dokter'
        },
        {
            id: 'ORD003',
            date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            customerName: 'Budi Santoso',
            customerPhone: '08111222333',
            items: [
                { name: 'Promag', price: 12000, quantity: 1, requiresPrescription: false },
                { name: 'CTM 4mg', price: 8000, quantity: 1, requiresPrescription: false }
            ],
            total: 20000,
            status: 'ready'
        }
    ];
}

// Logout function - accessible globally
window.logout = function() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        // Clear all user data
        localStorage.removeItem('pharmaHubUser');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('pharmahub-remember-user');
        
        // Redirect to login page
        alert('Logout berhasil!');
        window.location.href = '../Login.html';
    }
};