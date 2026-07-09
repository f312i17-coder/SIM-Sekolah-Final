import React, { useState } from 'react';
import { StateProvider, useAppState } from './lib/StateContext';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ArrowLeftRight, 
  CreditCard, 
  Calculator, 
  Award, 
  ClipboardList, 
  GraduationCap, 
  Milestone, 
  UserPlus, 
  FolderArchive, 
  BarChart3, 
  Settings,
  Menu,
  X,
  School,
  Lock,
  LogOut,
  Calendar,
  Mail,
  FileText,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Palette,
  FileSpreadsheet,
  Briefcase,
  UserCheck,
  FolderOpen,
  FileCheck,
  PlusCircle,
  KeyRound,
  ChevronDown,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import our premium components
import { SchoolLogo } from './components/SchoolLogo';
import { DashboardView } from './components/DashboardView';
import { DataSiswaView } from './components/DataSiswaView';
import { BukuIndukView } from './components/BukuIndukView';
import { MutasiView } from './components/MutasiView';
import { KartuPelajarView } from './components/KartuPelajarView';
import { NilaiIjazahView } from './components/NilaiIjazahView';
import { SuketRataRaporView } from './components/SuketRataRaporView';
import { TranskripView } from './components/TranskripView';
import { KelulusanView } from './components/KelulusanView';
import { AlumniView } from './components/AlumniView';
import { SpmbView } from './components/SpmbView';
import { ArsipDigitalView } from './components/ArsipDigitalView';
import { LaporanView } from './components/LaporanView';
import { PengaturanView } from './components/PengaturanView';
import { LoginView } from './components/LoginView';
import { SuratView } from './components/SuratView';
import { InputNilaiRaporView } from './components/InputNilaiRaporView';
import { KepegawaianView } from './components/KepegawaianView';
import { HubGridView } from './components/HubGridView';

type MenuID = 
  | 'dashboard'
  | 'kesiswaan-hub' | 'akademik-hub' | 'kepegawaian-hub' | 'persuratan-hub' | 'laporan-hub' | 'pengaturan-hub'
  // Kesiswaan group
  | 'siswa' | 'buku-induk' | 'mutasi' | 'kartu-pelajar' | 'arsip' | 'alumni' | 'spmb'
  // Nilai group
  | 'rapor-s1' | 'rapor-s2' | 'rapor-s3' | 'rapor-s4' | 'rapor-s5' | 'rapor-s6'
  | 'ijazah' | 'skl' | 'kelulusan' | 'transkrip'
  // Kepegawaian group
  | 'pegawai-guru' | 'pegawai-tendik' | 'pegawai-duk' | 'pegawai-arsip-guru' | 'pegawai-arsip-tendik'
  | 'pegawai-riwayat-pangkat' | 'pegawai-riwayat-jabatan' | 'pegawai-riwayat-pendidikan'
  | 'pegawai-riwayat-diklat' | 'pegawai-riwayat-sertifikasi' | 'pegawai-riwayat-sk' | 'pegawai-riwayat-penugasan'
  // Surat Menyurat group
  | 'surat-baru' | 'surat-template' | 'surat-arsip'
  // Laporan group
  | 'laporan-statistik' | 'laporan-mutasi' | 'laporan-buku-induk'
  // Pengaturan group
  | 'pengaturan-identitas' | 'pengaturan-backup' | 'pengaturan-password';

interface MainMenuItem {
  id: MenuID;
  label: string;
  icon: React.ComponentType<any>;
}

const MAIN_MENU_ITEMS: MainMenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'kesiswaan-hub', label: 'Kesiswaan', icon: Users },
  { id: 'akademik-hub', label: 'Akademik', icon: ClipboardList },
  { id: 'kepegawaian-hub', label: 'Kepegawaian', icon: Briefcase },
  { id: 'persuratan-hub', label: 'Persuratan', icon: Mail },
  { id: 'laporan-hub', label: 'Laporan', icon: BarChart3 },
  { id: 'pengaturan-hub', label: 'Pengaturan', icon: Settings }
];

