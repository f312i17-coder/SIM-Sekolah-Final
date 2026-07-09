import React, { useState, useEffect } from 'react';
import { useAppState } from '../lib/StateContext';
import { Siswa, SiswaNilai, MapelGrades } from '../types';
import { 
  FileText, 
  Printer, 
  Search, 
  CheckCircle, 
  FileEdit,
  Save,
  Download,
  RefreshCw,
  Sliders,
  ChevronRight,
  Info
} from 'lucide-react';

interface TemplateSurat {
  paragrafPembuka: string;
  paragrafIsi: string;
  paragrafPenutup: string;
}

const DEFAULT_TEMPLATE: TemplateSurat = {
  paragrafPembuka: "Yang bertanda tangan di bawah ini, Kepala Sekolah Menengah Pertama [Nama Sekolah] menerangkan dengan sebenarnya bahwa:",
  paragrafIsi: "Adalah benar-benar siswa aktif belajar di [Nama Sekolah] pada tahun pelajaran [Tahun Pelajaran]. Berdasarkan data administrasi Buku Induk Digital, siswa tersebut di atas memiliki rata-rata nilai Rapor Kelas VII, VIII, dan IX (Semester I s.d Semester V) sebagai berikut:",
  paragrafPenutup: "Demikian Surat Keterangan ini diberikan agar dapat dipergunakan sebagai salah satu persyaratan pendaftaran ke jenjang pendidikan berikutnya."
};

