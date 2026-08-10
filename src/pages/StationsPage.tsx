import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// --- FIX IKON MARKER LEAFLET DI REACT/VITE ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;
// ---------------------------------------------

interface Station {
  id: string;
  station_code: string;
  station_name: string;
  latitude: number;
  longitude: number;
  region?: string;
  status_active: boolean;
}

// Komponen helper untuk menangkap klik pada peta di dalam Modal
function LocationSelector({ position, setPosition, onSelectLocation }: {
  position: [number, number] | null,
  setPosition: (pos: [number, number]) => void,
  onSelectLocation: (lat: number, lon: number) => void
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onSelectLocation(lat, lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // State untuk Modal Form (Tambah / Edit)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // State loading khusus saat sedang menunggu hasil reverse-geocode dari klik peta
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Form Field State
  const [formData, setFormData] = useState({
    station_code: '',
    station_name: '',
    latitude: '',
    longitude: '',
    region: '',
    status_active: true,
  });

  // State untuk marker di peta dalam modal
  const [selectedCoord, setSelectedCoord] = useState<[number, number] | null>(null);

  const fetchStations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/admin/stations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStations(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Gagal mengambil data kecamatan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  // Handler Buka Modal Tambah
  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setCurrentId(null);
    setFormData({
      station_code: '',
      station_name: '',
      latitude: '',
      longitude: '',
      region: '',
      status_active: true,
    });
    setSelectedCoord([1.1301, 104.0529]); // Default pusat Batam
    setIsModalOpen(true);
  };

  // Handler Buka Modal Edit
  const handleOpenEditModal = (item: Station) => {
    setIsEditMode(true);
    setCurrentId(item.id);
    setFormData({
      station_code: item.station_code,
      station_name: item.station_name,
      latitude: item.latitude.toString(),
      longitude: item.longitude.toString(),
      region: item.region || '',
      status_active: item.status_active,
    });
    setSelectedCoord([item.latitude, item.longitude]);
    setIsModalOpen(true);
  };

  // Fungsi helper untuk mengubah nama wilayah menjadi format kode otomatis (misal: "Kecamatan Nongsa" -> "BTM-NONGSA")
  const generateStationCode = (regionName: string) => {
    if (!regionName) return '';
    const cleanName = regionName
      .replace(/Kecamatan|Kota|Kabupaten/gi, '')
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '-');
    return `BTM-${cleanName}`;
  };

  // Fungsi otomatis panggil reverse geocoding ke backend saat peta diklik.
  // Mengisi otomatis: latitude, longitude, region, nama kecamatan, DAN kode kecamatan!
  const handleMapClickCoord = async (lat: number, lon: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lon.toFixed(6),
    }));

    setIsLocating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/admin/stations/reverse-geocode?lat=${lat}&lon=${lon}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const suggestedName = response.data?.suggested_name || '';
      const displayName = response.data?.display_name || '';

      setFormData((prev) => ({
        ...prev,
        region: displayName || prev.region,
        station_name: suggestedName || prev.station_name,
        station_code: suggestedName ? generateStationCode(suggestedName) : prev.station_code,
      }));
    } catch (err) {
      console.log('Gagal mengambil nama wilayah otomatis');
    } finally {
      setIsLocating(false);
    }
  };

  // Handler Submit Form (POST / PUT)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        station_code: formData.station_code,
        station_name: formData.station_name,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        region: formData.region ? formData.region : null,
        status_active: formData.status_active,
      };

      if (isEditMode && currentId) {
        await axios.put(`http://localhost:8080/api/admin/stations/${currentId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:8080/api/admin/stations', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setIsModalOpen(false);
      fetchStations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan data kecamatan');
    }
  };

  // Handler Hapus Kecamatan (DELETE)
  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kecamatan ini?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/admin/stations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus kecamatan');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="m-0 mb-1 text-slate-900 text-xl font-bold">Kelola Kecamatan Pemantau</h2>
          <p className="text-slate-500 text-sm">Manajemen titik lokasi kecamatan wilayah Batam.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
        >
          + Tambah Kecamatan
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-rose-50 text-rose-600 rounded-lg border border-rose-200 text-sm">
          {error}
        </div>
      )}

      {/* PETA UTAMA HALAMAN */}
      {!loading && stations.length > 0 && (
        <div className="h-80 w-full mb-6 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
          <MapContainer center={[1.1301, 104.0529]} zoom={11} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {stations.map((item) => (
              <Marker key={item.id} position={[item.latitude, item.longitude]}>
                <Popup>
                  <div className="text-sm">
                    <strong className="block text-slate-900">{item.station_name}</strong>
                    <span className="text-slate-500 block mb-1">Kode: {item.station_code}</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status_active ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.status_active ? 'AKTIF' : 'TIDAK AKTIF'}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* TABEL DATA KECAMATAN */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
              <th className="py-3 px-6 font-semibold">Kode</th>
              <th className="py-3 px-6 font-semibold">Nama Kecamatan</th>
              <th className="py-3 px-6 font-semibold">Koordinat (Lat, Long)</th>
              <th className="py-3 px-6 font-semibold">Status</th>
              <th className="py-3 px-6 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
            {loading ? (
              <tr><td colSpan={5} className="py-8 text-center text-slate-500">Memuat data kecamatan...</td></tr>
            ) : stations.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-slate-500">Belum ada data kecamatan.</td></tr>
            ) : (
              stations.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-slate-900">{item.station_code}</td>
                  <td className="py-4 px-6 font-semibold">{item.station_name}</td>
                  <td className="py-4 px-6 text-slate-500">{item.latitude}, {item.longitude}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      item.status_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {item.status_active ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-xs bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-rose-600 hover:text-rose-800 font-medium text-xs bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL FORM DENGAN PETA INTERAKTIF --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden my-8">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900">
                {isEditMode ? 'Edit Kecamatan' : 'Tambah Kecamatan Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              {/* Peta Interaktif di dalam Modal */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Klik pada peta di bawah — kode, nama kecamatan, region, dan koordinat akan terisi otomatis:
                </label>
                <div className="h-56 w-full rounded-lg overflow-hidden border border-slate-300 relative">
                  <MapContainer center={selectedCoord || [1.1301, 104.0529]} zoom={12} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationSelector
                      position={selectedCoord}
                      setPosition={setSelectedCoord}
                      onSelectLocation={handleMapClickCoord}
                    />
                  </MapContainer>
                  {isLocating && (
                    <div className="absolute top-2 right-2 bg-white/90 text-xs text-slate-600 px-2 py-1 rounded shadow z-[1000]">
                      Mengambil data wilayah otomatis...
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kode Kecamatan (Otomatis dari Peta)</label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: BTM-NONGSA"
                    value={formData.station_code}
                    onChange={(e) => setFormData({...formData, station_code: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Kecamatan (Otomatis dari Peta)</label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: Kecamatan Nongsa"
                    value={formData.station_name}
                    onChange={(e) => setFormData({...formData, station_name: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Latitude (Otomatis dari Peta)</label>
                  <input
                    type="text"
                    readOnly
                    required
                    value={formData.latitude}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Longitude (Otomatis dari Peta)</label>
                  <input
                    type="text"
                    readOnly
                    required
                    value={formData.longitude}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Region / Alamat Detail (Otomatis dari Peta)</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({...formData, region: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="status_active"
                  checked={formData.status_active}
                  onChange={(e) => setFormData({...formData, status_active: e.target.checked})}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="status_active" className="text-sm font-medium text-slate-700">Status Aktif</label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}