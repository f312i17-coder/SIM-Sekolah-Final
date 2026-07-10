import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Siswa, 
  SiswaNilai, 
  Mutasi, 
  BukuIndukRecord, 
  SPMBRecord, 
  ArsipDokumen, 
  SchoolSettings,
  UserProfile,
  MapelGrades,
  SuratTemplate,
  SuratArsip,
  AgendaItem,
  Pegawai,
  ArsipPegawai
} from '../types';
import { dbService } from './db';
import { auth as firebaseAuth, firebaseUtils } from './firebase';
const { isFirebaseConfigured } = firebaseUtils;
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as fbSignOut, User } from 'firebase/auth';

const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`LocalStorage write failed for key "${key}":`, error);
  }
};

interface StateContextType {
  user: UserProfile | null;
  loading: boolean;
  schoolSettings: SchoolSettings;
  siswaList: Siswa[];
  gradesList: SiswaNilai[];
  mutasiList: Mutasi[];
  bukuIndukList: BukuIndukRecord[];
  spmbList: SPMBRecord[];
  arsipList: ArsipDokumen[];
  suratTemplates: SuratTemplate[];
  suratArsipList: SuratArsip[];
  agendaList: AgendaItem[];
  pegawaiList: Pegawai[];
  
  // Navigation
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  selectedSiswaId: string | null;
  setSelectedSiswaId: (id: string | null) => void;

  // Actions
  loginWithGoogle: () => Promise<void>;
  loginAsDemo: (role: 'admin' | 'operator') => void;
  loginWithUsernamePassword: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  changeAdminCredentials: (newUsername: string, newPassword: string) => Promise<void>;
  getAdminUsername: () => string;
  logout: () => Promise<void>;
  
  updateSchoolSettings: (settings: SchoolSettings) => Promise<void>;
  
  saveSiswa: (siswa: Siswa) => Promise<void>;
  deleteSiswa: (id: string) => Promise<void>;
  
  getGradesForSiswa: (siswaId: string) => Promise<SiswaNilai>;
  saveGrades: (grades: SiswaNilai) => Promise<void>;
  
  saveMutasi: (mutasi: Mutasi) => Promise<void>;
  deleteMutasi: (id: string) => Promise<void>;
  
  getBukuIndukForSiswa: (siswaId: string) => Promise<BukuIndukRecord>;
  saveBukuIndukRecord: (record: BukuIndukRecord) => Promise<void>;
  
  saveSPMB: (record: SPMBRecord) => Promise<void>;
  deleteSPMB: (id: string) => Promise<void>;
  approveSPMBToSiswa: (id: string) => Promise<void>;
  
  getArsipForSiswa: (siswaId: string) => Promise<ArsipDokumen[]>;
  saveArsip: (docRecord: ArsipDokumen) => Promise<void>;
  deleteArsip: (id: string) => Promise<void>;

  saveSuratTemplate: (template: SuratTemplate) => Promise<void>;
  saveSuratArsip: (surat: SuratArsip) => Promise<void>;
  deleteSuratArsip: (id: string) => Promise<void>;
  
  saveAgendaItem: (agenda: AgendaItem) => Promise<void>;
  deleteAgendaItem: (id: string) => Promise<void>;

  savePegawai: (record: Pegawai) => Promise<void>;
  deletePegawai: (id: string) => Promise<void>;
  getArsipPegawaiList: (pegawaiId: string) => Promise<ArsipPegawai[]>;
  saveArsipPegawai: (record: ArsipPegawai) => Promise<void>;
  deleteArsipPegawai: (id: string) => Promise<void>;
  
  backupData: () => string;
  restoreData: (json: string) => Promise<boolean>;
  
  isFirebaseActive: boolean;
  refreshAllData: () => Promise<void>;

