import React, { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/'; // Kembali ke root tanpa sisa hash
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', background: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid #1e293b' }}>
        <div>
          <div style={{ padding: '24px 20px', borderBottom: '1px solid #1e293b' }}>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#f8fafc', fontWeight: 600 }}>BMKG Batam</h3>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Weather Monitoring System</span>
          </div>
          <ul style={{ listStyle: 'none', padding: '16px 12px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              <button 
                onClick={() => setActiveMenu('dashboard')}
                style={{ 
                  width: '100%', 
                  textAlign: 'left', 
                  padding: '12px 16px', 
                  background: activeMenu === 'dashboard' ? '#2563eb' : 'transparent', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '14px'
                }}
              >
                📊 Dashboard Utama
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveMenu('sensors')}
                style={{ 
                  width: '100%', 
                  textAlign: 'left', 
                  padding: '12px 16px', 
                  background: activeMenu === 'sensors' ? '#2563eb' : 'transparent', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '14px'
                }}
              >
                📡 Kelola Sensor Cuaca
              </button>
            </li>
          </ul>
        </div>
        
        <div style={{ padding: '20px', borderTop: '1px solid #1e293b' }}>
          <button 
            onClick={handleLogout} 
            style={{ 
              width: '100%',
              padding: '10px', 
              background: '#ef4444', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            Keluar (Logout)
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: '70px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px' }}>
          <h4 style={{ margin: 0, color: '#334155', fontSize: '16px' }}>Panel Kontrol & Manajemen Data</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
              SA
            </div>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b' }}>Superadmin</span>
          </div>
        </header>

        <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          {activeMenu === 'dashboard' ? (
            <div>
              <h2 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>Selamat Datang, Superadmin! 👋</h2>
              <p style={{ color: '#64748b', marginBottom: '25px' }}>Berikut adalah ringkasan sistem pemantauan cuaca dan stasiun sensor wilayah Batam.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Total Stasiun Sensor</span>
                  <h3 style={{ margin: '8px 0 0 0', fontSize: '28px', color: '#0f172a' }}>5 Unit</h3>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Status Server AI</span>
                  <h3 style={{ margin: '8px 0 0 0', fontSize: '28px', color: '#16a34a' }}>Aktif & Normal</h3>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Koneksi Database</span>
                  <h3 style={{ margin: '8px 0 0 0', fontSize: '28px', color: '#2563eb' }}>Terhubung</h3>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>Kelola Sensor Cuaca</h2>
              <p style={{ color: '#64748b' }}>Halaman manajemen dan konfigurasi titik sensor cuaca BMKG Batam.</p>
              <div style={{ background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '20px', textAlign: 'center', color: '#94a3b8' }}>
                Fitur pengelolaan sensor akan segera ditampilkan di sini.
              </div>
            </div>
          )}
        </main>

        <footer style={{ height: '50px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#64748b' }}>
          &copy; 2026 Weather API Batam &bull; Politeknik Negeri Batam
        </footer>
      </div>
    </div>
  );
}