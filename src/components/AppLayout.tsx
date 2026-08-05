import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import DashboardPage from '../pages/DashboardPage'; // Sesuaikan path ini
import SensorsPage from '../pages/SensorsPage';     // Sesuaikan path ini

export default function AppLayout() {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/'; 
  };

  return (
    // Tambahkan w-full di sini dan pastikan bg-slate-100 terpasang
    <div className="flex h-screen w-full font-sans bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} onLogout={handleLogout} />

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 p-8 overflow-y-auto">
          {activeMenu === 'dashboard' ? <DashboardPage /> : <SensorsPage />}
        </main>

        <Footer />
      </div>
    </div>
  );
}