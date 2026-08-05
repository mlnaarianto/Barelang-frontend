import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

export default function AppLayout() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login'; 
  };

  return (
    <div className="flex h-screen w-full font-sans bg-slate-100 overflow-hidden">
      {/* Sidebar - tidak perlu lempar props activeMenu lagi */}
      <Sidebar onLogout={handleLogout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 p-8 overflow-y-auto">
          {/* Di sinilah halaman akan berganti-ganti sesuai URL */}
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}