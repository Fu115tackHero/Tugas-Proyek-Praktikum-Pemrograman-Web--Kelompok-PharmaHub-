// Drug Management functionality
let currentEditingDrug = null;
let allDrugs = [];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize drug management (no auth required)
    initializeDrugManagement();
    loadDrugs();
    setupEventListeners();
});

function initializeDrugManagement() {
    // Initialize drugs data if not exists
    if (!localStorage.getItem('adminDrugs')) {
        const defaultDrugs = getDefaultDrugs();
        localStorage.setItem('adminDrugs', JSON.stringify(defaultDrugs));
    }
}

function setupEventListeners() {
    // Search functionality
    document.getElementById('searchDrug').addEventListener('input', filterDrugs);
    document.getElementById('categoryFilter').addEventListener('change', filterDrugs);
    document.getElementById('prescriptionFilter').addEventListener('change', filterDrugs);
    
    // Form submission
    document.getElementById('drugForm').addEventListener('submit', handleDrugSubmit);
}

function loadDrugs() {
    allDrugs = JSON.parse(localStorage.getItem('adminDrugs')) || [];
    renderDrugsTable(allDrugs);
}

function renderDrugsTable(drugs) {
    const tbody = document.getElementById('drugTableBody');
    
    if (drugs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                    Tidak ada data obat
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = drugs.map(drug => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                        <img class="h-10 w-10 rounded-full object-cover" 
                             src="${drug.image || '../assets/images/default-drug.jpg'}" 
                             alt="${drug.name}">
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${drug.name}</div>
                        <div class="text-sm text-gray-500">${drug.description?.substring(0, 50)}...</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                           bg-blue-100 text-blue-800">
                    ${drug.category}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${formatCurrency(drug.price)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-900">${drug.stock}</span>
                ${drug.stock < 10 ? 
                    '<span class="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Stok Rendah</span>' : 
                    ''
                }
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                           ${drug.requiresPrescription ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">
                    ${drug.requiresPrescription ? 'Resep Dokter' : 'Obat Bebas'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="editDrug('${drug.id}')" 
                        class="text-indigo-600 hover:text-indigo-900 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteDrug('${drug.id}')" 
                        class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function filterDrugs() {
    const searchTerm = document.getElementById('searchDrug').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const prescriptionFilter = document.getElementById('prescriptionFilter').value;
    
    let filteredDrugs = allDrugs.filter(drug => {
        const matchesSearch = drug.name.toLowerCase().includes(searchTerm) ||
                            drug.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || drug.category === categoryFilter;
        const matchesPrescription = !prescriptionFilter || 
                                  drug.requiresPrescription.toString() === prescriptionFilter;
        
        return matchesSearch && matchesCategory && matchesPrescription;
    });
    
    renderDrugsTable(filteredDrugs);
}

function openAddDrugModal() {
    currentEditingDrug = null;
    document.getElementById('modalTitle').textContent = 'Tambah Obat Baru';
    document.getElementById('drugForm').reset();
    document.getElementById('drugId').value = '';
    document.getElementById('drugModal').classList.remove('hidden');
}

function editDrug(drugId) {
    const drug = allDrugs.find(d => d.id === drugId);
    if (!drug) return;
    
    currentEditingDrug = drug;
    document.getElementById('modalTitle').textContent = 'Edit Obat';
    
    // Populate form
    document.getElementById('drugId').value = drug.id;
    document.getElementById('drugName').value = drug.name;
    document.getElementById('drugCategory').value = drug.category;
    document.getElementById('drugPrice').value = drug.price;
    document.getElementById('drugStock').value = drug.stock;
    document.getElementById('drugDescription').value = drug.description;
    document.getElementById('drugImage').value = drug.image || '';
    document.getElementById('requiresPrescription').checked = drug.requiresPrescription;
    
    document.getElementById('drugModal').classList.remove('hidden');
}

function handleDrugSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: document.getElementById('drugId').value || generateId(),
        name: document.getElementById('drugName').value,
        category: document.getElementById('drugCategory').value,
        price: parseInt(document.getElementById('drugPrice').value),
        stock: parseInt(document.getElementById('drugStock').value),
        description: document.getElementById('drugDescription').value,
        image: document.getElementById('drugImage').value,
        requiresPrescription: document.getElementById('requiresPrescription').checked
    };
    
    if (currentEditingDrug) {
        // Update existing drug
        const index = allDrugs.findIndex(d => d.id === currentEditingDrug.id);
        if (index !== -1) {
            allDrugs[index] = { ...allDrugs[index], ...formData };
        }
    } else {
        // Add new drug
        allDrugs.push(formData);
    }
    
    // Save to localStorage
    localStorage.setItem('adminDrugs', JSON.stringify(allDrugs));
    
    // Refresh table
    renderDrugsTable(allDrugs);
    
    // Close modal
    closeDrugModal();
    
    // Show success message
    showToast(currentEditingDrug ? 'Obat berhasil diperbarui!' : 'Obat berhasil ditambahkan!', 'success');
}

function deleteDrug(drugId) {
    currentEditingDrug = allDrugs.find(d => d.id === drugId);
    if (!currentEditingDrug) return;
    
    document.getElementById('deleteModal').classList.remove('hidden');
    
    // Set up delete confirmation
    document.getElementById('confirmDelete').onclick = function() {
        allDrugs = allDrugs.filter(d => d.id !== drugId);
        localStorage.setItem('adminDrugs', JSON.stringify(allDrugs));
        renderDrugsTable(allDrugs);
        closeDeleteModal();
        showToast('Obat berhasil dihapus!', 'success');
    };
}

function closeDrugModal() {
    document.getElementById('drugModal').classList.add('hidden');
    currentEditingDrug = null;
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
}

function generateId() {
    return 'drug_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount).replace('IDR', 'Rp');
}

function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}

function getDefaultDrugs() {
    return [
        {
            id: 'drug_001',
            name: 'Paracetamol 500mg',
            category: 'Analgesik',
            price: 5000,
            stock: 50,
            description: 'Obat penurun demam dan pereda nyeri',
            image: '../assets/images/paracetamol.jpg',
            requiresPrescription: false
        },
        {
            id: 'drug_002',
            name: 'Amoxicillin 500mg',
            category: 'Antibiotik',
            price: 25000,
            stock: 30,
            description: 'Antibiotik untuk infeksi bakteri',
            image: '../assets/images/amoxicillin.jpg',
            requiresPrescription: true
        },
        {
            id: 'drug_003',
            name: 'Vitamin C 1000mg',
            category: 'Vitamin',
            price: 15000,
            stock: 75,
            description: 'Suplemen vitamin C untuk daya tahan tubuh',
            image: '../assets/images/vitamin-c.jpg',
            requiresPrescription: false
        },
        {
            id: 'drug_004',
            name: 'Promag',
            category: 'Antasida',
            price: 12000,
            stock: 8,
            description: 'Obat maag dan asam lambung',
            image: '../assets/images/promag.jpg',
            requiresPrescription: false
        },
        {
            id: 'drug_005',
            name: 'CTM 4mg',
            category: 'Antihistamin',
            price: 8000,
            stock: 5,
            description: 'Obat alergi dan gatal-gatal',
            image: '../assets/images/ctm.jpg',
            requiresPrescription: false
        }
    ];
}