import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-transparent text-white mt-16 relative overflow-hidden">
      {/* Background wrapper for footer content */}
      <div className="bg-gray-800 py-12 relative">
        {/* Footer Decoration */}
        <div 
          className="absolute left-0 top-0 h-full w-80 opacity-90 bg-no-repeat bg-left bg-cover pointer-events-none"
          style={{ backgroundImage: 'url(/images/footer-decor.png)' }}
        ></div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <img
                  src="/images/pharmahub-logo.png"
                  alt="PharmaHub"
                  className="h-12 w-auto"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'inline';
                  }}
                />
                <span className="text-2xl font-bold text-white hidden">PharmaHub</span>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                PharmaHub adalah platform terpercaya untuk kebutuhan obat dan
                kesehatan Anda. Kami menyediakan obat-obatan berkualitas dengan
                layanan yang profesional dan terpercaya.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white transition">
                  <i className="fab fa-facebook-f text-xl"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  <i className="fab fa-twitter text-xl"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  <i className="fab fa-instagram text-xl"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  <i className="fab fa-whatsapp text-xl"></i>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Semua Produk
                  </Link>
                </li>
                <li>
                  <Link
                    to="/notifications"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Notifikasi
                  </Link>
                </li>
                <li>
                  <Link
                    to="/history"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Riwayat
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cart"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Keranjang
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Kontak</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <i className="fas fa-map-marker-alt mr-3 text-blue-400"></i>
                  <span className="text-sm">Jl. Kesehatan No. 123, Jakarta</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-phone mr-3 text-blue-400"></i>
                  <span className="text-sm">+62 21 1234 5678</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-envelope mr-3 text-blue-400"></i>
                  <span className="text-sm">info@pharmahub.com</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-clock mr-3 text-blue-400"></i>
                  <span className="text-sm">24/7 Customer Service</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                &copy; 2024 PharmaHub. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  FAQ
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
