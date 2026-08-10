import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import StationsPage from './pages/StationsPage'; 
import WeatherPredictionsPage from './pages/WeatherPredictionsPage'; 
import RbacPage from './pages/RbacPage'; 
import RolesPermissionsPage from './pages/RolesPermissionsPage'; 

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* ========================================== */}
        {/* RUTE PUBLIK (Tanpa Login)                    */}
        {/* ========================================== */}

        {/* Default route saat pertama buka aplikasi -> langsung ke halaman publik */}
        <Route 
          path="/" 
          element={<Navigate to="/public/weather" replace />} 
        />

        {/* Route Login */}
        <Route 
          path="/login" 
          element={token ? <Navigate to="/admin/dashboard" replace /> : <LoginPage />} 
        />
        
        {/* Route Publik untuk Masyarakat Umum (Standalone tanpa Sidebar Admin) */}
        <Route 
          path="/public/weather" 
          element={<div className="p-4 md:p-8 bg-slate-50 min-h-screen"><WeatherPredictionsPage /></div>} 
        />

        {/* ========================================== */}
        {/* RUTE ADMIN TERPROTEKSI (Butuh Login)         */}
        {/* Semua rute admin sekarang berada di bawah prefix /admin  */}
        {/* ========================================== */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Default Route: otomatis ke /admin/dashboard */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="stations" element={<StationsPage />} />
          
          {/* Rute Prediksi Cuaca khusus Admin (Berada di dalam Sidebar) */}
          <Route path="weather-predictions" element={<WeatherPredictionsPage />} />
          
          <Route path="rbac" element={<RbacPage />} />
          <Route path="roles-permissions" element={<RolesPermissionsPage />} />
        </Route>

        {/* Fallback: path yang tidak dikenali -> balik ke halaman publik */}
        <Route path="*" element={<Navigate to="/public/weather" replace />} />
      </Routes>
    </BrowserRouter>
  );
}