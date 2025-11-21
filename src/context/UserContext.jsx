// file: src/context/UserContext.jsx
import React, { createContext, useState, useContext } from 'react';

// 1. Bikin Context-nya
const UserContext = createContext();

// 2. Bikin Provider-nya (Penyedianya)
// Ini nanti membungkus aplikasi kita biar datanya ngalir ke semua komponen
export const UserProvider = ({ children }) => {
  // Di sini kita simpan data user secara global
  // Contoh data awal (nanti ini biasanya diambil dari Database/API pas login)
  const [user, setUser] = useState({
    name: 'Dian Ananda', // Sesuaikan nama default
    initials: 'DA',
    email: 'dian.ananda@example.com',
    // INI KUNCINYA: Awalnya mungkin kosong atau pakai gambar default
    profileImage: null, 
  });

  // Fungsi buat update data user (dipanggil pas upload foto berhasil)
  const updateUserProfile = (newUserData) => {
    setUser((prevUser) => ({
      ...prevUser, // Pertahankan data lama
      ...newUserData, // Timpa dengan data baru (misal cuma image-nya aja)
    }));
  };

  return (
    <UserContext.Provider value={{ user, updateUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook biar gampang pakainya nanti di komponen lain
export const useUser = () => {
  return useContext(UserContext);
};