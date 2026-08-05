import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import AppLayout from './components/AppLayout';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Jika belum login, tampilkan halaman Login
  if (!token) {
    return <LoginPage />;
  }

  // Jika sudah login, tampilkan Layout utama aplikasi
  return <AppLayout />;
}

export default App;