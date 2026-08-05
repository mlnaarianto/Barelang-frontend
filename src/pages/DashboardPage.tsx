import React from 'react';

export default function DashboardPage() {
  return (
    <div>
      {/* Header Halaman */}
      <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm w-max">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
          🏠
        </div>
        <h2 className="m-0 text-slate-800 text-lg font-bold">Dashboard</h2>
      </div>
      
      {/* Kartu Informasi dengan Gradasi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Kartu 1: Pink ke Orange */}
        <div className="p-6 rounded-xl text-white shadow-md bg-gradient-to-br from-pink-400 to-orange-300 relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-sm font-medium mb-2 opacity-90">Total Stasiun Sensor</h4>
            <h2 className="text-3xl font-bold mb-4">5 Unit</h2>
            <p className="text-xs opacity-80">Tersebar di seluruh Batam</p>
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white rounded-full opacity-10"></div>
          <div className="absolute -right-2 -bottom-2 w-24 h-24 bg-white rounded-full opacity-10"></div>
        </div>

        {/* Kartu 2: Biru Terang ke Biru Gelap */}
        <div className="p-6 rounded-xl text-white shadow-md bg-gradient-to-br from-blue-400 to-blue-600 relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-sm font-medium mb-2 opacity-90">Status Server AI</h4>
            <h2 className="text-3xl font-bold mb-4">Aktif</h2>
            <p className="text-xs opacity-80">Sistem berjalan normal</p>
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white rounded-full opacity-10"></div>
          <div className="absolute -right-2 -bottom-2 w-24 h-24 bg-white rounded-full opacity-10"></div>
        </div>

        {/* Kartu 3: Hijau Tosca */}
        <div className="p-6 rounded-xl text-white shadow-md bg-gradient-to-br from-teal-400 to-emerald-400 relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-sm font-medium mb-2 opacity-90">Koneksi Database</h4>
            <h2 className="text-3xl font-bold mb-4">Terhubung</h2>
            <p className="text-xs opacity-80">Sinkronisasi real-time aktif</p>
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white rounded-full opacity-10"></div>
          <div className="absolute -right-2 -bottom-2 w-24 h-24 bg-white rounded-full opacity-10"></div>
        </div>

      </div>
    </div>
  );
}