  // Theme settings
  themeMode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark') => void;
  themeColor: 'blue_gold' | 'blue_royal' | 'green_emerald' | 'maroon' | 'purple_elegant' | 'blue' | 'green' | 'red' | 'purple' | 'gray';
  setThemeColor: (color: 'blue_gold' | 'blue_royal' | 'green_emerald' | 'maroon' | 'purple_elegant' | 'blue' | 'green' | 'red' | 'purple' | 'gray') => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

const DEFAULT_SURAT_TEMPLATES: SuratTemplate[] = [
  { id: "t1", nama: "Surat Keterangan Aktif Sekolah", kode: "SK-AKTIF", formatNomor: "421.3/[NOMOR]/SMPN1-R/2026", content: "Menerangkan bahwa siswa yang bersangkutan adalah benar-benar siswa aktif di SMP Negeri 1 Rangsang Tahun Pelajaran [TP]." },
  { id: "t2", nama: "Surat Keterangan Lulus", kode: "SKL", formatNomor: "421.3/[NOMOR]/SKL/SMPN1-R/2026", content: "Menyatakan bahwa siswa yang bersangkutan telah memenuhi seluruh kriteria kelulusan dan dinyatakan LULUS dari SMP Negeri 1 Rangsang." },
  { id: "t3", nama: "Surat Pindah Sekolah", kode: "SK-PINDAH", formatNomor: "421.3/[NOMOR]/SP/SMPN1-R/2026", content: "Menyatakan bahwa siswa tersebut pindah atas permintaan orang tua ke sekolah tujuan yang baru." },
  { id: "t4", nama: "Surat Mutasi Masuk", kode: "MUTASI-MASUK", formatNomor: "421.3/[NOMOR]/MM/SMPN1-R/2026", content: "Surat keterangan penerimaan mutasi masuk dari sekolah asal." },
  { id: "t5", nama: "Surat Mutasi Keluar", kode: "MUTASI-KELUAR", formatNomor: "421.3/[NOMOR]/MK/SMPN1-R/2026", content: "Surat keterangan persetujuan mutasi keluar siswa ke sekolah tujuan." },
  { id: "t6", nama: "Surat Kelakuan Baik", kode: "KELAKUAN-BAIK", formatNomor: "421.3/[NOMOR]/SKKB/SMPN1-R/2026", content: "Menerangkan bahwa siswa yang bersangkutan berkelakuan baik, rajin, dan tidak pernah melakukan pelanggaran berat di sekolah." },
  { id: "t7", nama: "Surat Izin Penelitian", kode: "IZIN-PENELITIAN", formatNomor: "421.3/[NOMOR]/IP/SMPN1-R/2026", content: "Memberikan izin kepada mahasiswa/peneliti untuk melakukan riset atau observasi di lingkungan SMP Negeri 1 Rangsang." },
  { id: "t8", nama: "Surat Rekomendasi", kode: "REKOMENDASI", formatNomor: "421.3/[NOMOR]/SR/SMPN1-R/2026", content: "Surat rekomendasi untuk mengikuti kegiatan, beasiswa, atau melanjutkan pendidikan ke jenjang berikutnya." },
  { id: "t9", nama: "Surat Keterangan Kehilangan", kode: "KEHILANGAN", formatNomor: "421.3/[NOMOR]/SKK/SMPN1-R/2026", content: "Menerangkan perihal kehilangan dokumen penting milik siswa seperti kartu pelajar atau ijazah asli." },
  { id: "t10", nama: "Surat Keterangan Prestasi", kode: "PRESTASI", formatNomor: "421.3/[NOMOR]/SKP/SMPN1-R/2026", content: "Menerangkan rincian prestasi akademik maupun non-akademik yang telah dicapai siswa selama di sekolah." },
  { id: "t11", nama: "Surat Dispensasi", kode: "DISPENSASI", formatNomor: "421.3/[NOMOR]/DISP/SMPN1-R/2026", content: "Memberikan dispensasi/izin meninggalkan kegiatan belajar mengajar sementara waktu karena mengikuti tugas kedinasan atau perlombaan." },
  { id: "t12", nama: "Surat Pernyataan Orang Tua", kode: "PERNYATAAN-ORTU", formatNomor: "-/Pernyataan/2026", content: "Surat pernyataan orang tua/wali siswa mengenai kepatuhan aturan sekolah, persetujuan kegiatan, atau pembiayaan." },
  { id: "t13", nama: "Surat Undangan Orang Tua", kode: "UNDANGAN-ORTU", formatNomor: "005/[NOMOR]/SMPN1-R/2026", content: "Mengundang orang tua/wali murid untuk menghadiri rapat komite, pembagian rapor, atau acara resmi sekolah lainnya." },
  { id: "t14", nama: "Surat Pemanggilan Orang Tua", kode: "PANGGILAN-ORTU", formatNomor: "421.3/[NOMOR]/SP-ORTU/SMPN1-R/2026", content: "Memanggil orang tua/wali murid ke sekolah untuk berkonsultasi mengenai masalah disiplin, kehadiran, atau bimbingan konseling siswa." },
  { id: "t15", nama: "Surat Keterangan Siswa Aktif", kode: "SISWA-AKTIF", formatNomor: "421.3/[NOMOR]/SSA/SMPN1-R/2026", content: "Surat keterangan resmi yang menyatakan status siswa yang bersangkutan masih aktif menempuh pendidikan." },
  { id: "t16", nama: "Surat Keterangan Alumni", kode: "ALUMNI", formatNomor: "421.3/[NOMOR]/ALUMNI/SMPN1-R/2026", content: "Surat keterangan alumni yang menerangkan status lulusan bersangkutan yang merupakan alumni resmi SMP Negeri 1 Rangsang." }
];

const THEME_COLORS = {
  blue_gold: {
    50: '#fdfbf7',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#1e88e5',
    600: '#1565c0',
    700: '#d4af37',
    800: '#b5902b',
    900: '#8f6f1c',
  },
  blue_royal: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#1e88e5',
    600: '#1565c0',
    700: '#0d47a1',
    800: '#0a3578',
    900: '#072350',
  },
  green_emerald: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  maroon: {
    50: '#fff5f5',
    100: '#ffe3e3',
    200: '#ffc9c9',
    300: '#ffa8a8',
    400: '#ff8787',
    500: '#991b1b',
    600: '#851414',
    700: '#700f0f',
    800: '#5c0a0a',
    900: '#450000',
  },
  purple_elegant: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#7c3aed',
    600: '#6d28d9',
    700: '#5b21b6',
    800: '#4c1d95',
    900: '#3b0764',
  },
  blue: {
    50: '#f0f7ff',
    100: '#e0effe',
    200: '#bae0fd',
    300: '#7cc8fc',
    400: '#38adf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#07557d',
    900: '#0c4a6e',
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
};

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Theme states
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    // Force light mode by default so the app is immediately bright and beautiful
    localStorage.setItem('sim_theme_mode', 'light');
    return 'light';
  });
  const [themeColor, setThemeColor] = useState<'blue_gold' | 'blue_royal' | 'green_emerald' | 'maroon' | 'purple_elegant' | 'blue' | 'green' | 'red' | 'purple' | 'gray'>(() => {
    return (localStorage.getItem('sim_theme_color') as any) || 'blue_gold';
  });

  useEffect(() => {
    localStorage.setItem('sim_theme_mode', themeMode);
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('sim_theme_color', themeColor);
    const colors = THEME_COLORS[themeColor];
    if (colors) {
      Object.entries(colors).forEach(([key, val]) => {
        document.documentElement.style.setProperty(`--color-brand-${key}`, val as string);
      });
    }
  }, [themeColor]);
  
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>({
    namaSekolah: "SMP Negeri 1 Rangsang",
    npsn: "10403328",
    nss: "201090311001",
    statusSekolah: "Negeri",
    akreditasi: "A",
    alamat: "Jl. Pelajar, Kecamatan Rangsang, Kabupaten Kepulauan Meranti, Provinsi Riau",
    desa: "Tanjung Samak",
    kecamatan: "Rangsang",
    kabupaten: "Kepulauan Meranti",
    provinsi: "Riau",
    kodePos: "28755",
    noTelepon: "08123456789",
    email: "smpn1rangsang@yahoo.co.id",
    website: "smpn1rangsang.sch.id",
    kepalaSekolah: "Drs. H. Syamsuddin, M.Pd.",
    nipKepalaSekolah: "197205151998031004",
    operatorName: "Yudi Hartono, S.Pd.",
    tahunPelajaran: "2025/2026",
    semester: "Ganjil",
    visi: "Unggul dalam prestasi, luhur dalam budi pekerti, dan berwawasan lingkungan.",
    misi: "1. Melaksanakan pembelajaran dan bimbingan secara efektif.\n2. Menumbuhkan penghayatan terhadap ajaran agama.\n3. Menerapkan manajemen partisipatif dengan melibatkan seluruh warga sekolah.",
    motto: "KERAS: Kreatif, Edukatif, Religius, Amanah, Sinergis",
    logoPemkab: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Coat_of_arms_of_Riau_Province.png",
    logoDinas: "",
    logoSekolah: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80",
    stempelSekolah: "",
    tandaTanganKepala: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Glowacki_Signature.png",
    tandaTanganOperator: "",
    masaBerlakuKartu: "Selama Menjadi Siswa",
    warnaKartu: "#0f172a",
    templateKartu: "Klasik Profesional",
    waliKelas: {
      'VII-1': 'Sri Wahyuni, S.Pd.',
      'VII-2': 'Rahmad Hidayat, M.Pd.',
      'VII-3': 'Supardi, S.Pd.',
      'VIII-1': 'Yuliana Hartono, S.S.',
      'VIII-2': 'Budi Pratama, S.Si.',
      'VIII-3': 'Siti Rahma, S.Pd.I.',
      'IX-1': 'Drs. H. Syamsuddin, M.Pd.',
      'IX-2': 'Bella Safitri, S.Kom.',
      'IX-3': 'Yudi Hartono, S.Pd.'
    }
  });
  
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [gradesList, setGradesList] = useState<SiswaNilai[]>([]);
  const [mutasiList, setMutasiList] = useState<Mutasi[]>([]);
  const [bukuIndukList, setBukuIndukList] = useState<BukuIndukRecord[]>([]);
  const [spmbList, setSpmbList] = useState<SPMBRecord[]>([]);
  const [arsipList, setArsipList] = useState<ArsipDokumen[]>([]);
  const [suratTemplates, setSuratTemplates] = useState<SuratTemplate[]>([]);
  const [suratArsipList, setSuratArsipList] = useState<SuratArsip[]>([]);
  const [agendaList, setAgendaList] = useState<AgendaItem[]>([]);
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [selectedSiswaId, setSelectedSiswaId] = useState<string | null>(null);

  // Load all initial data from dbService
  const loadAllData = async () => {
    try {
      const settings = await dbService.getSchoolSettings();
      // Ensure all school settings fields are initialized correctly
      setSchoolSettings({
        namaSekolah: settings.namaSekolah || "SMP Negeri 1 Rangsang",
        npsn: settings.npsn || "10403328",
        nss: settings.nss || "201090311001",
        statusSekolah: settings.statusSekolah || "Negeri",
        akreditasi: settings.akreditasi || "A",
        alamat: settings.alamat || "Jl. Pelajar, Kecamatan Rangsang, Kabupaten Kepulauan Meranti, Provinsi Riau",
        desa: settings.desa || "Tanjung Samak",
        kecamatan: settings.kecamatan || "Rangsang",
        kabupaten: settings.kabupaten || "Kepulauan Meranti",
        provinsi: settings.provinsi || "Riau",
        kodePos: settings.kodePos || "28755",
        noTelepon: settings.noTelepon || "08123456789",
        email: settings.email || "smpn1rangsang@yahoo.co.id",
        website: settings.website || "smpn1rangsang.sch.id",
        kepalaSekolah: settings.kepalaSekolah || "Drs. H. Syamsuddin, M.Pd.",
        nipKepalaSekolah: settings.nipKepalaSekolah || "197205151998031004",
        operatorName: settings.operatorName || "Yudi Hartono, S.Pd.",
        tahunPelajaran: settings.tahunPelajaran || "2025/2026",
        semester: settings.semester || "Ganjil",
        visi: settings.visi || "Unggul dalam prestasi, luhur dalam budi pekerti, dan berwawasan lingkungan.",
        misi: settings.misi || "1. Melaksanakan pembelajaran dan bimbingan secara efektif.\n2. Menumbuhkan penghayatan terhadap ajaran agama.\n3. Menerapkan manajemen partisipatif dengan melibatkan seluruh warga sekolah.",
        motto: settings.motto || "KERAS: Kreatif, Edukatif, Religius, Amanah, Sinergis",
        logoPemkab: settings.logoPemkab || "https://upload.wikimedia.org/wikipedia/commons/e/ee/Coat_of_arms_of_Riau_Province.png",
        logoDinas: settings.logoDinas || "",
        logoSekolah: settings.logoSekolah || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80",
        stempelSekolah: settings.stempelSekolah || "",
        tandaTanganKepala: settings.tandaTanganKepala || "https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Glowacki_Signature.png",
        tandaTanganOperator: settings.tandaTanganOperator || "",
        masaBerlakuKartu: settings.masaBerlakuKartu || "Selama Menjadi Siswa",
        warnaKartu: settings.warnaKartu || "#0f172a",
        templateKartu: settings.templateKartu || "Klasik Profesional",
        waliKelas: settings.waliKelas || {
          'VII-1': 'Sri Wahyuni, S.Pd.',
          'VII-2': 'Rahmad Hidayat, M.Pd.',
          'VII-3': 'Supardi, S.Pd.',
          'VIII-1': 'Yuliana Hartono, S.S.',
          'VIII-2': 'Budi Pratama, S.Si.',
          'VIII-3': 'Siti Rahma, S.Pd.I.',
          'IX-1': 'Drs. H. Syamsuddin, M.Pd.',
          'IX-2': 'Bella Safitri, S.Kom.',
          'IX-3': 'Yudi Hartono, S.Pd.'
        }
      });

      const siswa = await dbService.getSiswaList();
      setSiswaList(siswa);

      const grades = await dbService.getGradesList();
      setGradesList(grades);

      const mutasi = await dbService.getMutasiList();
      setMutasiList(mutasi);

      const bukuInduk = await dbService.getBukuIndukRecords();
      setBukuIndukList(bukuInduk);

      const spmb = await dbService.getSPMBList();
      setSpmbList(spmb);
      
      const localArsip = JSON.parse(localStorage.getItem("sim_arsip") || "[]");
      setArsipList(localArsip);

      // Load templates
      const templatesStr = localStorage.getItem("sim_surat_templates");
      if (templatesStr) {
        setSuratTemplates(JSON.parse(templatesStr));
      } else {
        safeSetItem("sim_surat_templates", JSON.stringify(DEFAULT_SURAT_TEMPLATES));
        setSuratTemplates(DEFAULT_SURAT_TEMPLATES);
      }

      // Load surat arsip
      const arsipSuratStr = localStorage.getItem("sim_surat_arsip");
      if (arsipSuratStr) {
        setSuratArsipList(JSON.parse(arsipSuratStr));
      } else {
        safeSetItem("sim_surat_arsip", JSON.stringify([]));
        setSuratArsipList([]);
      }

      // Load agendas
      const agendas = await dbService.getAgendaList();
      setAgendaList(agendas);

      // Load pegawais
      const pegawais = await dbService.getPegawaiList();
      setPegawaiList(pegawais);
    } catch (error) {
      console.error("Failed to load databases:", error);
    }
  };

  useEffect(() => {
    // Check local credential defaults
    if (!localStorage.getItem("sim_admin_username")) {
      safeSetItem("sim_admin_username", "admin");
    }
    if (!localStorage.getItem("sim_admin_password")) {
      safeSetItem("sim_admin_password", "admin");
    }

    // Auth Listener
    if (isFirebaseConfigured && firebaseAuth) {
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser: User | null) => {
        if (fbUser) {
          const profile: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || "Administrator",
            photoURL: fbUser.photoURL,
            role: fbUser.email?.includes('admin') || fbUser.email === 'yunefri17@gmail.com' ? 'admin' : 'operator'
          };
          setUser(profile);
        } else {
          // Check Remember Me or demo session
          const remembered = localStorage.getItem("sim_remember_me") === "true";
          const sessionUser = sessionStorage.getItem("sim_demo_user");
          if (remembered && localStorage.getItem("sim_remembered_profile")) {
            setUser(JSON.parse(localStorage.getItem("sim_remembered_profile") || "null"));
          } else if (sessionUser) {
            setUser(JSON.parse(sessionUser));
          } else {
            setUser(null);
          }
        }
        await loadAllData();
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Offline mode
      const remembered = localStorage.getItem("sim_remember_me") === "true";
      const sessionUser = sessionStorage.getItem("sim_demo_user");
      if (remembered && localStorage.getItem("sim_remembered_profile")) {
        setUser(JSON.parse(localStorage.getItem("sim_remembered_profile") || "null"));
      } else if (sessionUser) {
        setUser(JSON.parse(sessionUser));
      }
      loadAllData().finally(() => setLoading(false));
    }
  }, []);

  // 1. AUTH FUNCTIONS
  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && firebaseAuth) {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(firebaseAuth, provider);
        const fbUser = result.user;
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
          role: fbUser.email === 'yunefri17@gmail.com' || fbUser.email?.includes('admin') ? 'admin' : 'operator'
        };
        setUser(profile);
        safeSetItem("sim_remember_me", "true");
        safeSetItem("sim_remembered_profile", JSON.stringify(profile));
      } catch (error) {
        console.error("Google login failed:", error);
        alert("Gagal login dengan Google. Menggunakan mode demonstrasi.");
      }
    } else {
      alert("Firebase belum terkonfigurasi. Silakan login menggunakan Username/Password.");
    }
  };

  const loginAsDemo = (role: 'admin' | 'operator') => {
    const profile: UserProfile = {
      uid: `demo-${role}`,
      email: `${role}@kesiswaan.smp.sch.id`,
      displayName: `Petugas TU (${role === 'admin' ? 'Administrator' : 'Staf Operator'})`,
      photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      role: role
    };
    setUser(profile);
    sessionStorage.setItem("sim_demo_user", JSON.stringify(profile));
  };

  const loginWithUsernamePassword = async (usernameInput: string, passwordInput: string): Promise<{ success: boolean; message: string }> => {
    // Lockout check
    const lockUntilStr = localStorage.getItem("sim_login_lock_until");
    if (lockUntilStr) {
      const lockUntil = new Date(lockUntilStr);
      if (lockUntil > new Date()) {
        const remainingSeconds = Math.ceil((lockUntil.getTime() - new Date().getTime()) / 1000);
        const remainingMinutes = Math.ceil(remainingSeconds / 60);
        return { 
          success: false, 
          message: `Akun terkunci karena salah password 5 kali berturut-turut. Silakan coba lagi dalam ${remainingMinutes} menit.` 
        };
      }
    }

    const correctUsername = localStorage.getItem("sim_admin_username") || "admin";
    const correctPassword = localStorage.getItem("sim_admin_password") || "admin";

    if (usernameInput === correctUsername && passwordInput === correctPassword) {
      safeSetItem("sim_login_failed_attempts", "0");
      localStorage.removeItem("sim_login_lock_until");

      const profile: UserProfile = {
        uid: "admin-local",
        email: "admin@smpn1rangsang.sch.id",
        displayName: "Administrator SMPN 1 Rangsang",
        photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
        role: "admin"
      };

      setUser(profile);
      sessionStorage.setItem("sim_demo_user", JSON.stringify(profile));
      return { success: true, message: "Login Berhasil" };
    } else {
      const attemptsStr = localStorage.getItem("sim_login_failed_attempts") || "0";
      const attempts = parseInt(attemptsStr) + 1;
      safeSetItem("sim_login_failed_attempts", attempts.toString());

      if (attempts >= 5) {
        const lockUntilDate = new Date(new Date().getTime() + 15 * 60 * 1000); // 15 min lock
        safeSetItem("sim_login_lock_until", lockUntilDate.toISOString());
        return {
          success: false,
          message: "Password salah 5 kali berturut-turut. Akun Anda dikunci selama 15 menit."
        };
      } else {
        return {
          success: false,
          message: `Username atau Password salah. Sisa percobaan: ${5 - attempts}`
        };
      }
    }
  };

  const changeAdminCredentials = async (newUsername: string, newPassword: string): Promise<void> => {
    safeSetItem("sim_admin_username", newUsername);
    safeSetItem("sim_admin_password", newPassword);
  };

  const getAdminUsername = (): string => {
    return localStorage.getItem("sim_admin_username") || "admin";
  };

  const logout = async () => {
    if (isFirebaseConfigured && firebaseAuth) {
      await fbSignOut(firebaseAuth);
    }
    setUser(null);
    sessionStorage.removeItem("sim_demo_user");
  };

  // 2. SETTINGS
  const updateSchoolSettings = async (settings: SchoolSettings) => {
    setSchoolSettings(settings);
    await dbService.saveSchoolSettings(settings);
  };

  const saveSuratTemplate = async (template: SuratTemplate) => {
    const updated = suratTemplates.map(t => t.id === template.id ? template : t);
    if (!updated.find(t => t.id === template.id)) {
      updated.push(template);
    }
    setSuratTemplates(updated);
    safeSetItem("sim_surat_templates", JSON.stringify(updated));
  };

  const saveSuratArsip = async (surat: SuratArsip) => {
    const updated = suratArsipList.map(s => s.id === surat.id ? surat : s);
    if (!updated.find(s => s.id === surat.id)) {
      updated.push(surat);
    }
    setSuratArsipList(updated);
    safeSetItem("sim_surat_arsip", JSON.stringify(updated));
  };

  const deleteSuratArsip = async (id: string) => {
    const updated = suratArsipList.filter(s => s.id !== id);
    setSuratArsipList(updated);
    safeSetItem("sim_surat_arsip", JSON.stringify(updated));
  };

  // 2.5. ACADEMIC CALENDAR AGENDA
  const saveAgendaItem = async (agenda: AgendaItem) => {
    await dbService.saveAgendaItem(agenda);
    setAgendaList(prev => {
      const index = prev.findIndex(item => item.id === agenda.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = agenda;
        return next;
      }
      return [...prev, agenda];
    });
  };

  const deleteAgendaItem = async (id: string) => {
    await dbService.deleteAgendaItem(id);
    setAgendaList(prev => prev.filter(item => item.id !== id));
  };

  // 3. SISWA
  const saveSiswa = async (siswa: Siswa) => {
    await dbService.saveSiswa(siswa);
    setSiswaList(prev => {
      const index = prev.findIndex(item => item.id === siswa.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = siswa;
        return next;
      }
      return [...prev, siswa];
    });
  };

  const deleteSiswa = async (id: string) => {
    await dbService.deleteSiswa(id);
    setSiswaList(prev => prev.filter(item => item.id !== id));
  };

  // 4. GRADES
  const getGradesForSiswa = async (siswaId: string) => {
    return await dbService.getGradesForSiswa(siswaId);
  };

  const saveGrades = async (grades: SiswaNilai) => {
    await dbService.saveGrades(grades);
    setGradesList(prev => {
      const index = prev.findIndex(item => item.siswaId === grades.siswaId);
      if (index >= 0) {
        const next = [...prev];
        next[index] = grades;
        return next;
      }
      return [...prev, grades];
    });
  };

  // 5. MUTASI
  const saveMutasi = async (mutasi: Mutasi) => {
    await dbService.saveMutasi(mutasi);
    setMutasiList(prev => {
      const index = prev.findIndex(item => item.id === mutasi.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = mutasi;
        return next;
      }
      return [...prev, mutasi];
    });

    // Automatically update related student active status based on mutation
    const matchingSiswa = siswaList.find(s => s.id === mutasi.siswaId);
    if (matchingSiswa) {
      const updatedSiswa: Siswa = {
        ...matchingSiswa,
        statusAktif: mutasi.jenis === 'Keluar' ? 'Mutasi Keluar' : 'Aktif',
        kelas: mutasi.jenis === 'Masuk' ? mutasi.kelasSaatMutasi : matchingSiswa.kelas
      };
      await saveSiswa(updatedSiswa);
    } else if (mutasi.jenis === 'Masuk') {
      // Create new student record for Mutasi Masuk
      const newSiswa: Siswa = {
        id: mutasi.siswaId,
        foto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        nis: mutasi.nis,
        nisn: mutasi.nisn,
        nama: mutasi.siswaNama,
        jk: "L", // Default
        tempatLahir: "-",
        tanggalLahir: "2012-01-01",
        agama: "Islam",
        alamat: "-",
        rtRw: "-",
        desa: "-",
        kecamatan: "-",
        kabupaten: "-",
        provinsi: "-",
        namaAyah: "-",
        namaIbu: "-",
        namaWali: "-",
        pekerjaanOrtu: "-",
        noHp: "-",
        kip: "-",
        pkh: "-",
        noKk: "-",
        noAkta: "-",
        statusAktif: "Aktif",
        kelas: mutasi.kelasSaatMutasi,
        tahunMasuk: schoolSettings.tahunPelajaran.split('/')[0]
      };
      await saveSiswa(newSiswa);
    }
  };

  const deleteMutasi = async (id: string) => {
    await dbService.deleteMutasi(id);
    setMutasiList(prev => prev.filter(item => item.id !== id));
  };

  // 6. BUKU INDUK
  const getBukuIndukForSiswa = async (siswaId: string) => {
    return await dbService.getBukuIndukForSiswa(siswaId);
  };

  const saveBukuIndukRecord = async (record: BukuIndukRecord) => {
    await dbService.saveBukuIndukRecord(record);
    setBukuIndukList(prev => {
      const index = prev.findIndex(item => item.siswaId === record.siswaId);
      if (index >= 0) {
        const next = [...prev];
        next[index] = record;
        return next;
      }
      return [...prev, record];
    });
  };

  // 7. SPMB
  const saveSPMB = async (record: SPMBRecord) => {
    await dbService.saveSPMB(record);
    setSpmbList(prev => {
      const index = prev.findIndex(item => item.id === record.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = record;
        return next;
      }
      return [...prev, record];
    });
  };

  const deleteSPMB = async (id: string) => {
    await dbService.deleteSPMB(id);
    setSpmbList(prev => prev.filter(item => item.id !== id));
  };

  const approveSPMBToSiswa = async (id: string) => {
    const applicant = spmbList.find(a => a.id === id);
    if (!applicant) return;

    // 1. Update SPMB status to "Diterima"
    const updatedApplicant: SPMBRecord = {
      ...applicant,
      status: 'Diterima',
      biayaDaftarUlangLunas: true
    };
    await saveSPMB(updatedApplicant);

    // 2. Automatically generate NIS (derived from year + running index)
    const currentYearShort = schoolSettings.tahunPelajaran.split('/')[0].slice(2, 4);
    const existingActiveInYear = siswaList.filter(s => s.nis.startsWith(currentYearShort));
    const runningIndex = String(existingActiveInYear.length + 1).padStart(3, '0');
    const generatedNis = `${currentYearShort}${currentYearShort + 2}07${runningIndex}`; // pattern: YY-YY-07-index

    // 3. Create active Student (Data Siswa) record
    const newSiswaId = `siswa-spmb-${applicant.id}`;
    const newSiswa: Siswa = {
      id: newSiswaId,
      foto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80", // Default placeholder
      nis: generatedNis,
      nisn: applicant.nisn,
      nama: applicant.nama,
      jk: applicant.jk,
      tempatLahir: applicant.tempatLahir,
      tanggalLahir: applicant.tanggalLahir,
      agama: applicant.agama,
      alamat: applicant.alamat,
      rtRw: "-",
      desa: "-",
      kecamatan: "-",
      kabupaten: "-",
      provinsi: "-",
      namaAyah: applicant.namaAyah,
      namaIbu: applicant.namaIbu,
      namaWali: "-",
      pekerjaanOrtu: "-",
      noHp: applicant.noHp,
      kip: "-",
      pkh: "-",
      noKk: "-",
      noAkta: "-",
      statusAktif: "Aktif",
      kelas: "VII", // New students enter Class VII
      tahunMasuk: schoolSettings.tahunPelajaran.split('/')[0]
    };
    await saveSiswa(newSiswa);

    // 4. Create Buku Induk Record
    const blankKehadiran = { sakit: 0, izin: 0, alfa: 0 };
    const newBukuInduk: BukuIndukRecord = {
      siswaId: newSiswaId,
      riwayatKelas: [
        { tahunPelajaran: schoolSettings.tahunPelajaran, kelas: "VII", status: "Aktif" }
      ],
      prestasi: [],
      pelanggaran: [],
      ekstrakurikuler: [],
      kehadiran: {
        "1": { ...blankKehadiran },
        "2": { ...blankKehadiran },
        "3": { ...blankKehadiran },
        "4": { ...blankKehadiran },
        "5": { ...blankKehadiran },
        "6": { ...blankKehadiran }
      }
    };
    await saveBukuIndukRecord(newBukuInduk);

    // 5. Create grades entry (pre-populated with 0 scores)
    const emptyGrades: MapelGrades = { pai: 0, ppkn: 0, indo: 0, mtk: 0, ipa: 0, ips: 0, inggris: 0, seni: 0, pjok: 0, tik: 0, mulok: 0 };
    const newGrades: SiswaNilai = {
      siswaId: newSiswaId,
      s1: { ...emptyGrades },
      s2: { ...emptyGrades },
      s3: { ...emptyGrades },
      s4: { ...emptyGrades },
      s5: { ...emptyGrades },
      s6: { ...emptyGrades },
      ujianSekolah: { ...emptyGrades }
    };
    await saveGrades(newGrades);

    // 6. Pre-add a welcome digital folder archive record
    const welcomeDoc: ArsipDokumen = {
      id: `arsip-welcome-${applicant.id}`,
      siswaId: newSiswaId,
      namaDokumen: "Surat Keterangan",
      fileName: "berkas_penerimaan_spmb.pdf",
      fileType: "application/pdf",
      fileData: "PDF_WELCOME_MOCK",
      uploadedAt: new Date().toISOString().split('T')[0],
      keterangan: "Surat bukti kelulusan seleksi SPMB online."
    };
    await saveArsip(welcomeDoc);
  };

  // 8. ARSIP DOKUMEN DIGITAL
  const getArsipForSiswa = async (siswaId: string) => {
    return arsipList.filter(item => item.siswaId === siswaId);
  };

  const saveArsip = async (docRecord: ArsipDokumen) => {
    await dbService.saveArsip(docRecord);
    setArsipList(prev => {
      const index = prev.findIndex(item => item.id === docRecord.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = docRecord;
        return next;
      }
      return [...prev, docRecord];
    });
  };

  const deleteArsip = async (id: string) => {
    await dbService.deleteArsip(id);
    setArsipList(prev => prev.filter(item => item.id !== id));
  };

  // 10. KEPEGAWAIAN (GURU & TENDIK)
  const savePegawai = async (record: Pegawai) => {
    await dbService.savePegawai(record);
    setPegawaiList(prev => {
      const index = prev.findIndex(item => item.id === record.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = record;
        return next;
      }
      return [...prev, record];
    });
  };

  const deletePegawai = async (id: string) => {
    await dbService.deletePegawai(id);
    setPegawaiList(prev => prev.filter(item => item.id !== id));
  };

  const getArsipPegawaiList = async (pegawaiId: string) => {
    return await dbService.getArsipPegawaiList(pegawaiId);
  };

  const saveArsipPegawai = async (record: ArsipPegawai) => {
    await dbService.saveArsipPegawai(record);
  };

  const deleteArsipPegawai = async (id: string) => {
    await dbService.deleteArsipPegawai(id);
  };

  // 9. BACKUP AND RESTORE
  const backupData = () => {
    return dbService.backupDatabase();
  };

  const restoreData = async (json: string): Promise<boolean> => {
    const success = await dbService.restoreDatabase(json);
    if (success) {
      await loadAllData();
    }
    return success;
  };

  const refreshAllData = async () => {
    setLoading(true);
    await loadAllData();
    setLoading(false);
  };

  return (
    <StateContext.Provider value={{
      user,
      loading,
      schoolSettings,
      siswaList,
      gradesList,
      mutasiList,
      bukuIndukList,
      spmbList,
      arsipList,
      suratTemplates,
      suratArsipList,
      agendaList,
      pegawaiList,
      
      activeMenu,
      setActiveMenu,
      selectedSiswaId,
      setSelectedSiswaId,
      
      loginWithGoogle,
      loginAsDemo,
      loginWithUsernamePassword,
      changeAdminCredentials,
      getAdminUsername,
      logout,
      
      updateSchoolSettings,
      
      saveSiswa,
      deleteSiswa,
      
      getGradesForSiswa,
      saveGrades,
      
      saveMutasi,
      deleteMutasi,
      
      getBukuIndukForSiswa,
      saveBukuIndukRecord,
      
      saveSPMB,
      deleteSPMB,
      approveSPMBToSiswa,
      
      getArsipForSiswa,
      saveArsip,
      deleteArsip,

      saveSuratTemplate,
      saveSuratArsip,
      deleteSuratArsip,
      
      saveAgendaItem,
      deleteAgendaItem,

      savePegawai,
      deletePegawai,
      getArsipPegawaiList,
      saveArsipPegawai,
      deleteArsipPegawai,
      
      backupData,
      restoreData,
      
      isFirebaseActive: isFirebaseConfigured,
      refreshAllData,

      // Theme settings
      themeMode,
      setThemeMode,
      themeColor,
      setThemeColor
    }}>
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within a StateProvider');
  }
  return context;
};
