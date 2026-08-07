import React, { useState } from 'react';
import axios from 'axios';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:8080/login', {
        username,
        password,
      });

      // Struktur response backend: { data: { message, token, username, role } }
      const resData = response.data.data;

      localStorage.setItem('token', resData.token);
      localStorage.setItem('user', JSON.stringify({
        username: resData.username,
        name: resData.name,
        role: resData.role,
      }));

      setMessage('Login Berhasil! Mengalihkan...');

      setTimeout(() => {
        window.location.href = '/'; 
      }, 500);

    } catch (err: any) {
      setLoading(false);
      setMessage(err.response?.data?.data?.error || err.response?.data?.error || 'Login gagal, periksa kembali username atau password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md border border-slate-200 box-border">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Weather API Batam</h2>
          <p className="text-slate-500 text-sm">Silakan masuk ke panel sistem</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">Username / Email</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Masukkan username atau email..."
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm box-border"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm box-border"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold text-sm transition-colors duration-200 ${
              loading 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
            }`}
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        {message && (
          <div className={`mt-5 p-3 rounded-lg text-center text-xs font-medium ${
            message.includes('Berhasil') 
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
              : 'bg-rose-50 text-rose-600 border border-rose-200'
          }`}>
            {message}
          </div>
        )}

      </div>
    </div>
  );
}