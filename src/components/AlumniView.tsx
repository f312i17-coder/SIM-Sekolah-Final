import React, { useState } from 'react';
import { useAppState } from '../lib/StateContext';
import { Siswa } from '../types';
import { 
  GraduationCap, 
  Search, 
  BookOpen, 
  Trash2, 
  Edit, 
  Save, 
  Printer,
  ChevronRight,
  School
} from 'lucide-react';

export const AlumniView: React.FC = () => {
  const { siswaList, saveSiswa, deleteSiswa, schoolSettings } = useAppState();

  const alumniStudents = siswaList.filter(s => s.statusAktif === 'Lulus');

  // State
  const [selectedAlumniId, setSelectedAlumniId] = useState('');
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields
  const [targetSma, setTargetSma] = useState('');
  const [tahunLulus, setTahunLulus] = useState('2026');
  const [alumniNote, setAlumniNote] = useState('');

  const currentAlumni = alumniStudents.find(s => s.id === selectedAlumniId) || alumniStudents[0];

  React.useEffect(() => {
    if (currentAlumni) {
      setTargetSma(currentAlumni.sekolahLanjutan || 'SMA Negeri 1 Jakarta');
      setTahunLulus(currentAlumni.tahunMasuk ? String(Number(currentAlumni.tahunMasuk) + 3) : '2026');
      setAlumniNote(currentAlumni.pkh || '-'); // reuse or fallback
    }
  }, [selectedAlumniId, siswaList]);

  const handleSaveAlumniDetails = async () => {
    if (currentAlumni) {
      const updated: Siswa = {
        ...currentAlumni,
        sekolahLanjutan: targetSma,
        pkh: alumniNote // using pkh field as simple note for alumni
      };
      await saveSiswa(updated);
      setIsEditing(false);
      alert("Detail karir & sekolah lanjutan alumni berhasil diperbarui.");
    }
  };

  const handleDeleteAlumni = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data alumni ${name}?`)) {
      await deleteSiswa(id);
      setSelectedAlumniId('');
    }
  };

  const handlePrintAlumni = () => {
    window.print();
  };

  const filteredAlumni = alumniStudents.filter(s => 
    s.nama.toLowerCase().includes(search.toLowerCase()) || 
    s.nis.includes(search)
  );

  return (
    <div id="alumni-view-container" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Alumni Sidebar List */}
      <div id="alumni-sidebar" className="lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 no-print h-[calc(100vh-200px)] overflow-y-auto">
        <h3 className="font-semibold text-slate-800 text-sm font-sans uppercase tracking-wider">Daftar Alumni</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama alumni..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5 pt-1">
          {filteredAlumni.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedAlumniId(s.id)}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all text-xs cursor-pointer ${currentAlumni?.id === s.id ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <div>
                <div>{s.nama}</div>
                <div className="text-[10px] text-slate-400 font-mono">Tahun Lulus: {s.tahunMasuk ? Number(s.tahunMasuk) + 3 : '2026'}</div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ))}
          {filteredAlumni.length === 0 && (
            <p className="text-slate-400 text-center text-xs py-4">Belum ada data alumni.</p>
          )}
        </div>
      </div>

      {/* Main Alumni Details panel */}
      <div id="alumni-main" className="lg:col-span-3 space-y-6">
        {/* Class IX Migration Card */}
        {siswaList.filter(s => s.kelas === 'IX' && s.statusAktif === 'Aktif').length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3 shadow-xs no-print text-xs">
            <div className="flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-900 text-sm">Alur Migrasi Kelulusan Kelas IX</h4>
                <p className="text-amber-700 text-xs mt-0.5 leading-relaxed">
                  Ditemukan <strong>{siswaList.filter(s => s.kelas === 'IX' && s.statusAktif === 'Aktif').length} siswa</strong> aktif di Kelas IX. Di akhir tahun ajaran, Anda dapat memindahkan seluruh siswa Kelas IX ke status Alumni secara masal. Tindakan ini hanya memperbarui status mereka menjadi <strong>"Lulus"</strong> tanpa menghapus data dari Buku Induk Digital.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={async () => {
                  const activeClassIX = siswaList.filter(s => s.kelas === 'IX' && s.statusAktif === 'Aktif');
                  if (confirm(`Apakah Anda yakin ingin meluluskan seluruh siswa Kelas IX (${activeClassIX.length} orang) ke status Alumni? Tindakan ini akan merubah status mereka menjadi Lulus.`)) {
                    const currentYear = schoolSettings.tahunPelajaran.split('/')[0];
                    for (const student of activeClassIX) {
                      const updated = {
                        ...student,
                        statusAktif: 'Lulus' as const,
                        sekolahLanjutan: 'Belum Ditentukan',
                        pkh: `Lulus Angkatan ${currentYear}`
                      };
                      await saveSiswa(updated);
                    }
                    alert(`Migrasi Berhasil! ${activeClassIX.length} siswa Kelas IX kini berstatus Alumni.`);
                    window.location.reload();
                  }
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-4 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                Luluskan Siswa Kelas IX Masal
              </button>
            </div>
          </div>
        )}

        {currentAlumni ? (
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
            
            {/* Action Top header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-semibold text-slate-800 text-lg font-sans">Data Karir Alumni</h3>
                <p className="text-slate-500 text-sm mt-0.5">Pantau sekolah lanjutan alumni dan rekam jejak kelulusan.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintAlumni}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Cetak Biodata</span>
                </button>

                {isEditing ? (
                  <button
                    onClick={handleSaveAlumniDetails}
                    className="flex items-center gap-1.5 bg-brand-600 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-brand-50 text-brand-700 border border-brand-100 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
                  >
                    Edit Info Alumni
                  </button>
                )}
              </div>
            </div>

            {/* Profile Summary Card */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-200 text-center sm:text-left">
              <img 
                src={currentAlumni.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                alt={currentAlumni.nama} 
                className="w-20 h-20 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-slate-800 font-sans">{currentAlumni.nama}</h4>
                <p className="text-xs text-slate-400 font-mono">NIS: {currentAlumni.nis} | NISN: {currentAlumni.nisn}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1.5">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold">Tahun Lulus: {tahunLulus}</span>
                  <span className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full font-semibold">Alumni Terverifikasi</span>
                </div>
              </div>
            </div>

            {/* Editable Fields and info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Form Column */}
              <div className="space-y-4">
                <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-sans">Tujuan Studi Kelanjutan</h5>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-slate-500 text-xs font-medium block mb-1">Melanjutkan Pendidikan Ke (SMA/SMK) *</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={targetSma}
                        onChange={(e) => setTargetSma(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none"
                      />
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center gap-2.5">
                        <School className="w-4 h-4 text-brand-600 shrink-0" />
                        <span className="text-xs text-slate-700 font-semibold">{targetSma}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-slate-500 text-xs font-medium block mb-1">Catatan Karir & Studi Alumni</label>
                    {isEditing ? (
                      <textarea 
                        value={alumniNote}
                        onChange={(e) => setAlumniNote(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                        rows={3}
                      />
                    ) : (
                      <p className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 italic">
                        "{alumniNote}"
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Bio Column */}
              <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-sans">Identitas Wali / Ortu</h5>
                
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between py-1 border-b border-white"><span className="font-medium text-slate-400">Nama Ayah:</span><span className="font-semibold text-slate-700">{currentAlumni.namaAyah}</span></div>
                  <div className="flex justify-between py-1 border-b border-white"><span className="font-medium text-slate-400">Nama Ibu:</span><span className="font-semibold text-slate-700">{currentAlumni.namaIbu}</span></div>
                  <div className="flex justify-between py-1 border-b border-white"><span className="font-medium text-slate-400">Kontak HP:</span><span className="font-semibold text-slate-700 font-mono">{currentAlumni.noHp}</span></div>
                  <div className="flex justify-between py-1 border-b border-white"><span className="font-medium text-slate-400">Pekerjaan Ortu:</span><span className="font-semibold text-slate-700">{currentAlumni.pekerjaanOrtu}</span></div>
                  <div className="flex justify-between py-1"><span className="font-medium text-slate-400">Alamat Domisili:</span><span className="font-semibold text-slate-700 text-right max-w-[180px] truncate" title={currentAlumni.alamat}>{currentAlumni.alamat}</span></div>
                </div>
              </div>

            </div>

            {/* Danger Zone */}
            <div className="border-t border-slate-200 pt-4 flex justify-between items-center no-print">
              <span className="text-xs text-slate-400">Dihapus dari database alumni tidak dapat dibatalkan.</span>
              <button 
                onClick={() => handleDeleteAlumni(currentAlumni.id, currentAlumni.nama)}
                className="flex items-center gap-1.5 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Data Alumni</span>
              </button>
            </div>

          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center text-slate-400 text-sm">
            Tidak ada alumni terdaftar. Silakan lakukan kelulusan masal terlebih dahulu.
          </div>
        )}
      </div>
    </div>
  );
};