// Helper to determine parent hub category
const getParentHub = (menuId: MenuID): string | null => {
  if (menuId === 'dashboard') return null;
  if ([
    'siswa', 'buku-induk', 'mutasi', 'kartu-pelajar', 'arsip', 'alumni', 'spmb'
  ].includes(menuId)) {
    return 'kesiswaan-hub';
  }
  if ([
    'ijazah', 'skl', 'kelulusan', 'transkrip',
    'rapor-s1', 'rapor-s2', 'rapor-s3', 'rapor-s4', 'rapor-s5', 'rapor-s6'
  ].includes(menuId)) {
    return 'akademik-hub';
  }
  if (menuId.startsWith('pegawai-')) {
    return 'kepegawaian-hub';
  }
  if (menuId.startsWith('surat-')) {
    return 'persuratan-hub';
  }
  if (menuId.startsWith('laporan-')) {
    return 'laporan-hub';
  }
  if (menuId.startsWith('pengaturan-')) {
    return 'pengaturan-hub';
  }
  return null;
};


function AppContent() {
  const { 
    schoolSettings, 
    user, 
    loading, 
    logout,
    themeMode,
    setThemeMode,
    themeColor,
    setThemeColor,
    activeMenu,
    setActiveMenu
  } = useAppState();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sim_sidebar_collapsed') === 'true';
  });
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sim_sidebar_collapsed', String(next));
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
        <span className="text-slate-500 font-medium text-xs font-mono">Memuat SIM Kesiswaan...</span>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  // Render correct view component dynamically
  const renderActiveView = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardView />;
      case 'kesiswaan-hub':
        return <HubGridView category="kesiswaan" onSelect={setActiveMenu} />;
      case 'akademik-hub':
        return <HubGridView category="akademik" onSelect={setActiveMenu} />;
      case 'kepegawaian-hub':
        return <HubGridView category="kepegawaian" onSelect={setActiveMenu} />;
      case 'persuratan-hub':
        return <HubGridView category="persuratan" onSelect={setActiveMenu} />;
      case 'laporan-hub':
        return <HubGridView category="laporan" onSelect={setActiveMenu} />;
      case 'pengaturan-hub':
        return <HubGridView category="pengaturan" onSelect={setActiveMenu} />;

      case 'siswa':
        return <DataSiswaView />;
      case 'buku-induk':
        return <BukuIndukView />;
      case 'mutasi':
        return <MutasiView />;
      case 'kartu-pelajar':
        return <KartuPelajarView />;
      case 'alumni':
        return <AlumniView />;
      case 'spmb':
        return <SpmbView />;
      case 'arsip':
        return <ArsipDigitalView />;

      // Semester Grades
      case 'rapor-s1':
        return <InputNilaiRaporView semester={1} />;
      case 'rapor-s2':
        return <InputNilaiRaporView semester={2} />;
      case 'rapor-s3':
        return <InputNilaiRaporView semester={3} />;
      case 'rapor-s4':
        return <InputNilaiRaporView semester={4} />;
      case 'rapor-s5':
        return <InputNilaiRaporView semester={5} />;
      case 'rapor-s6':
        return <InputNilaiRaporView semester={6} />;

      case 'ijazah':
        return <NilaiIjazahView />;
      case 'skl':
        return <SuketRataRaporView />;
      case 'kelulusan':
        return <KelulusanView />;
      case 'transkrip':
        return <TranskripView />;

      // Kepegawaian View Sub-Tabs
      case 'pegawai-guru':
      case 'pegawai-tendik':
      case 'pegawai-duk':
      case 'pegawai-arsip-guru':
      case 'pegawai-arsip-tendik':
      case 'pegawai-riwayat-pangkat':
      case 'pegawai-riwayat-jabatan':
      case 'pegawai-riwayat-pendidikan':
      case 'pegawai-riwayat-diklat':
      case 'pegawai-riwayat-sertifikasi':
      case 'pegawai-riwayat-sk':
      case 'pegawai-riwayat-penugasan':
        return <KepegawaianView activeSubTab={activeMenu} />;

      // Surat Menyurat Views
      case 'surat-baru':
        return <SuratView initialTab="create" />;
      case 'surat-template':
        return <SuratView initialTab="create" />;
      case 'surat-arsip':
        return <SuratView initialTab="archive" />;

      // Laporan Views
      case 'laporan-statistik':
        return <LaporanView />;
      case 'laporan-mutasi':
        return <LaporanView />;
      case 'laporan-buku-induk':
        return <BukuIndukView />;

      // Pengaturan Views
      case 'pengaturan-identitas':
        return <PengaturanView initialTab="identity" />;
      case 'pengaturan-backup':
        return <PengaturanView initialTab="backup" />;
      case 'pengaturan-password':
        return <PengaturanView initialTab="security" />;

      default:
        return <DashboardView />;
    }
  };

  const getMenuLabel = () => {
    switch (activeMenu) {
      case 'dashboard':
        return 'Dashboard Utama';
      case 'kesiswaan-hub':
        return 'Menu Kesiswaan';
      case 'akademik-hub':
        return 'Menu Akademik';
      case 'kepegawaian-hub':
        return 'Menu Kepegawaian';
      case 'persuratan-hub':
        return 'Menu Persuratan';
      case 'laporan-hub':
        return 'Menu Laporan';
      case 'pengaturan-hub':
        return 'Menu Pengaturan';
      default:
        // Simple human-readable translations for the specific sub-modules
        if (activeMenu === 'siswa') return 'Data Siswa';
        if (activeMenu === 'buku-induk') return 'Buku Induk Digital';
        if (activeMenu === 'mutasi') return 'Mutasi Siswa';
        if (activeMenu === 'kartu-pelajar') return 'Kartu Pelajar';
        if (activeMenu === 'alumni') return 'Alumni';
        if (activeMenu === 'spmb') return 'SPMB';
        if (activeMenu === 'arsip') return 'Arsip Digital Siswa';
        if (activeMenu === 'ijazah') return 'Pengolahan Nilai Ijazah';
        if (activeMenu === 'skl') return 'Surat Nilai Rata-rata';
        if (activeMenu === 'kelulusan') return 'SKL (Surat Keterangan Kelulusan)';
        if (activeMenu === 'transkrip') return 'Transkrip Nilai';
        if (activeMenu.startsWith('pegawai-')) return 'Kepegawaian';
        if (activeMenu.startsWith('surat-')) return 'Persuratan';
        if (activeMenu.startsWith('laporan-')) return 'Laporan';
        if (activeMenu.startsWith('pengaturan-')) return 'Pengaturan';
        return 'Sistem Informasi Sekolah';
    }
  };

  return (
    <div id="app-workspace-frame" className="min-h-screen bg-[#F1F5F9] dark:bg-[#071321] flex text-slate-800 transition-colors duration-300">
      
      {/* 1. DESKTOP SIDEBAR RAIL */}
      <aside 
        id="desktop-sidebar-rail" 
        className={`hidden lg:flex flex-col bg-white dark:bg-[#131b2e] border-r border-slate-200 dark:border-slate-800 shrink-0 sticky top-0 h-screen z-20 no-print transition-all duration-300 ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* School Logo Brand Row */}
        <div className={`p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 ${isSidebarCollapsed ? 'flex-col' : ''}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-12 shrink-0 flex items-center justify-center">
              <SchoolLogo className="w-9 h-11 drop-shadow-md" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 transition-opacity duration-300">
                <span className="font-bold text-xs tracking-tight text-slate-800 dark:text-slate-100 uppercase block truncate w-40" title={schoolSettings.namaSekolah}>
                  {schoolSettings.namaSekolah}
                </span>
                <span className="text-[9px] text-brand-600 dark:text-brand-400 font-sans font-extrabold tracking-wider block uppercase">SISTEM INFORMASI SEKOLAH</span>
              </div>
            )}
          </div>
          
          {/* Collapse/Expand toggle button */}
          <button 
            onClick={toggleSidebar}
            className="p-1 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-1.5 custom-scrollbar text-xs font-semibold">
          {MAIN_MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id || getParentHub(activeMenu) === item.id;
            
            if (isSidebarCollapsed) {
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  title={item.label}
                  className={`w-full flex items-center justify-center p-3 transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-[#E3F2FD] dark:bg-[#1E88E5]/10 text-[#1E88E5] border-l-4 border-[#D4AF37] rounded-r-xl rounded-l-none font-bold scale-105 shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-[#E3F2FD] dark:hover:bg-[#1E88E5]/5 hover:text-[#1E88E5] rounded-xl'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#1E88E5]' : 'text-[#1E88E5]/70'}`} />
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 p-3 transition-all duration-150 cursor-pointer text-left text-xs font-semibold ${
                  isActive 
                    ? 'bg-[#E3F2FD] dark:bg-[#1E88E5]/10 text-[#1E88E5] border-l-4 border-[#D4AF37] rounded-r-xl rounded-l-none font-bold shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-[#E3F2FD] dark:hover:bg-[#1E88E5]/5 hover:text-[#1E88E5] rounded-xl border-l-4 border-transparent'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-[#1E88E5]' : 'text-slate-400 dark:text-slate-500 hover:text-[#1E88E5]'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Theme Widget inside sidebar (only show if expanded) */}
        {!isSidebarCollapsed && (
          <div className="mx-3 my-2 p-3 bg-slate-50 dark:bg-[#0c101d] rounded-xl border border-slate-150 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-1"><Palette className="w-3 h-3" /> TEMA</span>
              <button 
                onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-all cursor-pointer text-slate-500 hover:text-slate-700"
                title={themeMode === 'light' ? "Aktifkan Mode Gelap" : "Aktifkan Mode Terang"}
              >
                {themeMode === 'light' ? <Moon className="w-3.5 h-3.5 text-slate-500" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            </div>
            <div className="flex items-center justify-between gap-1.5 pt-0.5">
              {(['blue', 'green', 'red', 'purple', 'gray'] as const).map((color) => {
                const colorBgMap = {
                  blue: 'bg-blue-500',
                  green: 'bg-green-500',
                  red: 'bg-red-500',
                  purple: 'bg-purple-500',
                  gray: 'bg-gray-500'
                };
                return (
                  <button
                    key={color}
                    onClick={() => setThemeColor(color)}
                    className={`w-4.5 h-4.5 rounded-full ${colorBgMap[color]} transition-all cursor-pointer hover:scale-110 ${
                      themeColor === color ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900 scale-110' : 'opacity-70'
                    }`}
                    title={`Tema ${color}`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* User Operator Footer Info */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 mt-auto bg-slate-50 dark:bg-[#0c101d] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-slate-200">
              {user.displayName ? user.displayName[0] : 'U'}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate w-24" title={user.displayName || "Operator"}>
                  {user.displayName || "Operator TU"}
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-500 uppercase tracking-wider font-semibold">
                  {user.role === 'admin' ? 'Administrator' : 'Staf Operator'}
                </span>
              </div>
            )}
          </div>
          {!isSidebarCollapsed && (
            <button 
              onClick={() => {
                if (confirm("Apakah Anda yakin ingin keluar dari sistem?")) {
                  logout();
                }
              }}
              title="Keluar"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg shrink-0 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* 2. MAIN APPLICATION CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Navigation Bar */}
        <header id="mobile-top-header" className="bg-[#0F1E36] h-14 sticky top-0 z-10 flex items-center justify-between px-6 no-print transition-all duration-300 shadow-sm border-b-2 border-[#D4AF37]">
          {/* Menu Trigger Hamburger for Mobile */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* View Title */}
            <h2 className="font-bold text-white tracking-tight text-sm md:text-base font-sans drop-shadow-sm">
              {getMenuLabel()}
            </h2>
            <div className="h-6 w-px bg-white/20 hidden sm:block"></div>
            <div className="hidden sm:flex items-center gap-2 bg-white/15 text-white border border-white/25 text-[10px] font-bold rounded-full px-3 py-1 uppercase tracking-wider shadow-sm">
              TA: {schoolSettings.tahunPelajaran}
            </div>
          </div>

          {/* Quick Info & Small theme switch for collapsed sidebar */}
          <div className="flex items-center gap-4">
            {isSidebarCollapsed && (
              <button 
                onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white"
                title={themeMode === 'light' ? "Mode Gelap" : "Mode Terang"}
              >
                {themeMode === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            )}
            <div className="text-[10px] text-white/90 font-mono hidden md:block uppercase tracking-wider font-semibold">
              SISTEM INFORMASI SEKOLAH v2.4.0
            </div>
          </div>
        </header>

        {/* View Component Wrapper */}
        <main id="main-scroller-viewport" className="flex-1 p-6 overflow-y-auto bg-transparent transition-colors duration-300">
          {/* Elegant Breadcrumb Back Navigation */}
          {activeMenu !== 'dashboard' && !activeMenu.endsWith('-hub') && (
            <div className="mb-4 flex items-center gap-2 text-xs no-print">
              <button 
                onClick={() => {
                  const parentHub = getParentHub(activeMenu);
                  if (parentHub) setActiveMenu(parentHub as any);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#131b2e] text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:shadow transition-all duration-150 font-medium"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Menu Utama</span>
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeMenu}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* 3. MOBILE MENU SLIDE DRAWER OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div id="mobile-nav-drawer" className="fixed inset-0 z-50 lg:hidden flex no-print">
            {/* Backdrop cover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black"
            />

            {/* Slide Drawer body */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative w-72 bg-white dark:bg-[#131b2e] h-full flex flex-col p-5 border-r border-slate-200 dark:border-slate-800 shadow-xl"
            >
              {/* Header inside drawer */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-10 shrink-0 flex items-center justify-center">
                    <SchoolLogo className="w-7 h-9" />
                  </div>
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-100 font-display">SISTEM INFORMASI SEKOLAH</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation within drawer */}
              <nav className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar text-xs font-semibold">
                {MAIN_MENU_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenu === item.id || getParentHub(activeMenu) === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveMenu(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 transition-all duration-150 cursor-pointer text-left text-xs font-semibold ${
                        isActive 
                          ? 'bg-[#E3F2FD] dark:bg-[#1E88E5]/10 text-[#1E88E5] border-l-4 border-[#D4AF37] rounded-r-xl rounded-l-none font-bold shadow-sm' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-[#E3F2FD] dark:hover:bg-[#1E88E5]/5 hover:text-[#1E88E5] rounded-xl border-l-4 border-transparent'
                      }`}
                    >
                      <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-[#1E88E5]' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Theme Settings Widget for Mobile */}
              <div className="mt-4 p-3 bg-slate-50 dark:bg-[#0c101d] rounded-xl border border-slate-150 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1"><Palette className="w-3 h-3" /> TEMA</span>
                  <button 
                    onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-all cursor-pointer"
                  >
                    {themeMode === 'light' ? <Moon className="w-3.5 h-3.5 text-slate-500" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                </div>
                <div className="flex items-center justify-between gap-1">
                  {(['blue', 'green', 'red', 'purple', 'gray'] as const).map((color) => {
                    const colorBgMap = {
                      blue: 'bg-blue-500',
                      green: 'bg-green-500',
                      red: 'bg-red-500',
                      purple: 'bg-purple-500',
                      gray: 'bg-gray-500'
                    };
                    return (
                      <button
                        key={color}
                        onClick={() => setThemeColor(color)}
                        className={`w-4 h-4 rounded-full ${colorBgMap[color]} transition-all cursor-pointer ${
                          themeColor === color ? 'ring-2 ring-offset-2 ring-slate-400' : 'opacity-70'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Footer inside drawer */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-4 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-700 dark:text-slate-300 font-bold block">{user?.displayName || "Operator"}</span>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">{user?.role === 'admin' ? 'Administrator' : 'Staf Operator'}</span>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Apakah Anda yakin ingin keluar dari sistem?")) {
                      setIsMobileMenuOpen(false);
                      logout();
                    }
                  }}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function App() {
  return (
    <StateProvider>
      <AppContent />
    </StateProvider>
  );
}
