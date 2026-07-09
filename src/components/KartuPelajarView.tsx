import React, { useState } from 'react';
import { useAppState } from '../lib/StateContext';
import { Siswa } from '../types';
import { 
  Printer, 
  Search, 
  Palette, 
  QrCode, 
  Barcode, 
  ShieldCheck, 
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export const KartuPelajarView: React.FC = () => {
  const { siswaList, schoolSettings } = useAppState();

  // State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [search, setSearch] = useState('');
  const [cardTheme, setCardTheme] = useState<'brand' | 'indigo' | 'emerald' | 'charcoal'>('brand');

  const activeStudents = siswaList.filter(s => s.statusAktif === 'Aktif');
  
  // Find selected student
  const student = activeStudents.find(s => s.id === selectedStudentId) || activeStudents[0];

  const filteredStudents = activeStudents.filter(s => 
    s.nama.toLowerCase().includes(search.toLowerCase()) || 
    s.nis.includes(search)
  );

  // Theme color maps
  const themeClasses = {
    brand: {
      bg: 'bg-brand-600',
      text: 'text-brand-900',
      border: 'border-brand-100',
      gradient: 'from-brand-600 to-brand-800',
      pill: 'bg-brand-50 text-brand-700'
    },
    indigo: {
      bg: 'bg-indigo-600',
      text: 'text-indigo-900',
      border: 'border-indigo-100',
      gradient: 'from-indigo-600 to-indigo-800',
      pill: 'bg-indigo-50 text-indigo-700'
    },
    emerald: {
      bg: 'bg-emerald-600',
      text: 'text-emerald-900',
      border: 'border-emerald-100',
      gradient: 'from-emerald-600 to-emerald-800',
      pill: 'bg-emerald-50 text-emerald-700'
    },
    charcoal: {
      bg: 'bg-slate-800',
      text: 'text-slate-900',
      border: 'border-slate-200',
      gradient: 'from-slate-700 to-slate-900',
      pill: 'bg-slate-100 text-slate-800'
    }
  };

  const activeTheme = themeClasses[cardTheme];

  // Dynamic QR Code generation using public API
  const getQrUrl = (nisn: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(nisn)}`;
  };

  const handlePrintCard = () => {
    if (!student) return;

    const qrUrl = getQrUrl(student.nisn || student.nis);
    
    // Inject printable window with EXACT CR-80 physical scale (85.6mm x 54.0mm)
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cetak Kartu Pelajar - ${student.nama}</title>
            <style>
              @page {
                size: A4;
                margin: 10mm;
              }
              body {
                font-family: 'Inter', system-ui, sans-serif;
                margin: 0;
                padding: 10mm;
                background-color: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20mm;
              }
              .no-print-header {
                font-family: sans-serif;
                background: #f1f5f9;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 13px;
                color: #475569;
                margin-bottom: 10mm;
                text-align: center;
                border: 1px solid #cbd5e1;
                width: 100%;
                max-width: 600px;
                box-sizing: border-box;
              }
              @media print {
                .no-print-header {
                  display: none !important;
                }
                body {
                  padding: 0;
                  background: none;
                }
              }
              .card-row {
                display: flex;
                flex-wrap: wrap;
                gap: 10mm;
                justify-content: center;
              }
              /* CR-80 physical sizing standard (85.6mm x 53.98mm) */
              .cr80-card {
                width: 85.6mm;
                height: 53.98mm;
                border: 1px solid #e2e8f0;
                border-radius: 3.5mm;
                overflow: hidden;
                position: relative;
                box-sizing: border-box;
                background: white;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                page-break-inside: avoid;
              }
              .card-header {
                background: linear-gradient(135deg, ${cardTheme === 'brand' ? '#1e3a8a, #0d9488' : cardTheme === 'indigo' ? '#4f46e5, #4338ca' : cardTheme === 'emerald' ? '#059669, #047857' : '#334155, #1e293b'});
                color: white;
                padding: 2.2mm 3mm;
                display: flex;
                align-items: center;
                gap: 2mm;
                border-bottom: 0.5px solid rgba(255,255,255,0.1);
              }
              .header-logo {
                width: 7.5mm;
                height: 7.5mm;
                object-fit: contain;
                border-radius: 50%;
                background: white;
                padding: 0.4mm;
              }
              .header-text {
                flex-1;
                min-width: 0;
              }
              .header-title {
                font-size: 8pt;
                font-weight: 800;
                text-transform: uppercase;
                margin: 0;
                letter-spacing: 0.2mm;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .header-subtitle {
                font-size: 5pt;
                margin: 0;
                opacity: 0.85;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .card-body {
                flex: 1;
                padding: 2.5mm 3mm;
                display: flex;
                align-items: center;
                gap: 3mm;
              }
              .student-photo {
                width: 17mm;
                height: 22mm;
                object-fit: cover;
                border-radius: 1mm;
                border: 0.3mm solid #cbd5e1;
                background-color: #f8fafc;
              }
              .student-details {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 0.8mm;
              }
              .student-name {
                font-size: 8pt;
                font-weight: 800;
                color: #1e293b;
                margin-bottom: 0.5mm;
                text-transform: uppercase;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .detail-row {
                display: flex;
                font-size: 5.5pt;
                color: #475569;
              }
              .detail-label {
                width: 9mm;
                font-weight: 600;
                color: #94a3b8;
              }
              .detail-val {
                flex: 1;
                font-weight: 700;
                color: #334155;
              }
              .card-footer {
                background-color: #f8fafc;
                border-top: 0.3mm solid #e2e8f0;
                padding: 1.2mm 3mm;
                display: flex;
                justify-content: justify;
                align-items: center;
              }
              .footer-expiry {
                font-size: 4.5pt;
                color: #94a3b8;
                font-weight: 500;
              }
              .footer-signature {
                text-align: right;
                font-size: 4.5pt;
                color: #334155;
                position: relative;
                width: 26mm;
                line-height: 1.2;
              }
              .sig-role {
                font-weight: 600;
                display: block;
              }
              .sig-img {
                height: 4.5mm;
                object-fit: contain;
                position: absolute;
                right: 2mm;
                top: 1.5mm;
                z-index: 5;
              }
              .stempel-img {
                height: 5.5mm;
                object-fit: contain;
                position: absolute;
                right: 6mm;
                top: 0.8mm;
                opacity: 0.8;
                z-index: 1;
              }
              .sig-name {
                font-weight: 800;
                text-decoration: underline;
                display: block;
                margin-top: 4.2mm;
              }
              /* Back Card Rules */
              .back-rules-title {
                font-size: 7pt;
                font-weight: 800;
                color: #1e293b;
                text-transform: uppercase;
                margin-bottom: 1.5mm;
                border-bottom: 0.3mm solid #f1f5f9;
                padding-bottom: 0.5mm;
                letter-spacing: 0.1mm;
              }
              .rules-list {
                margin: 0;
                padding-left: 3.5mm;
                font-size: 4.8pt;
                color: #64748b;
                line-height: 1.4;
              }
              .rules-list li {
                margin-bottom: 0.6mm;
              }
              .back-footer {
                background-color: #f8fafc;
                border-top: 0.3mm solid #e2e8f0;
                padding: 1.5mm 3mm;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .qr-container {
                display: flex;
                align-items: center;
                gap: 1.5mm;
              }
              .qr-img {
                width: 6.5mm;
                height: 6.5mm;
              }
              .qr-label-box {
                line-height: 1.1;
              }
              .qr-sub {
                font-size: 4pt;
                color: #94a3b8;
                font-weight: bold;
                display: block;
                text-transform: uppercase;
              }
              .qr-val {
                font-size: 5pt;
                font-family: monospace;
                color: #334155;
                font-weight: bold;
              }
              .barcode-container {
                text-align: right;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
              }
              .barcode-box {
                font-family: 'Libre Barcode 128', monospace;
                font-size: 14px;
                letter-spacing: 0.5px;
                color: #1e293b;
                margin: 0;
              }
              .barcode-sub {
                font-size: 4.5pt;
                font-family: monospace;
                color: #94a3b8;
                margin: 0;
              }
            </style>
          </head>
          <body>
            <div class="no-print-header">
              <strong>Simulasi Ukuran CR-80 Standard Terverifikasi (85.6mm x 54.0mm)</strong><br />
              Gunakan opsi <strong>"Layout: Landscape"</strong> dan nonaktifkan <strong>"Headers and Footers"</strong> pada menu setelan cetak peramban.
            </div>

            <div class="card-row">
              <!-- FRONT CARD -->
              <div class="cr80-card">
                <div class="card-header">
                  <img src="${schoolSettings.logoSekolah || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=80'}" class="header-logo" />
                  <div class="header-text">
                    <h5 class="header-title">${schoolSettings.namaSekolah}</h5>
                    <p class="header-subtitle">Kec. ${schoolSettings.kecamatan || '-'}, Kab. ${schoolSettings.kabupaten || '-'}</p>
                  </div>
                </div>

                <div class="card-body">
                  <img src="${student.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" class="student-photo" />
                  <div class="student-details">
                    <div class="student-name">${student.nama}</div>
                    <div class="detail-row">
                      <span class="detail-label">NIS</span>
                      <span class="detail-val">: ${student.nis}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">NISN</span>
                      <span class="detail-val">: ${student.nisn}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Kelas</span>
                      <span class="detail-val">: Kelas ${student.kelas}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Lahir</span>
                      <span class="detail-val" style="font-size: 5pt;">: ${student.tempatLahir}, ${student.tanggalLahir}</span>
                    </div>
                  </div>
                </div>

                <div class="card-footer">
                  <div class="footer-expiry">Berlaku s/d Akhir Studi</div>
                  
                  <div class="footer-signature">
                    <span class="sig-role">Kepala Sekolah,</span>
                    ${schoolSettings.tandaTanganKepala ? `<img src="${schoolSettings.tandaTanganKepala}" class="sig-img" />` : ''}
                    ${schoolSettings.stempelSekolah ? `<img src="${schoolSettings.stempelSekolah}" class="stempel-img" />` : ''}
                    <span class="sig-name">${schoolSettings.kepalaSekolah}</span>
                  </div>
                </div>
              </div>

              <!-- BACK CARD -->
              <div class="cr80-card" style="padding: 2.5mm 3mm 0 3mm;">
                <div>
                  <div class="back-rules-title">Tata Tertib Penggunaan</div>
                  <ol class="rules-list">
                    <li>Kartu ini adalah identitas resmi siswa di ${schoolSettings.namaSekolah}.</li>
                    <li>Wajib dibawa selama berada di lingkungan sekolah & kegiatan resmi.</li>
                    <li>Tidak diperkenankan merusak, mencoret, atau memindahtangankan kartu.</li>
                    <li>Jika kartu hilang/rusak, segera laporkan ke Tata Usaha Bidang Kesiswaan.</li>
                  </ol>
                </div>

                <div class="back-footer" style="margin-left: -3mm; margin-right: -3mm;">
                  <div class="qr-container">
                    <img src="${qrUrl}" class="qr-img" />
                    <div class="qr-label-box">
                      <span class="qr-sub">Dapodik Sync</span>
                      <span class="qr-val">ID-${student.nis}</span>
                    </div>
                  </div>

                  <div class="barcode-container">
                    <div class="barcode-sub">NISN: ${student.nisn}</div>
                    <div style="font-family: monospace; font-size: 5pt; font-weight: bold; color: #475569; margin-top: 0.5mm;">SMPN1-RANGSANG-PVCS</div>
                  </div>
                </div>
              </div>
            </div>

            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div id="kartu-pelajar-container" className="grid grid-cols-1 lg:grid-cols-4 gap-6 font-sans">
      {/* Sidebar Student Selector */}
      <div id="kartu-pelajar-sidebar" className="lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 no-print h-[calc(100vh-200px)] overflow-y-auto">
        <h3 className="font-semibold text-slate-800 text-xs font-sans uppercase tracking-wider">Pencarian Siswa</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama / NIS..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-none font-medium"
          />
        </div>

        <div className="space-y-1 pt-1">
          {filteredStudents.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStudentId(s.id)}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all text-xs cursor-pointer ${
                (student?.id === s.id || (!selectedStudentId && activeStudents[0]?.id === s.id))
                  ? 'bg-brand-50 text-brand-700 font-bold' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="truncate">
                <div className="truncate">{s.nama}</div>
                <div className="text-[10px] text-slate-400 font-mono">NIS: {s.nis}</div>
              </div>
            </button>
          ))}
          {filteredStudents.length === 0 && (
            <div className="text-center text-slate-400 text-xs py-6">Siswa tidak ditemukan</div>
          )}
        </div>
      </div>

      {/* Main Designer Canvas */}
      <div id="kartu-pelajar-main" className="lg:col-span-3 space-y-6 text-xs">
        {student ? (
          <div className="space-y-6">
            {/* Control Center */}
            <div id="kartu-pelajar-controls" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
              <div>
                <h4 className="font-bold text-slate-800 text-sm font-sans flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <span>Kartu Pelajar Digital Standard CR-80</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Format lunas cetak PVC double-sided, dilengkapi tanda tangan & QR code Dapodik scannable.</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Palette Switcher */}
                <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                  <Palette className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
                  {(['brand', 'indigo', 'emerald', 'charcoal'] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setCardTheme(theme)}
                      className={`w-5.5 h-5.5 rounded-full transition-all cursor-pointer border ${
                        cardTheme === theme ? 'ring-2 ring-offset-2 ring-brand-500 scale-110' : 'hover:scale-105'
                      } ${
                        theme === 'brand' ? 'bg-brand-600' :
                        theme === 'indigo' ? 'bg-indigo-600' :
                        theme === 'emerald' ? 'bg-emerald-600' : 'bg-slate-800'
                      }`}
                      title={`Tema ${theme}`}
                    />
                  ))}
                </div>

                <button
                  id="btn-print-kartu"
                  onClick={handlePrintCard}
                  className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Kartu PVC</span>
                </button>
              </div>
            </div>

            {/* CARD TEMPLATES PREVIEW */}
            <div className="bg-slate-100 p-8 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-8 justify-center items-center">
              
              {/* FRONT SIDE */}
              <div id="id-card-front" className="w-[350px] h-[220px] rounded-2xl border border-slate-200 overflow-hidden relative shadow-md flex flex-col justify-between bg-white select-none shrink-0">
                {/* Header Banner */}
                <div className={`p-3 bg-gradient-to-r ${activeTheme.gradient} text-white flex items-center gap-2 border-b border-white/10`}>
                  <img 
                    src={schoolSettings.logoSekolah || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=80'} 
                    alt="Logo" 
                    className="w-8 h-8 object-contain bg-white rounded-full p-0.5 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="truncate min-w-0">
                    <h5 className="text-[10px] font-extrabold uppercase leading-tight tracking-wide truncate">{schoolSettings.namaSekolah}</h5>
                    <p className="text-[7px] text-white/85 leading-tight truncate">Kec. {schoolSettings.kecamatan || '-'}, Kab. {schoolSettings.kabupaten || '-'}</p>
                  </div>
                </div>

                {/* Card Content body */}
                <div className="flex-1 p-3 flex gap-3.5 items-center">
                  {/* Photo Container */}
                  <div className="w-18 h-22 rounded-lg overflow-hidden border border-slate-200 shadow-xs bg-slate-50 shrink-0">
                    <img 
                      src={student.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                      alt="Student Portrait" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Student Details */}
                  <div className="flex-1 text-[9px] text-slate-700 space-y-1 min-w-0">
                    <div className="font-extrabold text-slate-900 text-xs truncate leading-tight uppercase">{student.nama}</div>
                    
                    <div className="grid grid-cols-3">
                      <span className="text-slate-400 font-bold">NIS</span>
                      <span className="col-span-2 font-mono font-extrabold text-slate-800">: {student.nis}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-400 font-bold">NISN</span>
                      <span className="col-span-2 font-mono font-bold text-slate-800">: {student.nisn}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-400 font-bold">Kelas</span>
                      <span className="col-span-2 font-extrabold text-slate-700">: Kelas {student.kelas}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-400 font-bold">Lahir</span>
                      <span className="col-span-2 font-semibold text-slate-700 truncate">: {student.tempatLahir}, {student.tanggalLahir}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Section with Principal TTD */}
                <div className="bg-slate-50/80 px-3 py-1.5 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[7px] text-slate-400 flex items-center gap-1 font-semibold">
                    <Calendar className="w-2.5 h-2.5" />
                    <span>Berlaku s/d Akhir Studi</span>
                  </div>

                  {/* TTD Stamp Area */}
                  <div className="text-right text-[6px] text-slate-700 relative w-24 leading-tight shrink-0">
                    <span className="block font-bold">Kepala Sekolah,</span>
                    {schoolSettings.tandaTanganKepala && (
                      <img 
                        src={schoolSettings.tandaTanganKepala} 
                        alt="Signature" 
                        className="absolute right-2 -top-2.5 h-5.5 opacity-80 object-contain pointer-events-none z-10"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    {schoolSettings.stempelSekolah && (
                      <img 
                        src={schoolSettings.stempelSekolah} 
                        alt="Stempel" 
                        className="absolute right-5 -top-1 h-5.5 opacity-70 object-contain pointer-events-none z-0"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <span className="block font-extrabold mt-3.5 underline truncate">{schoolSettings.kepalaSekolah}</span>
                  </div>
                </div>
              </div>

              {/* BACK SIDE */}
              <div id="id-card-back" className="w-[350px] h-[220px] rounded-2xl border border-slate-200 overflow-hidden relative shadow-md flex flex-col justify-between bg-white select-none shrink-0">
                
                {/* Header back */}
                <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <span className="text-[9px] font-extrabold text-slate-800 uppercase tracking-wider">Tata Tertib Penggunaan</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500 animate-pulse" />
                </div>

                {/* Back side rules */}
                <ol className="list-decimal list-inside text-[7px] text-slate-500 p-3.5 space-y-1 leading-relaxed font-medium">
                  <li>Kartu ini adalah identitas resmi siswa {schoolSettings.namaSekolah}.</li>
                  <li>Wajib dibawa selama berada di sekolah dan kegiatan resmi sekolah.</li>
                  <li>Tidak boleh dicoret, dirusak, atau dipindahtangankan ke orang lain.</li>
                  <li>Jika hilang/rusak, harap melapor ke Tata Usaha Bidang Kesiswaan.</li>
                </ol>

                {/* Bottom Barcode / QR Section */}
                <div className="bg-slate-50 px-3 py-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <img 
                      src={getQrUrl(student.nisn || student.nis)} 
                      alt="Real QR Code" 
                      className="w-7 h-7 object-contain"
                    />
                    <div className="leading-none">
                      <span className="text-[6px] text-slate-400 block font-bold uppercase">Dapodik Sync</span>
                      <span className="text-[7.5px] font-mono text-slate-700 font-extrabold">ID-{student.nis}</span>
                    </div>
                  </div>

                  {/* Mock Barcode */}
                  <div className="flex flex-col items-end">
                    <Barcode className="w-16 h-5.5 text-slate-700" />
                    <span className="text-[6.5px] font-mono text-slate-400 font-bold">NISN: {student.nisn}</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center text-slate-400 text-sm">
            Tidak ada siswa aktif terdaftar untuk dibuatkan kartu pelajar.
          </div>
        )}
      </div>
    </div>
  );
};
