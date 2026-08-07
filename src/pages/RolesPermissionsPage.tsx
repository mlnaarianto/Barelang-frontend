import React, { useEffect, useState } from 'react';
import axios from 'axios';

const formatSafeId = (id: any) => {
  if (Array.isArray(id) && id.length === 16) {
    const hex = id.map((b: number) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return id;
};

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/admin/rbac', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const resData = response.data?.data?.data || response.data?.data || response.data;
      setRoles(resData.roles || []);
      setAllPermissions(resData.permissions || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal mengambil data Role & Permission.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenEdit = (role: any) => {
    setSelectedRole(role);
    const currentPermIds = role.permissions
      ? role.permissions.map((p: any) => formatSafeId(p.id || p.ID))
      : [];
    setSelectedPermissionIds(currentPermIds);
  };

  const handleSavePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    const rawRoleId = selectedRole.id || selectedRole.ID;
    const safeRoleId = formatSafeId(rawRoleId);

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8080/api/admin/roles/${safeRoleId}/permissions`,
        { permission_ids: selectedPermissionIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Permission role berhasil diperbarui!');
      setSelectedRole(null);
      fetchData();
    } catch (err: any) {
      console.error("DETAIL ERROR:", err.response?.data);
      alert(err.response?.data?.error || err.response?.data?.message || 'Gagal memperbarui permission.');
    }
  };

  const handleCheckboxChange = (permId: string) => {
    if (selectedPermissionIds.includes(permId)) {
      setSelectedPermissionIds(selectedPermissionIds.filter((id) => id !== permId));
    } else {
      setSelectedPermissionIds([...selectedPermissionIds, permId]);
    }
  };

  if (loading) return <div className="p-8 text-slate-500 font-medium">Memuat data sistem...</div>;
  if (error) return <div className="p-8 text-rose-600 font-medium">{error}</div>;

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Kelola Role &amp; Permission</h1>
        <p className="text-sm text-slate-500">Kelola daftar role dan permission yang dimiliki setiap role.</p>
      </div>

      {/* Tabel Role */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-800 text-sm">Daftar Role &amp; Permission</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase bg-slate-50/50">
                <th className="px-6 py-3">Nama Role</th>
                <th className="px-6 py-3">Permission Aktif</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {roles.length > 0 ? (
                roles.map((role, index) => {
                  const uniqueKey = formatSafeId(role.id || role.ID) || index;
                  return (
                    <tr key={uniqueKey} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{role.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {role.permissions && role.permissions.length > 0 ? (
                            role.permissions.map((perm: any, idx: number) => (
                              <span key={idx} className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                                {perm.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">Tanpa Permission</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(role)}
                          className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                        >
                          Edit Permission
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">
                    Tidak ada data role ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Edit Permission Role */}
      {selectedRole && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 max-w-lg">
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Edit Permission untuk Role: <span className="text-indigo-600">{selectedRole.name}</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">Pilih permission yang ingin diberikan kepada role ini.</p>

          <form onSubmit={handleSavePermissions}>
            <div className="space-y-2 mb-6">
              {allPermissions.map((perm: any) => {
                const permId = formatSafeId(perm.id || perm.ID);
                return (
                  <label key={permId} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPermissionIds.includes(permId)}
                      onChange={() => handleCheckboxChange(permId)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{perm.name}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="px-4 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm"
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