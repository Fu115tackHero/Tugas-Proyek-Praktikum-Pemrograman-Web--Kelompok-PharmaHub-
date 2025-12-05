/**
 * DeletedProductsModal Component
 * Modal untuk menampilkan dan mengelola produk yang dihapus (soft delete)
 */

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DeletedProductsModal.css";

const DeletedProductsModal = ({ isOpen, onClose }) => {
  const [deletedProducts, setDeletedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch deleted products saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      fetchDeletedProducts();
    }
  }, [isOpen]);

  /**
   * Fetch daftar produk yang dihapus dari API
   */
  const fetchDeletedProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("pharmahub_token");
      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        return;
      }

      const response = await axios.get("/api/products/deleted", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDeletedProducts(response.data.data || []);
    } catch (err) {
      console.error("Error fetching deleted products:", err);
      setError(
        err.response?.data?.message || "Gagal mengambil data produk yang dihapus"
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Restore produk yang dihapus
   */
  const handleRestore = async (productId, productName) => {
    try {
      if (!window.confirm(`Yakin ingin mengembalikan produk "${productName}"?`)) {
        return;
      }

      setRestoring(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem("pharmahub_token");
      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        setRestoring(false);
        return;
      }

      const response = await axios.post(`/api/products/${productId}/restore`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess(`Produk "${productName}" berhasil dikembalikan!`);

      // Remove dari list
      setDeletedProducts(
        deletedProducts.filter((p) => p.product_id !== productId)
      );

      // Refresh list after 1 second
      setTimeout(() => {
        fetchDeletedProducts();
      }, 1000);
    } catch (err) {
      console.error("Error restoring product:", err);
      setError(err.response?.data?.message || "Gagal mengembalikan produk");
    } finally {
      setRestoring(false);
    }
  };

  /**
   * Format tanggal
   */
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Produk yang Dihapus</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Error Alert */}
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="alert alert-success">
              <span>{success}</span>
              <button onClick={() => setSuccess(null)}>×</button>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Memuat produk yang dihapus...</p>
            </div>
          ) : deletedProducts.length === 0 ? (
            /* Empty State */
            <div className="empty-state">
              <div className="empty-icon"></div>
              <h3>Tidak ada produk yang dihapus</h3>
              <p>Semua produk Anda masih aktif</p>
            </div>
          ) : (
            /* Deleted Products Table */
            <div className="products-table-wrapper">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Nama Produk</th>
                    <th>Brand</th>
                    <th>Kategori</th>
                    <th>Harga</th>
                    <th>Stok</th>
                    <th>Pesanan</th>
                    <th>Dihapus Pada</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedProducts.map((product) => (
                    <tr key={product.product_id} className="product-row">
                      <td className="product-name">
                        <div className="name-wrapper">
                          <span className="name">{product.name}</span>
                        </div>
                      </td>
                      <td>{product.brand || "-"}</td>
                      <td>{product.category_name || "-"}</td>
                      <td className="price">{formatCurrency(product.price)}</td>
                      <td className="stock">
                        <span
                          className={`badge ${
                            product.stock > 0 ? "badge-success" : "badge-danger"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="orders">
                        <span className="badge badge-info">
                          {product.total_orders}
                        </span>
                      </td>
                      <td className="date">{formatDate(product.updated_at)}</td>
                      <td className="actions">
                        <button
                          className="btn-restore"
                          onClick={() =>
                            handleRestore(product.product_id, product.name)
                          }
                          disabled={restoring}
                          title="Kembalikan produk ini"
                        >
                          Kembalikan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary */}
          {!loading && deletedProducts.length > 0 && (
            <div className="modal-summary">
              <p>
                Total produk dihapus: <strong>{deletedProducts.length}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Tutup
          </button>
          {deletedProducts.length > 0 && (
            <button className="btn-refresh" onClick={fetchDeletedProducts}>
              Segarkan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeletedProductsModal;
