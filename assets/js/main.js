// ==========================================
// GLOBAL VARIABLES & CONSTANTS
// ==========================================

let cart = JSON.parse(localStorage.getItem("pharmahub-cart")) || [];
const TAX_RATE = 0.1; // 10% tax
let currentDiscount = 0;
let currentDiscountPercent = 0;

// Coupon codes configuration
const coupons = {
    'SEHAT10': { discount: 10, minAmount: 50000 },
    'OBAT20': { discount: 20, minAmount: 100000 },
    'PHARMAHUB15': { discount: 15, minAmount: 75000 }
};

// Product data for detail pages
const products = {
    '1': {
        id: '1',
        name: 'Paracetamol 500mg',
        brand: 'Sanbe Farma',
        price: 12000,
        description: 'Untuk menurunkan demam dan meredakan sakit kepala atau nyeri ringan.',
        uses: 'Menurunkan demam, meredakan nyeri ringan hingga sedang seperti sakit kepala, sakit gigi, nyeri otot.',
        genericName: 'Paracetamol',
        prescriptionRequired: false
    },
    '2': {
        id: '2',
        name: 'Ibuprofen 400mg',
        brand: 'Kimia Farma',
        price: 15000,
        description: 'Obat antiinflamasi non-steroid untuk nyeri otot, sendi, atau sakit gigi.',
        uses: 'Mengurangi peradangan, menurunkan demam, meredakan nyeri otot dan sendi.',
        genericName: 'Ibuprofen',
        prescriptionRequired: false
    },
};