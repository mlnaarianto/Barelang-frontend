import React from 'react';

export default function Navbar() {
  return (
    <header className="h-[70px] bg-transparent flex items-center justify-between px-8 pt-4">
      <h4 className="m-0 text-slate-800 text-lg font-bold">Panel Kontrol</h4>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
          SA
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-800">Superadmin</span>
          <span className="text-xs text-slate-500">Project Manager</span>
        </div>
      </div>
    </header>
  );
}