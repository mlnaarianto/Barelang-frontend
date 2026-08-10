import { useState, useEffect } from 'react';
import axios from 'axios';

interface DashboardStats {
  total_stations: number;
  total_predictions: number;
  ai_server_status: string;
  database_status: string;
}

const API_BASE = 'http://localhost:8080/api/admin';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total_stations: 0,
    total_predictions: 0,
    ai_server_status: 'Memeriksa...',
    database_status: 'Memeriksa...',
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE}/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data);
      } catch (err) {
        console.error('Gagal mengambil statistik dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      {/* Header Halaman */}
      <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm w-max">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
          🏠
        </div>
        <h2 className="m-0 text-slate-800 text-lg font-bold">Dashboard AtmoIQ AI</h2>
      </div>
      
      {/* Kartu Informasi dengan Gradasi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Kartu 1: Total Stasiun / Wilayah */}
        <div className="p-6 rounded-xl text-white shadow-md bg-gradient-to-br from-pink-400 to-orange-300 relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-sm font-medium mb-2 opacity-90">Total Kecamatan/Lokasi (Saat ini batam)</h4>
            <h2 className="text-3xl font-bold mb-4">{loading ? '...' : `${stats.total_stations} Unit`}</h2>
            <p className="text-xs opacity-80">Terdaftar di database sistem</p>
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white rounded-full opacity-10"></div>
          <div className="absolute -right-2 -bottom-2 w-24 h-24 bg-white rounded-full opacity-10"></div>
        </div>

        {/* Kartu 2: Status Server AI */}
        <div className="p-6 rounded-xl text-white shadow-md bg-gradient-to-br from-blue-400 to-blue-600 relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-sm font-medium mb-2 opacity-90">Status Server AI (LSTM + ENSO)</h4>
            <h2 className="text-3xl font-bold mb-4">{loading ? '...' : stats.ai_server_status}</h2>
            <p className="text-xs opacity-80">Model 30 tahun siap inferensi</p>
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white rounded-full opacity-10"></div>
          <div className="absolute -right-2 -bottom-2 w-24 h-24 bg-white rounded-full opacity-10"></div>
        </div>

        {/* Kartu 3: Koneksi Database */}
        <div className="p-6 rounded-xl text-white shadow-md bg-gradient-to-br from-teal-400 to-emerald-400 relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-sm font-medium mb-2 opacity-90">Koneksi Database & Log</h4>
            <h2 className="text-3xl font-bold mb-4">{loading ? '...' : stats.database_status}</h2>
            <p className="text-xs opacity-80">{stats.total_predictions} Total log prediksi tersimpan</p>
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white rounded-full opacity-10"></div>
          <div className="absolute -right-2 -bottom-2 w-24 h-24 bg-white rounded-full opacity-10"></div>
        </div>

      </div>
    </div>
  );
}