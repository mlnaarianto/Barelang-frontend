import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Station {
  id: string;
  station_code: string;
  station_name: string;
  latitude: number;
  longitude: number;
  region?: string;
  status_active: boolean;
}

interface WeatherPrediction {
  id: string;
  user_id?: string;
  station_id: string;
  prediction_date: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  air_pressure: number;
  wind_speed: number | null;
  wind_direction: number | null;
  enso_index: number | null;
  climate_phase: string | null;
  status_weather: string;
  confidence_score: number | null;
  uncertainty_metric: number | null;
  model_version: string | null;
  prediction_horizon: number | null;
  station?: {
    id: string;
    station_name: string;
    station_code: string;
    latitude: number;
    longitude: number;
  } | null;
}

const PUBLIC_API_BASE = 'http://localhost:8080/api/public';
const ADMIN_API_BASE = 'http://localhost:8080/api/admin';
const AI_SERVICE_BASE = 'http://localhost:8005';

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function WeatherPredictionsPage() {
  const [predictions, setPredictions] = useState<WeatherPrediction[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [selectedPrediction, setSelectedPrediction] = useState<WeatherPrediction | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const [selectedStationId, setSelectedStationId] = useState<string>('ALL');
  const [mapCenter, setMapCenter] = useState<[number, number]>([1.1301, 104.0529]);

  const fetchPredictions = async (stationIdFilter?: string) => {
    try {
      const token = localStorage.getItem('token');

      let url = '';
      if (!token) {
        url = `${PUBLIC_API_BASE}/weather-predictions`;
      } else {
        url = `${ADMIN_API_BASE}/weather-predictions`;
      }

      if (stationIdFilter && stationIdFilter !== 'ALL') {
        url += url.includes('?') ? `&station_id=${stationIdFilter}` : `?station_id=${stationIdFilter}`;
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(url, { headers });
      const dbData = response.data || [];

      // AMBIL DATA DARI LOCAL STORAGE
      let localData = JSON.parse(localStorage.getItem('local_ai_predictions') || '[]');

      if (stationIdFilter && stationIdFilter !== 'ALL') {
        localData = localData.filter((p: WeatherPrediction) => p.station_id === stationIdFilter);
      }

      setPredictions([...localData, ...dbData]);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Gagal mengambil data prediksi');
    } finally {
      setLoading(false);
    }
  };

  const fetchStations = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = token ? `${ADMIN_API_BASE}/stations` : `${PUBLIC_API_BASE}/stations`;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(url, { headers });
      setStations(response.data || []);
    } catch (err) {
      console.error('Gagal mengambil daftar kecamatan', err);
    }
  };

  useEffect(() => {
    fetchStations();
    fetchPredictions();
  }, []);

  const handleSelectStation = (stationId: string) => {
    setSelectedStationId(stationId);
    setLoading(true);
    fetchPredictions(stationId);

    if (stationId !== 'ALL') {
      const target = stations.find((s) => s.id === stationId);
      if (target) {
        setMapCenter([target.latitude, target.longitude]);
      }
    }
  };

  // --- INTI PERBAIKAN ---
  // Sebelumnya fungsi ini tidak pernah mengirim latitude/longitude stasiun,
  // sehingga main.py selalu jatuh ke DEFAULT_LAT/DEFAULT_LON (pusat Batam)
  // untuk SEMUA kecamatan. Sekarang koordinat station yang dipilih (atau
  // koordinat GPS user, lihat handleUseCurrentLocation) selalu disertakan.
  const runAIPredictionForStation = async (
    station: Station,
    coords?: { latitude: number; longitude: number }
  ) => {
    // Validasi dasar agar tidak mengirim koordinat kosong/invalid ke AI service
    const latitude = coords?.latitude ?? station.latitude;
    const longitude = coords?.longitude ?? station.longitude;

    if (
      latitude === undefined ||
      longitude === undefined ||
      latitude === null ||
      longitude === null ||
      Number.isNaN(latitude) ||
      Number.isNaN(longitude)
    ) {
      alert('Koordinat wilayah tidak valid, tidak bisa menjalankan prediksi AI.');
      return;
    }

    try {
      setIsProcessingAI(true);
      const token = localStorage.getItem('token');

      if (!token) {
        const res = await axios.post(`${AI_SERVICE_BASE}/predict-local`, {
          station_id: station.id,
          latitude,
          longitude,
        });
        const newPrediction = res.data.data;

        newPrediction.id = `local-${Date.now()}`;
        newPrediction.station = station;

        const existingLocal = JSON.parse(localStorage.getItem('local_ai_predictions') || '[]');
        localStorage.setItem('local_ai_predictions', JSON.stringify([newPrediction, ...existingLocal]));

        alert(`✨ Wilayah Dipilih: ${station.station_name}\n\n🤖 AI berhasil memprediksi cuaca!\n(Data Anda disimpan sementara di Local Storage perangkat)`);
        fetchPredictions(station.id);
        return;
      }

      let activeUserId = '';
      const userStored = localStorage.getItem('user');
      if (userStored) {
        try {
          const parsedUser = JSON.parse(userStored);
          activeUserId = parsedUser.id || '';
        } catch (e) {
          console.error('Gagal parse data user', e);
        }
      }

      const aiPayload = {
        station_id: station.id,
        user_id: activeUserId,
        latitude,
        longitude,
        backend_url: `${ADMIN_API_BASE}/weather-predictions`,
        token: token,
      };

      await axios.post(`${AI_SERVICE_BASE}/predict-and-save`, aiPayload);

      alert(`✨ Wilayah Dipilih: ${station.station_name}\n\n🤖 AI LSTM Klimatologi (ENSO) berhasil memprediksi cuaca & tersimpan permanen ke Database!`);
      fetchPredictions(station.id);
    } catch (err: any) {
      console.error(err);
      alert('Gagal memproses AI: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handlePredictSelectedStation = async () => {
    if (selectedStationId === 'ALL') {
      alert('Silakan pilih salah satu wilayah/kecamatan terlebih dahulu dari dropdown atau klik marker pada peta!');
      return;
    }
    const currentStation = stations.find((s) => s.id === selectedStationId);
    if (!currentStation) {
      alert('Data stasiun tidak ditemukan.');
      return;
    }
    await runAIPredictionForStation(currentStation);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung Geolocation.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        setMapCenter([userLat, userLon]);

        if (stations.length > 0) {
          let closestStation = stations[0];
          let minDistance = Math.hypot(stations[0].latitude - userLat, stations[0].longitude - userLon);

          stations.forEach((s) => {
            const dist = Math.hypot(s.latitude - userLat, s.longitude - userLon);
            if (dist < minDistance) {
              minDistance = dist;
              closestStation = s;
            }
          });

          setSelectedStationId(closestStation.id);
          // Kirim koordinat GPS user secara langsung (lebih akurat daripada
          // koordinat stasiun terdekat), tapi tetap catat sebagai stasiun terdekat.
          await runAIPredictionForStation(closestStation, { latitude: userLat, longitude: userLon });
        } else {
          alert('Daftar stasiun belum tersedia.');
        }
      },
      (err) => {
        console.error(err);
        alert('Gagal mendapatkan lokasi GPS Anda. Pastikan izin lokasi diaktifkan.');
      }
    );
  };

  const handleShowDetail = async (id: string) => {
    try {
      const found = predictions.find((p) => p.id === id);
      if (found) {
        setSelectedPrediction(found);
        setShowModal(true);
      }
    } catch (err: any) {
      alert('Gagal memuat detail prediksi');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus log prediksi ini?')) return;

    if (id.startsWith('local-')) {
      let localData = JSON.parse(localStorage.getItem('local_ai_predictions') || '[]');
      localData = localData.filter((p: WeatherPrediction) => p.id !== id);
      localStorage.setItem('local_ai_predictions', JSON.stringify(localData));
      fetchPredictions(selectedStationId);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Anda tidak memiliki akses untuk menghapus data dari server.');
        return;
      }
      await axios.delete(`${ADMIN_API_BASE}/weather-predictions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPredictions(selectedStationId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus data prediksi');
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="m-0 mb-1 text-slate-900 text-xl font-bold">Dashboard Prediksi Cuaca & Klimatologi AI</h2>
          <p className="text-slate-500 text-sm">Pilih wilayah kecamatan atau gunakan lokasi saat ini untuk memicu prediksi AI.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handlePredictSelectedStation}
            disabled={isProcessingAI || selectedStationId === 'ALL'}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isProcessingAI ? '🤖 Memproses...' : '⚡ Prediksi Wilayah Ini'}
          </button>

          <button
            onClick={handleUseCurrentLocation}
            disabled={isProcessingAI}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isProcessingAI ? '🤖 Memproses...' : '📍 Gunakan Lokasi Saya'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-rose-50 text-rose-600 rounded-lg border border-rose-200 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="w-full sm:w-72">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Wilayah / Kecamatan:</label>
            <select
              value={selectedStationId}
              onChange={(e) => handleSelectStation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="ALL">🌐 Semua Wilayah</option>
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.station_name} ({s.station_code})
                </option>
              ))}
            </select>
          </div>
          <div className="text-xs text-slate-500 italic">
            * Klik marker pada peta untuk melihat atau memfilter data prediksi area tersebut.
          </div>
        </div>

        <div className="h-72 w-full rounded-xl overflow-hidden border border-slate-200 relative z-0">
          <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%' }}>
            <MapController center={mapCenter} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {stations.map((st) => (
              <Marker
                key={st.id}
                position={[st.latitude, st.longitude]}
                eventHandlers={{ click: () => handleSelectStation(st.id) }}
              >
                <Popup>
                  <div className="text-sm">
                    <strong className="block text-slate-900 font-bold">{st.station_name}</strong>
                    <span className="text-slate-500 text-xs block mb-2">Kode: {st.station_code}</span>
                    <button
                      onClick={() => handleSelectStation(st.id)}
                      className="px-2.5 py-1 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
                    >
                      Pilih Wilayah Ini
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
            Hasil Inferensi Model {selectedStationId !== 'ALL' ? `- ${stations.find(s => s.id === selectedStationId)?.station_name}` : '(Semua Wilayah)'}
          </h3>
          <span className="text-xs text-slate-500 font-medium">{predictions.length} Data ditemukan</span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider bg-slate-50/50">
              <th className="py-3 px-6 font-semibold">Waktu Prediksi</th>
              <th className="py-3 px-6 font-semibold">Kecamatan</th>
              <th className="py-3 px-6 font-semibold">Estimasi Cuaca</th>
              <th className="py-3 px-6 font-semibold">Fase Iklim (ENSO)</th>
              <th className="py-3 px-6 font-semibold">Suhu & Kelembapan</th>
              <th className="py-3 px-6 font-semibold">Curah Hujan & Tekanan</th>
              <th className="py-3 px-6 font-semibold">Confidence & RMSE</th>
              <th className="py-3 px-6 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">Memuat data inferensi AI...</td>
              </tr>
            ) : predictions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">Belum ada log prediksi cuaca untuk wilayah ini.</td>
              </tr>
            ) : (
              predictions.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-slate-900">
                    {formatDate(item.prediction_date)}
                    {item.id.startsWith('local-') && (
                      <span className="block mt-1 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded w-max font-bold">DATA LOKAL</span>
                    )}
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-800">{item.station?.station_name || 'Tidak diketahui'}</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {item.status_weather}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      item.climate_phase === 'El Nino' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      item.climate_phase === 'La Nina' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {item.climate_phase || 'Netral'} {item.enso_index !== null ? `(${item.enso_index})` : ''}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-medium">
                    {item.temperature}°C <span className="text-slate-400 font-normal">({item.humidity}%)</span>
                  </td>
                  <td className="py-4 px-6 text-slate-600">
                    {item.rainfall} mm <span className="text-xs text-slate-400 block">{item.air_pressure} hPa</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-emerald-600">{item.confidence_score ?? '-'}%</span>
                      <span className="text-xs text-slate-400">Uncertainty: {item.uncertainty_metric ?? '-'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleShowDetail(item.id)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-xs bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                      >
                        Show
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-rose-600 hover:text-rose-800 font-medium text-xs bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedPrediction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-base">Detail Inferensi AI & Klimatologi</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-slate-700 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="block text-xs text-slate-400 uppercase font-semibold">Wilayah / Stasiun</span>
                  <span className="font-bold text-slate-900 text-base">{selectedPrediction.station?.station_name || '-'}</span>
                  <span className="text-xs text-slate-500 block">Kode: {selectedPrediction.station?.station_code || '-'}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 uppercase font-semibold">Waktu Prediksi</span>
                  <span className="font-semibold text-slate-900">{formatDate(selectedPrediction.prediction_date)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  <span className="block text-xs text-blue-600 font-semibold uppercase">Estimasi Cuaca</span>
                  <span className="text-lg font-bold text-blue-900">{selectedPrediction.status_weather}</span>
                </div>
                <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                  <span className="block text-xs text-indigo-600 font-semibold uppercase">Fase Iklim (ENSO)</span>
                  <span className="text-lg font-bold text-indigo-900">
                    {selectedPrediction.climate_phase || 'Netral'} {selectedPrediction.enso_index !== null ? `(${selectedPrediction.enso_index})` : ''}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="block text-xs text-slate-500">Suhu Udara</span>
                  <span className="text-base font-bold text-slate-900">{selectedPrediction.temperature}°C</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="block text-xs text-slate-500">Kelembapan</span>
                  <span className="text-base font-bold text-slate-900">{selectedPrediction.humidity}%</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="block text-xs text-slate-500">Curah Hujan</span>
                  <span className="text-base font-bold text-slate-900">{selectedPrediction.rainfall} mm</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="block text-xs text-slate-500">Tekanan Udara</span>
                  <span className="text-base font-bold text-slate-900">{selectedPrediction.air_pressure} hPa</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="block text-xs text-slate-500">Kecepatan Angin</span>
                  <span className="text-base font-bold text-slate-900">{selectedPrediction.wind_speed ?? '-'} m/s</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="block text-xs text-slate-500">Arah Angin</span>
                  <span className="text-base font-bold text-slate-900">{selectedPrediction.wind_direction ?? '-'}°</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                <div>
                  Model AI: <span className="font-semibold text-slate-700">{selectedPrediction.model_version || 'LSTM-ENSO'}</span>
                </div>
                <div>
                  Confidence: <span className="font-bold text-emerald-600">{selectedPrediction.confidence_score ?? '-'}%</span> | Uncertainty: <span className="font-semibold text-slate-700">{selectedPrediction.uncertainty_metric ?? '-'}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}