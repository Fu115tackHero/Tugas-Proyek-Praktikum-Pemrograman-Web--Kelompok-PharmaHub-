/** @type {import('tailwindcss').Config} */
export default {
  // Content: Menentukan file mana saja yang akan dipindai oleh Tailwind
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // Container: Mengatur lebar konten agar rapi di tengah (dari kode lama kamu)
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2rem',
        '2xl': '2rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
    extend: {
      // Colors: Menggunakan palet Hijau PharmaHub (dari kode lama) + varian baru
      colors: {
        primary: {
          DEFAULT: '#10b981', // Warna utama (Emerald-500) - DIPERTAHANKAN
          hover: '#059669',   // Warna saat kursor diarahkan (lebih gelap)
          light: '#d1fae5',   // Warna latar belakang tipis (Emerald-100)
        },
        secondary: '#059669', // Warna sekunder - DIPERTAHANKAN
      },
      // Font Size: Mempertahankan ukuran font lama kamu
      fontSize: {
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      // Font Family: Menambahkan font stack standar agar lebih modern
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      // Box Shadow: Menambahkan efek "Glassmorphism" (efek kaca)
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(16, 185, 129, 0.15)', // Bayangan halus kehijauan
      },
      // Animation: Menambahkan animasi custom untuk elemen yang "melayang"
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}