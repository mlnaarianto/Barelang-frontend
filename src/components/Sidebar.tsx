import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  return (
    <aside className="w-64 bg-white text-slate-700 flex flex-col justify-between shadow-sm z-10">
      <div>
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
            B
          </div>
          <div>
            <h3 className="m-0 text-base font-bold text-slate-900">BMKG Batam</h3>
            <span className="text-xs text-slate-500">Monitoring System</span>
          </div>
        </div>
        
        <ul className="list-none p-4 m-0 flex flex-col gap-1">
          <li>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                `w-full block text-left px-4 py-3 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600 font-bold' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`
              }
            >
              <span className="mr-2">🏠</span> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/sensors" 
              className={({ isActive }) => 
                `w-full block text-left px-4 py-3 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600 font-bold' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`
              }
            >
              <span className="mr-2">📡</span> Kelola Sensor
            </NavLink>
          </li>
        </ul>
      </div>
      
      <div className="p-5">
        <button 
          onClick={onLogout} 
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm transition-colors cursor-pointer flex justify-center items-center gap-2"
        >
          Keluar (Logout)
        </button>
      </div>
    </aside>
  );
}