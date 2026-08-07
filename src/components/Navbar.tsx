import React, { useEffect, useState } from 'react';

interface UserData {
  username: string;
  name: string;
  role: string;
}

// Ambil inisial dari name, contoh "Super Admin BMKG" -> "SA", "Budi" -> "BU"
const getInitials = (name: string) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function Navbar() {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const displayName = user?.name || 'Pengguna';
  const displayRole = user?.role || '-';

  return (
    <header className="h-[70px] bg-transparent flex items-center justify-between px-8 pt-4">
      <h4 className="m-0 text-slate-800 text-lg font-bold">Panel Kontrol</h4>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
          {getInitials(displayName)}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-800 capitalize">{displayName}</span>
          <span className="text-xs text-slate-500 capitalize">{displayRole}</span>
        </div>
      </div>
    </header>
  );
}