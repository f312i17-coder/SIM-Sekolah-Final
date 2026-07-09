import React, { useState, useEffect } from 'react';
import { useAppState } from '../lib/StateContext';
import { Siswa, SiswaNilai, MapelGrades } from '../types';
import { 
  FileSpreadsheet, 
  Save, 
  Search, 
  TrendingUp, 
  Calculator,
  FileDown
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const NilaiIjazahView: React.FC = () => {
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

  const handleSaveGrades = async () => {
    if (grades) {
      await saveGrades(grades);
      setIsEditing(false);
      alert("Nilai Ujian Sekolah & Kalkulasi Ijazah berhasil diperbarui.");
    }
  };

  // Export full table to excel
  const handleExportFullExcel = async () => {
    // Generate calculated lines for all active students
    const rows = [];
    
    for (let i = 0; i < activeStudents.length; i++) {
      const s = activeStudents[i];
      const g = await getGradesForSiswa(s.id);
      
      const row: any = {
        "NIS": s.nis,
        "Nama Siswa": s.nama,
        "Kelas": s.kelas
      };

      // Add each subject's weighted score
      mapelKeys.forEach(k => {
        row[`${mapelLabels[k]} (Rerata)`] = getSubjectAverage(g, k);
        row[`${mapelLabels[k]} (Ujian)`] = g.ujianSekolah[k] || 0;
        row[`${mapelLabels[k]} (Ijazah)`] = getWeightedScore(g, k);
      });

      row["Rata-rata Kelulusan"] = getOverallIjazahAverage(g);
      rows.push(row);
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pengolahan Ijazah");
    XLSX.writeFile(wb, `Pengolahan_Nilai_Ijazah_${schoolSettings.namaSekolah.replace(/\s+/g, '_')}.xlsx`);
  };

  const currentSiswa = activeStudents.find(s => s.id === selectedSiswaId) || activeStudents[0];

  const filteredStudents = activeStudents.filter(s => 
    s.nama.toLowerCase().includes(search.toLowerCase()) || 
    s.nis.includes(search)
  );

  return (
    <div id="nilai-ijazah-container" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Student List Sidebar */}
      <div id="nilai-ijazah-sidebar" className="lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 no-print h-[calc(100vh-200px)] overflow-y-auto">
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
              onClick={() => setSelectedSiswaId(s.id)}
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

      {/* Main Calculation Content */}
      <div id="nilai-ijazah-main" className="lg:col-span-3 space-y-6">
        {currentSiswa && grades ? (
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
            
            {/* Action top header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-semibold text-slate-800 text-lg font-sans">Kalkulator Kelulusan & Nilai Ijazah</h3>
                <p className="text-slate-400 text-xs mt-0.5">Rumus: 40% Rerata Rapor S1-S6 + 60% Ujian Sekolah.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportFullExcel}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Export Excel</span>
                </button>

                {isEditing ? (
                  <button
                    onClick={handleSaveGrades}
                    className="flex items-center gap-1.5 bg-brand-600 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Nilai</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-brand-50 text-brand-700 border border-brand-100 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    Input Nilai Ujian Sekolah
                  </button>
                )}
              </div>
            </div>

            {/* Student metadata banner */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 flex items-center gap-4">
              <img 
                src={currentSiswa.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                alt={currentSiswa.nama} 
                className="w-12 h-12 rounded-full object-cover border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <div className="text-xs">
                <h4 className="font-bold text-slate-800 text-sm">{currentSiswa.nama}</h4>
                <p className="text-slate-500 mt-0.5">NIS: {currentSiswa.nis} | Kelas {currentSiswa.kelas}</p>
              </div>
            </div>

            {/* Computations Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="p-3">Mata Pelajaran (Kurikulum Nasional)</th>
                    <th className="p-3 text-center">Rerata Rapor S1-S6 (40%)</th>
                    <th className="p-3 text-center">Nilai Ujian Sekolah / US (60%)</th>
                    <th className="p-3 text-center bg-brand-50 text-brand-700 font-bold">Kalkulasi Akhir Ijazah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {mapelKeys.map((key) => {
                    const avgRapor = getSubjectAverage(grades, key);
                    const weighted = getWeightedScore(grades, key);
                    return (
                      <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-medium text-slate-700">{mapelLabels[key]}</td>
                        
                        <td className="p-3 text-center font-semibold text-slate-500">
                          {avgRapor}
                        </td>

                        <td className="p-3 text-center">
                          {isEditing ? (
                            <input 
                              type="number" 
                              min={0} max={100}
                              value={grades.ujianSekolah[key]}
                              onChange={(e) => setGrades({
                                ...grades,
                                ujianSekolah: { ...grades.ujianSekolah, [key]: Number(e.target.value) }
                              })}
                              className="w-16 text-center bg-white border border-slate-200 rounded p-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                          ) : (
                            <span className="font-semibold text-slate-700">{grades.ujianSekolah[key] || 0}</span>
                          )}
                        </td>

                        <td className="p-3 text-center bg-brand-50/30 font-bold text-brand-800">
                          {weighted}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Calculated Class Metrics summary card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-white shadow-xs shrink-0">
                  <Calculator className="w-6 h-6 text-brand-600" />
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="text-slate-400 block font-bold uppercase">Rata-rata Akhir Ijazah</span>
                  <h5 className="text-xl font-bold text-slate-800 font-sans">{getOverallIjazahAverage(grades)}</h5>
                  <p className="text-[10px] text-slate-400">Nilai agregat seluruh mata pelajaran ijazah</p>
                </div>
              </div>

              <div className={`p-4 rounded-xl border flex items-center gap-4 ${getOverallIjazahAverage(grades) >= 75 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className="p-3 rounded-lg bg-white shadow-xs shrink-0">
                  <TrendingUp className={`w-6 h-6 ${getOverallIjazahAverage(grades) >= 75 ? 'text-emerald-600' : 'text-amber-600'}`} />
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="text-slate-400 block font-bold uppercase">Kelayakan Mutu Kelulusan</span>
                  <h5 className={`text-xl font-bold font-sans ${getOverallIjazahAverage(grades) >= 75 ? 'text-emerald-800' : 'text-amber-800'}`}>
                    {getOverallIjazahAverage(grades) >= 75 ? 'LULUS (MEMENUHI SYARAT)' : 'MENUNGGU VERIFIKASI'}
                  </h5>
                  <p className="text-[10px] text-slate-400">Minimum KKM Kelulusan Satuan: 75.00</p>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center text-slate-400 text-sm">
            Silakan pilih siswa untuk menampilkan lembar pengolahan nilai kelulusan ijazah.
          </div>
        )}
      </div>
    </div>
  );
};
