import React, { useState, useEffect } from 'react';
import { useAppState } from '../lib/StateContext';
import { Siswa, SiswaNilai, MapelGrades } from '../types';
import { 
  Save, 
  Search, 
  GraduationCap, 
  BookOpen,
  FileSpreadsheet,
  FileDown
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface InputNilaiRaporViewProps {
  semester: number;
}

export const InputNilaiRaporView: React.FC<InputNilaiRaporViewProps> = ({ semester }) => {
  const { siswaList, getGradesForSiswa, saveGrades, schoolSettings } = useAppState();

  const activeStudents = siswaList.filter(s => s.statusAktif === 'Aktif' || s.statusAktif === 'Lulus');

  // State
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [grades, setGrades] = useState<SiswaNilai | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState('');

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

  // Load selected grades
  useEffect(() => {
    if (selectedSiswaId) {
      getGradesForSiswa(selectedSiswaId).then(setGrades);
    } else if (activeStudents.length > 0) {
      setSelectedSiswaId(activeStudents[0].id);
    }
    setIsEditing(false);
  }, [selectedSiswaId, siswaList]);

  const currentSiswa = activeStudents.find(s => s.id === selectedSiswaId) || activeStudents[0];

  const filteredStudents = activeStudents.filter(s => 
    s.nama.toLowerCase().includes(search.toLowerCase()) || 
    s.nis.includes(search)
  );

  const getSemesterGrades = (): MapelGrades => {
    if (!grades) return { pai: 0, ppkn: 0, indo: 0, mtk: 0, ipa: 0, ips: 0, inggris: 0, seni: 0, pjok: 0, tik: 0, mulok: 0 };
    const key = `s${semester}` as keyof SiswaNilai;
    return (grades[key] as MapelGrades) || { pai: 0, ppkn: 0, indo: 0, mtk: 0, ipa: 0, ips: 0, inggris: 0, seni: 0, pjok: 0, tik: 0, mulok: 0 };
  };

  const handleUpdateGrade = (subjectKey: keyof MapelGrades, value: number) => {
    if (!grades) return;
    const semKey = `s${semester}` as keyof SiswaNilai;
    const updatedSemGrades = {
      ...(grades[semKey] as MapelGrades),
      [subjectKey]: value
    };

    setGrades({
      ...grades,
      [semKey]: updatedSemGrades
    });
  };

  const handleSaveGrades = async () => {
    if (grades) {
      await saveGrades(grades);
      setIsEditing(false);
      alert(`Nilai Rapor Semester ${semester} berhasil disimpan.`);
    }
  };

  const handleExportExcel = () => {
    if (!currentSiswa || !grades) return;
    const semGrades = getSemesterGrades();
    const rows = mapelKeys.map(key => ({
      "Mata Pelajaran": mapelLabels[key],
      "Nilai": semGrades[key] || 0
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Rapor Sem ${semester}`);
    XLSX.writeFile(wb, `Nilai_Rapor_Sem${semester}_${currentSiswa.nama.replace(/\s+/g, '_')}.xlsx`);
  };

  return (
    <div id={`rapor-s${semester}-container`} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Student List Sidebar */}
      <div id="rapor-sidebar" className="lg:col-span-1 bg-white dark:bg-[#131b2e] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 no-print h-[calc(100vh-200px)] overflow-y-auto transition-colors">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm font-sans uppercase tracking-wider">Pilih Siswa</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama / NIS..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-1.5 pt-1">
          {filteredStudents.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSiswaId(s.id)}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all text-xs cursor-pointer ${currentSiswa?.id === s.id ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            >
              <div>
                <div>{s.nama}</div>
                <div className="text-[10px] text-slate-400 font-mono">NIS: {s.nis} | Kelas {s.kelas}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div id="rapor-main" className="lg:col-span-3 space-y-6">
        {currentSiswa && grades ? (
          <div className="bg-white dark:bg-[#131b2e] rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg font-sans">Input Nilai Rapor Semester {semester}</h3>
                <p className="text-slate-400 text-xs mt-0.5">Lakukan pengisian nilai rapor kognitif mata pelajaran utama siswa.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer border border-transparent dark:border-slate-700"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Cetak Nilai</span>
                </button>

                {isEditing ? (
                  <button
                    onClick={handleSaveGrades}
                    className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Nilai</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-900/60 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    Edit Nilai Semester {semester}
                  </button>
                )}
              </div>
            </div>

            {/* Student Card */}
            <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-colors">
              <img 
                src={currentSiswa.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                alt={currentSiswa.nama} 
                className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                referrerPolicy="no-referrer"
              />
              <div className="text-xs">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{currentSiswa.nama}</h4>
                <p className="text-slate-500 mt-0.5">NIS: {currentSiswa.nis} | NISN: {currentSiswa.nisn || '-'} | Kelas {currentSiswa.kelas}</p>
              </div>
            </div>

            {/* Grades Table */}
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl transition-colors">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3">Mata Pelajaran (Kurikulum Nasional)</th>
                    <th className="p-3 text-center w-40">Nilai Kognitif (0 - 100)</th>
                    <th className="p-3 text-center w-40">Predikat Kelulusan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-600 dark:text-slate-300">
                  {mapelKeys.map((key) => {
                    const value = getSemesterGrades()[key] || 0;
                    let predikat = 'E';
                    if (value >= 90) predikat = 'A (Sangat Baik)';
                    else if (value >= 80) predikat = 'B (Baik)';
                    else if (value >= 75) predikat = 'C (Cukup)';
                    else if (value >= 60) predikat = 'D (Kurang)';
                    else predikat = 'E (Sangat Kurang)';

                    return (
                      <tr key={key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="p-3 font-medium text-slate-700 dark:text-slate-200">{mapelLabels[key]}</td>
                        
                        <td className="p-3 text-center">
                          {isEditing ? (
                            <input 
                              type="number" 
                              min={0} max={100}
                              value={value}
                              onChange={(e) => handleUpdateGrade(key, Number(e.target.value))}
                              className="w-20 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded p-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                            />
                          ) : (
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span>
                          )}
                        </td>

                        <td className="p-3 text-center font-semibold text-slate-500">
                          {predikat}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#131b2e] p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center text-slate-400 text-sm transition-colors">
            Silakan pilih siswa untuk menampilkan lembar penginputan nilai rapor.
          </div>
        )}
      </div>
    </div>
  );
};
