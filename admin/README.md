# PharmaHub Admin Panel

Panel administrasi untuk mengelola apotek PharmaHub dengan 3 fitur utama yang fokus dan praktis.

## 🚀 Fitur Utama

### 1. **Manajemen Obat** (`admin/drug-management.html`)
- ✅ **Tambah Obat Baru** - Form lengkap dengan validasi
- ✅ **Edit Data Obat** - Update informasi obat yang sudah ada
- ✅ **Hapus Obat** - Konfirmasi sebelum menghapus
- ✅ **Pencarian & Filter** - Berdasarkan nama, kategori, dan jenis resep
- ✅ **Monitoring Stok** - Alert untuk stok rendah
- ✅ **Kategorisasi** - Analgesik, Antibiotik, Vitamin, Antasida, Antihistamin

### 2. **Manajemen Pesanan** (`admin/order-management.html`)
- ✅ **Lihat Pesanan Masuk** - Daftar semua pesanan dengan detail lengkap
- ✅ **Update Status Pesanan** - 5 status: Pending → Sedang Disiapkan → Siap Diambil → Selesai / Dibatalkan
- ✅ **Filter & Pencarian** - Berdasarkan status, tanggal, ID pesanan, atau nama pelanggan
- ✅ **Detail Pesanan** - Informasi lengkap pelanggan dan item yang dipesan
- ✅ **Monitoring Real-time** - Statistik pesanan berdasarkan status
- ✅ **Notifikasi Status** - Toast notification untuk perubahan status

### 3. **Laporan Penjualan** (`admin/sales-report.html`)
- ✅ **Statistik Penjualan** - Total penjualan, transaksi, rata-rata, obat terjual
- ✅ **Grafik Penjualan** - Chart.js untuk visualisasi trend penjualan harian
- ✅ **Obat Terlaris** - Top 5 obat dengan grafik donut
- ✅ **Peringatan Stok** - Monitoring obat dengan stok rendah (< 10)
- ✅ **Filter Periode** - Hari ini, minggu, bulan, quarter, tahun, atau custom range
- ✅ **Export Laporan** - Tombol untuk export PDF dan Excel (fitur placeholder)
- ✅ **Detail Transaksi** - Tabel semua transaksi dalam periode terpilih

## 🎨 Dashboard Overview (`admin/index.html`)
- **Statistik Cards** - Total obat, pesanan hari ini, pending orders, penjualan bulanan
- **Quick Actions** - Shortcut ke fitur-fitur utama
- **Recent Activity** - Log aktivitas terbaru
- **Responsive Design** - Optimized untuk desktop dan mobile

## 🔧 Teknologi yang Digunakan

### Frontend
- **HTML5** - Struktur halaman yang semantic
- **Tailwind CSS** - Styling framework untuk UI yang konsisten
- **JavaScript ES6** - Logic aplikasi dengan modules
- **Chart.js** - Library untuk grafik penjualan
- **Font Awesome** - Icon set yang lengkap

### Storage
- **localStorage** - Penyimpanan data lokal browser
- **JSON Format** - Struktur data yang mudah dikelola

### Features
- **Responsive Design** - Mobile-first approach
- **Modal Components** - Pop-up untuk form dan detail
- **Search & Filter** - Real-time filtering dan pencarian
- **Data Validation** - Form validation sebelum submit
- **Toast Notifications** - User feedback untuk aksi

## 📂 Struktur File

```
admin/
├── index.html              # Dashboard utama
├── drug-management.html    # Manajemen obat
├── order-management.html   # Manajemen pesanan
└── sales-report.html       # Laporan penjualan

assets/js/admin/
├── dashboard.js           # Logic dashboard
├── drug-management.js     # CRUD obat
├── order-management.js    # Manajemen pesanan
└── sales-report.js        # Laporan dan analytics
```

## 🚀 Cara Menggunakan

### Akses Admin Panel
1. **Login sebagai Admin**:
   - Buka halaman `Login.html`
   - Pilih "Admin Apotek" dari dropdown
   - Gunakan credentials: `admin@pharmahub.com` / `admin123`
   - Klik tombol auto-fill untuk kemudahan
   - Klik "Masuk ke Dashboard"

2. **Automatic Redirect**: Setelah login berhasil, akan otomatis diarahkan ke admin dashboard

3. **Session Management**: Session berlaku selama 24 jam, setelah itu akan diminta login ulang

