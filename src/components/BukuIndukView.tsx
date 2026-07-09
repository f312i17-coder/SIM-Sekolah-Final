import React, { useState, useEffect } from 'react';
import { useAppState } from '../lib/StateContext';
import { Siswa, BukuIndukRecord, SiswaNilai, Prestasi, Pelanggaran, Ekstrakurikuler, MapelGrades } from '../types';
import { 
  User, 
  Award, 
  AlertTriangle, 
  Activity, 
  Clock, 
  FileSpreadsheet, 
  Search, 
  Plus, 
  Trash2, 
  Save, 
  ChevronRight,
  BookOpen,
  Printer,
  X,
  Info,
  ExternalLink
} from 'lucide-react';

export const BukuIndukView: React.FC = () => {
  const { 
    siswaList, 
    getGradesForSiswa, 
    saveGrades, 
    getBukuIndukForSiswa, 
    saveBukuIndukRecord, 
    schoolSettings 
  } = useAppState();

  const activeStudents = siswaList.filter(s => s.statusAktif !== 'Tidak Aktif');
  
  // State
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<'biodata' | 'nilai' | 'prestasi' | 'kehadiran'>('biodata');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Loaded records
  const [student, setStudent] = useState<Siswa | null>(null);
  const [grades, setGrades] = useState<SiswaNilai | null>(null);
  const [record, setRecord] = useState<BukuIndukRecord | null>(null);

  // Modals / Inputs
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditingGrades, setIsEditingGrades] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  
  // Form add-ons
  const [newPrestasi, setNewPrestasi] = useState<Partial<Prestasi>>({ nama: '', tingkat: 'Sekolah', tahun: '', keterangan: '' });
  const [newPelanggaran, setNewPelanggaran] = useState<Partial<Pelanggaran>>({ nama: '', tanggal: '', poin: 5, keterangan: '' });
  const [newEkskul, setNewEkskul] = useState<Partial<Ekstrakurikuler>>({ nama: '', nilai: 'A', keterangan: '' });

  // Load selected student profile
  useEffect(() => {
    if (selectedStudentId) {
      const activeSiswa = siswaList.find(s => s.id === selectedStudentId);
      if (activeSiswa) {
        setStudent(activeSiswa);
        getGradesForSiswa(activeSiswa.id).then(setGrades);
        getBukuIndukForSiswa(activeSiswa.id).then(setRecord);
      }
    } else {
      setStudent(null);
      setGrades(null);
      setRecord(null);
    }
    setIsEditMode(false);
    setIsEditingGrades(false);
  }, [selectedStudentId, siswaList]);

  // Set first student as default if list loaded and none selected
  useEffect(() => {
    if (activeStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(activeStudents[0].id);
    }
  }, [siswaList]);

  // Mapel configuration helper
  const mapelLabels: { [key in keyof MapelGrades]: string } = {
    pai: "Pendidikan Agama & Budi Pekerti",
    ppkn: "Pendidikan Pancasila & Kewarganegaraan",
    indo: "Bahasa Indonesia",
    mtk: "Matematika",
    ipa: "Ilmu Pengetahuan Alam (IPA)",
    ips: "Ilmu Pengetahuan Sosial (IPS)",
    inggris: "Bahasa Inggris",
    seni: "Seni Budaya & Prakarya",
    pjok: "Pendidikan Jasmani Olahraga & Kesehatan (PJOK)",
    tik: "Teknologi Informasi & Komunikasi (TIK)",
    mulok: "Muatan Lokal / Bahasa Daerah"
  };

  // Math solvers
  const getSubjectAverage = (subjectKey: keyof MapelGrades): number => {
    if (!grades) return 0;
    const scores = [
      grades.s1[subjectKey] || 0,
      grades.s2[subjectKey] || 0,
      grades.s3[subjectKey] || 0,
      grades.s4[subjectKey] || 0,
      grades.s5[subjectKey] || 0,
      grades.s6[subjectKey] || 0
    ];
    const sum = scores.reduce((a, b) => a + b, 0);
    return Math.round((sum / 6) * 100) / 100;
  };

  const getOverallAverage = (): number => {
    if (!grades) return 0;
    const subjects = Object.keys(mapelLabels) as (keyof MapelGrades)[];
    const averages = subjects.map(sub => getSubjectAverage(sub));
    const sum = averages.reduce((a, b) => a + b, 0);
    return Math.round((sum / subjects.length) * 100) / 100;
  };

  const getSubjectIjazah = (subjectKey: keyof MapelGrades): number => {
    if (!grades) return 0;
    const avgSemester = getSubjectAverage(subjectKey);
    const scoreUS = grades.ujianSekolah[subjectKey] || 0;
    // Formula: (40% * Rerata Semester) + (60% * US)
    return Math.round(((0.4 * avgSemester) + (0.6 * scoreUS)) * 100) / 100;
  };

  const getOverallIjazah = (): number => {
    const subjects = Object.keys(mapelLabels) as (keyof MapelGrades)[];
    const ijazahScores = subjects.map(sub => getSubjectIjazah(sub));
    const sum = ijazahScores.reduce((a, b) => a + b, 0);
    return Math.round((sum / subjects.length) * 100) / 100;
  };

  // Save changes
  const handleSaveGrades = async () => {
    if (grades) {
      await saveGrades(grades);
      setIsEditingGrades(false);
      alert("Riwayat nilai rapor siswa berhasil disimpan.");
    }
  };

  const handleAddPrestasi = async () => {
    if (!record || !newPrestasi.nama) return;
    const item: Prestasi = {
      id: `p-${Date.now()}`,
      nama: newPrestasi.nama,
      tingkat: newPrestasi.tingkat || 'Sekolah',
      tahun: newPrestasi.tahun || '2025',
      keterangan: newPrestasi.keterangan || ''
    };
    const updated = { ...record, prestasi: [...record.prestasi, item] };
    setRecord(updated);
    await saveBukuIndukRecord(updated);
    setNewPrestasi({ nama: '', tingkat: 'Sekolah', tahun: '', keterangan: '' });
  };

  const handleDeletePrestasi = async (id: string) => {
    if (!record) return;
    const updated = { ...record, prestasi: record.prestasi.filter(p => p.id !== id) };
    setRecord(updated);
    await saveBukuIndukRecord(updated);
  };

  const handleAddPelanggaran = async () => {
    if (!record || !newPelanggaran.nama) return;
    const item: Pelanggaran = {
      id: `pl-${Date.now()}`,
      nama: newPelanggaran.nama,
      tanggal: newPelanggaran.tanggal || new Date().toISOString().split('T')[0],
      poin: Number(newPelanggaran.poin || 5),
      keterangan: newPelanggaran.keterangan || ''
    };
    const updated = { ...record, pelanggaran: [...record.pelanggaran, item] };
    setRecord(updated);
    await saveBukuIndukRecord(updated);
    setNewPelanggaran({ nama: '', tanggal: '', poin: 5, keterangan: '' });
  };

  const handleDeletePelanggaran = async (id: string) => {
    if (!record) return;
    const updated = { ...record, pelanggaran: record.pelanggaran.filter(p => p.id !== id) };
    setRecord(updated);
    await saveBukuIndukRecord(updated);
  };

  const handleAddEkskul = async () => {
    if (!record || !newEkskul.nama) return;
    const item: Ekstrakurikuler = {
      id: `ek-${Date.now()}`,
      nama: newEkskul.nama,
      nilai: (newEkskul.nilai || 'A') as any,
      keterangan: newEkskul.keterangan || ''
    };
    const updated = { ...record, ekstrakurikuler: [...record.ekstrakurikuler, item] };
    setRecord(updated);
    await saveBukuIndukRecord(updated);
    setNewEkskul({ nama: '', nilai: 'A', keterangan: '' });
  };

  const handleDeleteEkskul = async (id: string) => {
    if (!record) return;
    const updated = { ...record, ekstrakurikuler: record.ekstrakurikuler.filter(e => e.id !== id) };
    setRecord(updated);
    await saveBukuIndukRecord(updated);
  };

  const handleSaveKehadiran = async (sem: string, key: 'sakit' | 'izin' | 'alfa', value: number) => {
    if (!record) return;
    const currentSemData = record.kehadiran[sem] || { sakit: 0, izin: 0, alfa: 0 };
    const updatedKehadiran = {
      ...record.kehadiran,
      [sem]: {
        ...currentSemData,
        [key]: Number(value)
      }
    };
    const updated = { ...record, kehadiran: updatedKehadiran };
    setRecord(updated);
    await saveBukuIndukRecord(updated);
  };

  const handlePrintBukuInduk = () => {
    setIsPrintModalOpen(true);
  };

  const triggerPrint = () => {
    try {
      window.print();
    } catch (e) {
      console.error("Gagal melakukan pencetakan:", e);
      alert("Pencetakan dibatasi oleh setelan keamanan browser di dalam frame peninjau. Mohon klik tombol 'Buka Aplikasi di Tab Baru' di kanan atas layar Anda terlebih dahulu.");
    }
  };

  // Student filtering
  const filteredStudents = activeStudents.filter(s => 
    s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.nis.includes(searchQuery)
  );

  return (
    <div id="buku-induk-container" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar List Selector */}
      <div id="buku-induk-sidebar" className="lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 no-print h-[calc(100vh-200px)] overflow-y-auto">
        <h3 className="font-semibold text-slate-800 text-sm font-sans uppercase tracking-wider">Cari Siswa</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama / NIS..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5 pt-1">
          {filteredStudents.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStudentId(s.id)}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all text-xs cursor-pointer ${selectedStudentId === s.id ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <div className="truncate pr-2">
                <div>{s.nama}</div>
                <div className="text-[10px] text-slate-400 font-mono">NIS: {s.nis}</div>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${selectedStudentId === s.id ? 'text-brand-600' : 'text-slate-400'}`} />
            </button>
          ))}
          {filteredStudents.length === 0 && (
            <p className="text-slate-400 text-center text-xs py-4">Siswa tidak ditemukan.</p>
          )}
        </div>
      </div>

      {/* Main Buku Induk Content */}
      <div id="buku-induk-main" className="lg:col-span-3 space-y-6">
        {student && record && grades ? (
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm print-portrait print-card space-y-6">
            
            {/* Header Document */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <img 
                  src={student.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                  alt={student.nama} 
                  className="w-16 h-16 rounded-full object-cover border border-slate-200 shadow-xs"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h2 className="text-xl font-bold text-slate-800 font-sans">{student.nama}</h2>
                  <p className="text-xs text-slate-400 font-mono">NIS: {student.nis} | NISN: {student.nisn}</p>
                  <p className="text-xs text-brand-600 font-semibold font-sans mt-0.5">Buku Induk Digital - Kelas {student.kelas}</p>
                </div>
              </div>

              {/* Document Action Button */}
              <button 
                id="btn-cetak-buku-induk"
                onClick={handlePrintBukuInduk}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer no-print"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Cetak Lembar Buku Induk</span>
              </button>
            </div>

            {/* Menu Tabs for Sections */}
            <div className="flex border-b border-slate-200 no-print">
              {[
                { id: 'biodata', label: 'Biodata & Ortu', icon: User },
                { id: 'nilai', label: 'Nilai Rapor S1-S6', icon: FileSpreadsheet },
                { id: 'prestasi', label: 'Prestasi & Organisasi', icon: Award },
                { id: 'kehadiran', label: 'Kehadiran & Sikap', icon: Clock }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${currentTab === tab.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* SECTION 1: BIODATA & ORTU */}
            {currentTab === 'biodata' && (
              <div id="section-biomateri" className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-1 font-display">Identitas Diri</h4>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-400">Tempat Lahir:</span>
                    <span className="col-span-2 text-slate-700 font-medium">{student.tempatLahir}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-400">Tanggal Lahir:</span>
                    <span className="col-span-2 text-slate-700 font-medium">{student.tanggalLahir}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-400">Jenis Kelamin:</span>
                    <span className="col-span-2 text-slate-700 font-medium">{student.jk === 'L' ? 'Laki-Laki' : 'Perempuan'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-400">Agama:</span>
                    <span className="col-span-2 text-slate-700 font-medium">{student.agama}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-400">Alamat Lengkap:</span>
                    <span className="col-span-2 text-slate-700 font-medium">{student.alamat}, RT/RW {student.rtRw}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-400">Desa/Kelurahan:</span>
                    <span className="col-span-2 text-slate-700 font-medium">{student.desa}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-400">Kecamatan:</span>
                    <span className="col-span-2 text-slate-700 font-medium">{student.kecamatan}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-400">Kabupaten/Kota:</span>
                    <span className="col-span-2 text-slate-700 font-medium">{student.kabupaten}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-1 font-display">Identitas Keluarga & Sosial</h4>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-400">Nama Ayah:</span>
                    <span className="col-span-2 text-slate-700 font-medium">{student.namaAyah}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-400">Nama Ibu:</span>
                    <span className="col-span-2 text-slate-700 font-medium">{student.namaIbu}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-400">Nama Wali:</span>
                    <span className="col-span-2 text-slate-700 font-medium">{student.namaWali}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-400">Pekerjaan Ortu:</span>
                    <span className="col-span-2 text-slate-700 font-medium">{student.pekerjaanOrtu}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-400">Kontak HP:</span>
                    <span className="col-span-2 text-slate-700 font-mono font-medium">{student.noHp}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-400">No. Akta Lahir:</span>
                    <span className="col-span-2 text-slate-700 font-mono font-medium">{student.noAkta || '-'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-400">Bantuan KIP/PKH:</span>
                    <span className="col-span-2 text-slate-700 font-medium">KIP: {student.kip || '-'} | PKH: {student.pkh || '-'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-400">Riwayat Kelas:</span>
                    <span className="col-span-2 text-slate-700 font-medium">
                      {record.riwayatKelas.map(rk => `${rk.kelas} (${rk.tahunPelajaran})`).join(' -> ')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: RIWAYAT NILAI RAPOR S1-S6 */}
            {currentTab === 'nilai' && (
              <div id="section-nilai" className="space-y-6">
                <div className="flex justify-between items-center no-print">
                  <div>
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider font-display text-sm">Riwayat Transkrip Rapor (Semester 1 - 6)</h4>
                    <p className="text-slate-400 text-xs">Evaluasi nilai rapor berkala selama masa belajar di sekolah.</p>
                  </div>
                  
                  {isEditingGrades ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setIsEditingGrades(false)}
                        className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Batal
                      </button>
                      <button 
                        onClick={handleSaveGrades}
                        className="flex items-center gap-1 bg-brand-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Simpan Perubahan</span>
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsEditingGrades(true)}
                      className="bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-100 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Input / Edit Nilai Rapor
                    </button>
                  )}
                </div>

                {/* Score Grid Table */}
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                        <th className="p-2.5 font-display">Mata Pelajaran (Kurikulum SMP)</th>
                        <th className="p-2.5 text-center">S1</th>
                        <th className="p-2.5 text-center">S2</th>
                        <th className="p-2.5 text-center">S3</th>
                        <th className="p-2.5 text-center">S4</th>
                        <th className="p-2.5 text-center">S5</th>
                        <th className="p-2.5 text-center">S6</th>
                        <th className="p-2.5 text-center bg-slate-100/50">Rerata</th>
                        <th className="p-2.5 text-center bg-brand-50 text-brand-700">Ujian Sekolah</th>
                        <th className="p-2.5 text-center bg-brand-600 text-white">Nilai Ijazah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {(Object.keys(mapelLabels) as (keyof MapelGrades)[]).map((subKey) => (
                        <tr key={subKey} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-2.5 font-medium text-slate-700">{mapelLabels[subKey]}</td>
                          
                          {/* S1 */}
                          <td className="p-2.5 text-center">
                            {isEditingGrades ? (
                              <input 
                                type="number" 
                                min={0} max={100}
                                value={grades.s1[subKey]}
                                onChange={(e) => setGrades({
                                  ...grades,
                                  s1: { ...grades.s1, [subKey]: Number(e.target.value) }
                                })}
                                className="w-12 text-center bg-slate-50 border border-slate-100 rounded p-1 text-xs"
                              />
                            ) : (grades.s1[subKey] || '-')}
                          </td>
                          
                          {/* S2 */}
                          <td className="p-2.5 text-center">
                            {isEditingGrades ? (
                              <input 
                                type="number" 
                                min={0} max={100}
                                value={grades.s2[subKey]}
                                onChange={(e) => setGrades({
                                  ...grades,
                                  s2: { ...grades.s2, [subKey]: Number(e.target.value) }
                                })}
                                className="w-12 text-center bg-slate-50 border border-slate-100 rounded p-1 text-xs"
                              />
                            ) : (grades.s2[subKey] || '-')}
                          </td>

                          {/* S3 */}
                          <td className="p-2.5 text-center">
                            {isEditingGrades ? (
                              <input 
                                type="number" 
                                min={0} max={100}
                                value={grades.s3[subKey]}
                                onChange={(e) => setGrades({
                                  ...grades,
                                  s3: { ...grades.s3, [subKey]: Number(e.target.value) }
                                })}
                                className="w-12 text-center bg-slate-50 border border-slate-100 rounded p-1 text-xs"
                              />
                            ) : (grades.s3[subKey] || '-')}
                          </td>

                          {/* S4 */}
                          <td className="p-2.5 text-center">
                            {isEditingGrades ? (
                              <input 
                                type="number" 
                                min={0} max={100}
                                value={grades.s4[subKey]}
                                onChange={(e) => setGrades({
                                  ...grades,
                                  s4: { ...grades.s4, [subKey]: Number(e.target.value) }
                                })}
                                className="w-12 text-center bg-slate-50 border border-slate-100 rounded p-1 text-xs"
                              />
                            ) : (grades.s4[subKey] || '-')}
                          </td>

                          {/* S5 */}
                          <td className="p-2.5 text-center">
                            {isEditingGrades ? (
                              <input 
                                type="number" 
                                min={0} max={100}
                                value={grades.s5[subKey]}
                                onChange={(e) => setGrades({
                                  ...grades,
                                  s5: { ...grades.s5, [subKey]: Number(e.target.value) }
                                })}
                                className="w-12 text-center bg-slate-50 border border-slate-100 rounded p-1 text-xs"
                              />
                            ) : (grades.s5[subKey] || '-')}
                          </td>

                          {/* S6 */}
                          <td className="p-2.5 text-center">
                            {isEditingGrades ? (
                              <input 
                                type="number" 
                                min={0} max={100}
                                value={grades.s6[subKey]}
                                onChange={(e) => setGrades({
                                  ...grades,
                                  s6: { ...grades.s6, [subKey]: Number(e.target.value) }
                                })}
                                className="w-12 text-center bg-slate-50 border border-slate-100 rounded p-1 text-xs"
                              />
                            ) : (grades.s6[subKey] || '-')}
                          </td>

                          {/* Subject Semester Average */}
                          <td className="p-2.5 text-center bg-slate-50 font-bold text-slate-700">
                            {getSubjectAverage(subKey)}
                          </td>

                          {/* US */}
                          <td className="p-2.5 text-center bg-brand-50/50 font-bold text-brand-700">
                            {isEditingGrades ? (
                              <input 
                                type="number" 
                                min={0} max={100}
                                value={grades.ujianSekolah[subKey]}
                                onChange={(e) => setGrades({
                                  ...grades,
                                  ujianSekolah: { ...grades.ujianSekolah, [subKey]: Number(e.target.value) }
                                })}
                                className="w-12 text-center bg-brand-50/50 border border-brand-100 rounded p-1 text-xs font-bold text-brand-800"
                              />
                            ) : (grades.ujianSekolah[subKey] || '-')}
                          </td>

                          {/* Computed Ijazah Score */}
                          <td className="p-2.5 text-center bg-brand-600 font-bold text-white">
                            {getSubjectIjazah(subKey)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Score Summary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Rata-rata Keseluruhan Rapor</span>
                    <h5 className="text-2xl font-bold text-slate-800 font-display">{getOverallAverage()}</h5>
                    <p className="text-[10px] text-slate-400">Total Akumulatif Semester 1 - 6</p>
                  </div>
                  
                  <div className="bg-brand-50 p-4 rounded-xl border border-brand-100 space-y-1">
                    <span className="text-brand-600 text-[10px] font-bold uppercase tracking-wider block">Nilai Akhir Kelulusan (Ijazah)</span>
                    <h5 className="text-2xl font-bold text-brand-800 font-display">{getOverallIjazah()}</h5>
                    <p className="text-[10px] text-brand-600">(40% Rerata Rapor + 60% Ujian Sekolah)</p>
                  </div>

                  <div className={`p-4 rounded-xl border space-y-1 ${getOverallIjazah() >= 75 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${getOverallIjazah() >= 75 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      Kualifikasi Kelulusan
                    </span>
                    <h5 className={`text-2xl font-bold font-display ${getOverallIjazah() >= 75 ? 'text-emerald-800' : 'text-rose-800'}`}>
                      {getOverallIjazah() >= 75 ? 'MEMENUHI SYARAT' : 'DI BAWAH STANDAR'}
                    </h5>
                    <p className="text-[10px] text-slate-400">KKM Kelulusan Satuan: 75.00</p>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: PRESTASI & ORGANISASI */}
            {currentTab === 'prestasi' && (
              <div id="section-prestasi" className="space-y-6">
                
                {/* Academic Achievements Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Prestasi */}
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
                    <div className="flex items-center gap-1 text-slate-800 font-bold text-xs uppercase font-display">
                      <Award className="w-4 h-4 text-brand-600" />
                      <span>Catatan Prestasi Siswa</span>
                    </div>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto pt-1">
                      {record.prestasi.map(p => (
                        <div key={p.id} className="bg-white p-2.5 rounded-lg border border-slate-100 flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold text-slate-800">{p.nama}</div>
                            <div className="text-[10px] text-slate-400">Tingkat {p.tingkat} | Tahun {p.tahun} ({p.keterangan})</div>
                          </div>
                          <button 
                            onClick={() => handleDeletePrestasi(p.id)}
                            className="text-red-400 hover:text-red-600 p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {record.prestasi.length === 0 && (
                        <p className="text-slate-400 text-center text-xs py-4">Belum ada riwayat prestasi.</p>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-3 space-y-2 no-print">
                      <input 
                        type="text" 
                        placeholder="Nama Lomba / Prestasi..." 
                        value={newPrestasi.nama || ''}
                        onChange={(e) => setNewPrestasi({ ...newPrestasi, nama: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs focus:outline-none"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          value={newPrestasi.tingkat || 'Sekolah'}
                          onChange={(e) => setNewPrestasi({ ...newPrestasi, tingkat: e.target.value as any })}
                          className="bg-white border border-slate-200 rounded p-1.5 text-xs focus:outline-none"
                        >
                          <option value="Sekolah">Sekolah</option>
                          <option value="Kecamatan">Kecamatan</option>
                          <option value="Kota">Kota</option>
                          <option value="Provinsi">Provinsi</option>
                          <option value="Nasional">Nasional</option>
                        </select>
                        <input 
                          type="text" 
                          placeholder="Tahun..." 
                          value={newPrestasi.tahun || ''}
                          onChange={(e) => setNewPrestasi({ ...newPrestasi, tahun: e.target.value })}
                          className="bg-white border border-slate-200 rounded p-1.5 text-xs focus:outline-none"
                        />
                        <button 
                          onClick={handleAddPrestasi}
                          className="bg-brand-600 hover:bg-brand-700 text-white rounded font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Simpan</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ekstrakurikuler */}
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
                    <div className="flex items-center gap-1 text-slate-800 font-bold text-xs uppercase font-display">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      <span>Ekstrakurikuler & Organisasi</span>
                    </div>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto pt-1">
                      {record.ekstrakurikuler.map(e => (
                        <div key={e.id} className="bg-white p-2.5 rounded-lg border border-slate-100 flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold text-slate-800">{e.nama} - Nilai: <span className="text-brand-600 font-bold">{e.nilai}</span></div>
                            <div className="text-[10px] text-slate-400">{e.keterangan}</div>
                          </div>
                          <button 
                            onClick={() => handleDeleteEkskul(e.id)}
                            className="text-red-400 hover:text-red-600 p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {record.ekstrakurikuler.length === 0 && (
                        <p className="text-slate-400 text-center text-xs py-4">Belum terdaftar di ekstra manapun.</p>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-3 space-y-2 no-print">
                      <input 
                        type="text" 
                        placeholder="Nama Ekstrakurikuler..." 
                        value={newEkskul.nama || ''}
                        onChange={(e) => setNewEkskul({ ...newEkskul, nama: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs focus:outline-none"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          value={newEkskul.nilai || 'A'}
                          onChange={(e) => setNewEkskul({ ...newEkskul, nilai: e.target.value as any })}
                          className="bg-white border border-slate-200 rounded p-1.5 text-xs focus:outline-none"
                        >
                          <option value="A">Nilai A</option>
                          <option value="B">Nilai B</option>
                          <option value="C">Nilai C</option>
                          <option value="D">Nilai D</option>
                        </select>
                        <input 
                          type="text" 
                          placeholder="Deskripsi/Ket..." 
                          value={newEkskul.keterangan || ''}
                          onChange={(e) => setNewEkskul({ ...newEkskul, keterangan: e.target.value })}
                          className="col-span-2 bg-white border border-slate-200 rounded p-1.5 text-xs focus:outline-none"
                        />
                      </div>
                      <button 
                        onClick={handleAddEkskul}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded p-1.5 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambahkan Ekstrakurikuler</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* SECTION 4: KEHADIRAN & PELANGGARAN */}
            {currentTab === 'kehadiran' && (
              <div id="section-kehadiran" className="space-y-6">
                
                {/* Attendance Counter */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider font-display text-sm">Rekap Presensi Kehadiran Siswa</h4>
                  <p className="text-slate-400 text-xs">Pencatatan ketidakhadiran (Sakit, Izin, Alfa) per semester belajar aktif.</p>
                  
                  <div className="overflow-x-auto border border-slate-100 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                          <th className="p-3">Kategori Semester</th>
                          <th className="p-3 text-center">Sakit (Hari)</th>
                          <th className="p-3 text-center">Izin (Hari)</th>
                          <th className="p-3 text-center">Tanpa Keterangan / Alfa (Hari)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        {["1", "2", "3", "4", "5", "6"].map((sem) => {
                          const attendance = record.kehadiran[sem] || { sakit: 0, izin: 0, alfa: 0 };
                          return (
                            <tr key={sem} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-3 font-semibold text-slate-700">Semester {sem}</td>
                              
                              <td className="p-3 text-center">
                                <input 
                                  type="number" 
                                  min={0}
                                  value={attendance.sakit}
                                  onChange={(e) => handleSaveKehadiran(sem, 'sakit', Number(e.target.value))}
                                  className="w-16 text-center bg-slate-50 border border-slate-200 rounded p-1 font-mono text-xs focus:outline-none"
                                />
                              </td>
                              <td className="p-3 text-center">
                                <input 
                                  type="number" 
                                  min={0}
                                  value={attendance.izin}
                                  onChange={(e) => handleSaveKehadiran(sem, 'izin', Number(e.target.value))}
                                  className="w-16 text-center bg-slate-50 border border-slate-200 rounded p-1 font-mono text-xs focus:outline-none"
                                />
                              </td>
                              <td className="p-3 text-center">
                                <input 
                                  type="number" 
                                  min={0}
                                  value={attendance.alfa}
                                  onChange={(e) => handleSaveKehadiran(sem, 'alfa', Number(e.target.value))}
                                  className="w-16 text-center bg-slate-50 border border-slate-200 rounded p-1 font-mono text-xs focus:outline-none"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Disciplinary violations points */}
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs uppercase font-display">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Laporan Pelanggaran Disiplin & Poin</span>
                  </div>

                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {record.pelanggaran.map(pl => (
                      <div key={pl.id} className="bg-white p-3 rounded-lg border border-slate-100 flex items-start justify-between gap-4">
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-2">
                            <span>{pl.nama}</span>
                            <span className="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-full font-bold">-{pl.poin} Poin</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Tanggal: {pl.tanggal} | {pl.keterangan}</div>
                        </div>
                        <button 
                          onClick={() => handleDeletePelanggaran(pl.id)}
                          className="text-red-400 hover:text-red-600 p-0.5 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {record.pelanggaran.length === 0 && (
                      <p className="text-slate-400 text-center text-xs py-4">Siswa sangat tertib. Tidak ada catatan pelanggaran.</p>
                    )}
                  </div>

                  {/* Add Violation form */}
                  <div className="border-t border-slate-100 pt-3 space-y-2 no-print">
                    <input 
                      type="text" 
                      placeholder="Nama Pelanggaran (contoh: Membolos, Atribut tidak lengkap)..." 
                      value={newPelanggaran.nama || ''}
                      onChange={(e) => setNewPelanggaran({ ...newPelanggaran, nama: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs focus:outline-none"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input 
                        type="date" 
                        value={newPelanggaran.tanggal || ''}
                        onChange={(e) => setNewPelanggaran({ ...newPelanggaran, tanggal: e.target.value })}
                        className="bg-white border border-slate-200 rounded p-1.5 text-xs focus:outline-none"
                      />
                      <input 
                        type="number" 
                        placeholder="Poin..." 
                        min={1}
                        value={newPelanggaran.poin}
                        onChange={(e) => setNewPelanggaran({ ...newPelanggaran, poin: Number(e.target.value) })}
                        className="bg-white border border-slate-200 rounded p-1.5 text-xs focus:outline-none"
                      />
                      <button 
                        onClick={handleAddPelanggaran}
                        className="bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Kurangi Poin</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xs text-center text-slate-400 text-sm">
            Silakan pilih siswa dari panel sebelah kiri untuk memproses Buku Induk Digital.
          </div>
        )}
      </div>

      {/* Print Assistant Modal */}
      {isPrintModalOpen && student && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-6 text-left">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-brand-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-sans">Asisten Pencetakan Buku Induk</h3>
                  <p className="text-[10px] text-slate-400 font-mono">PRINT ASSISTANT ENGINE v1.1</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPrintModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Student Info Summary */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px] text-slate-400">Target Dokumen</div>
              <div className="font-bold text-slate-800 text-sm">{student.nama}</div>
              <div className="font-mono text-[11px]">NIS: {student.nis} | NISN: {student.nisn}</div>
              <div>Buku Induk Digital - Kelas {student.kelas}</div>
            </div>

            {/* Print Instructions Checklist */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] text-brand-700 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-brand-500" />
                <span>Petunjuk Setelan Cetak Optimal</span>
              </h4>
              
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Grafis Latar Belakang (Background Graphics):</strong> Wajib <strong>Dicentang / Diaktifkan</strong> pada setelan cetak peramban agar warna brand, aksen tabel, dan logo muncul sempurna di lembar cetak.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Header dan Footer:</strong> Sebaiknya <strong>Dihilangkan / Dinonaktifkan</strong> agar kertas bersih dari URL peramban, tanggal cetak, dan nomor halaman bawaan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Ukuran & Tata Letak Kertas:</strong> Gunakan ukuran <strong>A4</strong> dengan tata letak <strong>Portrait</strong> (Tegak).</span>
                </li>
              </ul>
            </div>

            {/* Iframe Warning Warning Alert */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Penting: Batasan Mode Peninjauan (Preview)</span>
              </div>
              <p className="leading-relaxed">
                Karena aplikasi berjalan di dalam frame preview yang aman, peramban Anda mungkin memblokir dialog cetak bawaan. 
                Jika tombol <strong>"Lanjutkan ke Dialog Cetak"</strong> di bawah tidak memunculkan apa pun, mohon klik ikon <strong>"Buka Aplikasi di Tab Baru"</strong> <ExternalLink className="w-3 h-3 inline" /> di pojok kanan paling atas editor AI Studio Anda terlebih dahulu, lalu klik tombol cetak kembali di tab tersebut.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 border-t border-slate-100 pt-4 justify-end">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={triggerPrint}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Lanjutkan ke Dialog Cetak</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
