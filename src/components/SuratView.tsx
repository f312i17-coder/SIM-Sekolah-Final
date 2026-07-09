import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../lib/StateContext';
import { SuratTemplate, SuratArsip, Siswa } from '../types';
import { 
  FileText, 
  Printer, 
  Search, 
  Plus, 
  Trash2, 
  Calendar, 
  User, 
  Settings, 
  FileCheck, 
  Sparkles, 
  Download,
  AlertCircle
} from 'lucide-react';

interface SuratViewProps {
  initialTab?: 'create' | 'archive';
}

export const SuratView: React.FC<SuratViewProps> = ({ initialTab = 'create' }) => {
  const { 
    siswaList, 
    schoolSettings, 
    suratTemplates, 
    suratArsipList, 
    saveSuratArsip, 
    deleteSuratArsip 
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'create' | 'archive'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  
  // Selection States
  const [selectedTemplate, setSelectedTemplate] = useState<SuratTemplate | null>(null);
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [siswaSearchTerm, setSiswaSearchTerm] = useState('');
  const [showSiswaDropdown, setShowSiswaDropdown] = useState(false);

  // Form input states
  const [nomorUrut, setNomorUrut] = useState('024');
  const [perihal, setPerihal] = useState('Keterangan Aktif Belajar');
  const [tanggalSurat, setTanggalSurat] = useState(new Date().toISOString().split('T')[0]);
  const [alasanTambahan, setAlasanTambahan] = useState('');
  const [sekolahTujuan, setSekolahTujuan] = useState('');
  const [namaKegiatan, setNamaKegiatan] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [lokasiKegiatan, setLokasiKegiatan] = useState('');
  const [namaPrestasi, setNamaPrestasi] = useState('');
  const [tingkatPrestasi, setTingkatPrestasi] = useState('');

  // Archive States
  const [archiveSearch, setArchiveSearch] = useState('');

  // Ref for A4 print area
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Set default template on load
  useEffect(() => {
    if (suratTemplates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(suratTemplates[0]);
    }
  }, [suratTemplates, selectedTemplate]);

  // Formatted Letter Number
  const getFormattedNomor = () => {
    if (!selectedTemplate) return '';
    return selectedTemplate.formatNomor.replace('[NOMOR]', nomorUrut);
  };

  const filteredSiswaList = siswaList.filter(s => 
    s.nama.toLowerCase().includes(siswaSearchTerm.toLowerCase()) ||
    s.nis.includes(siswaSearchTerm) ||
    s.nisn.includes(siswaSearchTerm)
  );

  const filteredArchive = suratArsipList.filter(a => 
    a.siswaNama.toLowerCase().includes(archiveSearch.toLowerCase()) ||
    a.noSurat.toLowerCase().includes(archiveSearch.toLowerCase()) ||
    a.jenisSurat.toLowerCase().includes(archiveSearch.toLowerCase())
  );

  const handlePrint = () => {
    if (!selectedTemplate) return;

    // Create a printable archive record
    const archiveRecord: SuratArsip = {
      id: `surat-${Date.now()}`,
      noSurat: getFormattedNomor(),
      siswaId: selectedSiswa ? selectedSiswa.id : 'umum',
      siswaNama: selectedSiswa ? selectedSiswa.nama : 'Masyarakat / Umum',
      siswaKelas: selectedSiswa ? selectedSiswa.kelas : '-',
      tanggalSurat,
      jenisSurat: selectedTemplate.nama,
      pengirim: schoolSettings.kepalaSekolah,
      perihal: perihal,
      isiRingkas: alasanTambahan || `Penerbitan ${selectedTemplate.nama}`
    };

    saveSuratArsip(archiveRecord);

    // Dynamic print styling injection
    const originalContent = document.body.innerHTML;
    const printContent = printAreaRef.current?.innerHTML || '';
    
    // Create print window style with robust official letter layout styles
    const printStyle = `
      <style>
        @media print {
          body {
            background: white !important;
            color: black !important;
            font-family: 'Times New Roman', Times, serif !important;
            padding: 1.5cm !important;
          }
          .no-print {
            display: none !important;
          }
        }
        body {
          padding: 2.5rem;
          background: white;
          font-family: 'Times New Roman', Times, serif;
          line-height: 1.5;
          color: black;
        }
        .kop-container {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: space-between !important;
          border-bottom: 4px double black !important;
          padding-bottom: 12px !important;
          margin-bottom: 20px !important;
        }
        .kop-logo {
          width: 70px !important;
          height: 70px !important;
          object-fit: contain !important;
        }
        .kop-text {
          flex: 1 !important;
          text-align: center !important;
          line-height: 1.3 !important;
          padding: 0 15px !important;
        }
        .kop-title-gov {
          font-size: 11pt !important;
          font-weight: bold !important;
          text-transform: uppercase !important;
          margin: 0 !important;
          color: black !important;
        }
        .kop-title-dept {
          font-size: 11pt !important;
          font-weight: bold !important;
          text-transform: uppercase !important;
          margin: 2px 0 0 0 !important;
          color: black !important;
        }
        .kop-title-school {
          font-size: 14pt !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          margin: 2px 0 0 0 !important;
          color: black !important;
        }
        .kop-details {
          font-size: 8.5pt !important;
          font-style: normal !important;
          margin: 4px 0 0 0 !important;
          line-height: 1.2 !important;
          color: black !important;
        }
        .title-container {
          text-align: center !important;
          margin-top: 24px !important;
        }
        .doc-title {
          font-size: 13pt !important;
          font-weight: bold !important;
          text-transform: uppercase !important;
          text-decoration: underline !important;
          margin: 0 !important;
          color: black !important;
        }
        .doc-number {
          font-size: 11pt !important;
          margin: 4px 0 0 0 !important;
          font-family: monospace !important;
          color: black !important;
        }
        .doc-body {
          font-size: 11pt !important;
          line-height: 1.6 !important;
          margin-top: 25px !important;
          text-align: justify !important;
          color: black !important;
        }
        .doc-outro {
          font-size: 11pt !important;
          line-height: 1.6 !important;
          margin-top: 16px !important;
          text-align: justify !important;
          color: black !important;
        }
        .signature-container {
          display: flex !important;
          justify-content: flex-end !important;
          margin-top: 40px !important;
          position: relative !important;
          min-height: 140px !important;
        }
        .signature-box {
          text-align: center !important;
          width: 250px !important;
          font-size: 11pt !important;
          color: black !important;
        }
        .sig-wrapper {
          height: 80px !important;
          margin: 8px 0 !important;
          position: relative !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .sig-graphic {
          max-height: 65px !important;
          object-fit: contain !important;
          z-index: 10 !important;
        }
        .stamp-graphic {
          max-height: 80px !important;
          object-fit: contain !important;
          position: absolute !important;
          opacity: 0.85 !important;
          z-index: 0 !important;
          left: 45px !important;
        }
        .signee-name {
          font-weight: bold !important;
          text-decoration: underline !important;
          text-transform: uppercase !important;
          margin: 0 !important;
          color: black !important;
        }
        .signee-nip {
          margin: 2px 0 0 0 !important;
          font-size: 10pt !important;
          color: black !important;
        }
      </style>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cetak ${selectedTemplate.nama}</title>
            ${printStyle}
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Compile letter template content with dynamic tags
  const renderTemplateBody = (): React.ReactNode => {
    if (!selectedTemplate) return null;

    const tp = schoolSettings.tahunPelajaran;

    const renderBiodataTable = (data: { label: string; value: string }[]) => {
      return (
        <table className="w-full my-4 text-[11pt]" style={{ tableLayout: 'fixed', borderCollapse: 'collapse', border: 'none', marginLeft: '1cm', width: 'calc(100% - 1cm)', fontFamily: 'Times New Roman, serif' }}>
          <colgroup>
            <col style={{ width: '185px' }} />
            <col style={{ width: '25px' }} />
            <col style={{ width: 'auto' }} />
          </colgroup>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} style={{ verticalAlign: 'top', border: 'none' }}>
                <td style={{ padding: '4px 0', border: 'none', color: 'black', whiteSpace: 'nowrap', textAlign: 'left' }}>{item.label}</td>
                <td style={{ padding: '4px 0', border: 'none', color: 'black', textAlign: 'center' }}>:</td>
                <td style={{ padding: '4px 0', border: 'none', color: 'black', textAlign: 'left', fontWeight: item.label === 'Nama Lengkap' ? 'bold' : 'normal', wordBreak: 'break-word' }}>{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    };

    if (selectedSiswa) {
      // Specific overrides for special letters
      if (selectedTemplate.kode === 'SKL') {
        return (
          <div style={{ fontFamily: 'Times New Roman, serif', color: 'black' }}>
            <p style={{ textIndent: '1cm', margin: '0 0 12px 0', textAlign: 'justify' }}>
              Menerangkan dengan sesungguhnya bahwa siswa yang tersebut di bawah ini:
            </p>
            {renderBiodataTable([
              { label: 'Nama Lengkap', value: selectedSiswa.nama },
              { label: 'NIS / NISN', value: `${selectedSiswa.nis} / ${selectedSiswa.nisn}` },
              { label: 'Tempat, Tgl Lahir', value: `${selectedSiswa.tempatLahir}, ${selectedSiswa.tanggalLahir}` },
              { label: 'Nama Orang Tua / Wali', value: selectedSiswa.namaAyah || selectedSiswa.namaIbu || '-' },
              { label: 'Alamat Lengkap', value: selectedSiswa.alamat || '-' },
            ])}
            <p style={{ textIndent: '1cm', margin: '12px 0 0 0', textAlign: 'justify' }}>
              Berdasarkan Kriteria Kelulusan {schoolSettings.namaSekolah || 'SMP Negeri 1 Rangsang'} Tahun Pelajaran {tp}, siswa tersebut di atas dinyatakan LULUS dari satuan pendidikan {schoolSettings.namaSekolah || 'SMP Negeri 1 Rangsang'}.
            </p>
          </div>
        );
      }
      
      if (selectedTemplate.kode === 'SK-PINDAH') {
        return (
          <div style={{ fontFamily: 'Times New Roman, serif', color: 'black' }}>
            <p style={{ textIndent: '1cm', margin: '0 0 12px 0', textAlign: 'justify' }}>
              Menerangkan dengan sesungguhnya bahwa siswa yang tersebut di bawah ini:
            </p>
            {renderBiodataTable([
              { label: 'Nama Lengkap', value: selectedSiswa.nama },
              { label: 'NIS / NISN', value: `${selectedSiswa.nis} / ${selectedSiswa.nisn}` },
              { label: 'Tempat, Tgl Lahir', value: `${selectedSiswa.tempatLahir}, ${selectedSiswa.tanggalLahir}` },
              { label: 'Jenis Kelamin', value: selectedSiswa.jk === 'L' ? 'Laki-laki' : 'Perempuan' },
              { label: 'Sebab Pindah', value: 'Atas permintaan Orang Tua / Wali Siswa' },
              { label: 'Tujuan Pindah', value: sekolahTujuan || '[SEKOLAH TUJUAN]' },
            ])}
            <p style={{ textIndent: '1cm', margin: '12px 0 0 0', textAlign: 'justify' }}>
              Mulai tanggal surat ini dikeluarkan, siswa tersebut telah dicabut hak belajarnya dari {schoolSettings.namaSekolah || 'SMP Negeri 1 Rangsang'} dan dinyatakan pindah belajar.
            </p>
          </div>
        );
      }
      
      if (selectedTemplate.kode === 'MUTASI-KELUAR') {
        return (
          <div style={{ fontFamily: 'Times New Roman, serif', color: 'black' }}>
            <p style={{ textIndent: '1cm', margin: '0 0 12px 0', textAlign: 'justify' }}>
              Memberikan persetujuan mutasi keluar untuk siswa berikut:
            </p>
            {renderBiodataTable([
              { label: 'Nama Lengkap', value: selectedSiswa.nama },
              { label: 'NIS / NISN', value: `${selectedSiswa.nis} / ${selectedSiswa.nisn}` },
              { label: 'Kelas Saat Mutasi', value: `Kelas ${selectedSiswa.kelas}` },
              { label: 'Tujuan Mutasi', value: sekolahTujuan || '[SEKOLAH TUJUAN]' },
              { label: 'Alasan Mutasi', value: alasanTambahan || 'Mengikuti kepindahan domisili Orang Tua/Wali' },
            ])}
            <p style={{ textIndent: '1cm', margin: '12px 0 0 0', textAlign: 'justify' }}>
              Demikian surat mutasi keluar ini diberikan agar dapat digunakan sebagaimana mestinya.
            </p>
          </div>
        );
      }
      
      if (selectedTemplate.kode === 'MUTASI-MASUK') {
        return (
          <div style={{ fontFamily: 'Times New Roman, serif', color: 'black' }}>
            <p style={{ textIndent: '1cm', margin: '0 0 12px 0', textAlign: 'justify' }}>
              Menyatakan menerima mutasi masuk untuk siswa berikut:
            </p>
            {renderBiodataTable([
              { label: 'Nama Lengkap', value: selectedSiswa.nama },
              { label: 'NIS / NISN', value: `${selectedSiswa.nis} / ${selectedSiswa.nisn}` },
              { label: 'Asal Sekolah', value: sekolahTujuan || '[SEKOLAH ASAL]' },
              { label: 'Diterima di Kelas', value: `Kelas ${selectedSiswa.kelas}` },
              { label: 'Alasan Mutasi', value: alasanTambahan || 'Ikut Orang Tua' },
            ])}
            <p style={{ textIndent: '1cm', margin: '12px 0 0 0', textAlign: 'justify' }}>
              Mulai saat ini siswa tersebut secara resmi terdaftar sebagai siswa aktif belajar di {schoolSettings.namaSekolah || 'SMP Negeri 1 Rangsang'}.
            </p>
          </div>
        );
      }
      
      if (selectedTemplate.kode === 'KELAKUAN-BAIK') {
        return (
          <div style={{ fontFamily: 'Times New Roman, serif', color: 'black' }}>
            <p style={{ textIndent: '1cm', margin: '0 0 12px 0', textAlign: 'justify' }}>
              Menerangkan dengan sesungguhnya bahwa siswa yang tersebut di bawah ini:
            </p>
            {renderBiodataTable([
              { label: 'Nama Lengkap', value: selectedSiswa.nama },
              { label: 'NIS / NISN', value: `${selectedSiswa.nis} / ${selectedSiswa.nisn}` },
              { label: 'Tempat, Tgl Lahir', value: `${selectedSiswa.tempatLahir}, ${selectedSiswa.tanggalLahir}` },
              { label: 'Alamat Lengkap', value: selectedSiswa.alamat || '-' },
            ])}
            <p style={{ textIndent: '1cm', margin: '12px 0 0 0', textAlign: 'justify' }}>
              Adalah benar siswa yang berkelakuan BAIK di lingkungan sekolah kami, tidak terlibat tindak pidana, narkoba, serta aktif mengikuti norma sosial di sekolah dengan baik.
            </p>
          </div>
        );
      }
      
      if (selectedTemplate.kode === 'PRESTASI') {
        return (
          <div style={{ fontFamily: 'Times New Roman, serif', color: 'black' }}>
            <p style={{ textIndent: '1cm', margin: '0 0 12px 0', textAlign: 'justify' }}>
              Menerangkan dengan sesungguhnya bahwa siswa yang tersebut di bawah ini:
            </p>
            {renderBiodataTable([
              { label: 'Nama Lengkap', value: selectedSiswa.nama },
              { label: 'NIS / NISN', value: `${selectedSiswa.nis} / ${selectedSiswa.nisn}` },
              { label: 'Kelas / Tingkat', value: `Kelas ${selectedSiswa.kelas}` },
              { label: 'Nama Prestasi / Juara', value: namaPrestasi || '[NAMA PRESTASI / JUARA]' },
              { label: 'Tingkat Penyelenggaraan', value: tingkatPrestasi || '[TINGKAT PENYELENGGARAAN]' },
              { label: 'Tahun Penghargaan', value: schoolSettings.tahunPelajaran.split('/')[0] },
            ])}
            <p style={{ textIndent: '1cm', margin: '12px 0 0 0', textAlign: 'justify' }}>
              Sekolah menyampaikan penghargaan setinggi-tingginya atas dedikasi dan prestasi yang diraih oleh siswa bersangkutan.
            </p>
          </div>
        );
      }
      
      if (selectedTemplate.kode === 'DISPENSASI') {
        return (
          <div style={{ fontFamily: 'Times New Roman, serif', color: 'black' }}>
            <p style={{ textIndent: '1cm', margin: '0 0 12px 0', textAlign: 'justify' }}>
              Memberikan dispensasi / izin meninggalkan kegiatan belajar mengajar kepada siswa:
            </p>
            {renderBiodataTable([
              { label: 'Nama Lengkap', value: selectedSiswa.nama },
              { label: 'NIS / NISN', value: `${selectedSiswa.nis} / ${selectedSiswa.nisn}` },
              { label: 'Kelas', value: `Kelas ${selectedSiswa.kelas}` },
            ])}
            <p style={{ margin: '12px 0 6px 0', textAlign: 'justify' }}>Untuk keperluan:</p>
            {renderBiodataTable([
              { label: 'Nama Kegiatan / Agenda', value: namaKegiatan || '[NAMA KEGIATAN]' },
              { label: 'Waktu Pelaksanaan', value: `${tanggalMulai ? new Date(tanggalMulai).toLocaleDateString('id-ID') : '[TGL MULAI]'} s.d ${tanggalSelesai ? new Date(tanggalSelesai).toLocaleDateString('id-ID') : '[TGL SELESAI]'}` },
              { label: 'Lokasi Kegiatan', value: lokasiKegiatan || '[LOKASI KEGIATAN]' },
            ])}
            <p style={{ textIndent: '1cm', margin: '12px 0 0 0', textAlign: 'justify' }}>
              Diharapkan kepada Bapak/Ibu guru pengajar untuk memberikan izin serta toleransi akademik yang diperlukan selama masa penugasan di atas.
            </p>
          </div>
        );
      }
      
      if (selectedTemplate.kode === 'PANGGILAN-ORTU') {
        return (
          <div style={{ fontFamily: 'Times New Roman, serif', color: 'black' }}>
            <p style={{ margin: '0 0 4px 0' }}>Kepada Yth.</p>
            <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>Bapak / Ibu Orang Tua / Wali dari Siswa: {selectedSiswa.nama} (Kelas {selectedSiswa.kelas})</p>
            <p style={{ margin: '0 0 16px 0' }}>Di Tempat</p>
            <p style={{ textIndent: '1cm', margin: '0 0 12px 0', textAlign: 'justify' }}>Dengan hormat, kami mengharapkan kehadiran Bapak/Ibu ke sekolah pada:</p>
            {renderBiodataTable([
              { label: 'Hari / Tanggal', value: tanggalMulai ? new Date(tanggalMulai).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '[HARI & TANGGAL]' },
              { label: 'Waktu Acara', value: lokasiKegiatan || '08:30 WIB s.d Selesai' },
              { label: 'Tempat Rapat', value: `Ruang Bimbingan Konseling (BK) ${schoolSettings.namaSekolah || 'SMP Negeri 1 Rangsang'}` },
              { label: 'Keperluan Rapat', value: 'Konsultasi Perkembangan Belajar dan Tata Tertib Siswa' },
            ])}
            <p style={{ textIndent: '1cm', margin: '12px 0 0 0', textAlign: 'justify' }}>
              Kehadiran Bapak/Ibu sangat menentukan kelancaran pembinaan siswa yang bersangkutan.
            </p>
          </div>
        );
      }

      // Default Certificate
      return (
        <div style={{ fontFamily: 'Times New Roman, serif', color: 'black' }}>
          <p style={{ textIndent: '1cm', margin: '0 0 12px 0', textAlign: 'justify' }}>
            Menerangkan dengan sesungguhnya bahwa siswa yang tersebut di bawah ini:
          </p>
          {renderBiodataTable([
            { label: 'Nama Lengkap', value: selectedSiswa.nama },
            { label: 'NIS / NISN', value: `${selectedSiswa.nis} / ${selectedSiswa.nisn}` },
            { label: 'Tempat, Tgl Lahir', value: `${selectedSiswa.tempatLahir}, ${selectedSiswa.tanggalLahir}` },
            { label: 'Jenis Kelamin', value: selectedSiswa.jk === 'L' ? 'Laki-laki' : 'Perempuan' },
            { label: 'Kelas / Tingkat', value: `Kelas ${selectedSiswa.kelas} ${schoolSettings.namaSekolah || 'SMP Negeri 1 Rangsang'}` },
            { label: 'Alamat Lengkap', value: selectedSiswa.alamat || '-' },
          ])}
          <p style={{ textIndent: '1cm', margin: '12px 0 0 0', textAlign: 'justify' }}>
            Adalah benar-benar siswa aktif belajar di {schoolSettings.namaSekolah || 'SMP Negeri 1 Rangsang'} pada Tahun Pelajaran {tp} Semester {schoolSettings.semester}.
          </p>
        </div>
      );
    }

    return (
      <p className="text-center text-slate-400 py-6" style={{ fontFamily: 'sans-serif' }}>
        [SILAKAN PILIH SISWA DI PANEL KIRI UNTUK MEN-GENERATE ISI SURAT SECARA OTOMATIS]
      </p>
    );
  };

  const handleCreateTemplateDraft = (t: SuratTemplate) => {
    setSelectedTemplate(t);
  };

  return (
    <div id="surat-menyurat-wrapper" className="space-y-6 max-w-7xl mx-auto">
      {/* Scoped styles for the live printable A4 canvas preview */}
      <style>{`
        #printable-a4-canvas {
          font-family: 'Times New Roman', Times, serif !important;
        }
        #printable-a4-canvas .kop-container {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: space-between !important;
          border-bottom: 4px double black !important;
          padding-bottom: 12px !important;
          margin-bottom: 20px !important;
        }
        #printable-a4-canvas .kop-logo {
          width: 70px !important;
          height: 70px !important;
          object-fit: contain !important;
        }
        #printable-a4-canvas .kop-text {
          flex: 1 !important;
          text-align: center !important;
          line-height: 1.3 !important;
          padding: 0 15px !important;
        }
        #printable-a4-canvas .kop-title-gov {
          font-size: 11pt !important;
          font-weight: bold !important;
          text-transform: uppercase !important;
          margin: 0 !important;
          color: black !important;
        }
        #printable-a4-canvas .kop-title-dept {
          font-size: 11pt !important;
          font-weight: bold !important;
          text-transform: uppercase !important;
          margin: 2px 0 0 0 !important;
          color: black !important;
        }
        #printable-a4-canvas .kop-title-school {
          font-size: 14pt !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          margin: 2px 0 0 0 !important;
          color: black !important;
        }
        #printable-a4-canvas .kop-details {
          font-size: 8.5pt !important;
          font-style: normal !important;
          margin: 4px 0 0 0 !important;
          line-height: 1.2 !important;
          color: black !important;
        }
        #printable-a4-canvas .title-container {
          text-align: center !important;
          margin-top: 24px !important;
        }
        #printable-a4-canvas .doc-title {
          font-size: 13pt !important;
          font-weight: bold !important;
          text-transform: uppercase !important;
          text-decoration: underline !important;
          margin: 0 !important;
          color: black !important;
        }
        #printable-a4-canvas .doc-number {
          font-size: 11pt !important;
          margin: 4px 0 0 0 !important;
          font-family: monospace !important;
          color: black !important;
        }
        #printable-a4-canvas .doc-body {
          font-size: 11pt !important;
          line-height: 1.6 !important;
          margin-top: 25px !important;
          text-align: justify !important;
          color: black !important;
        }
        #printable-a4-canvas .doc-outro {
          font-size: 11pt !important;
          line-height: 1.6 !important;
          margin-top: 16px !important;
          text-align: justify !important;
          color: black !important;
        }
        #printable-a4-canvas .signature-container {
          display: flex !important;
          justify-content: flex-end !important;
          margin-top: 40px !important;
          position: relative !important;
          min-height: 140px !important;
        }
        #printable-a4-canvas .signature-box {
          text-align: center !important;
          width: 250px !important;
          font-size: 11pt !important;
          color: black !important;
        }
        #printable-a4-canvas .sig-wrapper {
          height: 80px !important;
          margin: 8px 0 !important;
          position: relative !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        #printable-a4-canvas .sig-graphic {
          max-height: 65px !important;
          object-fit: contain !important;
          z-index: 10 !important;
        }
        #printable-a4-canvas .stamp-graphic {
          max-height: 80px !important;
          object-fit: contain !important;
          position: absolute !important;
          opacity: 0.85 !important;
          z-index: 0 !important;
          left: 45px !important;
        }
        #printable-a4-canvas .signee-name {
          font-weight: bold !important;
          text-decoration: underline !important;
          text-transform: uppercase !important;
          margin: 0 !important;
          color: black !important;
        }
        #printable-a4-canvas .signee-nip {
          margin: 2px 0 0 0 !important;
          font-size: 10pt !important;
          color: black !important;
        }
      `}</style>

      {/* View Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight font-sans">Administrasi & Surat Menyurat</h2>
          <p className="text-slate-500 text-sm mt-0.5">Generate 16 jenis surat resmi sekolah dengan tanda tangan & stempel otomatis, siap cetak A4.</p>
        </div>

        {/* Tab Controls */}
        <div className="inline-flex bg-slate-200/80 p-1 rounded-xl self-start sm:self-center text-xs">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'create' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Buat Surat</span>
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'archive' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Arsip Surat ({suratArsipList.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT PANEL: CONFIGURATION FORM (Col: 5) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5 text-xs">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-slate-800 text-sm">Konfigurasi Lembaran Dokumen</h3>
            </div>

            {/* 1. Select Template */}
            <div className="space-y-1.5">
              <label className="text-slate-600 font-semibold block">1. Jenis Surat Resmi *</label>
              <select
                value={selectedTemplate?.id || ''}
                onChange={(e) => {
                  const t = suratTemplates.find(x => x.id === e.target.value);
                  if (t) setSelectedTemplate(t);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-slate-400 transition-all font-semibold"
              >
                {suratTemplates.map(t => (
                  <option key={t.id} value={t.id}>{t.kode} - {t.nama}</option>
                ))}
              </select>
            </div>

            {/* 2. Select Student */}
            <div className="space-y-1.5 relative">
              <label className="text-slate-600 font-semibold block">2. Cari Siswa Induk (Auto-fill) *</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ketik nama / NIS / NISN siswa..."
                  value={siswaSearchTerm}
                  onChange={(e) => {
                    setSiswaSearchTerm(e.target.value);
                    setShowSiswaDropdown(true);
                  }}
                  onFocus={() => setShowSiswaDropdown(true)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-slate-800 focus:outline-none focus:border-slate-400 transition-all font-medium"
                />
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>

              {showSiswaDropdown && siswaSearchTerm && (
                <div className="absolute z-30 left-0 right-0 mt-1 max-h-56 bg-white border border-slate-200 rounded-xl shadow-lg overflow-y-auto divide-y divide-slate-100">
                  {filteredSiswaList.length > 0 ? (
                    filteredSiswaList.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedSiswa(s);
                          setSiswaSearchTerm(s.nama);
                          setShowSiswaDropdown(false);
                        }}
                        className="w-full text-left p-2.5 hover:bg-slate-50 text-xs flex justify-between items-center transition-all"
                      >
                        <div>
                          <span className="font-bold text-slate-800 block">{s.nama}</span>
                          <span className="text-slate-400 text-[10px] font-mono">NIS: {s.nis} | Kelas {s.kelas}</span>
                        </div>
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase">{s.statusAktif}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-slate-400 text-center">Siswa tidak ditemukan</div>
                  )}
                </div>
              )}

              {selectedSiswa && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <span className="font-bold block">Siswa Terpilih: {selectedSiswa.nama}</span>
                    <span className="text-[10px] text-emerald-600 block">Kelas {selectedSiswa.kelas} — NIS: {selectedSiswa.nis}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSiswa(null);
                      setSiswaSearchTerm('');
                    }}
                    className="text-emerald-800 hover:text-red-600 p-1 rounded-full hover:bg-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* 3. Letter Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-600 font-semibold block">No. Urut Surat *</label>
                <input
                  type="text"
                  value={nomorUrut}
                  onChange={(e) => setNomorUrut(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-800 font-bold focus:outline-none"
                  placeholder="001"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-600 font-semibold block">Tanggal Cetak *</label>
                <input
                  type="date"
                  value={tanggalSurat}
                  onChange={(e) => setTanggalSurat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-bold focus:outline-none"
                />
              </div>
            </div>

            {/* 4. Template-specific inputs */}
            {selectedTemplate && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">Kuesioner Variabel Surat ({selectedTemplate.kode})</span>
                
                {selectedTemplate.kode === 'SK-PINDAH' || selectedTemplate.kode === 'MUTASI-KELUAR' || selectedTemplate.kode === 'MUTASI-MASUK' ? (
                  <div className="space-y-1.5">
                    <label className="text-slate-600 font-semibold block">Nama Sekolah {selectedTemplate.kode === 'MUTASI-MASUK' ? 'Asal' : 'Tujuan'} *</label>
                    <input
                      type="text"
                      placeholder="e.g. SMP Negeri 2 Selatpanjang"
                      value={sekolahTujuan}
                      onChange={(e) => setSekolahTujuan(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none"
                    />
                  </div>
                ) : null}

                {selectedTemplate.kode === 'DISPENSASI' || selectedTemplate.kode === 'PANGGILAN-ORTU' ? (
                  <div className="space-y-2">
                    {selectedTemplate.kode === 'DISPENSASI' && (
                      <div className="space-y-1">
                        <label className="text-slate-600 font-semibold block">Nama Kegiatan Penugasan *</label>
                        <input
                          type="text"
                          placeholder="e.g. Turnamen Futsal Bupati Cup 2026"
                          value={namaKegiatan}
                          onChange={(e) => setNamaKegiatan(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none"
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-slate-600 font-semibold block">{selectedTemplate.kode === 'DISPENSASI' ? 'Tgl Mulai' : 'Hari / Tgl Acara'}</label>
                        <input
                          type="date"
                          value={tanggalMulai}
                          onChange={(e) => setTanggalMulai(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-slate-800 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-600 font-semibold block">{selectedTemplate.kode === 'DISPENSASI' ? 'Tgl Selesai' : 'Waktu / Jam'}</label>
                        {selectedTemplate.kode === 'DISPENSASI' ? (
                          <input
                            type="date"
                            value={tanggalSelesai}
                            onChange={(e) => setTanggalSelesai(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-slate-800 focus:outline-none"
                          />
                        ) : (
                          <input
                            type="text"
                            placeholder="e.g. 08:30 WIB s.d Selesai"
                            value={lokasiKegiatan}
                            onChange={(e) => setLokasiKegiatan(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-slate-800 focus:outline-none"
                          />
                        )}
                      </div>
                    </div>
                    {selectedTemplate.kode === 'DISPENSASI' && (
                      <div className="space-y-1">
                        <label className="text-slate-600 font-semibold block">Lokasi Pelaksanaan *</label>
                        <input
                          type="text"
                          placeholder="e.g. GOR Meranti, Selatpanjang"
                          value={lokasiKegiatan}
                          onChange={(e) => setLokasiKegiatan(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                ) : null}

                {selectedTemplate.kode === 'PRESTASI' ? (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-slate-600 font-semibold block">Nama Prestasi / Juara *</label>
                      <input
                        type="text"
                        placeholder="e.g. Juara 1 Olimpiade Sains Matematika"
                        value={namaPrestasi}
                        onChange={(e) => setNamaPrestasi(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-600 font-semibold block">Tingkat Penyelenggaraan *</label>
                      <input
                        type="text"
                        placeholder="e.g. Tingkat Kabupaten / Provinsi"
                        value={tingkatPrestasi}
                        onChange={(e) => setTingkatPrestasi(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                ) : null}

                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold block">Keterangan / Catatan Tambahan</label>
                  <textarea
                    rows={2}
                    value={alasanTambahan}
                    onChange={(e) => setAlasanTambahan(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none font-sans text-xs"
                    placeholder="Tulis alasan, catatan, atau isi ringkas tambahan..."
                  />
                </div>
              </div>
            )}

            <button
              onClick={handlePrint}
              disabled={!selectedTemplate || !selectedSiswa}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white rounded-xl shadow-sm hover:shadow font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Lembar Dokumen (A4)</span>
            </button>
            
            {!selectedSiswa && (
              <div className="bg-indigo-50 text-indigo-700 rounded-xl p-3 flex items-start gap-2 border border-indigo-100">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-indigo-500" />
                <p className="leading-relaxed">Silakan pilih siswa aktif terlebih dahulu untuk men-generate format dokumen secara presisi.</p>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: LIVE DOCUMENT A4 PREVIEW (Col: 7) */}
          <div className="lg:col-span-7 space-y-4">
            <span className="font-bold text-slate-500 text-xs uppercase tracking-widest block font-sans">Live Preview Lembar Dokumen Resmi</span>
            
            <div className="bg-slate-200/80 p-5 rounded-2xl border border-slate-300 overflow-x-auto">
              {/* Paper container inside scrollable box */}
              <div 
                ref={printAreaRef}
                id="printable-a4-canvas" 
                className="bg-white mx-auto shadow-md border border-slate-300 text-slate-900 p-12 select-none print-portrait print-card"
                style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box', fontFamily: 'Times New Roman, serif' }}
              >
                {/* 1. KOP SURAT (Letterhead) */}
                <div className="kop-container">
                  {/* Left Logo (Pemkab Riau / Meranti) */}
                  <div className="flex justify-center items-center" style={{ width: '70px', minWidth: '70px' }}>
                    {schoolSettings.logoPemkab ? (
                      <img 
                        src={schoolSettings.logoPemkab} 
                        alt="Logo Pemkab" 
                        className="kop-logo"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 border border-slate-400 rounded flex items-center justify-center text-[8px]" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #94a3b8', fontSize: '8px', fontFamily: 'sans-serif' }}>Logo Pemkab</div>
                    )}
                  </div>

                  {/* Middle Copy */}
                  <div className="kop-text">
                    <h4 className="kop-title-gov">Pemerintah Kabupaten {schoolSettings.kabupaten || 'Kepulauan Meranti'}</h4>
                    <h3 className="kop-title-dept">Dinas Pendidikan dan Kebudayaan</h3>
                    <h2 className="kop-title-school">{schoolSettings.namaSekolah || 'SMP Negeri 1 Rangsang'}</h2>
                    <p className="kop-details">
                      Alamat: {schoolSettings.alamat || 'Jl. Pelajar'}<br />
                      Desa {schoolSettings.desa || '-'} Kec. {schoolSettings.kecamatan || '-'} Kodepos {schoolSettings.kodePos || '-'}<br />
                      Surel: {schoolSettings.email || '-'} | Website: {schoolSettings.website || '-'}
                    </p>
                  </div>

                  {/* Right Logo (Sekolah / Tut Wuri) */}
                  <div className="flex justify-center items-center" style={{ width: '70px', minWidth: '70px' }}>
                    {schoolSettings.logoSekolah ? (
                      <img 
                        src={schoolSettings.logoSekolah} 
                        alt="Logo Sekolah" 
                        className="kop-logo"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 border border-slate-400 rounded flex items-center justify-center text-[8px]" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #94a3b8', fontSize: '8px', fontFamily: 'sans-serif' }}>Logo Sekolah</div>
                    )}
                  </div>
                </div>

                {/* 2. SURAT TITLE */}
                <div className="title-container">
                  <h3 className="doc-title">
                    {selectedTemplate ? selectedTemplate.nama : 'Surat Keterangan Resmi'}
                  </h3>
                  <p className="doc-number">
                    Nomor: {getFormattedNomor()}
                  </p>
                </div>

                {/* 3. SURAT BODY */}
                <div className="doc-body" style={{ textIndent: selectedSiswa ? '0' : '1cm' }}>
                  {renderTemplateBody()}
                </div>

                <div className="doc-outro">
                  Demikian surat keterangan ini kami berikan dengan penuh kesadaran dan tanggung jawab agar dapat dipergunakan sebagaimana mestinya.
                </div>

                {/* 4. SIGNATURE AREA */}
                <div className="signature-container">
                  <div className="signature-box">
                    <p style={{ margin: 0 }}>{schoolSettings.desa || 'Tanjung Samak'}, {new Date(tanggalSurat).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="font-bold uppercase mt-1" style={{ fontWeight: 'bold', textTransform: 'uppercase', margin: '4px 0 0 0' }}>Kepala Sekolah,</p>
                    
                    <div className="sig-wrapper">
                      {/* Signature graphic layer */}
                      {schoolSettings.tandaTanganKepala && (
                        <img 
                          src={schoolSettings.tandaTanganKepala} 
                          alt="Tanda Tangan Kepala Sekolah" 
                          className="sig-graphic"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      {/* Transparent Stempel layer behind signature */}
                      {schoolSettings.stempelSekolah && (
                        <img 
                          src={schoolSettings.stempelSekolah} 
                          alt="Stempel Resmi" 
                          className="stamp-graphic"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>

                    <p className="signee-name">{schoolSettings.kepalaSekolah || 'Kepala Sekolah'}</p>
                    <p className="signee-nip">NIP. {schoolSettings.nipKepalaSekolah || '-'}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ARCHIVE TAB CONTAINER */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-xs">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Riwayat Dokumen & Surat Keluar</h3>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Cari arsip berdasarkan nama / no. surat..."
                value={archiveSearch}
                onChange={(e) => setArchiveSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:border-slate-400 transition-all font-medium text-xs"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Table list */}
          {filteredArchive.length > 0 ? (
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3">Tanggal Cetak</th>
                    <th className="p-3">No. Surat</th>
                    <th className="p-3">Jenis Dokumen</th>
                    <th className="p-3">Nama Penerima</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredArchive.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50 font-medium text-slate-700">
                      <td className="p-3 font-semibold font-mono">
                        {new Date(a.tanggalSurat).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="p-3 font-bold font-mono text-slate-800">{a.noSurat}</td>
                      <td className="p-3">{a.jenisSurat}</td>
                      <td className="p-3 font-bold text-slate-900">{a.siswaNama}</td>
                      <td className="p-3">
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-bold font-mono">{a.siswaKelas}</span>
                      </td>
                      <td className="p-3 text-right flex justify-end gap-1.5">
                        <button
                          onClick={() => {
                            // Find template and student to populate preview
                            const templ = suratTemplates.find(t => t.nama === a.jenisSurat);
                            const sis = siswaList.find(s => s.id === a.siswaId);
                            if (templ) setSelectedTemplate(templ);
                            if (sis) {
                              setSelectedSiswa(sis);
                              setSiswaSearchTerm(sis.nama);
                            }
                            // Extract nomorUrut from string e.g. 421.3/[024]/...
                            const match = a.noSurat.match(/\d+/);
                            if (match) setNomorUrut(match[0]);
                            setActiveTab('create');
                          }}
                          className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 p-1.5 rounded-lg font-bold transition-all cursor-pointer"
                          title="Cetak Ulang / Load"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Apakah Anda yakin ingin menghapus arsip surat ini?")) {
                              deleteSuratArsip(a.id);
                            }
                          }}
                          className="bg-red-50 text-red-600 hover:bg-red-100 p-1.5 rounded-lg font-bold transition-all cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 font-medium">
              Tidak ada arsip surat keluar.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
