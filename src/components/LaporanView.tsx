import React from 'react';
import { useAppState } from '../lib/StateContext';
import { 
  Printer, 
  TrendingUp, 
  Users, 
  Award, 
  ArrowLeftRight, 
  Calendar,
  Grid
} from 'lucide-react';

export const LaporanView: React.FC = () => {
  const { siswaList, mutasiList, spmbList, schoolSettings } = useAppState();

  const activeSiswa = siswaList.filter(s => s.statusAktif === 'Aktif');
  const totalSiswa = activeSiswa.length;

  const maleCount = activeSiswa.filter(s => s.jk === 'L').length;
  const femaleCount = activeSiswa.filter(s => s.jk === 'P').length;

  const class7Count = activeSiswa.filter(s => s.kelas === 'VII').length;
  const class8Count = activeSiswa.filter(s => s.kelas === 'VIII').length;
  const class9Count = activeSiswa.filter(s => s.kelas === 'IX').length;

  const mutasiMasuk = mutasiList.filter(m => m.jenis === 'Masuk').length;
  const mutasiKeluar = mutasiList.filter(m => m.jenis === 'Keluar').length;

  const alumniCount = siswaList.filter(s => s.statusAktif === 'Lulus').length;
  const spmbTotal = spmbList.length;
  const spmbAccepted = spmbList.filter(r => r.status === 'Diterima').length;

  const handlePrintLaporan = () => {
    window.print();
  };

  return (
    <div id="laporan-view-container" className="space-y-6">
      {/* Title Header */}
      <div id="laporan-header-bar" className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight font-sans">Laporan & Rekapitulasi</h2>
          <p className="text-slate-500 text-sm mt-0.5">Lembar rekapitulasi formal statistik kesiswaan untuk laporan dinas pendidikan.</p>
        </div>

        <button
          id="btn-print-laporan"
          onClick={handlePrintLaporan}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Seluruh Laporan</span>
        </button>
      </div>

      {/* PRINT COVER SHEET */}
      <div id="laporan-print-canvas" className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm print-landscape print-card space-y-6">
        
        {/* Kop Surat */}
        <div className="text-center border-b-4 border-double border-slate-800 pb-4 flex items-center justify-between gap-4">
          <img 
            src={schoolSettings.logoUrl} 
            alt="Logo" 
            className="w-16 h-16 object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1">
            <h3 className="text-sm font-bold uppercase tracking-wide">Pemerintah Kota Administrasi</h3>
            <h2 className="text-md font-bold uppercase tracking-wider text-slate-800">Dinas Pendidikan {schoolSettings.namaSekolah.split(' ')[0]}</h2>
            <h1 className="text-xl font-bold uppercase tracking-widest">{schoolSettings.namaSekolah}</h1>
            <p className="text-[10px] italic font-sans">{schoolSettings.alamat}</p>
          </div>
        </div>

        {/* Report Metadata */}
        <div className="text-center space-y-1 py-4">
          <h3 className="text-lg font-bold uppercase tracking-wider text-slate-800">REKAPITULASI LAPORAN BULANAN KESISWAAN</h3>
          <p className="text-xs text-slate-400 font-mono">Tahun Pelajaran: {schoolSettings.tahunPelajaran} | Semester: {schoolSettings.semester}</p>
        </div>

        {/* Grid 1: Basic Statistics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-1">
            <Users className="w-5 h-5 text-brand-600 mx-auto" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Siswa Aktif</span>
            <span className="text-xl font-bold text-slate-700 font-sans block">{totalSiswa}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-1">
            <Calendar className="w-5 h-5 text-emerald-600 mx-auto" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Alumni Lulus</span>
            <span className="text-xl font-bold text-slate-700 font-sans block">{alumniCount}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-1">
            <ArrowLeftRight className="w-5 h-5 text-amber-600 mx-auto" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Mutasi</span>
            <span className="text-xl font-bold text-slate-700 font-sans block">+{mutasiMasuk} / -{mutasiKeluar}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-1">
            <Award className="w-5 h-5 text-purple-600 mx-auto" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pendaftar SPMB</span>
            <span className="text-xl font-bold text-slate-700 font-sans block">{spmbTotal} ({spmbAccepted} Diterima)</span>
          </div>
        </div>

        {/* Detailed Data Tables blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* Enrollment Breakdown Table */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-sans border-b pb-1">1. Distribusi Kelas & Rasio Gender</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 border-b">
                    <th className="p-2 font-semibold">Tingkatan / Kelas</th>
                    <th className="p-2 text-center font-semibold">Laki-Laki</th>
                    <th className="p-2 text-center font-semibold">Perempuan</th>
                    <th className="p-2 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-600">
                  <tr>
                    <td className="p-2 font-medium">Kelas VII (Satu)</td>
                    <td className="p-2 text-center font-mono">{activeSiswa.filter(s => s.kelas === 'VII' && s.jk === 'L').length}</td>
                    <td className="p-2 text-center font-mono">{activeSiswa.filter(s => s.kelas === 'VII' && s.jk === 'P').length}</td>
                    <td className="p-2 text-right font-bold font-mono">{class7Count}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">Kelas VIII (Dua)</td>
                    <td className="p-2 text-center font-mono">{activeSiswa.filter(s => s.kelas === 'VIII' && s.jk === 'L').length}</td>
                    <td className="p-2 text-center font-mono">{activeSiswa.filter(s => s.kelas === 'VIII' && s.jk === 'P').length}</td>
                    <td className="p-2 text-right font-bold font-mono">{class8Count}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">Kelas IX (Tiga)</td>
                    <td className="p-2 text-center font-mono">{activeSiswa.filter(s => s.kelas === 'IX' && s.jk === 'L').length}</td>
                    <td className="p-2 text-center font-mono">{activeSiswa.filter(s => s.kelas === 'IX' && s.jk === 'P').length}</td>
                    <td className="p-2 text-right font-bold font-mono">{class9Count}</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td className="p-2 text-brand-700">Total Keseluruhan</td>
                    <td className="p-2 text-center font-mono">{maleCount}</td>
                    <td className="p-2 text-center font-mono">{femaleCount}</td>
                    <td className="p-2 text-right text-brand-700 font-mono">{totalSiswa}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Mutation and Social aids statistics */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-sans border-b pb-1">2. Statistik Layanan Sosial & Mutasi</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 border-b">
                    <th className="p-2 font-semibold">Kategori Penilaian</th>
                    <th className="p-2 text-right font-semibold">Akumulasi / Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-600">
                  <tr>
                    <td className="p-2 font-medium">Siswa Pemegang Kartu KIP (Kartu Indonesia Pintar)</td>
                    <td className="p-2 text-right font-mono font-bold">{siswaList.filter(s => s.kip && s.kip !== '-').length} Siswa</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">Keluarga Penerima Manfaat PKH</td>
                    <td className="p-2 text-right font-mono font-bold">{siswaList.filter(s => s.pkh && s.pkh !== '-').length} KK</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">Catatan Mutasi Masuk</td>
                    <td className="p-2 text-right font-mono text-emerald-600 font-bold">+{mutasiMasuk} Siswa</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">Catatan Mutasi Keluar</td>
                    <td className="p-2 text-right font-mono text-rose-600 font-bold">-{mutasiKeluar} Siswa</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Validation principal signature footer */}
        <div className="pt-12 grid grid-cols-2 gap-6 border-t border-slate-200">
          <div className="text-center space-y-1">
            <p className="text-slate-400 text-[10px]">Dilaporkan oleh,</p>
            <p className="font-semibold text-slate-700">Wali Bidang Kesiswaan / TU</p>
            <div className="h-12"></div>
            <p className="font-bold underline text-slate-800">Drs. M. Wahyudi, M.Pd</p>
            <p className="text-slate-400 text-[9px]">NIP. 19780512 200501 1 002</p>
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
  );
};
