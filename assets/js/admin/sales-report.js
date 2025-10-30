// Sales Report functionality
let salesChart = null;
let topProductsChart = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize sales report (no auth required)
    initializeSalesReport();
    setupEventListeners();
    generateReport();
});

function initializeSalesReport() {
    // Set default dates
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    document.getElementById('startDate').value = firstDayOfMonth.toISOString().split('T')[0];
    document.getElementById('endDate').value = today.toISOString().split('T')[0];
}

function setupEventListeners() {
    document.getElementById('periodFilter').addEventListener('change', handlePeriodChange);
}

function handlePeriodChange() {
    const period = document.getElementById('periodFilter').value;
    const customDateRange = document.getElementById('customDateRange');
    
    if (period === 'custom') {
        customDateRange.style.display = 'block';
    } else {
        customDateRange.style.display = 'none';
        setDatesByPeriod(period);
    }
}

function setDatesByPeriod(period) {
    const today = new Date();
    let startDate = new Date();
    
    switch (period) {
        case 'today':
            startDate = today;
            break;
        case 'week':
            startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
        case 'quarter':
            startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        case 'year':
            startDate = new Date(today.getFullYear(), 0, 1);
            break;
    }
    
    document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('endDate').value = today.toISOString().split('T')[0];
}

function generateReport() {
    const period = document.getElementById('periodFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    // Get data
    const reportData = getReportData(startDate, endDate);
    
    // Update summary cards
    updateSummaryCards(reportData);
    
    // Update charts
    updateSalesChart(reportData.dailySales);
    updateTopProductsChart(reportData.topProducts);
    
    // Update tables
    updateStockAlertTable(reportData.lowStockItems);
    updateTransactionTable(reportData.transactions);
}

function getReportData(startDate, endDate) {
    // Get orders from localStorage
    const orders = JSON.parse(localStorage.getItem('adminOrders')) || [];
    const drugs = JSON.parse(localStorage.getItem('adminDrugs')) || [];
    
    // Filter orders by date range
    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
    });
    
    // Calculate summary data
    const completedOrders = filteredOrders.filter(order => order.status === 'completed');
    const totalSales = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const totalTransactions = completedOrders.length;
    const avgTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;
    
    // Calculate total drugs sold
    const totalDrugsSold = completedOrders.reduce((sum, order) => {
        return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);
    
    // Generate daily sales data
    const dailySales = generateDailySalesData(completedOrders, startDate, endDate);
    
    // Get top products
    const topProducts = getTopProducts(completedOrders);
    
    // Get low stock items
    const lowStockItems = drugs.filter(drug => drug.stock < 10);
    
    return {
        summary: {
            totalSales,
            totalTransactions,
            avgTransaction,
            totalDrugsSold,
            salesGrowth: '+15.3%', // Mock growth data
            transactionGrowth: '+8.7%',
            avgGrowth: '+6.1%',
            drugsGrowth: '+12.4%'
        },
        dailySales,
        topProducts,
        lowStockItems,
        transactions: completedOrders
    };
}

function updateSummaryCards(data) {
    const { summary } = data;
    
    document.getElementById('totalSales').textContent = formatCurrency(summary.totalSales);
    document.getElementById('totalTransactions').textContent = summary.totalTransactions;
    document.getElementById('avgTransaction').textContent = formatCurrency(summary.avgTransaction);
    document.getElementById('totalDrugsSold').textContent = summary.totalDrugsSold;
    
    document.getElementById('salesGrowth').textContent = summary.salesGrowth;
    document.getElementById('transactionGrowth').textContent = summary.transactionGrowth;
    document.getElementById('avgGrowth').textContent = summary.avgGrowth;
    document.getElementById('drugsGrowth').textContent = summary.drugsGrowth;
}

function generateDailySalesData(orders, startDate, endDate) {
    const dailyData = {};
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Initialize all days with 0
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        dailyData[dateKey] = 0;
    }
    
    // Aggregate sales by day
    orders.forEach(order => {
        const orderDate = new Date(order.date).toISOString().split('T')[0];
        if (dailyData.hasOwnProperty(orderDate)) {
            dailyData[orderDate] += order.total;
        }
    });
    
    return Object.keys(dailyData).map(date => ({
        date,
        sales: dailyData[date]
    }));
}

