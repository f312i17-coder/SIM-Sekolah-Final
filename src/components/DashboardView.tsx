import React, { useState } from 'react';
import { useAppState } from '../lib/StateContext';
import { 
  Users, 
  UserCheck, 
  UserX, 
  GraduationCap, 
  TrendingUp, 
  TrendingDown, 
  BookOpen, 
  ArrowRightLeft, 
  Calendar, 
  Server,
  Plus,
  Printer,
  FileText,
  Settings,
  ChevronRight,
  ChevronLeft,
  Clock,
  Briefcase,
  Trash2,
  Edit2,
  AlertCircle,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { AgendaItem } from '../types';

export const DashboardView: React.FC = () => {
  const { siswaList, mutasiList, spmbList, schoolSettings, isFirebaseActive, setActiveMenu, agendaList, saveAgendaItem, deleteAgendaItem, pegawaiList } = useAppState();

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  // Calculations
  const activeSiswa = siswaList.filter(s => s.statusAktif === 'Aktif');
  const totalSiswa = activeSiswa.length;
  
  const maleCount = activeSiswa.filter(s => s.jk === 'L').length;
  const femaleCount = activeSiswa.filter(s => s.jk === 'P').length;

  const totalGuru = pegawaiList.filter(p => p.tipePegawai === 'Guru').length;
  const totalTendik = pegawaiList.filter(p => p.tipePegawai === 'Tendik').length;

  const class7Count = activeSiswa.filter(s => s.kelas === 'VII' || s.kelas.startsWith('VII-')).length;
  const class8Count = activeSiswa.filter(s => s.kelas === 'VIII' || s.kelas.startsWith('VIII-')).length;
  const class9Count = activeSiswa.filter(s => s.kelas === 'IX' || s.kelas.startsWith('IX-')).length;

  const mutasiMasuk = mutasiList.filter(m => m.jenis === 'Masuk').length;
  const mutasiKeluar = mutasiList.filter(m => m.jenis === 'Keluar').length;

  const alumniCount = siswaList.filter(s => s.statusAktif === 'Lulus').length;
  const spmbPending = spmbList.filter(r => r.status !== 'Diterima' && r.status !== 'Tidak Lulus').length;

  const maxClassVal = Math.max(class7Count, class8Count, class9Count, 1);

  // Calendar Generator Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Agenda State & Form Handlers
  const [editingAgendaId, setEditingAgendaId] = useState<string | null>(null);
  const [agendaTitle, setAgendaTitle] = useState('');
  const [agendaType, setAgendaType] = useState<'Ujian' | 'Rapat' | 'Libur' | 'Upacara' | 'Kegiatan' | 'Administrasi' | 'Lainnya'>('Kegiatan');
  const [agendaKeterangan, setAgendaKeterangan] = useState('');
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error' | 'loading'; text: string } | null>(null);

  React.useEffect(() => {
    const hasHolidays = agendaList.some(a => a.type === 'Libur');
    if (!hasHolidays) {
      handleSyncHolidays();
    }
  }, []);

  const handleSyncHolidays = async () => {
    setSyncStatus({ type: 'loading', text: 'Menyinkronkan hari libur nasional...' });
    try {
      const holidaysList = [
        // 2025
        { tanggal: "2025-01-01", title: "Tahun Baru Masehi", keterangan: "Hari Libur Nasional" },
        { tanggal: "2025-01-27", title: "Isra Mi'raj Nabi Muhammad SAW", keterangan: "Hari Libur Nasional" },
        { tanggal: "2025-01-29", title: "Tahun Baru Imlek", keterangan: "Hari Libur Nasional" },
        { tanggal: "2025-03-29", title: "Hari Suci Nyepi", keterangan: "Hari Libur Nasional" },
        { tanggal: "2025-03-31", title: "Hari Raya Idul Fitri 1446 H", keterangan: "Hari Libur Nasional" },
        { tanggal: "2025-04-01", title: "Hari Raya Idul Fitri 1446 H (Hari Kedua)", keterangan: "Hari Libur Nasional" },
        { tanggal: "2025-04-18", title: "Wafat Yesus Kristus", keterangan: "Hari Libur Nasional" },
        { tanggal: "2025-05-01", title: "Hari Buruh Internasional", keterangan: "Hari Libur Nasional" },
        { tanggal: "2025-05-12", title: "Hari Raya Waisak 2569 BE", keterangan: "Hari Libur Nasional" },
        { tanggal: "2025-05-29", title: "Kenaikan Yesus Kristus", keterangan: "Hari Libur Nasional" },
        { tanggal: "2025-06-01", title: "Hari Lahir Pancasila", keterangan: "Hari Libur Nasional" },
        { tanggal: "2025-06-06", title: "Hari Raya Idul Adha 1446 H", keterangan: "Hari Libur Nasional" },
        { tanggal: "2025-06-27", title: "Tahun Baru Islam 1447 H", keterangan: "Hari Libur Nasional" },
        { tanggal: "2025-08-17", title: "Hari Kemerdekaan RI (HUT RI Ke-80)", keterangan: "Hari Libur Nasional" },
        { tanggal: "2025-09-05", title: "Maulid Nabi Muhammad SAW", keterangan: "Hari Libur Nasional" },
        { tanggal: "2025-12-25", title: "Hari Raya Natal", keterangan: "Hari Libur Nasional" },
        
        // 2026
        { tanggal: "2026-01-01", title: "Tahun Baru Masehi", keterangan: "Hari Libur Nasional" },
        { tanggal: "2026-01-15", title: "Isra Mi'raj Nabi Muhammad SAW", keterangan: "Hari Libur Nasional" },
        { tanggal: "2026-02-17", title: "Tahun Baru Imlek 2577 Kongzili", keterangan: "Hari Libur Nasional" },
        { tanggal: "2026-03-19", title: "Hari Suci Nyepi (Saka 1948)", keterangan: "Hari Libur Nasional" },
        { tanggal: "2026-03-20", title: "Hari Raya Idul Fitri 1447 H", keterangan: "Hari Libur Nasional" },
        { tanggal: "2026-03-21", title: "Hari Raya Idul Fitri 1447 H (Hari Kedua)", keterangan: "Hari Libur Nasional" },
        { tanggal: "2026-04-03", title: "Wafat Yesus Kristus (Jumat Agung)", keterangan: "Hari Libur Nasional" },
        { tanggal: "2026-05-01", title: "Hari Buruh Internasional", keterangan: "Hari Libur Nasional" },
        { tanggal: "2026-05-14", title: "Kenaikan Yesus Kristus", keterangan: "Hari Libur Nasional" },
        { tanggal: "2026-05-27", title: "Hari Raya Idul Adha 1447 H", keterangan: "Hari Libur Nasional" },
        { tanggal: "2026-05-31", title: "Hari Raya Waisak 2570 BE", keterangan: "Hari Libur Nasional" },
        { tanggal: "2026-06-01", title: "Hari Lahir Pancasila", keterangan: "Hari Libur Nasional" },
        { tanggal: "2026-06-15", title: "Tahun Baru Islam 1448 H", keterangan: "Hari Libur Nasional" },
        { tanggal: "2026-08-17", title: "Hari Kemerdekaan RI (HUT RI Ke-81)", keterangan: "Hari Libur Nasional" },
        { tanggal: "2026-08-25", title: "Maulid Nabi Muhammad SAW", keterangan: "Hari Libur Nasional" },
        { tanggal: "2026-12-25", title: "Hari Raya Natal", keterangan: "Hari Libur Nasional" }
      ];

      let addedCount = 0;
      for (const item of holidaysList) {
        const alreadyExists = agendaList.some(
          a => a.tanggal === item.tanggal && 
          (a.title.toLowerCase().includes(item.title.toLowerCase()) || item.title.toLowerCase().includes(a.title.toLowerCase()))
        );
        if (!alreadyExists) {
          const agendaItem: AgendaItem = {
            id: `ag-holiday-${item.tanggal}-${Math.random().toString(36).substr(2, 5)}`,
            tanggal: item.tanggal,
            title: item.title,
            type: 'Libur',
            keterangan: item.keterangan
          };
          await saveAgendaItem(agendaItem);
          addedCount++;
        }
      }

      setSyncStatus({ 
        type: 'success', 
        text: addedCount > 0 
          ? `Berhasil sinkronisasi ${addedCount} hari libur nasional.` 
          : 'Semua hari libur nasional sudah terdaftar.' 
      });
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (err) {
      console.error(err);
      setSyncStatus({ type: 'error', text: 'Gagal menyinkronkan hari libur.' });
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  const handleSaveAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay || !agendaTitle.trim()) return;

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    const agendaItem: AgendaItem = {
      id: editingAgendaId || `ag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tanggal: dateStr,
      title: agendaTitle.trim(),
      type: agendaType,
      keterangan: agendaKeterangan.trim() || undefined
    };

    await saveAgendaItem(agendaItem);
    
    // Reset Form
    setEditingAgendaId(null);
    setAgendaTitle('');
    setAgendaType('Kegiatan');
    setAgendaKeterangan('');
  };

  const handleEditClick = (item: AgendaItem) => {
    setEditingAgendaId(item.id);
    setAgendaTitle(item.title);
    setAgendaType(item.type);
    setAgendaKeterangan(item.keterangan || '');
  };

  const handleCancelEdit = () => {
    setEditingAgendaId(null);
    setAgendaTitle('');
    setAgendaType('Kegiatan');
    setAgendaKeterangan('');
  };

  const handleDeleteClick = async (id: string) => {
    await deleteAgendaItem(id);
    // If the currently edited item is deleted, reset the form
    if (editingAgendaId === id) {
      handleCancelEdit();
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
    handleCancelEdit();
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
    handleCancelEdit();
  };

  const cardsData = [
    { 
      id: 'stat-total',
      title: "Total Siswa Aktif", 
      value: totalSiswa, 
      sub: "Siswa terdaftar aktif", 
      icon: Users, 
      color: "bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 border border-brand-100/50" 
    },
    { 
      id: 'stat-male',
      title: "Siswa Laki-laki", 
      value: maleCount, 
      sub: `${totalSiswa ? Math.round((maleCount / totalSiswa) * 100) : 0}% dari total`, 
      icon: UserCheck, 
      color: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100/50" 
    },
    { 
      id: 'stat-female',
      title: "Siswa Perempuan", 
      value: femaleCount, 
      sub: `${totalSiswa ? Math.round((femaleCount / totalSiswa) * 100) : 0}% dari total`, 
      icon: UserCheck, 
      color: "bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400 border border-pink-100/50" 
    },
    { 
      id: 'stat-guru',
      title: "Tenaga Pendidik (Guru)", 
      value: totalGuru, 
      sub: "Guru pengajar aktif", 
      icon: Briefcase, 
      color: "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50" 
    },
    { 
      id: 'stat-tendik',
      title: "Tenaga Kependidikan", 
      value: totalTendik, 
      sub: "Staf Tata Usaha & Karyawan", 
      icon: UserCheck, 
      color: "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100/50" 
    },
    { 
      id: 'stat-mutin',
      title: "Mutasi Masuk", 
      value: mutasiMasuk, 
      sub: "Semester berjalan", 
      icon: TrendingUp, 
      color: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50" 
    },
    { 
      id: 'stat-mutout',
      title: "Mutasi Keluar", 
      value: mutasiKeluar, 
      sub: "Semester berjalan", 
      icon: TrendingDown, 
      color: "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100/50" 
    },
    { 
      id: 'stat-alumni',
      title: "Jumlah Alumni", 
      value: alumniCount, 
      sub: "Telah lulus & diarsip", 
      icon: GraduationCap, 
      color: "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-100/50" 
    }
  ];

  const quickActions = [
    { label: "Tambah Siswa", sub: "Input Data Baru", icon: Plus, menu: "siswa", color: "text-brand-600 bg-brand-50 dark:bg-brand-950/20 border border-brand-100" },
    { label: "Cetak Buku Induk", sub: "Arsip Portofolio", icon: Printer, menu: "buku-induk", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20 border border-blue-100" },
    { label: "Proses Mutasi", sub: "Masuk / Keluar", icon: ArrowRightLeft, menu: "mutasi", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100" },
    { label: "Suket Rata Rapor", sub: "Kelulusan Rapor", icon: FileText, menu: "skl", color: "text-pink-600 bg-pink-50 dark:bg-pink-950/20 border border-pink-100" },
    { label: "Kartu Pelajar", sub: "Cetak Digital", icon: GraduationCap, menu: "kartu-pelajar", color: "text-purple-600 bg-purple-50 dark:bg-purple-950/20 border border-purple-100" },
    { label: "Pengaturan SIM", sub: "Konfigurasi Sekolah", icon: Settings, menu: "pengaturan", color: "text-slate-600 bg-slate-50 dark:bg-slate-900 border border-slate-200" }
  ];

  return (
    <div id="dashboard-view-container" className="space-y-6 font-sans">
      
      {/* 1. PREMIUM HEADER HERO BANNER */}
      <div 
        id="dashboard-header-banner" 
        className="bg-gradient-to-r from-[#0F1E36] via-[#1E3A8A] to-[#172554] p-8 rounded-3xl text-white shadow-lg relative overflow-hidden group border-l-8 border-[#D4AF37] border-y border-r border-slate-700/30"
      >
        {/* Soft elegant background graphics */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 top-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold bg-white/20 text-white border border-white/25 px-3 py-1 rounded-full uppercase tracking-widest inline-block shadow-sm">
                Portal Utama SIM
              </span>
              <span className="text-[10px] font-bold bg-amber-400/30 text-amber-100 border border-amber-400/35 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                NPSN: 10403759
              </span>
              <span className="text-[10px] font-bold bg-white/10 text-slate-100 border border-white/15 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                Akreditasi A
              </span>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight drop-shadow-md text-white font-sans uppercase">
                Sistem Informasi Sekolah
              </h1>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-normal text-amber-100 drop-shadow-sm font-sans">
                SMP Negeri 1 Rangsang
              </h2>
            </div>
            
            <p className="text-xs md:text-sm text-white/90 max-w-3xl leading-relaxed font-medium">
              Unit Tata Usaha <strong className="text-white font-extrabold">{schoolSettings.namaSekolah}</strong>. Kelola administrasi sekolah, data kependidikan, guru, tendik, dan siswa secara digital, akurat, dan profesional.
            </p>
          </div>
          
          {/* Active Period Info Pills integrated elegantly in glassmorphism */}
          <div className="flex flex-col gap-2 shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-inner md:w-72">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-200">Status Sistem Aktif:</span>
            
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Calendar className="w-4 h-4 text-amber-200" />
              <span>TP: {schoolSettings.tahunPelajaran}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <BookOpen className="w-4 h-4 text-amber-200" />
              <span>Semester: {schoolSettings.semester}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Server className="w-4 h-4 text-amber-200" />
              <span>{isFirebaseActive ? 'Sinkronisasi Cloud' : 'Database Lokal'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS CARDS GRID */}
      <div id="dashboard-stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {cardsData.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              id={`stat-card-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="bg-white dark:bg-[#131b2e] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs card-hover flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider block truncate">{card.title}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-sans">{card.value}</h3>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5 truncate">{card.sub}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. CHARTS & CALENDAR BENTO PANEL */}
      <div id="dashboard-bento-panel" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Charts (takes 2/3 space) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Distribution & Gender Ratio Split Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Siswa Distribution Column Chart Card */}
            <div className="bg-white dark:bg-[#131b2e] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-850 dark:text-slate-100 font-sans text-sm">Grafik Distribusi Siswa</h4>
                <p className="text-xs text-slate-400 mt-0.5">Komparasi siswa aktif per jenjang kelas</p>
              </div>

              {/* Dynamic SVG Columns */}
              <div className="h-44 flex items-end justify-between px-4 border-b border-slate-100 dark:border-slate-800 pb-2 gap-4 mt-4">
                <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{class7Count}</span>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-[100px] rounded-t-lg relative group">
                    <div className="absolute bottom-0 w-full bg-brand-500/10 rounded-t-lg h-full transition-all group-hover:bg-brand-500/20"></div>
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${(class7Count / maxClassVal) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="absolute bottom-0 w-full bg-brand-500 rounded-t-lg shadow-sm shadow-brand-500/20"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Kls VII</span>
                </div>
                
                <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{class8Count}</span>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-[100px] rounded-t-lg relative group">
                    <div className="absolute bottom-0 w-full bg-emerald-500/10 rounded-t-lg h-full transition-all group-hover:bg-emerald-500/20"></div>
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${(class8Count / maxClassVal) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                      className="absolute bottom-0 w-full bg-emerald-500 rounded-t-lg shadow-sm shadow-emerald-500/20"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Kls VIII</span>
                </div>

                <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{class9Count}</span>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-[100px] rounded-t-lg relative group">
                    <div className="absolute bottom-0 w-full bg-pink-500/10 rounded-t-lg h-full transition-all group-hover:bg-pink-500/20"></div>
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${(class9Count / maxClassVal) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                      className="absolute bottom-0 w-full bg-pink-500 rounded-t-lg shadow-sm shadow-pink-500/20"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Kls IX</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2">
                <span>Rata-Rata Rombel: {Math.round(totalSiswa / 9)} siswa</span>
                <span>Aktif berjalan</span>
              </div>
            </div>

            {/* Gender Ratio Donut Circle Card */}
            <div className="bg-white dark:bg-[#131b2e] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-850 dark:text-slate-100 font-sans text-sm">Rasio Gender Siswa</h4>
                <p className="text-xs text-slate-400 mt-0.5">Proporsi Laki-laki vs Perempuan</p>
              </div>

              <div className="flex items-center justify-around py-2 gap-4">
                {/* Custom Donut Ring with SVG */}
                <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle 
                      cx="50" cy="50" r="40" 
                      className="stroke-slate-100 dark:stroke-slate-800" 
                      strokeWidth="12" 
                      fill="transparent" 
                    />
                    <circle 
                      cx="50" cy="50" r="40" 
                      className="stroke-blue-500" 
                      strokeWidth="12" 
                      fill="transparent" 
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - (totalSiswa ? maleCount / totalSiswa : 0.5))}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-base font-bold text-slate-800 dark:text-white">
                      {totalSiswa ? Math.round((maleCount / totalSiswa) * 100) : 50}%
                    </span>
                    <span className="text-[8px] text-slate-400 uppercase font-semibold">Laki-Laki</span>
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  <div className="flex items-center justify-between bg-blue-50/50 dark:bg-blue-950/10 p-2 rounded-xl border border-blue-100/10">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0" />
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-350">Laki-laki</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white">{maleCount}</span>
                  </div>
                  <div className="flex items-center justify-between bg-pink-50/50 dark:bg-pink-950/10 p-2 rounded-xl border border-pink-100/10">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-pink-500 rounded-full shrink-0" />
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-350">Perempuan</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white">{femaleCount}</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 border-t border-slate-50 dark:border-slate-800/50 pt-2 mt-2 text-center font-medium">
                Penyebaran gender seimbang di lingkungan sekolah.
              </div>
            </div>

          </div>

          {/* QUICK ACTIONS PANEL */}
          <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-slate-850 dark:text-slate-100 font-sans text-sm">Akses Menu Cepat</h4>
                <p className="text-xs text-slate-400">Pintasan navigasi langsung ke fungsionalitas utama</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {quickActions.map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.label}
                    onClick={() => setActiveMenu(act.menu)}
                    className="flex flex-col items-center text-center p-3.5 bg-slate-50 dark:bg-[#0c101d] rounded-xl border border-slate-150 dark:border-slate-800/80 hover:border-brand-300 dark:hover:border-brand-500/50 hover:bg-white dark:hover:bg-[#131b2e] transition-all duration-200 card-hover cursor-pointer group"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110 ${act.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-750 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">{act.label}</span>
                    <span className="text-[9px] text-slate-400 mt-0.5 truncate w-full">{act.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right column: Calendar Widget & Schedule alerts (takes 1/3 space) */}
        <div className="space-y-6">
          
          {/* Calendar Widget Card */}
          <div className="bg-white dark:bg-[#131b2e] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-850 dark:text-slate-100 font-sans text-sm">Kalender Akademik</h4>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-1">
                  {monthNames[month]} {year}
                </span>
                <button 
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Holiday Sync Option */}
            <div className="flex flex-col gap-2 bg-slate-50 dark:bg-[#0c101d] rounded-xl p-2.5 border border-slate-150 dark:border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Hari Libur Nasional</span>
                <button
                  type="button"
                  onClick={handleSyncHolidays}
                  disabled={syncStatus?.type === 'loading'}
                  className="text-[9px] bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-bold px-2.5 py-1 rounded-lg border border-red-200/20 dark:border-red-900/30 transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  title="Sinkronisasikan Hari Libur Nasional 2025/2026"
                >
                  <Calendar className="w-2.5 h-2.5" />
                  Sinkronisasikan
                </button>
              </div>
              
              {syncStatus && (
                <div className={`p-2 rounded-lg text-[9px] font-medium flex items-center gap-1.5 border ${
                  syncStatus.type === 'loading' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30' :
                  syncStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' :
                  'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    syncStatus.type === 'loading' ? 'bg-blue-500 animate-pulse' :
                    syncStatus.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`} />
                  <span>{syncStatus.text}</span>
                </div>
              )}
            </div>

            {/* Calendar Grid */}
            <div>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
              </div>
              
              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {/* Empty cells before start of month */}
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-7" />
                ))}

                {/* Days of month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isSelected = selectedDay === day;
                  const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
                  
                  const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dayAgendas = agendaList.filter(e => e.tanggal === cellDateStr);
                  const hasEvent = dayAgendas.length > 0;

                  return (
                    <button
                      key={`day-${day}`}
                      onClick={() => {
                        setSelectedDay(day);
                        // Reset form on day change unless we are currently editing an item on this day
                        const matchingEditingItem = dayAgendas.find(e => e.id === editingAgendaId);
                        if (!matchingEditingItem) {
                          handleCancelEdit();
                        }
                      }}
                      className={`h-7 w-7 mx-auto rounded-full text-xs font-semibold flex items-center justify-center relative transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20 scale-105'
                          : isToday
                            ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 ring-1 ring-amber-400/50'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{day}</span>
                      {hasEvent && (
                        <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-brand-500'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected day event details and editor */}
            <div className="bg-slate-50 dark:bg-[#0c101d] rounded-xl p-3 border border-slate-150 dark:border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/60 pb-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Agenda {selectedDay ? `${selectedDay} ${monthNames[month]} ${year}` : "Pilih Tanggal"}
                </span>
                {selectedDay && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/20">
                    {agendaList.filter(e => e.tanggal === `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`).length} Jadwal
                  </span>
                )}
              </div>

              {selectedDay ? (
                <>
                  {/* Event List */}
                  <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                    {agendaList.filter(e => e.tanggal === `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`).length > 0 ? (
                      agendaList.filter(e => e.tanggal === `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`).map((ev) => (
                        <div key={ev.id} className="group/item flex items-start justify-between bg-white dark:bg-[#131b2e] p-2.5 rounded-lg border border-slate-150 dark:border-slate-800 hover:border-brand-200 dark:hover:border-brand-500/20 transition-all">
                          <div className="space-y-1 pr-2 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                                ev.type === 'Ujian' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' :
                                ev.type === 'Rapat' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
                                ev.type === 'Libur' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                                ev.type === 'Upacara' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' :
                                ev.type === 'Kegiatan' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                                ev.type === 'Administrasi' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                                'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
                              }`}>
                                {ev.type}
                              </span>
                              <h5 className="text-xs font-bold text-slate-750 dark:text-slate-200 leading-tight">{ev.title}</h5>
                            </div>
                            {ev.keterangan && (
                              <p className="text-[10px] text-slate-450 dark:text-slate-400 pl-0.5 leading-normal">{ev.keterangan}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleEditClick(ev)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                              title="Edit Agenda"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(ev.id)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                              title="Hapus Agenda"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-slate-400 dark:text-slate-500 text-[11px] flex flex-col items-center gap-1">
                        <Calendar className="w-5 h-5 text-slate-350 dark:text-slate-650" />
                        <span>Tidak ada agenda pada tanggal ini.</span>
                      </div>
                    )}
                  </div>

                  {/* Form Input Section */}
                  <form onSubmit={handleSaveAgenda} className="border-t border-slate-200/50 dark:border-slate-800/60 pt-3 space-y-2">
                    <span className="text-[9px] text-slate-500 dark:text-slate-450 uppercase font-bold tracking-wider block">
                      {editingAgendaId ? "✏️ Edit Detail Agenda" : "➕ Tambah Agenda Baru"}
                    </span>
                    
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={agendaTitle}
                        onChange={(e) => setAgendaTitle(e.target.value)}
                        placeholder="Nama agenda (misal: Ujian Tengah Semester)..."
                        className="w-full text-xs bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 transition-colors"
                        required
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={agendaType}
                          onChange={(e) => setAgendaType(e.target.value as any)}
                          className="w-full text-xs bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 transition-colors"
                        >
                          <option value="Kegiatan">Kegiatan</option>
                          <option value="Ujian">Ujian</option>
                          <option value="Rapat">Rapat</option>
                          <option value="Libur">Libur</option>
                          <option value="Upacara">Upacara</option>
                          <option value="Administrasi">Administrasi</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>

                        <input
                          type="text"
                          value={agendaKeterangan}
                          onChange={(e) => setAgendaKeterangan(e.target.value)}
                          placeholder="Keterangan (opsional)..."
                          className="w-full text-xs bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-850 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 justify-end pt-1">
                      {editingAgendaId && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Batal
                        </button>
                      )}
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        {editingAgendaId ? "Simpan Perubahan" : "Simpan Agenda"}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-6 text-slate-450 dark:text-slate-500 text-xs flex flex-col items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                  <span>Silakan klik salah satu tanggal di kalender untuk mengelola agenda harian sekolah.</span>
                </div>
              )}
            </div>
          </div>

          {/* SPMB Alerts Card */}
          <div className="bg-white dark:bg-[#131b2e] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-850 dark:text-slate-100 font-sans text-sm">Notifikasi Calon Siswa</h4>
            
            {spmbPending > 0 ? (
              <div 
                onClick={() => setActiveMenu('spmb')}
                className="bg-amber-50/70 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/30 rounded-xl p-3.5 flex items-start gap-3 hover:shadow-xs cursor-pointer hover:border-amber-300 transition-all"
              >
                <ArrowRightLeft className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-amber-800 dark:text-amber-400">Pendaftar SPMB Baru</h5>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">Ada {spmbPending} berkas siswa baru menunggu verifikasi administrasi.</p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-[#0c101d] border border-slate-150 dark:border-slate-800 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-xs">Semua berkas SPMB telah selesai diverifikasi.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 4. ROMBONGAN BELAJAR DETAIL CARD */}
      <div id="rombel-grid-section" className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-2">
          <div>
            <h4 className="font-bold text-slate-850 dark:text-slate-100 font-display text-base">Rombongan Belajar (Rombel)</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Daftar wali kelas dan pembagian gender per rombel aktif</p>
          </div>
          <div className="bg-slate-100 dark:bg-[#0c101d] px-3.5 py-1 rounded-full text-slate-600 dark:text-slate-400 text-xs font-bold border border-slate-200/50 dark:border-slate-800/80">
            Tahun Pelajaran: {schoolSettings.tahunPelajaran}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { grade: 'KELAS VII', list: ['VII-1', 'VII-2', 'VII-3'], color: 'from-brand-500 to-brand-600 shadow-brand-500/10', textLight: 'text-brand-600 dark:text-brand-400', bgLight: 'bg-brand-50 dark:bg-brand-950/20 border-brand-100/10' },
            { grade: 'KELAS VIII', list: ['VIII-1', 'VIII-2', 'VIII-3'], color: 'from-emerald-500 to-emerald-600 shadow-emerald-500/10', textLight: 'text-emerald-600 dark:text-emerald-400', bgLight: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100/10' },
            { grade: 'KELAS IX', list: ['IX-1', 'IX-2', 'IX-3'], color: 'from-pink-500 to-pink-600 shadow-pink-500/10', textLight: 'text-pink-600 dark:text-pink-400', bgLight: 'bg-pink-50 dark:bg-pink-950/20 border-pink-100/10' }
          ].map((group) => {
            const WALI_KELAS_MAP: Record<string, string> = {
              'VII-1': 'Sri Wahyuni, S.Pd.',
              'VII-2': 'Rahmad Hidayat, M.Pd.',
              'VII-3': 'Supardi, S.Pd.',
              'VIII-1': 'Yuliana Hartono, S.S.',
              'VIII-2': 'Budi Pratama, S.Si.',
              'VIII-3': 'Siti Rahma, S.Pd.I.',
              'IX-1': 'Drs. H. Syamsuddin, M.Pd.',
              'IX-2': 'Bella Safitri, S.Kom.',
              'IX-3': 'Yudi Hartono, S.Pd.',
              ...(schoolSettings.waliKelas || {})
            };

            return (
              <div key={group.grade} className="space-y-4">
                <div className={`p-3.5 rounded-xl bg-gradient-to-r ${group.color} text-white shadow-md`}>
                  <h5 className="font-bold text-xs tracking-wide">{group.grade}</h5>
                </div>
                <div className="space-y-3">
                  {group.list.map((rombel) => {
                    const studentsInRombel = activeSiswa.filter(s => s.kelas === rombel || (s.kelas === rombel.split('-')[0] && rombel.endsWith('-1')));
                    const total = studentsInRombel.length;
                    const boys = studentsInRombel.filter(s => s.jk === 'L').length;
                    const girls = studentsInRombel.filter(s => s.jk === 'P').length;
                    const wali = WALI_KELAS_MAP[rombel] || 'Belum Ditentukan';
                    
                    return (
                      <div key={rombel} className="bg-slate-50 dark:bg-[#0c101d] border border-slate-150 dark:border-slate-800/80 p-4 rounded-xl space-y-3 transition-all hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-700">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${group.textLight} px-2.5 py-0.5 rounded-md border ${group.bgLight}`}>{rombel}</span>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-350">{total} Siswa</span>
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Wali Kelas</span>
                          <span className="text-xs text-slate-700 dark:text-slate-300 font-bold block truncate" title={wali}>{wali}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-850">
                          <div className="bg-blue-50/40 dark:bg-blue-950/5 rounded-lg p-1.5 text-center border border-blue-100/5">
                            <span className="text-[9px] text-blue-500 font-bold block">LAKI-LAKI</span>
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{boys}</span>
                          </div>
                          <div className="bg-pink-50/40 dark:bg-pink-950/5 rounded-lg p-1.5 text-center border border-pink-100/5">
                            <span className="text-[9px] text-pink-500 font-bold block">PEREMPUAN</span>
                            <span className="text-xs font-bold text-pink-700 dark:text-pink-400">{girls}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
};
