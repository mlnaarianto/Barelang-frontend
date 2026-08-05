import React from 'react';

export default function SensorsPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm w-max">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
          📡
        </div>
        <h2 className="m-0 text-slate-800 text-lg font-bold">Kelola Sensor Cuaca</h2>
      </div>
      <div className="bg-white p-8 rounded-xl border border-slate-100 text-center text-slate-400 text-sm shadow-sm">
        Fitur pengelolaan sensor akan segera ditampilkan di sini.
      </div>
    </div>
  );
}