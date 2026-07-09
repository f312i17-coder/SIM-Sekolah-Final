import React, { useState } from 'react';
import { useAppState } from '../lib/StateContext';
import { StudentPhotoEditor } from './StudentPhotoEditor';
import { Siswa, ArsipDokumen } from '../types';
import { 
  Search, 
  Filter, 
  FileUp, 
  FileDown, 
  Printer, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X,
  User,
  Phone,
  BookOpen,
  Eye
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const DataSiswaView: React.FC = () => {
  const { siswaList, saveSiswa, deleteSiswa, schoolSettings, saveArsip } = useAppState();

  // State
  const [search, setSearch] = useState('');
  const [filterKelas, setFilterKelas] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'Aktif' | 'Mutasi Keluar' | 'Lulus'>('ALL');
  const [filterJk, setFilterJk] = useState<'ALL' | 'L' | 'P'>('ALL');
  
  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  
  // Form fields
  const [formData, setFormData] = useState<Partial<Siswa>>({
    foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    nis: '',
    nisn: '',
    nama: '',
    jk: 'L',
    tempatLahir: '',
    tanggalLahir: '',
    agama: 'Islam',
    alamat: '',
    rtRw: '',
    desa: '',
    kecamatan: '',
    kabupaten: '',
    provinsi: '',
    namaAyah: '',
    namaIbu: '',
    namaWali: '-',
    pekerjaanOrtu: '',
    noHp: '',
    kip: '-',
    pkh: '-',
    noKk: '',
    noAkta: '',
    statusAktif: 'Aktif',
    kelas: 'VII',
    tahunMasuk: ''
  });

  // Filter list
  const filteredList = siswaList.filter(s => {
    const matchSearch = s.nama.toLowerCase().includes(search.toLowerCase()) || 
                        s.nis.includes(search) || 
                        s.nisn.includes(search);
    const matchKelas = filterKelas === 'ALL' || 
                       s.kelas === filterKelas ||
                       (filterKelas === 'VII' && s.kelas.startsWith('VII')) ||
                       (filterKelas === 'VIII' && s.kelas.startsWith('VIII')) ||
                       (filterKelas === 'IX' && s.kelas.startsWith('IX'));
    const matchStatus = filterStatus === 'ALL' || s.statusAktif === filterStatus;
    const matchJk = filterJk === 'ALL' || s.jk === filterJk;
    return matchSearch && matchKelas && matchStatus && matchJk;
  });

  // Actions
  const handleOpenAddForm = () => {
    setSelectedSiswa(null);
    setFormData({
      id: `siswa-${Date.now()}`,
      foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      nis: '',
      nisn: '',
      nama: '',
      jk: 'L',
      tempatLahir: '',
      tanggalLahir: '',
      agama: 'Islam',
      alamat: '',
      rtRw: '',
      desa: '',
      kecamatan: '',
      kabupaten: '',
      provinsi: '',
      namaAyah: '',
      namaIbu: '',
      namaWali: '-',
      pekerjaanOrtu: '',
      noHp: '',
      kip: '-',
      pkh: '-',
      noKk: '',
      noAkta: '',
      statusAktif: 'Aktif',
      kelas: 'VII',
      tahunMasuk: schoolSettings.tahunPelajaran.split('/')[0]
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (siswa: Siswa) => {
    setSelectedSiswa(siswa);
    setFormData({ ...siswa });
    setIsFormOpen(true);
  };

  const handleOpenDetail = (siswa: Siswa) => {
    setSelectedSiswa(siswa);
    setIsDetailOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nis || !formData.nisn || !formData.nama) {
      alert("NIS, NISN, dan Nama Lengkap wajib diisi!");
      return;
    }
    const savedSiswa = formData as Siswa;
    await saveSiswa(savedSiswa);

    // Auto-save cropped photo to Arsip Digital Siswa if it is a newly uploaded base64 image
    if (savedSiswa.foto && savedSiswa.foto.startsWith('data:image')) {
      try {
        const arsipFoto: ArsipDokumen = {
          id: `arsip-photo-${Date.now()}`,
          siswaId: savedSiswa.id,
          namaDokumen: 'Dokumen Lainnya',
          fileName: `Foto_Profil_${savedSiswa.nama.replace(/\s+/g, '_')}.jpg`,
          fileType: 'image/jpeg',
          fileData: savedSiswa.foto,
          uploadedAt: new Date().toISOString().split('T')[0],
          keterangan: 'Foto Profil Siswa (Otomatis dari Form Identitas)'
        };
        await saveArsip(arsipFoto);
      } catch (err) {
        console.error("Gagal menyimpan foto ke Arsip Digital Siswa:", err);
      }
    }

    setIsFormOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data siswa ${name}?`)) {
      await deleteSiswa(id);
    }
  };

  // EXPORT EXCEL (SheetJS)
  const handleExportExcel = () => {
    const header = [
      "NIS", "NISN", "Nama Lengkap", "JK", "Tempat Lahir", "Tanggal Lahir",
      "Agama", "Alamat", "RT/RW", "Desa", "Kecamatan", "Kabupaten", "Provinsi",
      "Ayah", "Ibu", "Wali", "Pekerjaan Ortu", "No HP", "KIP", "PKH", "KK", "Akta", "Kelas", "Status"
    ];
    
    const rows = filteredList.map(s => [
      s.nis, s.nisn, s.nama, s.jk, s.tempatLahir, s.tanggalLahir,
      s.agama, s.alamat, s.rtRw, s.desa, s.kecamatan, s.kabupaten, s.provinsi,
      s.namaAyah, s.namaIbu, s.namaWali, s.pekerjaanOrtu, s.noHp, s.kip, s.pkh, s.noKk, s.noAkta, s.kelas, s.statusAktif
    ]);

    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Siswa");
    XLSX.writeFile(wb, `Data_Siswa_${schoolSettings.namaSekolah.replace(/\s+/g, '_')}.xlsx`);
  };

  // IMPORT EXCEL (SheetJS)
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const bstr = event.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        if (data.length === 0) {
          alert("Berkas kosong atau tidak valid.");
          return;
        }

        // Map excel columns to Siswa object
        for (let idx = 0; idx < data.length; idx++) {
          const row = data[idx];
          const newSiswa: Siswa = {
            id: `siswa-import-${Date.now()}-${idx}`,
            foto: row["Foto"] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            nis: String(row["NIS"] || ''),
            nisn: String(row["NISN"] || ''),
            nama: String(row["Nama Lengkap"] || row["Nama"] || ''),
            jk: (row["JK"] === "P" || row["JK"] === "Perempuan") ? "P" : "L",
            tempatLahir: row["Tempat Lahir"] || '',
            tanggalLahir: row["Tanggal Lahir"] || '',
            agama: row["Agama"] || 'Islam',
            alamat: row["Alamat"] || '',
            rtRw: row["RT/RW"] || '',
            desa: row["Desa"] || '',
            kecamatan: row["Kecamatan"] || '',
            kabupaten: row["Kabupaten"] || '',
            provinsi: row["Provinsi"] || '',
            namaAyah: row["Ayah"] || '',
            namaIbu: row["Ibu"] || '',
            namaWali: row["Wali"] || '-',
            pekerjaanOrtu: row["Pekerjaan Ortu"] || '',
            noHp: String(row["No HP"] || ''),
            kip: row["KIP"] || '-',
            pkh: row["PKH"] || '-',
            noKk: String(row["KK"] || ''),
            noAkta: String(row["Akta"] || ''),
            statusAktif: (row["Status"] || 'Aktif') as any,
            kelas: (row["Kelas"] || 'VII') as any,
            tahunMasuk: schoolSettings.tahunPelajaran.split('/')[0]
          };

          if (newSiswa.nis && newSiswa.nisn && newSiswa.nama) {
            await saveSiswa(newSiswa);
          }
        }
        alert("Import Data Siswa berhasil diproses!");
      } catch (err) {
        console.error(err);
        alert("Gagal memproses berkas Excel. Pastikan format tabel sesuai.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handlePrint = () => {
    window.print();
  };

  // Stats by class
  const totalSiswa = siswaList.filter(s => s.statusAktif === 'Aktif').length;
  const totalVII = siswaList.filter(s => s.kelas === 'VII' && s.statusAktif === 'Aktif').length;
  const totalVIII = siswaList.filter(s => s.kelas === 'VIII' && s.statusAktif === 'Aktif').length;
  const totalIX = siswaList.filter(s => s.kelas === 'IX' && s.statusAktif === 'Aktif').length;
  const totalLaki = siswaList.filter(s => s.jk === 'L' && s.statusAktif === 'Aktif').length;
  const totalPerempuan = siswaList.filter(s => s.jk === 'P' && s.statusAktif === 'Aktif').length;

  return (
    <div id="data-siswa-view-container" className="space-y-6">
      {/* Title Bar & Main Actions */}
      <div id="data-siswa-actions-bar" className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 tracking-tight font-display">Data Siswa</h2>
          <p className="text-slate-500 text-sm mt-0.5">Kelola data biodata, orang tua, dan status akademik siswa.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add Student Button */}
          <button 
            id="btn-tambah-siswa"
            onClick={handleOpenAddForm}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>

          {/* Import / Export Excel */}
          <label className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 cursor-pointer shadow-sm transition-all">
            <FileUp className="w-4 h-4 text-emerald-600" />
            <span>Import Excel</span>
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              onChange={handleImportExcel} 
              className="hidden" 
            />
          </label>

          <button 
            id="btn-export-excel"
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 shadow-sm transition-all cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-brand-600" />
            <span>Export Excel</span>
          </button>

          {/* Print Tabular Button */}
          <button 
            id="btn-cetak-tabel"
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Cetak Data</span>
          </button>
        </div>
      </div>

      {/* Class Grouping Stats Panel (Bento Grid Style) */}
      <div id="class-stats-panel" className="grid grid-cols-2 md:grid-cols-5 gap-4 no-print text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider">Total Siswa Aktif</span>
          <span className="text-2xl font-bold text-slate-800 block mt-1">{totalSiswa}</span>
          <span className="text-slate-500 block text-[10px] mt-0.5">Siswa terdaftar aktif</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider">Kelas VII</span>
          <span className="text-2xl font-bold text-indigo-600 block mt-1">{totalVII}</span>
          <span className="text-slate-500 block text-[10px] mt-0.5">Siswa Tingkat 7</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider">Kelas VIII</span>
          <span className="text-2xl font-bold text-teal-600 block mt-1">{totalVIII}</span>
          <span className="text-slate-500 block text-[10px] mt-0.5">Siswa Tingkat 8</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider">Kelas IX</span>
          <span className="text-2xl font-bold text-rose-600 block mt-1">{totalIX}</span>
          <span className="text-slate-500 block text-[10px] mt-0.5">Siswa Tingkat 9</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 md:col-span-1">
          <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider">Rasio Gender (Aktif)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm font-bold text-blue-600">L: {totalLaki}</span>
            <span className="text-xs text-slate-300">|</span>
            <span className="text-sm font-bold text-pink-500">P: {totalPerempuan}</span>
          </div>
          <span className="text-slate-500 block text-[10px] mt-1">Proporsi gender siswa</span>
        </div>
      </div>

      {/* Filters & Search Panel */}
      <div id="data-siswa-filters-panel" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari siswa berdasarkan nama, NIS, atau NISN..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 border border-slate-200"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select 
              value={filterKelas} 
              onChange={(e) => setFilterKelas(e.target.value as any)}
              className="bg-slate-50 text-slate-700 text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-200 focus:outline-none"
            >
              <option value="ALL">Semua Kelas</option>
              <option value="VII">Kelas VII (Semua)</option>
              <option value="VII-1">VII-1</option>
              <option value="VII-2">VII-2</option>
              <option value="VII-3">VII-3</option>
              <option value="VIII">Kelas VIII (Semua)</option>
              <option value="VIII-1">VIII-1</option>
              <option value="VIII-2">VIII-2</option>
              <option value="VIII-3">VIII-3</option>
              <option value="IX">Kelas IX (Semua)</option>
              <option value="IX-1">IX-1</option>
              <option value="IX-2">IX-2</option>
              <option value="IX-3">IX-3</option>
            </select>
          </div>

          {/* Gender Filter */}
          <select 
            value={filterJk} 
            onChange={(e) => setFilterJk(e.target.value as any)}
            className="bg-slate-50 text-slate-700 text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-200 focus:outline-none"
          >
            <option value="ALL">Semua Gender</option>
            <option value="L">Laki-Laki</option>
            <option value="P">Perempuan</option>
          </select>

          {/* Status Filter */}
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-slate-50 text-slate-700 text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-200 focus:outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Mutasi Keluar">Mutasi Keluar</option>
            <option value="Lulus">Lulus / Alumni</option>
          </select>
        </div>
      </div>

      {/* Main Student Data Table */}
      <div id="data-siswa-table-card" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print-card">
        <div className="overflow-x-auto">
          <table id="table-data-siswa" className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Foto</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">NIS / NISN</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">JK</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kelas</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">No HP</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length > 0 ? (
                filteredList.map((siswa) => (
                  <tr key={siswa.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <img 
                        src={siswa.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'} 
                        alt={siswa.nama} 
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-semibold text-slate-800">{siswa.nis}</div>
                      <div className="text-xs text-slate-400 font-mono">{siswa.nisn}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-slate-700">{siswa.nama}</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${siswa.jk === 'L' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                        {siswa.jk === 'L' ? 'Laki-Laki' : 'Perempuan'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-semibold text-slate-600 font-display">{siswa.kelas}</span>
                    </td>
                    <td className="p-4 text-xs text-slate-500 font-mono">
                      {siswa.noHp || '-'}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        siswa.statusAktif === 'Aktif' ? 'bg-emerald-50 text-emerald-600' :
                        siswa.statusAktif === 'Mutasi Keluar' ? 'bg-amber-50 text-amber-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {siswa.statusAktif}
                      </span>
                    </td>
                    <td className="p-4 text-right no-print">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => handleOpenDetail(siswa)}
                          className="p-1.5 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenEditForm(siswa)}
                          className="p-1.5 bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(siswa.id, siswa.nama)}
                          className="p-1.5 bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-sm">
                    Tidak ditemukan data siswa yang cocok dengan filter atau pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL (Add/Edit) */}
      {isFormOpen && (
        <div id="siswa-form-modal" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto no-print">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 font-sans">
                {selectedSiswa ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* Photo & Main Identity */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2 text-center md:border-r border-slate-100 md:pr-6">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">Foto Siswa</span>
                  <StudentPhotoEditor
                    currentPhoto={formData.foto}
                    onPhotoCropped={(croppedBase64) => setFormData({ ...formData, foto: croppedBase64 })}
                    onPhotoRemoved={() => setFormData({ ...formData, foto: '' })}
                  />
                </div>

                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-600 text-xs font-semibold block mb-1">NIS (Nomor Induk Siswa) *</label>
                    <input 
                      type="text" 
                      value={formData.nis || ''}
                      onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 text-xs font-semibold block mb-1">NISN (Nasional) *</label>
                    <input 
                      type="text" 
                      value={formData.nisn || ''}
                      onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-slate-600 text-xs font-semibold block mb-1">Nama Lengkap *</label>
                    <input 
                      type="text" 
                      value={formData.nama || ''}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 text-xs font-semibold block mb-1">Jenis Kelamin</label>
                    <select 
                      value={formData.jk || 'L'}
                      onChange={(e) => setFormData({ ...formData, jk: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="L">Laki-Laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-600 text-xs font-semibold block mb-1">Agama</label>
                    <input 
                      type="text" 
                      value={formData.agama || 'Islam'}
                      onChange={(e) => setFormData({ ...formData, agama: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-800 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 text-xs font-semibold block mb-1">Tempat Lahir</label>
                    <input 
                      type="text" 
                      value={formData.tempatLahir || ''}
                      onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-800 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 text-xs font-semibold block mb-1">Tanggal Lahir</label>
                    <input 
                      type="date" 
                      value={formData.tanggalLahir || ''}
                      onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-800 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Status and Placement */}
              <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-600 text-xs font-semibold block mb-1">Kelas Placement</label>
                  <select 
                    value={formData.kelas || 'VII-1'}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-800 text-sm focus:outline-none"
                  >
                    <optgroup label="KELAS VII">
                      <option value="VII-1">VII-1</option>
                      <option value="VII-2">VII-2</option>
                      <option value="VII-3">VII-3</option>
                    </optgroup>
                    <optgroup label="KELAS VIII">
                      <option value="VIII-1">VIII-1</option>
                      <option value="VIII-2">VIII-2</option>
                      <option value="VIII-3">VIII-3</option>
                    </optgroup>
                    <optgroup label="KELAS IX">
                      <option value="IX-1">IX-1</option>
                      <option value="IX-2">IX-2</option>
                      <option value="IX-3">IX-3</option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 text-xs font-semibold block mb-1">Status Keaktifan</label>
                  <select 
                    value={formData.statusAktif || 'Aktif'}
                    onChange={(e) => setFormData({ ...formData, statusAktif: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-800 text-sm focus:outline-none"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Mutasi Keluar">Mutasi Keluar</option>
                    <option value="Lulus">Lulus / Alumni</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 text-xs font-semibold block mb-1">Nomor HP / Kontak</label>
                  <input 
                    type="text" 
                    value={formData.noHp || ''}
                    onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-800 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Address details */}
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <h4 className="text-sm font-semibold text-slate-700 font-display">Detail Domisili & Alamat</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-slate-600 text-xs font-semibold block mb-1">Alamat Jalan</label>
                    <input 
                      type="text" 
                      value={formData.alamat || ''}
                      onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-800 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 text-xs font-semibold block mb-1">RT/RW</label>
                    <input 
                      type="text" 
                      value={formData.rtRw || ''}
                      onChange={(e) => setFormData({ ...formData, rtRw: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-800 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 text-xs font-semibold block mb-1">Desa/Kelurahan</label>
                    <input 
                      type="text" 
                      value={formData.desa || ''}
                      onChange={(e) => setFormData({ ...formData, desa: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-800 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 text-xs font-semibold block mb-1">Kecamatan</label>
                    <input 
                      type="text" 
                      value={formData.kecamatan || ''}
                      onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-800 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 text-xs font-semibold block mb-1">Kabupaten/Kota</label>
                    <input 
                      type="text" 
                      value={formData.kabupaten || ''}
                      onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-800 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 text-xs font-semibold block mb-1">Provinsi</label>
                    <input 
                      type="text" 
                      value={formData.provinsi || ''}
                      onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-800 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Family & Social Aids */}
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <h4 className="text-sm font-semibold text-slate-700 font-display">Data Orang Tua / Wali & Bantuan Sosial</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-slate-600 text-xs font-semibold block mb-1">Nama Ayah Kandung</label>
                    <input 
                      type="text" 
                      value={formData.namaAyah || ''}
                      onChange={(e) => setFormData({ ...formData, namaAyah: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-800 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 text-xs font-semibold block mb-1">Nama Ibu Kandung</label>
                    <input 
                      type="text" 
                      value={formData.namaIbu || ''}
                      onChange={(e) => setFormData({ ...formData, namaIbu: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-800 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 text-xs font-semibold block mb-1">Nama Wali (jika ada)</label>
                    <input 
                      type="text" 
                      value={formData.namaWali || '-'}
                      onChange={(e) => setFormData({ ...formData, namaWali: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-800 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 text-xs font-semibold block mb-1">Pekerjaan Orang Tua</label>
                    <input 
                      type="text" 
                      value={formData.pekerjaanOrtu || ''}
                      onChange={(e) => setFormData({ ...formData, pekerjaanOrtu: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-800 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 text-xs font-semibold block mb-1">Nomor Kartu Keluarga (KK)</label>
                    <input 
                      type="text" 
                      value={formData.noKk || ''}
                      onChange={(e) => setFormData({ ...formData, noKk: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-800 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 text-xs font-semibold block mb-1">Nomor Registrasi Akta Lahir</label>
                    <input 
                      type="text" 
                      value={formData.noAkta || ''}
                      onChange={(e) => setFormData({ ...formData, noAkta: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-800 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 text-xs font-semibold block mb-1">Nomor KIP (jika memiliki)</label>
                    <input 
                      type="text" 
                      value={formData.kip || '-'}
                      onChange={(e) => setFormData({ ...formData, kip: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-800 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 text-xs font-semibold block mb-1">Nomor PKH (jika menerima)</label>
                    <input 
                      type="text" 
                      value={formData.pkh || '-'}
                      onChange={(e) => setFormData({ ...formData, pkh: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-800 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="border-t border-slate-100 pt-6 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL (Read-Only Preview) */}
      {isDetailOpen && selectedSiswa && (
        <div id="siswa-detail-modal" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto no-print">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-lg border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 font-sans">Biodata Lengkap Siswa</h3>
              <button 
                onClick={() => setIsDetailOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Card Summary */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-50">
                <img 
                  src={selectedSiswa.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                  alt={selectedSiswa.nama} 
                  className="w-24 h-24 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div className="text-center sm:text-left space-y-1">
                  <h4 className="text-xl font-bold text-slate-800 font-display">{selectedSiswa.nama}</h4>
                  <p className="text-sm font-mono text-slate-400">NIS: {selectedSiswa.nis} | NISN: {selectedSiswa.nisn}</p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1.5">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-semibold">Kelas {selectedSiswa.kelas}</span>
                    <span className="text-xs bg-brand-50 text-brand-600 px-2.5 py-1 rounded-full font-semibold">{selectedSiswa.jk === 'L' ? 'Laki-Laki' : 'Perempuan'}</span>
                    <span className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-semibold">{selectedSiswa.statusAktif}</span>
                  </div>
                </div>
              </div>

              {/* Details Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <span className="text-slate-400 text-xs block font-semibold uppercase">Tempat, Tanggal Lahir</span>
                  <span className="text-slate-700 font-medium">{selectedSiswa.tempatLahir || '-'}, {selectedSiswa.tanggalLahir || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block font-semibold uppercase">Agama</span>
                  <span className="text-slate-700 font-medium">{selectedSiswa.agama || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block font-semibold uppercase">No HP / HP Ortu</span>
                  <span className="text-slate-700 font-mono font-medium">{selectedSiswa.noHp || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block font-semibold uppercase">Alamat</span>
                  <span className="text-slate-700 font-medium">{selectedSiswa.alamat || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block font-semibold uppercase">Kelurahan / RT-RW</span>
                  <span className="text-slate-700 font-medium">{selectedSiswa.desa || '-'} | RT/RW {selectedSiswa.rtRw || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block font-semibold uppercase">Kecamatan & Kota</span>
                  <span className="text-slate-700 font-medium">{selectedSiswa.kecamatan || '-'}, {selectedSiswa.kabupaten || '-'}</span>
                </div>
                <div className="sm:col-span-2 border-t border-slate-50 pt-3">
                  <h5 className="font-semibold text-slate-700 mb-2 font-display">Hubungan Keluarga & Identitas Sosial</h5>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block font-semibold uppercase">Nama Ayah</span>
                  <span className="text-slate-700 font-medium">{selectedSiswa.namaAyah || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block font-semibold uppercase">Nama Ibu</span>
                  <span className="text-slate-700 font-medium">{selectedSiswa.namaIbu || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block font-semibold uppercase">Nama Wali</span>
                  <span className="text-slate-700 font-medium">{selectedSiswa.namaWali || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block font-semibold uppercase">Pekerjaan Orang Tua</span>
                  <span className="text-slate-700 font-medium">{selectedSiswa.pekerjaanOrtu || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block font-semibold uppercase">No. Kartu Keluarga (KK)</span>
                  <span className="text-slate-700 font-mono font-medium">{selectedSiswa.noKk || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block font-semibold uppercase">No. Akta Kelahiran</span>
                  <span className="text-slate-700 font-mono font-medium">{selectedSiswa.noAkta || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block font-semibold uppercase">KIP (Bantuan Siswa)</span>
                  <span className="text-slate-700 font-mono font-medium">{selectedSiswa.kip || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block font-semibold uppercase">PKH (Program Harapan)</span>
                  <span className="text-slate-700 font-mono font-medium">{selectedSiswa.pkh || '-'}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setIsDetailOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