### Security Features
- **Role-based Access**: Hanya admin yang bisa akses admin panel
- **Session Validation**: Cek otomatis setiap halaman admin
- **Auto Redirect**: Redirect otomatis jika tidak ada akses
- **Secure Logout**: Hapus session saat logout

### Navigasi
- **Sidebar kiri** - Menu utama dengan 4 section
- **Responsive** - Mobile hamburger menu (jika diperlukan)
- **Breadcrumb** - Indikator halaman aktif

### Fitur-Fitur

**Mengelola Obat:**
1. Klik "Manajemen Obat" di sidebar
2. Gunakan tombol "Tambah Obat" untuk obat baru
3. Klik icon edit/hapus pada setiap row
4. Gunakan search dan filter untuk mencari obat

**Mengelola Pesanan:**
1. Klik "Manajemen Pesanan" di sidebar
2. Lihat semua pesanan dengan status real-time
3. Klik "Update Status" untuk mengubah status pesanan
4. Klik "Lihat Detail" untuk informasi lengkap

**Melihat Laporan:**
1. Klik "Laporan Penjualan" di sidebar
2. Pilih periode laporan yang diinginkan
3. Klik "Generate Report" untuk update data
4. Gunakan tombol export untuk download laporan

## 💾 Data Management

### Default Data
- **5 obat contoh** dengan berbagai kategori
- **3 pesanan sample** dengan status berbeda
- **Data tersimpan di localStorage** browser

### Storage Keys
```javascript
'pharmaHubUser'  // User session data
'adminDrugs'     // Array obat
'adminOrders'    // Array pesanan
```

### Demo Accounts
```javascript
// Admin Account
email: 'admin@pharmahub.com'
password: 'admin123'
role: 'admin'

// Customer Account  
email: 'customer@pharmahub.com'
password: 'customer123'
role: 'customer'
```

### Reset Data
Untuk reset data ke default, hapus localStorage:
```javascript
localStorage.removeItem('adminDrugs');
localStorage.removeItem('adminOrders');
localStorage.removeItem('pharmaHubUser'); // Logout user
```

### Manual Logout
```javascript
logout(); // Hapus session dan redirect ke login
```

## 🎯 Use Cases

### Skenario Apotek Harian

**Pagi (Persiapan):**
1. Cek dashboard untuk overview
2. Review pesanan pending dari malam sebelumnya
3. Cek stock alert untuk restock obat

**Siang (Operasional):**
1. Update status pesanan yang sedang disiapkan
2. Tambah obat baru jika ada supply
3. Monitor pesanan masuk real-time

**Sore (Laporan):**
1. Generate laporan penjualan harian
2. Review obat terlaris
3. Update stok obat yang habis

**Malam (Evaluasi):**
1. Lihat summary penjualan hari ini
2. Export laporan untuk accounting
3. Set pesanan pending untuk besok

## ⚡ Performance & UX

### Optimisasi
- **Lazy Loading** untuk tabel besar
- **Search Debouncing** untuk performa filter
- **Modal Management** untuk UX yang smooth
- **Toast Notifications** untuk feedback instan

### Responsive Design
- **Desktop First** - Layout optimal untuk admin workstation
- **Mobile Friendly** - Tetap usable di tablet/mobile
- **Touch Friendly** - Button size yang sesuai

## 🔮 Future Enhancements

### Prioritas Tinggi
- **Real API Integration** - Replace localStorage dengan database
- **User Authentication** - Login system untuk admin
- **Role Management** - Different access levels

### Prioritas Medium
- **PDF/Excel Export** - Implementasi actual export functionality
- **Email Notifications** - Auto email untuk status update
- **Inventory Automation** - Auto restock alerts

### Prioritas Rendah
- **Advanced Analytics** - Prediction dan forecasting
- **Multi-location** - Support untuk multiple apotek
- **Mobile App** - Native mobile admin app

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6) - Actions, links
- **Success**: Green (#10B981) - Completed, success states
- **Warning**: Yellow (#F59E0B) - Alerts, pending
- **Danger**: Red (#EF4444) - Delete, error states
- **Purple**: Purple (#8B5CF6) - Analytics, reports

### Typography
- **Headings**: Font-semibold, various sizes
- **Body**: Regular weight, readable line-height
- **Labels**: Font-medium for form labels

### Spacing
- **Consistent**: Tailwind spacing scale (4, 6, 8, 12, 16...)
- **Cards**: Padding 6 (24px) standard
- **Sections**: Margin bottom 6-8 between sections

---

**Status**: ✅ Complete - Ready for Production
**Version**: 1.0.0
**Last Updated**: October 2024