import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Helper untuk menangani jika ID dari Golang dikirim berupa Array of Bytes (UUID)
const formatSafeId = (id: any) => {
  if (Array.isArray(id) && id.length === 16) {
    const hex = id.map((b: number) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return id;
};

export default function RbacPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [allRoles, setAllRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State untuk modal/form edit role user (diubah menjadi string[] karena role ID berupa UUID string)
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  const fetchRbacData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/admin/rbac', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const resData = response.data?.data?.data || response.data?.data || response.data;
      setUsers(resData.users || []);
      setAllRoles(resData.roles || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal mengambil data RBAC.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRbacData();
  }, []);

  // Fungsi untuk membuka modal edit dan mengisi role awal user tersebut
  const handleOpenEdit = (user: any) => {
    setSelectedUser(user);
    // Konversi role ID ke format string yang aman
    const currentRoleIds = user.roles ? user.roles.map((r: any) => formatSafeId(r.id || r.ID)) : [];
    setSelectedRoleIds(currentRoleIds);
  };

  // Fungsi untuk submit perubahan role ke backend dengan aman
  const handleSaveRoles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const rawUserId = selectedUser.id || selectedUser.ID;
    const safeUserId = formatSafeId(rawUserId);

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8080/api/admin/users/${safeUserId}/roles`,
        { role_ids: selectedRoleIds }, // Mengirim array string UUID [ "uuid-1", "uuid-2" ]
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Role berhasil diperbarui!');
      setSelectedUser(null);
      fetchRbacData();
    } catch (err: any) {
      console.error("DETAIL ERROR:", err.response?.data);
      alert(err.response?.data?.error || err.response?.data?.message || 'Gagal memperbarui role.');
    }
  };

  // Handler checkbox role (menggunakan string ID)
  const handleCheckboxChange = (roleId: string) => {
    if (selectedRoleIds.includes(roleId)) {
      setSelectedRoleIds(selectedRoleIds.filter((id) => id !== roleId));
    } else {
      setSelectedRoleIds([...selectedRoleIds, roleId]);
    }
  };

  if (loading) return <div className="p-8 text-slate-500 font-medium">Memuat data sistem...</div>;
  if (error) return <div className="p-8 text-rose-600 font-medium">{error}</div>;

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Kelola RBAC</h1>
        <p className="text-sm text-slate-500">Kelola daftar pengguna dan hak akses peran (Role) sistem.</p>
      </div>

      {/* Tabel Pengguna */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-800 text-sm">Daftar Pengguna & Role</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase bg-slate-50/50">
                <th className="px-6 py-3">Username</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role Aktif</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {users.length > 0 ? (
                users.map((user, index) => {
                  const uniqueKey = formatSafeId(user.id || user.ID) || index;
                  return (
                    <tr key={uniqueKey} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{user.username}</td>
                      <td className="px-6 py-4 text-slate-500">{user.email || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((role: any, idx: number) => (
                              <span key={idx} className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                                {role.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">Tanpa Role</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                        >
                          Edit Role
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">
                    Tidak ada data pengguna ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form / Modal Sederhana untuk Edit Role */}
      {selectedUser && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 max-w-lg">
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Edit Role untuk: <span className="text-blue-600">{selectedUser.username}</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">Pilih role yang ingin diberikan kepada pengguna ini.</p>
          
          <form onSubmit={handleSaveRoles}>
            <div className="space-y-2 mb-6">
              {allRoles.map((role: any) => {
                const roleId = formatSafeId(role.id || role.ID);
                return (
                  <label key={roleId} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedRoleIds.includes(roleId)}
                      onChange={() => handleCheckboxChange(roleId)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{role.name}</p>
                      <p className="text-xs text-slate-400">{role.description || 'Tidak ada deskripsi'}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}