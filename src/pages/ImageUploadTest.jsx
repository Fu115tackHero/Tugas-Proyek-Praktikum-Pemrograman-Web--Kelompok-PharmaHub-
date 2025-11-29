/**
 * Image Upload Test Component
 * Test upload dan display image dari Supabase
 */

import { useState } from "react";
import { uploadImage, getImagePreview, revokeImagePreview } from "../utils/imageUpload";
import ProductService from "../services/product.service";

const ImageUploadTest = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [showProducts, setShowProducts] = useState(false);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Cleanup previous preview
    if (previewUrl) {
      revokeImagePreview(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(getImagePreview(file));
    setError(null);
  };

  // Upload image to Supabase
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Pilih file terlebih dahulu");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const url = await uploadImage(selectedFile);
      setUploadedUrl(url);
      alert("✅ Upload berhasil!\n\nURL: " + url);
    } catch (err) {
      setError(err.message);
      alert("❌ Upload gagal: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Load products from API
  const loadProducts = async () => {
    try {
      const response = await ProductService.getAllProducts();
      if (response.success) {
        setProducts(response.data);
        setShowProducts(true);
      }
    } catch (err) {
      setError("Gagal memuat products: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🖼️ Test Upload & Display Image
          </h1>
          <p className="text-gray-600 mb-6">
            Test upload gambar ke Supabase Storage dan tampilkan di frontend
          </p>

          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">1. Upload Image</h2>
            
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="mb-4 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />

            {previewUrl && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-xs rounded-lg shadow"
                />
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold
                hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed
                transition-colors"
            >
              {isUploading ? "Uploading..." : "Upload ke Supabase"}
            </button>
          </div>

          {/* Uploaded Image Display */}
          {uploadedUrl && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-green-800">
                ✅ Upload Berhasil!
              </h2>
              <p className="text-sm text-gray-600 mb-2">URL:</p>
              <code className="block bg-white p-2 rounded text-sm mb-4 break-all">
                {uploadedUrl}
              </code>
              <p className="text-sm text-gray-600 mb-2">Gambar dari Supabase:</p>
              <img
                src={uploadedUrl}
                alt="Uploaded"
                className="max-w-xs rounded-lg shadow"
              />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">❌ {error}</p>
            </div>
          )}

          {/* Load Products Section */}
          <div className="border-t-2 border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">2. Lihat Produk dari Database</h2>
            <button
              onClick={loadProducts}
              className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold
                hover:bg-green-600 transition-colors mb-4"
            >
              Load Products
            </button>

            {showProducts && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div key={product.product_id} className="border rounded-lg p-4 shadow">
                    <div className="mb-3">
                      {product.main_image_url ? (
                        <img
                          src={product.main_image_url}
                          alt={product.name}
                          className="w-full h-40 object-cover rounded"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="w-full h-40 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-800">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.brand}</p>
                    <p className="text-lg font-bold text-blue-600 mt-2">
                      Rp {parseInt(product.price).toLocaleString("id-ID")}
                    </p>
                    {product.main_image_url && (
                      <p className="text-xs text-gray-500 mt-2 truncate">
                        {product.main_image_url}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4">
            <h3 className="font-semibold text-blue-800 mb-2">📝 Cara Test:</h3>
            <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
              <li>Pilih file gambar (JPG, PNG, WebP, max 5MB)</li>
              <li>Klik "Upload ke Supabase"</li>
              <li>Jika berhasil, URL dan gambar akan muncul</li>
              <li>Klik "Load Products" untuk melihat produk dari database</li>
              <li>Pastikan gambar produk bisa ditampilkan</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadTest;
