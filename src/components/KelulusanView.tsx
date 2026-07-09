import React, { useState } from 'react';
import { useAppState } from '../lib/StateContext';
import { Siswa } from '../types';
import { 
  CheckSquare, 
  Square, 
  Award, 
  Printer, 
  Search, 
  ArrowRight,
  Sparkles,
  Users
} from 'lucide-react';

export const KelulusanView: React.FC = () => {
  const { siswaList, saveSiswa, schoolSettings } = useAppState();

  const kelas9Siswa = siswaList.filter(s => s.kelas === 'IX' && s.statusAktif === 'Aktif');

  // State
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectToggle = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredSiswa.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSiswa.map(s => s.id));
    }
  };

  const handleBatchGraduate = async () => {
    if (selectedIds.length === 0) {
      alert("Harap pilih setidaknya satu siswa untuk diluluskan!");
      return;
    }
    
    if (confirm(`Apakah Anda yakin ingin MELULUSKAN ${selectedIds.length} siswa terpilih? Mereka akan dipindahkan ke status Alumni.`)) {
      for (const id of selectedIds) {
        const student = siswaList.find(s => s.id === id);
        if (student) {
          const updated: Siswa = {
            ...student,
            statusAktif: 'Lulus',
            kelas: 'IX' // Keep grade but status is alumni now
          };
          await saveSiswa(updated);
        }
      }
      setSelectedIds([]);
      alert("Proses kelulusan massal sukses dilakukan! Siswa kini tercatat di database Alumni.");
    }
  };

  const filteredSiswa = kelas9Siswa.filter(s => 
    s.nama.toLowerCase().includes(search.toLowerCase()) || 
    s.nis.includes(search)
  );

  return (
    <div id="kelulusan-view-container" className="space-y-6">
      {/* Title Header */}
      <div id="kelulusan-header-bar" className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight font-sans">Penetapan Kelulusan</h2>
          <p className="text-slate-500 text-sm mt-0.5">Proses kelulusan tingkat akhir kelas IX menuju alumni secara massal.</p>
        </div>

        <button
          id="btn-kelulusan-masal"
          onClick={handleBatchGraduate}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Luluskan {selectedIds.length} Siswa Terpilih</span>
        </button>
      </div>

      {/* Stats summary panel */}
      <div id="kelulusan-metrics-row" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-brand-50 text-brand-600 rounded-lg shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Siswa Tingkat IX Aktif</span>
            <span className="text-lg font-bold text-slate-700 font-sans">{kelas9Siswa.length} Orang</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Terpilih Untuk Diproses</span>
            <span className="text-lg font-bold text-emerald-600 font-sans">{selectedIds.length} Orang</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Tahun Pelajaran Kelulusan</span>
            <span className="text-lg font-bold text-slate-700 font-sans">{schoolSettings.tahunPelajaran}</span>
          </div>
        </div>
      </div>

      {/* Search Input bar */}
      <div id="kelulusan-search" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4 no-print">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari siswa tingkat IX..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 text-slate-800 text-sm border border-slate-200 focus:outline-none"
          />
        </div>
      </div>

      {/* Main assessment checklist table */}
      <div id="kelulusan-checklist-card" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 w-12 text-center no-print">
                  <button onClick={handleSelectAll} className="text-slate-500 hover:text-brand-600 cursor-pointer">
                    {selectedIds.length === filteredSiswa.length && filteredSiswa.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-brand-600 mx-auto" />
                    ) : (
                      <Square className="w-5 h-5 mx-auto" />
                    )}
                  </button>
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">NIS / NISN</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Laki/Perempuan</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tahun Masuk</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Status Evaluasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSiswa.map((s) => {
                const isSelected = selectedIds.includes(s.id);
                return (
                  <tr key={s.id} className={`transition-colors ${isSelected ? 'bg-brand-50/10' : 'hover:bg-slate-50/50'}`}>
                    <td className="p-4 text-center no-print">
                      <button onClick={() => handleSelectToggle(s.id)} className="text-slate-400 hover:text-brand-600 cursor-pointer">
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-brand-600 mx-auto" />
                        ) : (
                          <Square className="w-5 h-5 mx-auto" />
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-semibold text-slate-800">{s.nis}</div>
                      <div className="text-xs text-slate-400 font-mono">{s.nisn}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-semibold text-slate-700">{s.nama}</span>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {s.jk === 'L' ? 'Laki-Laki' : 'Perempuan'}
                    </td>
                    <td className="p-4 text-xs text-slate-400 font-mono">
                      {s.tahunMasuk || '2023'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold">LENGKAP</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                        <span className="text-[10px] bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-bold">SIAP LULUS</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredSiswa.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-sm">
                    Tidak ditemukan siswa tingkat IX aktif yang dapat diproses saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
