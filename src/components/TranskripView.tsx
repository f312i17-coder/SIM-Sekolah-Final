import React, { useState, useEffect } from 'react';
import { useAppState } from '../lib/StateContext';
import { Siswa, SiswaNilai, MapelGrades } from '../types';
import { 
  Printer, 
  Search, 
  TrendingUp, 
  GraduationCap
} from 'lucide-react';

export const TranskripView: React.FC = () => {
  const { siswaList, getGradesForSiswa, schoolSettings } = useAppState();

  const activeStudents = siswaList.filter(s => s.statusAktif === 'Aktif' || s.statusAktif === 'Lulus');

  // State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [grades, setGrades] = useState<SiswaNilai | null>(null);
  const [search, setSearch] = useState('');

  const currentSiswa = activeStudents.find(s => s.id === selectedStudentId) || activeStudents[0];

  useEffect(() => {
    if (selectedStudentId) {
      getGradesForSiswa(selectedStudentId).then(setGrades);
    } else if (activeStudents.length > 0) {
      setSelectedStudentId(activeStudents[0].id);
    }
  }, [selectedStudentId, siswaList]);

  // Course configurations
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

  const mapelKeys = Object.keys(mapelLabels) as (keyof MapelGrades)[];

  // Calculations helper for specific student grades
  const getSubjectAverage = (sNilai: SiswaNilai, key: keyof MapelGrades): number => {
    const sum = (sNilai.s1[key] || 0) + (sNilai.s2[key] || 0) + (sNilai.s3[key] || 0) + 
                (sNilai.s4[key] || 0) + (sNilai.s5[key] || 0) + (sNilai.s6[key] || 0);
    return Math.round((sum / 6) * 100) / 100;
  };

  const getWeightedScore = (sNilai: SiswaNilai, key: keyof MapelGrades): number => {
    const avg = getSubjectAverage(sNilai, key);
    const us = sNilai.ujianSekolah[key] || 0;
    return Math.round(((0.4 * avg) + (0.6 * us)) * 100) / 100;
  };

  const getOverallIjazahAverage = (sNilai: SiswaNilai): number => {
    const sum = mapelKeys.reduce((acc, k) => acc + getWeightedScore(sNilai, k), 0);
    return Math.round((sum / mapelKeys.length) * 100) / 100;
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredStudents = activeStudents.filter(s => 
    s.nama.toLowerCase().includes(search.toLowerCase()) || 
    s.nis.includes(search)
  );

  return (
    <div id="transkrip-view-container" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Student List Sidebar */}
      <div id="transkrip-sidebar" className="lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 no-print h-[calc(100vh-200px)] overflow-y-auto">
        <h3 className="font-semibold text-slate-800 text-sm font-sans uppercase tracking-wider">Cari Siswa</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama / NIS..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5 pt-1">
          {filteredStudents.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStudentId(s.id)}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all text-xs cursor-pointer ${currentSiswa?.id === s.id ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <div>
                <div>{s.nama}</div>
                <div className="text-[10px] text-slate-400 font-mono">NIS: {s.nis}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Transcript Canvas */}
      <div id="transkrip-main" className="lg:col-span-3 space-y-6">
        {currentSiswa && grades ? (
          <div className="space-y-6">
            
            {/* Action controls */}
            <div id="transkrip-controls" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4 no-print">
              <div>
                <h4 className="font-semibold text-slate-800 font-sans">Transkrip Nilai Akademik Siswa</h4>
                <p className="text-xs text-slate-400">Lembar transkrip resmi rekapitulasi nilai rapor komparatif.</p>
              </div>

              <button
                id="btn-print-transkrip"
                onClick={handlePrint}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Transkrip</span>
              </button>
            </div>

            {/* Document Printable Paper Canvas */}
            <div id="transkrip-canvas" className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm print-portrait print-card max-w-3xl mx-auto font-sans text-slate-800 leading-relaxed text-xs">
              
              {/* Formal Header Logo row */}
              <div className="flex items-center justify-between gap-4 border-b-2 border-slate-900 pb-4">
                <img 
                  src={schoolSettings.logoUrl} 
                  alt="Logo" 
                  className="w-14 h-14 object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="text-center flex-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 leading-none">Dinas Pendidikan Provinsi DKI Jakarta</h4>
                  <h3 className="text-sm font-bold uppercase text-slate-800 tracking-wide mt-1">{schoolSettings.namaSekolah}</h3>
                  <p className="text-[9px] text-slate-400 mt-0.5">{schoolSettings.alamat}</p>
                </div>
                <div className="w-14 h-14"></div> {/* Balance spacer */}
              </div>

              {/* Title Section */}
              <div className="text-center mt-6 space-y-1">
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-800 font-sans">TRANSKRIP NILAI AKADEMIK</h4>
                <p className="text-[10px] text-slate-400">Tahun Pelajaran: {schoolSettings.tahunPelajaran} | Semester Ganjil/Genap</p>
              </div>

              {/* Student Bio Metadata row */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 my-6">
                <div className="space-y-1">
                  <div className="flex"><span className="w-20 font-semibold text-slate-400">NAMA</span><span className="font-bold text-slate-800">: {currentSiswa.nama}</span></div>
                  <div className="flex"><span className="w-20 font-semibold text-slate-400">NIS</span><span className="font-mono text-slate-700">: {currentSiswa.nis}</span></div>
                  <div className="flex"><span className="w-20 font-semibold text-slate-400">NISN</span><span className="font-mono text-slate-700">: {currentSiswa.nisn}</span></div>
                </div>
                <div className="space-y-1">
                  <div className="flex"><span className="w-24 font-semibold text-slate-400">JENIS KELAMIN</span><span className="text-slate-700">: {currentSiswa.jk === 'L' ? 'Laki-Laki' : 'Perempuan'}</span></div>
                  <div className="flex"><span className="w-24 font-semibold text-slate-400">KELAS AKHIR</span><span className="text-slate-700 font-bold">: {currentSiswa.kelas}</span></div>
                  <div className="flex"><span className="w-24 font-semibold text-slate-400">STATUS</span><span className="text-emerald-600 font-bold">: {currentSiswa.statusAktif}</span></div>
                </div>
              </div>

              {/* Historical Grid */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-[10px] border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                      <th className="p-2">Daftar Mata Pelajaran</th>
                      <th className="p-2 text-center">S1</th>
                      <th className="p-2 text-center">S2</th>
                      <th className="p-2 text-center">S3</th>
                      <th className="p-2 text-center">S4</th>
                      <th className="p-2 text-center">S5</th>
                      <th className="p-2 text-center">S6</th>
                      <th className="p-2 text-center bg-slate-200/50">Rerata</th>
                      <th className="p-2 text-center bg-brand-50 text-brand-800">Ujian</th>
                      <th className="p-2 text-center bg-brand-600 text-white font-bold">Hasil Akhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {mapelKeys.map((key) => {
                      const avg = getSubjectAverage(grades, key);
                      const weighted = getWeightedScore(grades, key);
                      return (
                        <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-2 font-medium text-slate-700">{mapelLabels[key]}</td>
                          <td className="p-2 text-center font-mono">{grades.s1[key] || '-'}</td>
                          <td className="p-2 text-center font-mono">{grades.s2[key] || '-'}</td>
                          <td className="p-2 text-center font-mono">{grades.s3[key] || '-'}</td>
                          <td className="p-2 text-center font-mono">{grades.s4[key] || '-'}</td>
                          <td className="p-2 text-center font-mono">{grades.s5[key] || '-'}</td>
                          <td className="p-2 text-center font-mono">{grades.s6[key] || '-'}</td>
                          <td className="p-2 text-center bg-slate-50 font-bold text-slate-700">{avg}</td>
                          <td className="p-2 text-center bg-brand-50/30 font-bold text-brand-700">{grades.ujianSekolah[key] || 0}</td>
                          <td className="p-2 text-center bg-brand-600 font-bold text-white">{weighted}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Total GPA banner */}
              <div className="flex justify-end mt-4">
                <div className="bg-brand-50 border border-brand-100 p-3 rounded-xl flex items-center gap-4">
                  <GraduationCap className="w-5 h-5 text-brand-600" />
                  <div>
                    <span className="text-[8px] text-brand-600 font-bold uppercase tracking-wider block">Indeks Rata-rata Prestasi Kelulusan</span>
                    <span className="text-lg font-bold text-brand-800 font-sans leading-none">{getOverallIjazahAverage(grades)}</span>
                  </div>
                </div>
              </div>

              {/* Two Column Signature blocks */}
              <div className="mt-8 grid grid-cols-2 gap-6 pt-6 border-t border-slate-200">
                <div className="text-center space-y-1">
                  <p className="text-slate-400 text-[10px]">Mengetahui,</p>
                  <p className="font-semibold text-slate-700">Wali Kelas {currentSiswa?.kelas || "Tingkat IX"}</p>
                  <div className="h-12"></div>
                  <p className="font-bold underline text-slate-800">
                    {(schoolSettings.waliKelas && currentSiswa && schoolSettings.waliKelas[currentSiswa.kelas]) || 'Drs. M. Wahyudi, M.Pd'}
                  </p>
                  <p className="text-slate-400 text-[9px]">
                    {currentSiswa?.kelas?.startsWith('IX') ? 'NIP. 19780512 200501 1 002' : 'NIP. -'}
                  </p>
                </div>

                <div className="text-center space-y-1">
                  <p className="text-slate-400 text-[10px]">Mengesahkan,</p>
                  <p className="font-semibold text-slate-700">Kepala {schoolSettings.namaSekolah}</p>
                  
                  {/* Signature block */}
                  <div className="h-12 flex items-center justify-center relative">
                    <img 
                      src={schoolSettings.tandaTanganUrl} 
                      alt="Stamp" 
                      className="h-10 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <p className="font-bold underline text-slate-800">{schoolSettings.kepalaSekolah}</p>
                  <p className="text-slate-400 text-[9px]">NIP. {schoolSettings.nipKepalaSekolah}</p>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center text-slate-400 text-sm">
            Silakan pilih siswa dari panel sebelah kiri untuk memproses Transkrip Nilai Rapor.
          </div>
        )}
      </div>
    </div>
  );
};
