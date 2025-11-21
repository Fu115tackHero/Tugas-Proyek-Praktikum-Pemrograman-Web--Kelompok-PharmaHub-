import { useState, useEffect } from 'react';

const DrugManagement = () => {
  const [drugs, setDrugs] = useState([]);
  const [filteredDrugs, setFilteredDrugs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [prescriptionFilter, setPrescriptionFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentDrug, setCurrentDrug] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [availableGenerics, setAvailableGenerics] = useState([]);
  const [newGeneric, setNewGeneric] = useState('');
  const [showAddGeneric, setShowAddGeneric] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    image: '',
    prescriptionRequired: false,
    // Detail fields
    brand: '',
    uses: '',
    howItWorks: '',
    genericName: '',
    importantInfo: [],
    ingredients: [],
    precaution: [],
    sideEffects: [],
    interactions: [],
    indication: []
  });

  // Temporary inputs for adding items to arrays
  const [tempInputs, setTempInputs] = useState({
    importantInfo: '',
    ingredients: '',
    precaution: '',
    sideEffects: '',
    interactions: '',
    indication: ''
  });

  useEffect(() => {
    loadDrugs();
    loadGenerics();
  }, []);

  useEffect(() => {
    filterDrugs();
  }, [drugs, searchTerm, categoryFilter, prescriptionFilter]);

  const loadDrugs = () => {
    const savedDrugs = localStorage.getItem('adminDrugs');
    if (savedDrugs) {
      setDrugs(JSON.parse(savedDrugs));
    } else {
      const defaultDrugs = getDefaultDrugs();
      localStorage.setItem('adminDrugs', JSON.stringify(defaultDrugs));
      setDrugs(defaultDrugs);
    }
  };

  const loadGenerics = () => {
    const savedGenerics = localStorage.getItem('drugGenerics');
    if (savedGenerics) {
      setAvailableGenerics(JSON.parse(savedGenerics));
    } else {
      const defaultGenerics = [
        'Paracetamol',
        'Amoxicillin',
        'Ascorbic Acid',
        'Magnesium Hydroxide',
        'Chlorpheniramine Maleate',
        'Ibuprofen',
        'Cetirizine',
        'Omeprazole',
        'Metformin',
        'Amlodipine'
      ];
      localStorage.setItem('drugGenerics', JSON.stringify(defaultGenerics));
      setAvailableGenerics(defaultGenerics);
    }
  };

  const handleAddGeneric = () => {
    if (newGeneric.trim() && !availableGenerics.includes(newGeneric.trim())) {
      const updatedGenerics = [...availableGenerics, newGeneric.trim()].sort();
      setAvailableGenerics(updatedGenerics);
      localStorage.setItem('drugGenerics', JSON.stringify(updatedGenerics));
      setFormData({ ...formData, genericName: newGeneric.trim() });
      setNewGeneric('');
      setShowAddGeneric(false);
    }
  };

  const filterDrugs = () => {
    let filtered = drugs.filter(drug => {
      const matchesSearch = drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          drug.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || drug.category === categoryFilter;
      const matchesPrescription = !prescriptionFilter || 
                                (drug.prescriptionRequired || drug.requiresPrescription || false).toString() === prescriptionFilter;
      
      return matchesSearch && matchesCategory && matchesPrescription;
    });
    setFilteredDrugs(filtered);
  };

  const openAddModal = () => {
    setCurrentDrug(null);
    setFormData({
      name: '',
      category: '',
      price: '',
      stock: '',
      description: '',
      image: '',
      prescriptionRequired: false,
      brand: '',
      uses: '',
      howItWorks: '',
      genericName: '',
      importantInfo: [],
      ingredients: [],
      precaution: [],
      sideEffects: [],
      interactions: [],
      indication: []
    });
    setTempInputs({
      importantInfo: '',
      ingredients: '',
      precaution: '',
      sideEffects: '',
      interactions: '',
      indication: ''
    });
    setShowModal(true);
  };

  const openEditModal = (drug) => {
    setCurrentDrug(drug);
    setFormData({
      name: drug.name,
      category: drug.category,
      price: drug.price,
      stock: drug.stock,
      description: drug.description,
      image: drug.image || '',
      prescriptionRequired: drug.prescriptionRequired || drug.requiresPrescription || false,
      brand: drug.brand || '',
      uses: drug.uses || '',
      howItWorks: drug.howItWorks || '',
      genericName: drug.genericName || drug.generic || '',
      importantInfo: drug.importantInfo || [],
      ingredients: drug.ingredients || [],
      precaution: drug.precaution || drug.warnings || [],
      sideEffects: drug.sideEffects || [],
      interactions: drug.interactions || drug.drugInteractions || [],
      indication: drug.indication || drug.indications || []
    });
    setTempInputs({
      importantInfo: '',
      ingredients: '',
      precaution: '',
      sideEffects: '',
      interactions: '',
      indication: ''
    });
    setShowModal(true);
  };

  const addArrayItem = (field) => {
    if (tempInputs[field].trim()) {
      setFormData({
        ...formData,
        [field]: [...formData[field], tempInputs[field].trim()]
      });
      setTempInputs({ ...tempInputs, [field]: '' });
    }
  };

  const removeArrayItem = (field, index) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const drugData = {
      ...formData,
      price: parseInt(formData.price),
      stock: parseInt(formData.stock),
      id: currentDrug ? currentDrug.id : `drug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    let updatedDrugs;
    if (currentDrug) {
      updatedDrugs = drugs.map(d => d.id === currentDrug.id ? drugData : d);
    } else {
      updatedDrugs = [...drugs, drugData];
    }

    localStorage.setItem('adminDrugs', JSON.stringify(updatedDrugs));
    setDrugs(updatedDrugs);
    setShowModal(false);
    alert(currentDrug ? 'Obat berhasil diperbarui!' : 'Obat berhasil ditambahkan!');
  };

  const openDeleteModal = (drugId) => {
    setDeleteId(drugId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    const updatedDrugs = drugs.filter(d => d.id !== deleteId);
    localStorage.setItem('adminDrugs', JSON.stringify(updatedDrugs));
    setDrugs(updatedDrugs);
    setShowDeleteModal(false);
    alert('Obat berhasil dihapus!');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount).replace('IDR', 'Rp');
  };

  const getDefaultDrugs = () => {
    return [
      {
        id: 'drug_001',
        name: 'Paracetamol 500mg',
        category: 'Analgesik',
        price: 5000,
        stock: 50,
        description: 'Obat penurun demam dan pereda nyeri',
        image: '/images/products/paracetamol.png',
        prescriptionRequired: false
      },
      {
        id: 'drug_002',
        name: 'Ibuprofen 400mg',
        category: 'Analgesik',
        price: 25000,
        stock: 30,
        description: 'Obat anti inflamasi untuk nyeri dan demam',
        image: '/images/products/ibuprofen.jpg',
        prescriptionRequired: false
      },
      {
        id: 'drug_003',
        name: 'Cetirizine 10mg',
        category: 'Antihistamin',
        price: 15000,
        stock: 75,
        description: 'Obat alergi dan antihistamin',
        image: '/images/products/cetirizine.jpeg',
        prescriptionRequired: false
      },
      {
        id: 'drug_004',
        name: 'Promag',
        category: 'Antasida',
        price: 12000,
        stock: 8,
        description: 'Obat maag dan asam lambung',
        image: '/images/products/promag.jpg',
        prescriptionRequired: false
      },
      {
        id: 'drug_005',
        name: 'Oralit',
        category: 'Elektrolit',
        price: 8000,
        stock: 40,
        description: 'Larutan elektrolit untuk dehidrasi',
        image: '/images/products/oralit.jpeg',
        prescriptionRequired: false
      }
    ];
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b mb-6">
        <div className="px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Manajemen Obat</h2>
            <p className="text-gray-600">Kelola data obat dan inventory apotek</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <i className="fas fa-plus mr-2"></i>
            Tambah Obat
          </button>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari obat..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Semua Kategori</option>
                <option value="Analgesik">Analgesik</option>
                <option value="Antibiotik">Antibiotik</option>
                <option value="Vitamin">Vitamin</option>
                <option value="Antasida">Antasida</option>
                <option value="Antihistamin">Antihistamin</option>
              </select>
              <select
                value={prescriptionFilter}
                onChange={(e) => setPrescriptionFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Semua Jenis</option>
                <option value="true">Resep Dokter</option>
                <option value="false">Obat Bebas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Drug Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Obat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stok
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resep
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDrugs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Tidak ada data obat
                  </td>
                </tr>
              ) : (
                filteredDrugs.map((drug) => (
                  <tr key={drug.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={drug.image || 'https://via.placeholder.com/40'}
                            alt={drug.name}
                            onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{drug.name}</div>
                          <div className="text-sm text-gray-500">
                            {drug.description?.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {drug.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(drug.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{drug.stock}</span>
                      {drug.stock < 10 && (
                        <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Stok Rendah
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          (drug.prescriptionRequired || drug.requiresPrescription)
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {(drug.prescriptionRequired || drug.requiresPrescription) ? 'Resep Dokter' : 'Obat Bebas'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openEditModal(drug)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => openDeleteModal(drug.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white mb-10">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {currentDrug ? 'Edit Obat' : 'Tambah Obat Baru'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                {/* Basic Information Section */}
                <div className="border-b pb-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Informasi Dasar</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Obat *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategori *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Pilih Kategori</option>
                        <option value="Analgesik">Analgesik</option>
                        <option value="Antibiotik">Antibiotik</option>
                        <option value="Vitamin">Vitamin</option>
                        <option value="Antasida">Antasida</option>
                        <option value="Antihistamin">Antihistamin</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Harga *</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stok *</label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Gambar
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center mt-4">
                  <input
                    type="checkbox"
                    checked={formData.prescriptionRequired}
                    onChange={(e) =>
                      setFormData({ ...formData, prescriptionRequired: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Memerlukan Resep Dokter
                  </label>
                </div>
              </div>

              {/* Brand Information */}
              <div className="border-b pb-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Nama Brand</h4>
                <div>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Contoh: Bodrex, Panadol, dll"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>                {/* Generic Selection */}
                <div className="border-b pb-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Nama Generik</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pilih Generik
                      </label>
                      <select
                        value={formData.genericName}
                        onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Pilih Generik</option>
                        {availableGenerics.map((gen, idx) => (
                          <option key={idx} value={gen}>{gen}</option>
                        ))}
                      </select>
                    </div>
                    {!showAddGeneric ? (
                      <button
                        type="button"
                        onClick={() => setShowAddGeneric(true)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        + Tambah Generik Baru
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newGeneric}
                          onChange={(e) => setNewGeneric(e.target.value)}
                          placeholder="Nama generik baru"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddGeneric}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Tambah
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddGeneric(false);
                            setNewGeneric('');
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Batal
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              {/* Uses Section */}
              <div className="border-b pb-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Kegunaan</h4>
                <div>
                  <textarea
                    value={formData.uses}
                    onChange={(e) => setFormData({ ...formData, uses: e.target.value })}
                    rows="4"
                    placeholder="Jelaskan kegunaan obat ini..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* How It Works Section */}
              <div className="border-b pb-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Cara Kerja</h4>
                <div>
                  <textarea
                    value={formData.howItWorks}
                    onChange={(e) => setFormData({ ...formData, howItWorks: e.target.value })}
                    rows="4"
                    placeholder="Jelaskan cara kerja obat ini..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>                {/* Ingredients Section */}
                <div className="border-b pb-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Kandungan</h4>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempInputs.ingredients}
                        onChange={(e) => setTempInputs({ ...tempInputs, ingredients: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('ingredients'))}
                        placeholder="Tambah kandungan"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => addArrayItem('ingredients')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Tambah
                      </button>
                    </div>
                    <ul className="space-y-1">
                      {formData.ingredients.map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                          <span className="text-sm">• {item}</span>
                          <button
                            type="button"
                            onClick={() => removeArrayItem('ingredients', idx)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Important Info Section */}
                <div className="border-b pb-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Informasi Penting</h4>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempInputs.importantInfo}
                        onChange={(e) => setTempInputs({ ...tempInputs, importantInfo: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('importantInfo'))}
                        placeholder="Tambah informasi penting"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => addArrayItem('importantInfo')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Tambah
                      </button>
                    </div>
                    <ul className="space-y-1">
                      {formData.importantInfo.map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                          <span className="text-sm">• {item}</span>
                          <button
                            type="button"
                            onClick={() => removeArrayItem('importantInfo', idx)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Precaution Section */}
                <div className="border-b pb-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Peringatan</h4>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempInputs.precaution}
                        onChange={(e) => setTempInputs({ ...tempInputs, precaution: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('precaution'))}
                        placeholder="Tambah peringatan"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => addArrayItem('precaution')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Tambah
                      </button>
                    </div>
                    <ul className="space-y-1">
                      {formData.precaution.map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                          <span className="text-sm">• {item}</span>
                          <button
                            type="button"
                            onClick={() => removeArrayItem('precaution', idx)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Side Effects Section */}
                <div className="border-b pb-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Efek Samping</h4>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempInputs.sideEffects}
                        onChange={(e) => setTempInputs({ ...tempInputs, sideEffects: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('sideEffects'))}
                        placeholder="Tambah efek samping"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => addArrayItem('sideEffects')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Tambah
                      </button>
                    </div>
                    <ul className="space-y-1">
                      {formData.sideEffects.map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                          <span className="text-sm">• {item}</span>
                          <button
                            type="button"
                            onClick={() => removeArrayItem('sideEffects', idx)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Interactions Section */}
                <div className="border-b pb-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Interaksi Obat</h4>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempInputs.interactions}
                        onChange={(e) => setTempInputs({ ...tempInputs, interactions: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('interactions'))}
                        placeholder="Tambah interaksi obat"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => addArrayItem('interactions')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Tambah
                      </button>
                    </div>
                    <ul className="space-y-1">
                      {formData.interactions.map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                          <span className="text-sm">• {item}</span>
                          <button
                            type="button"
                            onClick={() => removeArrayItem('interactions', idx)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Indication Section */}
                <div className="pb-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Indikasi</h4>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempInputs.indication}
                        onChange={(e) => setTempInputs({ ...tempInputs, indication: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('indication'))}
                        placeholder="Tambah indikasi"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => addArrayItem('indication')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Tambah
                      </button>
                    </div>
                    <ul className="space-y-1">
                      {formData.indication.map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                          <span className="text-sm">• {item}</span>
                          <button
                            type="button"
                            onClick={() => removeArrayItem('indication', idx)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t sticky bottom-0 bg-white">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Hapus Obat</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Apakah Anda yakin ingin menghapus obat ini? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 mr-2"
                >
                  Hapus
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrugManagement;