export const SuketRataRaporView: React.FC = () => {
  const { siswaList, getGradesForSiswa, schoolSettings } = useAppState();

  // Filter only grade IX by default
  const [filterKelas9, setFilterKelas9] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [grades, setGrades] = useState<SiswaNilai | null>(null);
  
  // Letter custom settings
  const [nomorSurat, setNomorSurat] = useState('');
  const [tanggalSurat, setTanggalSurat] = useState(new Date().toISOString().split('T')[0]);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [template, setTemplate] = useState<TemplateSurat>(() => {
    const saved = localStorage.getItem('sim_suket_rapor_template');
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATE;
  });

  const [isSavedTemplate, setIsSavedTemplate] = useState(false);

  // Filter students based on status and search query
  const eligibleStudents = siswaList.filter(s => {
    const isStatusEligible = s.statusAktif === 'Aktif' || s.statusAktif === 'Lulus';
    if (!isStatusEligible) return false;
    
    if (filterKelas9) {
      return s.kelas.startsWith('IX');
    }
    return true;
  });

  const filteredStudents = eligibleStudents.filter(s => 
    s.nama.toLowerCase().includes(search.toLowerCase()) || 
    s.nis.includes(search) ||
    s.nisn.includes(search)
  );

  const currentSiswa = eligibleStudents.find(s => s.id === selectedStudentId) || filteredStudents[0] || eligibleStudents[0];

  // Fetch grades when student changes
  useEffect(() => {
    if (currentSiswa) {
      setSelectedStudentId(currentSiswa.id);
      getGradesForSiswa(currentSiswa.id).then(setGrades);
    } else {
      setGrades(null);
    }
  }, [currentSiswa, siswaList]);

  // Generate Automatic Letter Number when current student changes
  useEffect(() => {
    if (currentSiswa) {
      const studentIndex = eligibleStudents.findIndex(s => s.id === currentSiswa.id) + 1;
      const indexStr = studentIndex > 0 ? String(studentIndex).padStart(3, '0') : '001';
      const year = schoolSettings.tahunPelajaran ? schoolSettings.tahunPelajaran.split('/')[0] : new Date().getFullYear();
      setNomorSurat(`421.3/SMPN1R/${indexStr}/${year}`);
    }
  }, [currentSiswa, schoolSettings]);

  // Calculations helper for grades
  const getSemesterAverage = (semGrades: MapelGrades | undefined): number => {
    if (!semGrades) return 0;
    const subjects: (keyof MapelGrades)[] = ['pai', 'ppkn', 'indo', 'mtk', 'ipa', 'ips', 'inggris', 'seni', 'pjok', 'tik', 'mulok'];
    const sum = subjects.reduce((acc, k) => acc + (semGrades[k] || 0), 0);
    return Math.round((sum / subjects.length) * 100) / 100;
  };

  const s1Avg = grades ? getSemesterAverage(grades.s1) : 0;
  const s2Avg = grades ? getSemesterAverage(grades.s2) : 0;
  const s3Avg = grades ? getSemesterAverage(grades.s3) : 0;
  const s4Avg = grades ? getSemesterAverage(grades.s4) : 0;
  const s5Avg = grades ? getSemesterAverage(grades.s5) : 0;

  // Calculate Overall Average from Semester 1 to Semester 5
  const getOverallAverage = (): number => {
    const validScores = [s1Avg, s2Avg, s3Avg, s4Avg, s5Avg].filter(score => score > 0);
    if (validScores.length === 0) return 0;
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    return Math.round((sum / validScores.length) * 100) / 100;
  };

  const overallAverage = getOverallAverage();

  const formatNumberIndo = (num: number): string => {
    return num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveTemplate = () => {
    localStorage.setItem('sim_suket_rapor_template', JSON.stringify(template));
    setIsSavedTemplate(true);
    setTimeout(() => {
      setIsSavedTemplate(false);
      setIsEditingTemplate(false);
    }, 1500);
  };

  const handleResetTemplate = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan template ke bawaan awal?')) {
      setTemplate(DEFAULT_TEMPLATE);
      localStorage.setItem('sim_suket_rapor_template', JSON.stringify(DEFAULT_TEMPLATE));
    }
  };

  // Export to editable Word (.doc file)
  const handleExportWord = () => {
    const element = document.getElementById('suket-print-canvas');
    if (!element) return;
    
    const htmlContent = element.innerHTML;
    
    const documentTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <title>Surat Keterangan Nilai Rata-Rata Rapor</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; color: #000; padding: 2cm; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .uppercase { text-transform: uppercase; }
          .underline { text-decoration: underline; }
          .italic { font-style: italic; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; }
          table, th, td { border: 1px solid black; }
          th, td { padding: 8px; text-align: left; }
          .kop-table { width: 100%; border-collapse: collapse; border: none; margin-bottom: 20px; }
          .kop-table td { border: none; padding: 4px; }
          .divider-double { border-bottom: 4px double black; margin-bottom: 15px; }
          .signature-area { width: 100%; margin-top: 40px; }
          .signature-table { width: 100%; border-collapse: collapse; border: none; }
          .signature-table td { border: none; padding: 4px; text-align: center; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;
    
    const blob = new Blob(['\ufeff' + documentTemplate], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Suket_Rata_Rapor_${currentSiswa?.nama.replace(/\s+/g, '_') || 'Siswa'}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Render text with replacements
  const renderTextWithPlaceholders = (text: string) => {
    if (!text) return '';
    return text
      .replace(/\[Nama Sekolah\]/g, schoolSettings.namaSekolah)
      .replace(/\[Tahun Pelajaran\]/g, schoolSettings.tahunPelajaran);
  };

  return (
    <div id="suket-view-container" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* 1. SIDEBAR: STUDENT LIST */}
      <div id="suket-sidebar" className="lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-140px)] sticky top-6 no-print">
        <div className="space-y-3 pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-sans">Siswa Kelas IX</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama atau NIS..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-300 font-semibold"
            />
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input 
              type="checkbox" 
              checked={filterKelas9} 
              onChange={(e) => setFilterKelas9(e.target.checked)}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
            />
            <span className="text-slate-600 text-[11px] font-bold">Hanya Kelas IX (Persyaratan)</span>
          </label>
        </div>

        {/* List scrollable */}
        <div className="flex-1 overflow-y-auto pt-3 space-y-1">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStudentId(s.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all text-xs cursor-pointer ${
                  currentSiswa?.id === s.id 
                    ? 'bg-brand-50 text-brand-700 font-bold border-l-4 border-brand-500 pl-2' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="truncate pr-1">
                  <div className="truncate font-semibold">{s.nama}</div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                    <span>NIS: {s.nis}</span>
                    <span>•</span>
                    <span className="bg-slate-100 text-slate-600 px-1 rounded font-sans font-bold">{s.kelas}</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
              </button>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 text-[11px] font-medium">
              Siswa tidak ditemukan.
            </div>
          )}
        </div>
      </div>

      {/* 2. MAIN: FORM & PREVIEW */}
      <div id="suket-main" className="lg:col-span-3 space-y-6">
        
        {/* TOP INTERACTIVE CONTROL PANEL */}
        <div id="suket-controls" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5 no-print">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-bold text-slate-800 font-sans text-sm flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-600" />
                <span>Surat Keterangan Nilai Rata-Rata Rapor (Semester I - V)</span>
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">Terbitkan surat keterangan resmi otomatis bagi peserta didik jenjang akhir.</p>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setIsEditingTemplate(!isEditingTemplate)}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                <span>Edit Template</span>
              </button>
              
              <button
                onClick={handleExportWord}
                className="flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Word (.doc)</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Simpan PDF</span>
              </button>
            </div>
          </div>

          {/* Quick inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-600 font-bold block">Nomor Surat Resmi *</label>
              <input 
                type="text" 
                value={nomorSurat}
                onChange={(e) => setNomorSurat(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-semibold focus:outline-none focus:border-slate-300 transition-all"
                placeholder="Contoh: 421.3/SMPN1R/025/2026"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 font-bold block">Tanggal Penerbitan Surat *</label>
              <input 
                type="date" 
                value={tanggalSurat}
                onChange={(e) => setTanggalSurat(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-semibold focus:outline-none focus:border-slate-300 transition-all"
              />
            </div>
          </div>

          <div className="bg-brand-50/50 border border-brand-100 p-3.5 rounded-xl flex items-start gap-2.5 text-brand-800 text-xs">
            <Info className="w-4.5 h-4.5 shrink-0 text-brand-600 mt-0.5" />
            <div>
              <p className="font-bold">Otomasi Terintegrasi Buku Induk Digital</p>
              <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                Nilai Semester I sampai V di bawah ini ditarik secara real-time dari Buku Induk Digital. Jika nilai diperbarui di Buku Induk, data di surat ini akan langsung terupdate secara otomatis tanpa perlu input manual ulang.
              </p>
            </div>
          </div>
        </div>

        {/* TEMPLATE EDITOR (COLLAPSIBLE PANEL) */}
        {isEditingTemplate && (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-5 rounded-2xl space-y-4 no-print text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-700 flex items-center gap-1.5">
                <FileEdit className="w-4 h-4 text-brand-600" />
                <span>Sesuaikan Redaksi Template Surat</span>
              </h3>
              <button 
                onClick={handleResetTemplate}
                className="text-slate-400 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Default</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-slate-600 font-bold block">Paragraf Pembuka</label>
                <textarea
                  rows={2}
                  value={template.paragrafPembuka}
                  onChange={(e) => setTemplate({ ...template, paragrafPembuka: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-slate-300 font-medium"
                  placeholder="Isi paragraf pembuka surat..."
                />
                <p className="text-[10px] text-slate-400 italic">Gunakan [Nama Sekolah] untuk digantikan nama sekolah dari Pengaturan secara otomatis.</p>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-bold block">Paragraf Isi (Sebelum Tabel Nilai)</label>
                <textarea
                  rows={3}
                  value={template.paragrafIsi}
                  onChange={(e) => setTemplate({ ...template, paragrafIsi: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-slate-300 font-medium"
                  placeholder="Isi paragraf penerang sebelum tabel nilai..."
                />
                <p className="text-[10px] text-slate-400 italic">Gunakan [Nama Sekolah] atau [Tahun Pelajaran] untuk penggantian otomatis.</p>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-bold block">Paragraf Penutup</label>
                <textarea
                  rows={2}
                  value={template.paragrafPenutup}
                  onChange={(e) => setTemplate({ ...template, paragrafPenutup: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-slate-300 font-medium"
                  placeholder="Isi paragraf penutup surat..."
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setIsEditingTemplate(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveTemplate}
                  className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl font-bold shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavedTemplate ? 'Disimpan!' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. PRINT CANVAS SHEET (A4 FORMAT) */}
        {currentSiswa ? (
          <div className="bg-slate-100 p-4 sm:p-8 rounded-2xl border border-slate-200 shadow-inner flex justify-center">
            
            {/* The printable paper canvas container */}
            <div 
              id="suket-print-canvas" 
              className="bg-white p-[15mm] sm:p-[20mm] border border-slate-300 shadow-md print-portrait print-card text-black leading-relaxed"
              style={{ 
                width: '210mm', 
                minHeight: '297mm', 
                boxSizing: 'border-box', 
                fontFamily: '"Times New Roman", Times, serif',
                fontSize: '11pt'
              }}
            >
              
              {/* KOP SURAT (Letterhead) */}
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

              {/* DOCUMENT TITLE */}
              <div className="text-center mt-6 space-y-1">
                <h3 className="text-[12pt] font-bold uppercase underline tracking-wider">SURAT KETERANGAN NILAI RATA-RATA RAPOR</h3>
                <p className="text-[10pt] font-medium font-mono">Nomor: {nomorSurat || '... / ... / ...'}</p>
              </div>

              {/* BODY: OPENING */}
              <div className="mt-6 text-justify leading-relaxed">
                <p>{renderTextWithPlaceholders(template.paragrafPembuka)}</p>
              </div>

              {/* BODY: STUDENT IDENTITY */}
              <div className="mt-4 pl-8 pr-4 space-y-1">
                <table className="w-full border-none m-0 p-0" style={{ border: 'none' }}>
                  <tbody style={{ border: 'none' }}>
                    <tr style={{ border: 'none' }}>
                      <td style={{ border: 'none', padding: '2px 0', width: '220px' }}>Nama Lengkap</td>
                      <td style={{ border: 'none', padding: '2px 0', width: '20px' }}>:</td>
                      <td style={{ border: 'none', padding: '2px 0' }} className="font-bold uppercase">{currentSiswa.nama}</td>
                    </tr>
                    <tr style={{ border: 'none' }}>
                      <td style={{ border: 'none', padding: '2px 0' }}>Nomor Induk Siswa (NIS)</td>
                      <td style={{ border: 'none', padding: '2px 0' }}>:</td>
                      <td style={{ border: 'none', padding: '2px 0' }} className="font-mono">{currentSiswa.nis}</td>
                    </tr>
                    <tr style={{ border: 'none' }}>
                      <td style={{ border: 'none', padding: '2px 0' }}>NISN</td>
                      <td style={{ border: 'none', padding: '2px 0' }}>:</td>
                      <td style={{ border: 'none', padding: '2px 0' }} className="font-mono">{currentSiswa.nisn}</td>
                    </tr>
                    <tr style={{ border: 'none' }}>
                      <td style={{ border: 'none', padding: '2px 0' }}>Tempat, Tanggal Lahir</td>
                      <td style={{ border: 'none', padding: '2px 0' }}>:</td>
                      <td style={{ border: 'none', padding: '2px 0' }}>
                        {currentSiswa.tempatLahir}, {new Date(currentSiswa.tanggalLahir).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </td>
                    </tr>
                    <tr style={{ border: 'none' }}>
                      <td style={{ border: 'none', padding: '2px 0' }}>Jenis Kelamin</td>
                      <td style={{ border: 'none', padding: '2px 0' }}>:</td>
                      <td style={{ border: 'none', padding: '2px 0' }}>{currentSiswa.jk === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                    </tr>
                    <tr style={{ border: 'none' }}>
                      <td style={{ border: 'none', padding: '2px 0' }}>Rombongan Belajar (Kelas)</td>
                      <td style={{ border: 'none', padding: '2px 0' }}>:</td>
                      <td style={{ border: 'none', padding: '2px 0' }} className="font-bold">{currentSiswa.kelas}</td>
                    </tr>
                    <tr style={{ border: 'none' }}>
                      <td style={{ border: 'none', padding: '2px 0' }}>Tahun Pelajaran</td>
                      <td style={{ border: 'none', padding: '2px 0' }}>:</td>
                      <td style={{ border: 'none', padding: '2px 0' }}>{schoolSettings.tahunPelajaran}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* BODY: MIDDLE PARAGRAPH */}
              <div className="mt-5 text-justify leading-relaxed">
                <p>{renderTextWithPlaceholders(template.paragrafIsi)}</p>
              </div>

              {/* GRADES AVERAGE TABLE */}
              <div className="mt-4">
                <table className="w-full text-center border-collapse border border-black" style={{ border: '1px solid black' }}>
                  <thead>
                    <tr className="bg-slate-50" style={{ border: '1px solid black' }}>
                      <th className="font-bold py-2 border border-black" style={{ border: '1px solid black', width: '80px' }}>No.</th>
                      <th className="font-bold py-2 border border-black text-left pl-4" style={{ border: '1px solid black' }}>Semester Akademik</th>
                      <th className="font-bold py-2 border border-black" style={{ border: '1px solid black', width: '220px' }}>Nilai Rata-Rata Rapor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ border: '1px solid black' }}>
                      <td className="py-2 border border-black" style={{ border: '1px solid black' }}>1.</td>
                      <td className="py-2 border border-black text-left pl-4" style={{ border: '1px solid black' }}>Semester I (Satu) / Ganjil - Kelas VII</td>
                      <td className="py-2 border border-black font-mono font-bold" style={{ border: '1px solid black' }}>
                        {s1Avg > 0 ? formatNumberIndo(s1Avg) : 'Belum Diinput'}
                      </td>
                    </tr>
                    <tr style={{ border: '1px solid black' }}>
                      <td className="py-2 border border-black" style={{ border: '1px solid black' }}>2.</td>
                      <td className="py-2 border border-black text-left pl-4" style={{ border: '1px solid black' }}>Semester II (Dua) / Genap - Kelas VII</td>
                      <td className="py-2 border border-black font-mono font-bold" style={{ border: '1px solid black' }}>
                        {s2Avg > 0 ? formatNumberIndo(s2Avg) : 'Belum Diinput'}
                      </td>
                    </tr>
                    <tr style={{ border: '1px solid black' }}>
                      <td className="py-2 border border-black" style={{ border: '1px solid black' }}>3.</td>
                      <td className="py-2 border border-black text-left pl-4" style={{ border: '1px solid black' }}>Semester III (Tiga) / Ganjil - Kelas VIII</td>
                      <td className="py-2 border border-black font-mono font-bold" style={{ border: '1px solid black' }}>
                        {s3Avg > 0 ? formatNumberIndo(s3Avg) : 'Belum Diinput'}
                      </td>
                    </tr>
                    <tr style={{ border: '1px solid black' }}>
                      <td className="py-2 border border-black" style={{ border: '1px solid black' }}>4.</td>
                      <td className="py-2 border border-black text-left pl-4" style={{ border: '1px solid black' }}>Semester IV (Empat) / Genap - Kelas VIII</td>
                      <td className="py-2 border border-black font-mono font-bold" style={{ border: '1px solid black' }}>
                        {s4Avg > 0 ? formatNumberIndo(s4Avg) : 'Belum Diinput'}
                      </td>
                    </tr>
                    <tr style={{ border: '1px solid black' }}>
                      <td className="py-2 border border-black" style={{ border: '1px solid black' }}>5.</td>
                      <td className="py-2 border border-black text-left pl-4" style={{ border: '1px solid black' }}>Semester V (Lima) / Ganjil - Kelas IX</td>
                      <td className="py-2 border border-black font-mono font-bold" style={{ border: '1px solid black' }}>
                        {s5Avg > 0 ? formatNumberIndo(s5Avg) : 'Belum Diinput'}
                      </td>
                    </tr>
                    {/* OVERALL ROW */}
                    <tr className="bg-slate-50 font-bold" style={{ border: '1px solid black' }}>
                      <td colSpan={2} className="py-2.5 border border-black text-center font-bold tracking-wider" style={{ border: '1px solid black' }}>
                        Rerata Kumulatif (Semester I s.d V)
                      </td>
                      <td className="py-2.5 border border-black text-brand-700 text-[12pt] font-mono font-extrabold bg-brand-50/20" style={{ border: '1px solid black' }}>
                        {overallAverage > 0 ? formatNumberIndo(overallAverage) : 'Belum Diinput'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* BODY: CLOSING */}
              <div className="mt-5 text-justify leading-relaxed">
                <p>{renderTextWithPlaceholders(template.paragrafPenutup)}</p>
              </div>

              {/* SIGNATURE SECTION */}
              <div className="mt-10 flex justify-end">
                <div className="text-center space-y-0.5" style={{ minWidth: '240px' }}>
                  <p>
                    {schoolSettings.desa || 'Tanjung Samak'}, {new Date(tanggalSurat).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="font-bold">Kepala Sekolah,</p>
                  
                  {/* Signature graphic & stamp overlap */}
                  <div className="h-20 relative flex items-center justify-center">
                    {schoolSettings.stempelSekolah && (
                      <img 
                        src={schoolSettings.stempelSekolah} 
                        alt="Stempel Sekolah" 
                        className="w-20 h-20 object-contain absolute opacity-80 left-4"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    {schoolSettings.tandaTanganKepala && (
                      <img 
                        src={schoolSettings.tandaTanganKepala} 
                        alt="Tanda Tangan Kepala Sekolah" 
                        className="w-24 h-16 object-contain absolute z-10"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>

                  <p className="font-bold underline uppercase">{schoolSettings.kepalaSekolah}</p>
                  <p className="text-[10px] font-mono">NIP. {schoolSettings.nipKepalaSekolah}</p>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="bg-white p-12 text-center border border-slate-200 rounded-2xl shadow-sm text-slate-400 no-print">
            <Info className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">Tidak Ada Siswa Terpilih</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">Silakan sesuaikan filter pencarian atau pilih nama siswa dari daftar di sidebar untuk membuat surat keterangan.</p>
          </div>
        )}
      </div>
    </div>
  );
};
