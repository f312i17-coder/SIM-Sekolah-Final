import React, { useState, useEffect } from 'react';
import { useAppState } from '../lib/StateContext';
import { compressImage } from '../lib/imageCompress';
import { SchoolSettings } from '../types';
import { 
  Settings, 
  Save, 
  Database, 
  HelpCircle,
  FileCheck,
  Server,
  Upload,
  Download,
  Key,
  Image,
  RefreshCw,
  Lock,
  Trash2,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

interface PengaturanViewProps {
  initialTab?: 'identity' | 'media' | 'backup' | 'security' | 'walikelas' | 'theme';
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({ initialTab = 'identity' }) => {
  const { 
    schoolSettings, 
    updateSchoolSettings, 
    isFirebaseActive, 
    backupData, 
    restoreData,
    changeAdminCredentials,
    getAdminUsername,
    themeColor,
    setThemeColor
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'identity' | 'media' | 'backup' | 'security' | 'walikelas' | 'theme'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  
  // Forms States
  const [formData, setFormData] = useState<SchoolSettings>({ ...schoolSettings });
  const [isSaved, setIsSaved] = useState(false);
  const [isSavedMedia, setIsSavedMedia] = useState(false);
  const [isSavedWaliKelas, setIsSavedWaliKelas] = useState(false);

  // Security Credentials form states
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');
  const [credMessage, setCredMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Load username on load
  useEffect(() => {
    setAdminUsername(getAdminUsername());
  }, []);

  // Update formData if schoolSettings change
  useEffect(() => {
    setFormData({
      ...schoolSettings,
      waliKelas: schoolSettings.waliKelas || {
        'VII-1': 'Sri Wahyuni, S.Pd.',
        'VII-2': 'Rahmad Hidayat, M.Pd.',
        'VII-3': 'Supardi, S.Pd.',
        'VIII-1': 'Yuliana Hartono, S.S.',
        'VIII-2': 'Budi Pratama, S.Si.',
        'VIII-3': 'Siti Rahma, S.Pd.I.',
        'IX-1': 'Drs. H. Syamsuddin, M.Pd.',
        'IX-2': 'Bella Safitri, S.Kom.',
        'IX-3': 'Yudi Hartono, S.Pd.'
      }
    });
  }, [schoolSettings]);

  const handleSubmitIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSchoolSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSubmitWaliKelas = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSchoolSettings(formData);
    setIsSavedWaliKelas(true);
    setTimeout(() => setIsSavedWaliKelas(false), 3000);
  };

  const handleSubmitMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSchoolSettings(formData);
    setIsSavedMedia(true);
    setTimeout(() => setIsSavedMedia(false), 3000);
  };

  // Base64 file loaders with Drag and Drop
  const handleFileLoad = async (file: File, field: keyof SchoolSettings) => {
    if (!file.type.startsWith('image/')) {
      alert("Hanya file gambar yang diperbolehkan.");
      return;
    }
    try {
      const compressedDataUrl = await compressImage(file);
      setFormData(prev => ({ ...prev, [field]: compressedDataUrl }));
    } catch (error) {
      console.error("Gagal kompresi gambar:", error);
      // Fallback
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setFormData(prev => ({ ...prev, [field]: e.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, field: keyof SchoolSettings) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileLoad(file, field);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Change Admin Credentials
  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredMessage(null);

    if (!adminUsername.trim()) {
      setCredMessage({ type: 'error', text: 'Username tidak boleh kosong.' });
      return;
    }

    if (adminPassword !== adminPasswordConfirm) {
      setCredMessage({ type: 'error', text: 'Konfirmasi password tidak cocok.' });
      return;
    }

    if (adminPassword.length < 4) {
      setCredMessage({ type: 'error', text: 'Password minimal 4 karakter demi keamanan.' });
      return;
    }

    try {
      await changeAdminCredentials(adminUsername, adminPassword);
      setCredMessage({ type: 'success', text: 'Username dan Password Administrator berhasil diperbarui!' });
      setAdminPassword('');
      setAdminPasswordConfirm('');
      setTimeout(() => setCredMessage(null), 5000);
    } catch (err: any) {
      setCredMessage({ type: 'error', text: err?.message || 'Gagal mengubah sandi.' });
    }
  };

  // Download Backup
  const handleDownloadBackup = () => {
    try {
      const dataStr = backupData();
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `sim_kesiswaan_backup_${formData.namaSekolah.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      alert("Gagal melakukan ekspor data.");
    }
  };

  // Upload Restore
  const handleUploadRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (confirm("PERINGATAN: Memulihkan database akan menimpa seluruh data yang ada saat ini. Apakah Anda yakin ingin melanjutkan?")) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const jsonStr = event.target?.result as string;
          const success = await restoreData(jsonStr);
          if (success) {
            alert("Database berhasil dipulihkan secara penuh!");
            window.location.reload();
          } else {
            alert("Gagal memulihkan database. Pastikan struktur berkas backup sesuai.");
          }
        } catch (err) {
          alert("Gagal membaca berkas backup.");
        }
      };
      reader.readAsText(file);
    }
  };

  // Helper for rendering image box
  const renderUploaderBox = (label: string, field: keyof SchoolSettings, accept = "image/*") => {
    const value = formData[field] as string;
    return (
      <div className="space-y-2">
        <label className="text-slate-600 font-bold block text-[11px] uppercase tracking-wider">{label}</label>
        <div 
          onDrop={(e) => handleDrop(e, field)}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all min-h-[140px] relative group"
        >
          {value ? (
            <div className="space-y-2">
              <img 
                src={value} 
                alt={label} 
                className="max-h-20 object-contain mx-auto"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, [field]: '' }))}
                className="text-[10px] text-red-500 hover:text-red-700 font-bold flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Media</span>
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <Image className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-[10px] text-slate-400">Drag & drop atau klik untuk cari</p>
              <label className="inline-block bg-white border border-slate-200 px-2.5 py-1 rounded text-[10px] font-bold text-slate-600 hover:bg-slate-50 cursor-pointer shadow-sm">
                <span>Pilih Berkas</span>
                <input 
                  type="file" 
                  accept={accept} 
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileLoad(f, field);
                  }}
                  className="sr-only" 
                />
              </label>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div id="settings-view-container" className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* View Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight font-sans">Pengaturan Sistem Terpadu</h2>
          <p className="text-slate-500 text-sm mt-0.5">Kelola identitas sekolah, unggah logo/stempel, backup-restore basis data, serta kredensial administrator.</p>
        </div>

        {/* Database Status Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm text-xs font-semibold">
          <Server className={`w-4 h-4 ${isFirebaseActive ? 'text-indigo-500 animate-pulse' : 'text-slate-400'}`} />
          <span className="text-slate-700">{isFirebaseActive ? 'Mode Cloud Firebase Active' : 'Mode Penyimpanan Lokal (LocalStorage)'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT RAIL: Navigation tabs (Col: 1) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm h-fit space-y-1 text-xs">
          <button
            onClick={() => setActiveTab('identity')}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left font-semibold transition-all cursor-pointer ${
              activeTab === 'identity' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4.5 h-4.5" />
            <span>Identitas Sekolah</span>
          </button>
          
          <button
            onClick={() => setActiveTab('media')}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left font-semibold transition-all cursor-pointer ${
              activeTab === 'media' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Image className="w-4.5 h-4.5" />
            <span>Logo & Tanda Tangan</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left font-semibold transition-all cursor-pointer ${
              activeTab === 'backup' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Database className="w-4.5 h-4.5" />
            <span>Backup & Pemulihan</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left font-semibold transition-all cursor-pointer ${
              activeTab === 'security' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Key className="w-4.5 h-4.5" />
            <span>Kredensial & Sandi</span>
          </button>

          <button
            onClick={() => setActiveTab('walikelas')}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left font-semibold transition-all cursor-pointer ${
              activeTab === 'walikelas' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4.5 h-4.5" />
            <span>Wali Kelas & Rombel</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left font-semibold transition-all cursor-pointer ${
              activeTab === 'theme' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4.5 h-4.5 text-[#1E88E5]" />
            <span>Tema Aplikasi</span>
          </button>
        </div>

        {/* RIGHT PANEL: Tab View Area (Col: 3) */}
        <div className="lg:col-span-3">
          {activeTab === 'identity' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <Settings className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-slate-800 text-sm">Profil Satuan Pendidikan</h3>
              </div>

              <form onSubmit={handleSubmitIdentity} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold block">Nama Sekolah *</label>
                    <input 
                      type="text" 
                      value={formData.namaSekolah}
                      onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-slate-400 transition-all font-semibold"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold block">NPSN *</label>
                    <input 
                      type="text" 
                      value={formData.npsn}
                      onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-mono focus:outline-none focus:border-slate-400 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold block">NSS (Nomor Statistik Sekolah)</label>
                    <input 
                      type="text" 
                      value={formData.nss || ''}
                      onChange={(e) => setFormData({ ...formData, nss: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-mono focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold block">Status Sekolah *</label>
                    <input 
                      type="text" 
                      value={formData.statusSekolah || 'Negeri'}
                      onChange={(e) => setFormData({ ...formData, statusSekolah: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold block">Akreditasi *</label>
                    <input 
                      type="text" 
                      value={formData.akreditasi || 'A'}
                      onChange={(e) => setFormData({ ...formData, akreditasi: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold block">Alamat Jalan Sekolah *</label>
                  <input 
                    type="text" 
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-slate-400 transition-all font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold block">Desa / Kelurahan</label>
                    <input 
                      type="text" 
                      value={formData.desa || ''}
                      onChange={(e) => setFormData({ ...formData, desa: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold block">Kecamatan</label>
                    <input 
                      type="text" 
                      value={formData.kecamatan || ''}
                      onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold block">Kabupaten</label>
                    <input 
                      type="text" 
                      value={formData.kabupaten || ''}
                      onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold block">Kode Pos</label>
                    <input 
                      type="text" 
                      value={formData.kodePos || ''}
                      onChange={(e) => setFormData({ ...formData, kodePos: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold block">Nomor Telepon</label>
                    <input 
                      type="text" 
                      value={formData.noTelepon || ''}
                      onChange={(e) => setFormData({ ...formData, noTelepon: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold block">Surel (Email)</label>
                    <input 
                      type="email" 
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold block">Situs Web</label>
                    <input 
                      type="text" 
                      value={formData.website || ''}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold block">Nama Kepala Sekolah *</label>
                    <input 
                      type="text" 
                      value={formData.kepalaSekolah}
                      onChange={(e) => setFormData({ ...formData, kepalaSekolah: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold block">NIP Kepala Sekolah *</label>
                    <input 
                      type="text" 
                      value={formData.nipKepalaSekolah}
                      onChange={(e) => setFormData({ ...formData, nipKepalaSekolah: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-mono focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold block">Nama Staf Operator TU *</label>
                    <input 
                      type="text" 
                      value={formData.operatorName}
                      onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold block">Tahun Pelajaran Berjalan *</label>
                    <input 
                      type="text" 
                      value={formData.tahunPelajaran}
                      onChange={(e) => setFormData({ ...formData, tahunPelajaran: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-bold focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold block">Semester Aktif *</label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none font-bold"
                    >
                      <option value="Ganjil">Ganjil (1)</option>
                      <option value="Genap">Genap (2)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 border-t border-slate-100 pt-4">
                  <label className="text-slate-600 font-semibold block">Visi Sekolah</label>
                  <textarea 
                    rows={2}
                    value={formData.visi || ''}
                    onChange={(e) => setFormData({ ...formData, visi: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold block">Misi Sekolah</label>
                  <textarea 
                    rows={3}
                    value={formData.misi || ''}
                    onChange={(e) => setFormData({ ...formData, misi: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold block">Motto Sekolah</label>
                  <input 
                    type="text" 
                    value={formData.motto || ''}
                    onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
                  {isSaved ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs">
                      <FileCheck className="w-4.5 h-4.5 animate-bounce" />
                      <span>Identitas Sekolah berhasil disimpan!</span>
                    </div>
                  ) : <span></span>}

                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm hover:shadow transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Identitas</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <Image className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-800 text-sm">Logo Resmi & Tanda Tangan</h3>
              </div>

              <p className="text-slate-500 text-xs leading-relaxed mt-1">
                Silakan unggah logo dan tanda tangan resmi. Berkas media ini akan disisipkan secara dinamis pada semua lembaran cetak (Kartu Pelajar, SKL, Transkrip, Surat Menyurat, dan Laporan).
              </p>

              <form onSubmit={handleSubmitMedia} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {renderUploaderBox("Logo Pemerintah Daerah (Pemda)", "logoPemkab")}
                  {renderUploaderBox("Logo Dinas Pendidikan", "logoDinas")}
                  {renderUploaderBox("Logo Satuan Pendidikan (Sekolah)", "logoSekolah")}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-slate-100 pt-6">
                  {renderUploaderBox("Stempel Sekolah (PNG Transparan)", "stempelSekolah")}
                  {renderUploaderBox("Tanda Tangan Kepala Sekolah", "tandaTanganKepala")}
                  {renderUploaderBox("Tanda Tangan Operator", "tandaTanganOperator")}
                </div>

                <div className="border-t border-slate-100 pt-5 flex items-center justify-between text-xs">
                  {isSavedMedia ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                      <FileCheck className="w-4.5 h-4.5 animate-bounce" />
                      <span>Logo & Tanda Tangan berhasil disimpan!</span>
                    </div>
                  ) : <span></span>}

                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm hover:shadow transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Media</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-slate-800 text-sm">Cadangkan & Pulihkan Basis Data</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export section */}
                <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Ekspor Database (Backup)</h4>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    Cadangkan seluruh konfigurasi sekolah, database siswa aktif, data alumni, mutasi, pengolahan nilai ijazah, arsip berkas, dan template surat menyurat ke dalam sebuah berkas tunggal JSON. Simpan berkas ini di media eksternal (Flashdisk / Google Drive) secara berkala demi keamanan data Dapodik.
                  </p>
                  <button
                    onClick={handleDownloadBackup}
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-950 text-white rounded-xl shadow-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Ekspor ke File JSON</span>
                  </button>
                </div>

                {/* Import section */}
                <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-amber-500" />
                    <span>Impor Database (Restore)</span>
                  </h4>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    Unggah berkas cadangan JSON yang telah Anda ekspor sebelumnya untuk memulihkan seluruh data kesiswaan. Tindakan ini bersifat merusak dan akan menggantikan seluruh dataset aktif saat ini di penyimpanan local/cloud.
                  </p>
                  <label className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-center">
                    <Upload className="w-4 h-4" />
                    <span>Pilih File Backup JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleUploadRestore}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <Key className="w-5 h-5 text-slate-700" />
                <h3 className="font-bold text-slate-800 text-sm">Ganti Sandi Administrator Utama</h3>
              </div>

              <p className="text-slate-500 text-xs leading-relaxed mt-1">
                Melalui panel ini, operator/administrator dapat merubah kombinasi Username dan Password untuk proteksi login keamanan aplikasi.
              </p>

              <form onSubmit={handleUpdateCredentials} className="max-w-md space-y-4 text-xs">
                {credMessage && (
                  <div className={`p-3.5 rounded-xl border font-semibold ${
                    credMessage.type === 'success' 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                      : 'bg-red-50 border-red-100 text-red-800'
                  }`}>
                    {credMessage.text}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold block">Username Baru *</label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-slate-400 transition-all font-semibold"
                    placeholder="e.g. admin_kesiswaan"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold block">Password Baru *</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none"
                    placeholder="Minimal 4 karakter"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold block">Konfirmasi Password Baru *</label>
                  <input
                    type="password"
                    value={adminPasswordConfirm}
                    onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none"
                    placeholder="Ulangi password baru"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <UserCheck className="w-4.5 h-4.5" />
                    <span>Simpan Perubahan Kredensial</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'walikelas' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-slate-800 text-sm">Pengaturan Wali Kelas & Rombel</h3>
              </div>

              <p className="text-slate-500 text-xs leading-relaxed">
                Silakan edit nama Wali Kelas untuk setiap Rombongan Belajar (Rombel). Nama Wali Kelas yang tersimpan di sini akan otomatis digunakan di halaman Dashboard, Buku Induk Siswa, serta cetakan Transkrip Nilai/Ijazah.
              </p>

              <form onSubmit={handleSubmitWaliKelas} className="space-y-6 text-xs">
                {/* Kelas VII */}
                <div className="space-y-3">
                  <h4 className="font-bold text-teal-600 text-[11px] uppercase tracking-wider border-b border-teal-50 pb-1">Kelas VII</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['VII-1', 'VII-2', 'VII-3'].map((rombel) => (
                      <div key={rombel} className="space-y-1">
                        <label className="text-slate-600 font-semibold block">Wali Kelas {rombel} *</label>
                        <input
                          type="text"
                          value={formData.waliKelas?.[rombel] || ''}
                          onChange={(e) => {
                            const updatedWali = { ...formData.waliKelas, [rombel]: e.target.value };
                            setFormData({ ...formData, waliKelas: updatedWali });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-slate-400 transition-all font-semibold"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kelas VIII */}
                <div className="space-y-3">
                  <h4 className="font-bold text-amber-600 text-[11px] uppercase tracking-wider border-b border-amber-50 pb-1">Kelas VIII</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['VIII-1', 'VIII-2', 'VIII-3'].map((rombel) => (
                      <div key={rombel} className="space-y-1">
                        <label className="text-slate-600 font-semibold block">Wali Kelas {rombel} *</label>
                        <input
                          type="text"
                          value={formData.waliKelas?.[rombel] || ''}
                          onChange={(e) => {
                            const updatedWali = { ...formData.waliKelas, [rombel]: e.target.value };
                            setFormData({ ...formData, waliKelas: updatedWali });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-slate-400 transition-all font-semibold"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kelas IX */}
                <div className="space-y-3">
                  <h4 className="font-bold text-purple-600 text-[11px] uppercase tracking-wider border-b border-purple-50 pb-1">Kelas IX</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['IX-1', 'IX-2', 'IX-3'].map((rombel) => (
                      <div key={rombel} className="space-y-1">
                        <label className="text-slate-600 font-semibold block">Wali Kelas {rombel} *</label>
                        <input
                          type="text"
                          value={formData.waliKelas?.[rombel] || ''}
                          onChange={(e) => {
                            const updatedWali = { ...formData.waliKelas, [rombel]: e.target.value };
                            setFormData({ ...formData, waliKelas: updatedWali });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-slate-400 transition-all font-semibold"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
                  {isSavedWaliKelas ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs animate-pulse">
                      <FileCheck className="w-4.5 h-4.5" />
                      <span>Perubahan Wali Kelas Berhasil Disimpan!</span>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-[11px]">Pastikan seluruh nama diisi dengan benar sebelum menyimpan.</p>
                  )}

                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-slate-850 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all cursor-pointer text-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Wali Kelas</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <Settings className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-slate-800 text-sm">Konfigurasi Tema Aplikasi</h3>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pilih skema warna utama untuk Sistem Informasi Sekolah SMP Negeri 1 Rangsang. Perubahan akan langsung diterapkan ke seluruh halaman aplikasi secara seketika dan disimpan secara permanen di browser ini.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {[
                    { id: 'blue_gold', name: 'Biru & Emas (Default)', desc: 'Skema warna resmi SMP Negeri 1 Rangsang. Menampilkan kemewahan aksen emas dan kekuatan biru royal.', swatch: ['#1E88E5', '#D4AF37'] },
                    { id: 'blue_royal', name: 'Biru Royal', desc: 'Bersih, formal, dan mencerminkan institusi pendidikan dan pemerintahan yang profesional.', swatch: ['#1E88E5', '#1565C0'] },
                    { id: 'green_emerald', name: 'Hijau Emerald', desc: 'Nuansa alam yang sejuk, ramah lingkungan, bernuansa agamis dan tenang.', swatch: ['#10B981', '#047857'] },
                    { id: 'maroon', name: 'Merah Marun', desc: 'Warna penuh semangat, tegas, berani, berkarakter kuat dan berwibawa.', swatch: ['#991B1B', '#700F0F'] },
                    { id: 'purple_elegant', name: 'Ungu Elegan', desc: 'Tampilan prestisius, kreatif, modern, dan bernilai estetika tinggi.', swatch: ['#7C3AED', '#5B21B6'] }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setThemeColor(t.id as any)}
                      className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        themeColor === t.id 
                          ? 'border-brand-500 bg-brand-50/40 ring-1 ring-brand-500' 
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex gap-1 shrink-0 mt-0.5">
                        <span className="w-5 h-5 rounded-full border border-white shadow-sm inline-block" style={{ backgroundColor: t.swatch[0] }} />
                        <span className="w-5 h-5 rounded-full border border-white shadow-sm inline-block -ml-2" style={{ backgroundColor: t.swatch[1] }} />
                      </div>
                      
                      <div className="space-y-1 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 text-xs">{t.name}</span>
                          {themeColor === t.id && (
                            <span className="text-[10px] bg-brand-600 text-white font-extrabold px-1.5 py-0.2 rounded">Aktif</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
