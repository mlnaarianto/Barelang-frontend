import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import SensorsPage from './pages/SensorsPage';
import RbacPage from './pages/RbacPage'; // Tambahkan import ini
import RolesPermissionsPage from './pages/RolesPermissionsPage'; // Tambahkan import ini

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
        {/* Route Login */}
        <Route 
          path="/login" 
          element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />

        {/* Route Utama dengan AppLayout sebagai pembungkus */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Default Route: otomatis ke /dashboard jika mengakses root (/) */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Halaman Anak / Child Routes */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="sensors" element={<SensorsPage />} />
          
          {/* Rute baru untuk halaman RBAC ditambahkan di sini */}
          <Route path="rbac" element={<RbacPage />} />

          {/* Rute baru untuk halaman Role & Permission ditambahkan di sini */}
          <Route path="roles-permissions" element={<RolesPermissionsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}