import React, { useState } from 'react';
import { useAppState } from '../lib/StateContext';
import { Mutasi, Siswa } from '../types';
import { 
  ArrowLeftRight, 
  Plus, 
  Trash2, 
  Printer, 
  Search, 
  X,
  FileText,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export const MutasiView: React.FC = () => {
  const { mutasiList, siswaList, saveMutasi, deleteMutasi, schoolSettings } = useAppState();

  // State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMutasi, setSelectedMutasi] = useState<Mutasi | null>(null);
  const [isPrintLetterOpen, setIsPrintLetterOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Form Fields
  const [formData, setFormData] = useState<Partial<Mutasi>>({
    id: '',
    siswaId: '',
    siswaNama: '',
    nis: '',
    nisn: '',
    jenis: 'Keluar',
    tanggal: new Date().toISOString().split('T')[0],
    noSurat: '',
    sekolahAsalTujuan: '',
    alasan: '',
    kelasSaatMutasi: 'IX'
  });

  const handleOpenAddForm = () => {
    setFormData({
      id: `mutasi-${Date.now()}`,
      siswaId: '',
      siswaNama: '',
      nis: '',
      nisn: '',
      jenis: 'Keluar',
      tanggal: new Date().toISOString().split('T')[0],
      noSurat: `421.3/${Math.floor(Math.random() * 800 + 100)}/SMP-C/${new Date().getFullYear()}`,
      sekolahAsalTujuan: '',
      alasan: '',
      kelasSaatMutasi: 'IX'
    });
    setSelectedMutasi(null);
    setIsFormOpen(true);
  };

  const handleSiswaChange = (siswaId: string) => {
    const selected = siswaList.find(s => s.id === siswaId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        siswaId: selected.id,
        siswaNama: selected.nama,
        nis: selected.nis,
        nisn: selected.nisn,
        kelasSaatMutasi: selected.kelas
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.siswaNama || !formData.noSurat || !formData.sekolahAsalTujuan) {
      alert("Harap lengkapi semua kolom wajib!");
      return;
    }
    
    // Generate mock student ID for Mutasi Masuk
    if (formData.jenis === 'Masuk' && !formData.siswaId) {
      formData.siswaId = `siswa-mutasi-masuk-${Date.now()}`;
    }

    await saveMutasi(formData as Mutasi);
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus catatan mutasi untuk ${name}?`)) {
      await deleteMutasi(id);
    }
  };

  const handleOpenLetter = (mutasi: Mutasi) => {
    setSelectedMutasi(mutasi);
    setIsPrintLetterOpen(true);
  };

  const handlePrintLetter = () => {
    window.print();
  };

  const filteredMutasi = mutasiList.filter(m => 
    m.siswaNama.toLowerCase().includes(search.toLowerCase()) || 
    m.nis.includes(search) || 
    m.noSurat.includes(search)
  );

  return (
    <div id="mutasi-view-container" className="space-y-6">
      {/* Title Bar */}
      <div id="mutasi-header-bar" className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight font-sans">Mutasi Siswa</h2>
          <p className="text-slate-500 text-sm mt-0.5">Kelola data kepindahan masuk dan keluar siswa terintegrasi.</p>
        </div>

        <button 
          id="btn-tambah-mutasi"
          onClick={handleOpenAddForm}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register Mutasi</span>
        </button>
      </div>

      {/* Filter / Search Panel */}
      <div id="mutasi-search-panel" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4 no-print">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari data mutasi berdasarkan nama siswa atau nomor surat..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 text-slate-800 text-sm focus:outline-none border border-slate-200"
          />
        </div>
      </div>

      {/* Grid of history */}
      <div id="mutasi-table-card" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Jenis</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Siswa</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">NIS / NISN</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">No Surat Mutasi</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Asal/Tujuan Sekolah</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMutasi.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-sm font-medium text-slate-600">{m.tanggal}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      m.jenis === 'Masuk' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {m.jenis === 'Masuk' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>Mutasi {m.jenis}</span>
                    </span>
                  </td>
                  <td className="p-4 text-sm font-semibold text-slate-800">{m.siswaNama}</td>
                  <td className="p-4 text-xs font-mono text-slate-400">
                    <div>{m.nis}</div>
                    <div>{m.nisn}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-500">{m.noSurat}</td>
                  <td className="p-4 text-sm text-slate-600 font-medium">{m.sekolahAsalTujuan}</td>
                  <td className="p-4 text-right no-print">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => handleOpenLetter(m)}
                        className="p-1.5 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-lg cursor-pointer"
                        title="Surat Mutasi"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(m.id, m.siswaNama)}
                        className="p-1.5 bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 rounded-lg cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMutasi.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-sm">
                    Belum ada riwayat mutasi siswa terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MUTASI FORM MODAL */}
      {isFormOpen && (
        <div id="mutasi-form-modal" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto no-print">
          <div className="bg-white rounded-xl max-w-xl w-full shadow-lg border border-slate-200">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 font-sans">Registrasi Mutasi Siswa</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="text-slate-600 text-xs font-semibold block mb-1">Jenis Mutasi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, jenis: 'Keluar' }))}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      formData.jenis === 'Keluar' ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    Mutasi KELUAR
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, jenis: 'Masuk' }))}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      formData.jenis === 'Masuk' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    Mutasi MASUK
                  </button>
                </div>
              </div>

              {/* Student Selector */}
              {formData.jenis === 'Keluar' ? (
                <div>
                  <label className="text-slate-600 text-xs font-semibold block mb-1">Pilih Siswa Aktif *</label>
                  <select
                    value={formData.siswaId || ''}
                    onChange={(e) => handleSiswaChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {siswaList.filter(s => s.statusAktif === 'Aktif').map(s => (
                      <option key={s.id} value={s.id}>{s.nama} ({s.nis})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">Identitas Siswa Pindahan</span>
                  <div>
                    <label className="text-slate-600 text-[10px] font-semibold block mb-1">Nama Lengkap *</label>
                    <input 
                      type="text" 
                      value={formData.siswaNama || ''}
                      onChange={(e) => setFormData({ ...formData, siswaNama: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 text-xs focus:outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-600 text-[10px] font-semibold block mb-1">NIS Mutasi *</label>
                      <input 
                        type="text" 
                        value={formData.nis || ''}
                        onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 text-xs focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 text-[10px] font-semibold block mb-1">NISN *</label>
                      <input 
                        type="text" 
                        value={formData.nisn || ''}
                        onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 text-xs focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 text-xs font-semibold block mb-1">Nomor Surat Mutasi *</label>
                  <input 
                    type="text" 
                    value={formData.noSurat || ''}
                    onChange={(e) => setFormData({ ...formData, noSurat: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-slate-800 text-sm focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-600 text-xs font-semibold block mb-1">Tanggal Efektif</label>
                  <input 
                    type="date" 
                    value={formData.tanggal || ''}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-slate-800 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 text-xs font-semibold block mb-1">
                    {formData.jenis === 'Keluar' ? 'Sekolah Tujuan *' : 'Sekolah Asal *'}
                  </label>
                  <input 
                    type="text" 
                    placeholder="Nama SMP tujuan/asal..."
                    value={formData.sekolahAsalTujuan || ''}
                    onChange={(e) => setFormData({ ...formData, sekolahAsalTujuan: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-slate-800 text-sm focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-600 text-xs font-semibold block mb-1">Kelas Placement</label>
                  <select
                    value={formData.kelasSaatMutasi || 'IX'}
                    onChange={(e) => setFormData({ ...formData, kelasSaatMutasi: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-slate-800 text-sm focus:outline-none"
                  >
                    <option value="VII">Kelas VII</option>
                    <option value="VIII">Kelas VIII</option>
                    <option value="IX">Kelas IX</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-600 text-xs font-semibold block mb-1">Alasan Mutasi</label>
                <textarea 
                  value={formData.alasan || ''}
                  onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-800 text-sm focus:outline-none"
                  rows={2}
                  placeholder="Isi alasan perpindahan siswa..."
                />
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Simpan Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LETTER PREVIEW DIALOG FOR PRINTING */}
      {isPrintLetterOpen && selectedMutasi && (
        <div id="mutasi-letter-modal" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between no-print">
              <h4 className="font-bold text-slate-800 text-xs uppercase font-display">Preview Surat Keterangan Mutasi</h4>
              <div className="flex gap-2">
                <button onClick={handlePrintLetter} className="flex items-center gap-1.5 bg-brand-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer">
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Langsung</span>
                </button>
                <button onClick={() => setIsPrintLetterOpen(false)} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer">
                  Tutup
                </button>
              </div>
            </div>

            {/* Printable Formal Document Canvas */}
            <div className="p-8 font-serif text-black leading-relaxed" style={{ fontSize: '11pt' }}>
              
              {/* Kop Surat */}
              <div className="border-b-4 border-double border-black pb-3 flex items-center justify-between gap-4">
                {schoolSettings.logoPemkab ? (
                  <img 
                    src={schoolSettings.logoPemkab} 
                    alt="Logo Pemkab" 
                    className="w-16 h-16 object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-16 h-16 border border-dashed border-slate-300 rounded flex items-center justify-center text-[8px] text-slate-400 no-print">Logo Pemkab</div>
                )}

                <div className="text-center flex-1 space-y-0.5">
                  <h4 className="text-[11pt] font-bold uppercase tracking-wider">PEMERINTAH KABUPATEN {schoolSettings.kabupaten || 'KEPULAUAN MERANTI'}</h4>
                  <h3 className="text-[10pt] font-bold uppercase tracking-wider">DINAS PENDIDIKAN DAN KEBUDAYAAN</h3>
                  <h2 className="text-[13pt] font-extrabold uppercase tracking-wide">{schoolSettings.namaSekolah}</h2>
                  <p className="text-[8.5pt] italic leading-tight">
                    Alamat: {schoolSettings.alamat || 'Jl. Pelajar'}<br />
                    Desa {schoolSettings.desa || '-'} Kec. {schoolSettings.kecamatan || '-'} Kabupaten {schoolSettings.kabupaten || '-'} Kode Pos {schoolSettings.kodePos || '-'}<br />
                    Surel: {schoolSettings.email || '-'} | Website: {schoolSettings.website || '-'}
                  </p>
                </div>

                {schoolSettings.logoSekolah ? (
                  <img 
                    src={schoolSettings.logoSekolah} 
                    alt="Logo Sekolah" 
                    className="w-16 h-16 object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-16 h-16 border border-dashed border-slate-300 rounded flex items-center justify-center text-[8px] text-slate-400 no-print">Logo Sekolah</div>
                )}
              </div>

              {/* Title Surat */}
              <div className="text-center mt-6 space-y-1">
                <h4 className="text-md font-bold uppercase decoration-solid underline tracking-wider">
                  SURAT KETERANGAN MUTASI SISWA
                </h4>
                <p className="text-sm">Nomor: {selectedMutasi.noSurat}</p>
              </div>

              {/* Body */}
              <p className="mt-6 text-justify">
                Yang bertanda tangan di bawah ini Kepala Sekolah {schoolSettings.namaSekolah}, menerangkan bahwa siswa di bawah ini:
              </p>

              <div className="my-6 pl-8 space-y-1">
                <div className="grid grid-cols-4">
                  <span className="font-semibold">Nama Lengkap</span>
                  <span className="col-span-3">: &nbsp; {selectedMutasi.siswaNama}</span>
                </div>
                <div className="grid grid-cols-4">
                  <span className="font-semibold">NIS / NISN</span>
                  <span className="col-span-3">: &nbsp; {selectedMutasi.nis} / {selectedMutasi.nisn}</span>
                </div>
                <div className="grid grid-cols-4">
                  <span className="font-semibold">Kelas Terakhir</span>
                  <span className="col-span-3">: &nbsp; {selectedMutasi.kelasSaatMutasi}</span>
                </div>
                <div className="grid grid-cols-4">
                  <span className="font-semibold">Tanggal Mutasi</span>
                  <span className="col-span-3">: &nbsp; {
                    (() => {
                      try {
                        return new Date(selectedMutasi.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
                      } catch (e) {
                        return selectedMutasi.tanggal;
                      }
                    })()
                  }</span>
                </div>
              </div>

              <p className="text-justify">
                Telah dinyatakan {selectedMutasi.jenis === 'Keluar' ? 'MUTASI KELUAR' : 'MUTASI MASUK'} {selectedMutasi.jenis === 'Keluar' ? 'dari' : 'ke'} lingkungan belajar {schoolSettings.namaSekolah} {selectedMutasi.jenis === 'Keluar' ? 'menuju ke' : 'dari'} sekolah <strong>{selectedMutasi.sekolahAsalTujuan}</strong> dengan alasan <em>{selectedMutasi.alasan || '-'}</em>.
              </p>

              <p className="mt-4 text-justify">
                Demikian surat keterangan mutasi ini diterbitkan untuk dipergunakan sebagaimana mestinya dan sebagai dasar pembaharuan Data Pokok Pendidikan (Dapodik) kesiswaan.
              </p>

              {/* Signature Blocks */}
              <div className="mt-12 flex justify-between gap-6">
                <div></div>
                <div className="text-center w-64 text-[12pt] relative" style={{ minHeight: '140px' }}>
                  <p className="text-sm">Ditetapkan di: {schoolSettings.kabupaten || 'Kepulauan Meranti'}</p>
                  <p className="text-sm">Pada Tanggal: {
                    (() => {
                      try {
                        return new Date(selectedMutasi.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
                      } catch (e) {
                        return selectedMutasi.tanggal;
                      }
                    })()
                  }</p>
                  <p className="font-bold uppercase mt-2 text-sm">Kepala Sekolah,</p>
                  
                  <div className="h-20 my-2 relative flex items-center justify-center">
                    {/* Signature graphic layer */}
                    {schoolSettings.tandaTanganKepala && (
                      <img 
                        src={schoolSettings.tandaTanganKepala} 
                        alt="Tanda Tangan Kepala Sekolah" 
                        className="max-h-16 object-contain z-10"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    {/* Transparent Stempel layer behind signature */}
                    {schoolSettings.stempelSekolah && (
                      <img 
                        src={schoolSettings.stempelSekolah} 
                        alt="Stempel Resmi" 
                        className="max-h-20 object-contain absolute opacity-85 z-0"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                  
                  <p className="font-bold underline uppercase text-sm">{schoolSettings.kepalaSekolah || 'Kepala Sekolah'}</p>
                  <p className="text-xs">NIP. {schoolSettings.nipKepalaSekolah || '-'}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