function getTopProducts(orders) {
    const productSales = {};
    
    orders.forEach(order => {
        order.items.forEach(item => {
            if (!productSales[item.name]) {
                productSales[item.name] = {
                    name: item.name,
                    quantity: 0,
                    revenue: 0
                };
            }
            productSales[item.name].quantity += item.quantity;
            productSales[item.name].revenue += item.price * item.quantity;
        });
    });
    
    return Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
}

function updateSalesChart(dailySalesData) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    if (salesChart) {
        salesChart.destroy();
    }
    
    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dailySalesData.map(data => formatShortDate(data.date)),
            datasets: [{
                label: 'Penjualan (Rp)',
                data: dailySalesData.map(data => data.sales),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Penjualan: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            }
        }
    });
}

function updateTopProductsChart(topProductsData) {
    const ctx = document.getElementById('topProductsChart').getContext('2d');
    
    if (topProductsChart) {
        topProductsChart.destroy();
    }
    
    topProductsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: topProductsData.map(product => product.name),
            datasets: [{
                data: topProductsData.map(product => product.revenue),
                backgroundColor: [
                    '#3B82F6',
                    '#10B981',
                    '#F59E0B',
                    '#EF4444',
                    '#8B5CF6'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const product = topProductsData[context.dataIndex];
                            return `${product.name}: ${formatCurrency(product.revenue)} (${product.quantity} unit)`;
                        }
                    }
                }
            }
        }
    });
}

function updateStockAlertTable(lowStockItems) {
    const tbody = document.getElementById('stockAlertTable');
    
    if (lowStockItems.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                    Tidak ada obat dengan stok rendah
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = lowStockItems.map(drug => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${drug.name}</div>
                <div class="text-sm text-gray-500">${drug.category}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${drug.stock}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">10</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                           ${drug.stock < 5 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}">
                    ${drug.stock < 5 ? 'Kritis' : 'Rendah'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="restockDrug('${drug.id}')" 
                        class="text-blue-600 hover:text-blue-900">
                    Restock
                </button>
            </td>
        </tr>
    `).join('');
}

function updateTransactionTable(transactions) {
    const tbody = document.getElementById('transactionTable');
    
    if (transactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                    Tidak ada transaksi dalam periode ini
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = transactions.map(transaction => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #${transaction.id}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${formatShortDate(transaction.date)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${transaction.customerName}</div>
                <div class="text-sm text-gray-500">${transaction.customerPhone}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${formatCurrency(transaction.total)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                           bg-green-100 text-green-800">
                    Selesai
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="viewTransactionDetail('${transaction.id}')" 
                        class="text-indigo-600 hover:text-indigo-900">
                    Detail
                </button>
            </td>
        </tr>
    `).join('');
}

function restockDrug(drugId) {
    const newStock = prompt('Masukkan jumlah stok baru:');
    if (newStock && !isNaN(newStock)) {
        const drugs = JSON.parse(localStorage.getItem('adminDrugs')) || [];
        const drugIndex = drugs.findIndex(d => d.id === drugId);
        
        if (drugIndex !== -1) {
            drugs[drugIndex].stock = parseInt(newStock);
            localStorage.setItem('adminDrugs', JSON.stringify(drugs));
            generateReport(); // Refresh report
            showToast('Stok berhasil diperbarui!', 'success');
        }
    }
}

function viewTransactionDetail(transactionId) {
    // This would open the order detail modal from order management
    // For now, just show an alert
    alert(`Detail transaksi #${transactionId} akan ditampilkan`);
}

function exportReport(format) {
    if (format === 'pdf') {
        showToast('Export PDF sedang diproses...', 'info');
        // Here you would implement PDF generation
        setTimeout(() => {
            showToast('Laporan PDF berhasil diunduh!', 'success');
        }, 2000);
    } else if (format === 'excel') {
        showToast('Export Excel sedang diproses...', 'info');
        // Here you would implement Excel generation
        setTimeout(() => {
            showToast('Laporan Excel berhasil diunduh!', 'success');
        }, 2000);
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount).replace('IDR', 'Rp');
}

function formatShortDate(dateString) {
    return new Date(dateString).toLocaleDateString('id-ID', {
        month: 'short',
        day: 'numeric'
    });
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
        if (document.body.contains(toast)) {
            document.body.removeChild(toast);
        }
    }, 3000);
}