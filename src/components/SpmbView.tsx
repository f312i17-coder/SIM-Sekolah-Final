import React, { useState } from 'react';
import { useAppState } from '../lib/StateContext';
import { SPMBRecord, Siswa } from '../types';
import { 
  Plus, 
  Trash2, 
  Search, 
  X,
  FileDown,
  UserCheck,
  UserX
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const SpmbView: React.FC = () => {
  const { spmbList, saveSpmb, deleteSpmb, saveSiswa } = useAppState();

  // State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pendaftaran' | 'Diterima' | 'Tidak Lulus'>('ALL');

  // Form Fields
  const [formData, setFormData] = useState<Partial<SPMBRecord>>({
    id: '',
    nama: '',
    jk: 'L',
    nisn: '',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2013-01-01',
    agama: 'Islam',
    alamat: '',
    namaAyah: '',
    namaIbu: '',
    asalSd: '',
    noHp: '',
    tanggalDaftar: new Date().toISOString().split('T')[0],
    status: 'Pendaftaran',
    biayaDaftarUlangLunas: false
  });

  const handleOpenAddForm = () => {
    setFormData({
      id: `SPMB-${new Date().getFullYear()}-${Math.floor(Math.random() * 8000 + 1000)}`,
      nama: '',
      jk: 'L',
      nisn: '',
      tempatLahir: 'Jakarta',
      tanggalLahir: '2013-01-01',
      agama: 'Islam',
      alamat: '',
      namaAyah: '',
      namaIbu: '',
      asalSd: '',
      noHp: '',
      tanggalDaftar: new Date().toISOString().split('T')[0],
      status: 'Pendaftaran',
      biayaDaftarUlangLunas: false
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.asalSd || !formData.noHp) {
      alert("Harap lengkapi semua kolom wajib!");
      return;
    }
    await saveSpmb(formData as SPMBRecord);
    setIsFormOpen(false);
  };

  const handleStatusChange = async (record: SPMBRecord, newStatus: 'Diterima' | 'Tidak Lulus' | 'Terverifikasi') => {
    const updated: SPMBRecord = {
      ...record,
      status: newStatus
    };
    await saveSpmb(updated);

    // If accepted, option to auto-enroll into siswaList as VII Grade Student!
    if (newStatus === 'Diterima') {
      const confirmEnroll = confirm(`Calon siswa ${record.nama} DITERIMA! Apakah Anda ingin mendaftarkan siswa ini langsung ke Data Siswa Kelas VII aktif?`);
      if (confirmEnroll) {
        const newSiswa: Siswa = {
          id: `siswa-spmb-${Date.now()}`,
          foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          nis: `2526${Math.floor(Math.random() * 800 + 100)}`,
          nisn: record.nisn || `00${Math.floor(Math.random() * 80000000 + 10000000)}`,
          nama: record.nama,
          jk: record.jk,
          tempatLahir: record.tempatLahir,
          tanggalLahir: record.tanggalLahir,
          agama: record.agama,
          alamat: record.alamat || 'Alamat Baru',
          rtRw: '01/01',
          desa: 'Kelurahan',
          kecamatan: 'Kecamatan',
          kabupaten: 'Jakarta',
          provinsi: 'DKI Jakarta',
          namaAyah: record.namaAyah || 'Nama Ayah',
          namaIbu: record.namaIbu || 'Nama Ibu',
          namaWali: '-',
          pekerjaanOrtu: 'Wiraswasta',
          noHp: record.noHp,
          kip: '-',
          pkh: '-',
          noKk: '',
          noAkta: '',
          statusAktif: 'Aktif',
          kelas: 'VII',
          tahunMasuk: String(new Date().getFullYear())
        };
        await saveSiswa(newSiswa);
        alert(`Pendaftaran sukses! ${record.nama} sekarang terdaftar di kelas VII.`);
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus berkas pendaftaran ${name}?`)) {
      await deleteSpmb(id);
    }
  };

  const handleExportExcel = () => {
    const header = ["No Pendaftaran", "Nama", "JK", "Sekolah Asal (SD/MI)", "Kontak", "Status", "Tanggal Daftar"];
    const rows = filteredApplicants.map(r => [
      r.id, r.nama, r.jk, r.asalSd, r.noHp, r.status, r.tanggalDaftar
    ]);

    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SPMB");
    XLSX.writeFile(wb, `SPMB_Siswa_Baru_${new Date().getFullYear()}.xlsx`);
  };

  const filteredApplicants = spmbList.filter(r => {
    const matchSearch = r.nama.toLowerCase().includes(search.toLowerCase()) || 
                        r.id.includes(search) || 
                        r.asalSd.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div id="spmb-view-container" className="space-y-6">
      {/* Title Header */}
      <div id="spmb-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight font-sans">Penerimaan Murid Baru (SPMB)</h2>
          <p className="text-slate-500 text-sm mt-0.5">Pantau berkas pendaftaran, verifikasi, dan registrasi siswa kelas VII baru.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-tambah-pendaftar"
            onClick={handleOpenAddForm}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Pendaftaran Baru</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Filters Search */}
      <div id="spmb-filters" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari berdasarkan nama, nomor pendaftaran, atau SD..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 text-slate-800 text-sm focus:outline-none border border-slate-200"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none"
        >
          <option value="ALL">Semua Status</option>
          <option value="Pendaftaran">Pendaftaran</option>
          <option value="Diterima">Diterima</option>
          <option value="Tidak Lulus">Tidak Lulus</option>
        </select>
      </div>

      {/* Main Applicants List */}
      <div id="spmb-list-card" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">No Pendaftaran</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Asal SD/MI</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kontak No HP</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status Seleksi</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApplicants.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors text-slate-700">
                  <td className="p-4 font-mono font-semibold text-xs text-brand-600">{r.id}</td>
                  <td className="p-4 text-sm font-semibold text-slate-800">{r.nama} ({r.jk})</td>
                  <td className="p-4 text-sm font-medium text-slate-500">{r.asalSd}</td>
                  <td className="p-4 text-xs text-slate-400 font-mono">{r.noHp}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      r.status === 'Diterima' ? 'bg-emerald-50 text-emerald-600' :
                      r.status === 'Tidak Lulus' ? 'bg-rose-50 text-rose-600' :
                      'bg-slate-50 border border-slate-200 text-slate-500'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-right no-print">
                    <div className="flex items-center justify-end gap-1.5">
                      {r.status === 'Pendaftaran' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(r, 'Diterima')}
                            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg cursor-pointer"
                            title="Terima Siswa"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(r, 'Tidak Lulus')}
                            className="p-1.5 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-lg cursor-pointer"
                            title="Tolak Siswa"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(r.id, r.nama)}
                        className="p-1.5 bg-red-50 text-red-400 hover:bg-red-100 rounded-lg cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredApplicants.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-sm">
                    Belum ada pendaftar baru terdaftar pada periode seleksi ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM REGISTRASI MODAL */}
      {isFormOpen && (
        <div id="spmb-form-modal" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-md font-bold text-slate-800 font-display">Registrasi Pendaftar Baru</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Nomor Registrasi Seleksi</label>
                <input 
                  type="text" 
                  value={formData.id || ''} 
                  disabled
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 font-mono text-slate-500 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Nama Lengkap Calon Siswa *</label>
                <input 
                  type="text" 
                  value={formData.nama || ''}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.jk || 'L'}
                    onChange={(e) => setFormData({ ...formData, jk: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-slate-800 focus:outline-none"
                  >
                    <option value="L">Laki-Laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">NISN Calon Siswa</label>
                  <input 
                    type="text" 
                    value={formData.nisn || ''}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-slate-800 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Asal SD/MI Almamater *</label>
                <input 
                  type="text" 
                  placeholder="Contoh: SDN Menteng 01"
                  value={formData.asalSd || ''}
                  onChange={(e) => setFormData({ ...formData, asalSd: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">No HP Orang Tua / Kontak WA *</label>
                <input 
                  type="text" 
                  value={formData.noHp || ''}
                  onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl font-semibold cursor-pointer"
                >
                  Daftarkan Calon Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
