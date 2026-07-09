import { doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, collection, query, where, writeBatch } from 'firebase/firestore';
import { db, isFirebaseConfigured, OperationType, handleFirestoreError } from './firebase';
import { 
  Siswa, 
  SiswaNilai, 
  Mutasi, 
  BukuIndukRecord, 
  SPMBRecord, 
  ArsipDokumen, 
  SchoolSettings,
  MapelGrades,
  AgendaItem,
  Pegawai,
  ArsipPegawai
} from '../types';

const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`LocalStorage write failed for key "${key}":`, error);
  }
};

// ==========================================
// SEED DATA FOR DEMO & LOCAL STORAGE
// ==========================================

const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
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
  
  // Base64 or standard decorative placeholders
  logoPemkab: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Coat_of_arms_of_Riau_Province.png",
  logoDinas: "",
  logoSekolah: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80",
  stempelSekolah: "",
  tandaTanganKepala: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Glowacki_Signature.png",
  tandaTanganOperator: "",
  
  masaBerlakuKartu: "Selama Menjadi Siswa",
  warnaKartu: "#0f172a", // Dark Slate/Navy
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
};

const createInitialGrades = (base: number): MapelGrades => ({
  pai: base + Math.floor(Math.random() * 8),
  ppkn: base + Math.floor(Math.random() * 8),
  indo: base + Math.floor(Math.random() * 8),
  mtk: base + Math.floor(Math.random() * 6),
  ipa: base + Math.floor(Math.random() * 7),
  ips: base + Math.floor(Math.random() * 8),
  inggris: base + Math.floor(Math.random() * 8),
  seni: base + Math.floor(Math.random() * 9),
  pjok: base + Math.floor(Math.random() * 9),
  tik: base + Math.floor(Math.random() * 8),
  mulok: base + Math.floor(Math.random() * 8),
});

const DEFAULT_SISWA: Siswa[] = [
  {
    id: "siswa-01",
    foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    nis: "232409001",
    nisn: "0112837456",
    nama: "Andika Pratama",
    jk: "L",
    tempatLahir: "Jakarta",
    tanggalLahir: "2011-04-12",
    agama: "Islam",
    alamat: "Jl. Kenanga No. 12, RT 03/RW 04",
    rtRw: "03/04",
    desa: "Gambir",
    kecamatan: "Gambir",
    kabupaten: "Jakarta Pusat",
    provinsi: "DKI Jakarta",
    namaAyah: "Budi Pratama",
    namaIbu: "Siti Rahma",
    namaWali: "-",
    pekerjaanOrtu: "PNS",
    noHp: "081234567890",
    kip: "KIP-893718",
    pkh: "-",
    noKk: "3171011204110002",
    noAkta: "3171-LU-12042011-0005",
    statusAktif: "Aktif",
    kelas: "IX-1",
    tahunMasuk: "2023",
    statusKelulusan: "Belum Ditentukan"
  },
  {
    id: "siswa-02",
    foto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    nis: "232409002",
    nisn: "0113847582",
    nama: "Bella Safitri",
    jk: "P",
    tempatLahir: "Bogor",
    tanggalLahir: "2011-08-25",
    agama: "Islam",
    alamat: "Jl. Mawar No. 7, RT 01/RW 02",
    rtRw: "01/02",
    desa: "Kebon Kelapa",
    kecamatan: "Gambir",
    kabupaten: "Jakarta Pusat",
    provinsi: "DKI Jakarta",
    namaAyah: "Rudi Hermawan",
    namaIbu: "Lilis Marlina",
    namaWali: "-",
    pekerjaanOrtu: "Wiraswasta",
    noHp: "081298765432",
    kip: "-",
    pkh: "-",
    noKk: "3171012508110001",
    noAkta: "3171-LU-25082011-0012",
    statusAktif: "Aktif",
    kelas: "IX-2",
    tahunMasuk: "2023",
    statusKelulusan: "Belum Ditentukan"
  },
  {
    id: "siswa-03",
    foto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    nis: "242508001",
    nisn: "0129283745",
    nama: "Candra Wijaya",
    jk: "L",
    tempatLahir: "Bandung",
    tanggalLahir: "2012-01-15",
    agama: "Kristen",
    alamat: "Sawah Besar Indah No. 5B",
    rtRw: "05/08",
    desa: "Sawah Besar",
    kecamatan: "Sawah Besar",
    kabupaten: "Jakarta Pusat",
    provinsi: "DKI Jakarta",
    namaAyah: "Hendra Wijaya",
    namaIbu: "Yanti Maria",
    namaWali: "-",
    pekerjaanOrtu: "Karyawan Swasta",
    noHp: "085612345678",
    kip: "-",
    pkh: "PKH-19283",
    noKk: "3171021501120004",
    noAkta: "3171-LU-15012012-0043",
    statusAktif: "Aktif",
    kelas: "VIII-1",
    tahunMasuk: "2024",
    statusKelulusan: "Belum Ditentukan"
  },
  {
    id: "siswa-04",
    foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    nis: "242508002",
    nisn: "0128374650",
    nama: "Dian Kirana",
    jk: "P",
    tempatLahir: "Surakarta",
    tanggalLahir: "2012-05-30",
    agama: "Islam",
    alamat: "Jl. Melati IV No. 19",
    rtRw: "02/03",
    desa: "Gambir",
    kecamatan: "Gambir",
    kabupaten: "Jakarta Pusat",
    provinsi: "DKI Jakarta",
    namaAyah: "Danu Kirana",
    namaIbu: "Eka Purwanti",
    namaWali: "-",
    pekerjaanOrtu: "Guru",
    noHp: "085712345678",
    kip: "KIP-773641",
    pkh: "-",
    noKk: "3171013005120002",
    noAkta: "3171-LU-30052012-0008",
    statusAktif: "Aktif",
    kelas: "VIII-2",
    tahunMasuk: "2024",
    statusKelulusan: "Belum Ditentukan"
  },
  {
    id: "siswa-05",
    foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    nis: "252607001",
    nisn: "0137364810",
    nama: "Eko Prasetyo",
    jk: "L",
    tempatLahir: "Semarang",
    tanggalLahir: "2013-03-08",
    agama: "Islam",
    alamat: "Jl. Dahlia No. 101, RT 04/RW 05",
    rtRw: "04/05",
    desa: "Duri Pulo",
    kecamatan: "Gambir",
    kabupaten: "Jakarta Pusat",
    provinsi: "DKI Jakarta",
    namaAyah: "Supardi Prasetyo",
    namaIbu: "Sri Wahyuni",
    namaWali: "-",
    pekerjaanOrtu: "Pedagang",
    noHp: "089912345678",
    kip: "-",
    pkh: "-",
    noKk: "3171010803130001",
    noAkta: "3171-LU-08032013-0019",
    statusAktif: "Aktif",
    kelas: "VII-1",
    tahunMasuk: "2025",
    statusKelulusan: "Belum Ditentukan"
  },
  {
    id: "siswa-06",
    foto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
    nis: "252607002",
    nisn: "0138274619",
    nama: "Fitri Handayani",
    jk: "P",
    tempatLahir: "Yogyakarta",
    tanggalLahir: "2013-07-11",
    agama: "Islam",
    alamat: "Jl. Kamboja No. 34, RT 02/RW 06",
    rtRw: "02/06",
    desa: "Cideng",
    kecamatan: "Gambir",
    kabupaten: "Jakarta Pusat",
    provinsi: "DKI Jakarta",
    namaAyah: "Sutarno",
    namaIbu: "Haryati",
    namaWali: "-",
    pekerjaanOrtu: "Buruh",
    noHp: "082112345678",
    kip: "KIP-554231",
    pkh: "PKH-88371",
    noKk: "3171011107130002",
    noAkta: "3171-LU-11072013-0004",
    statusAktif: "Aktif",
    kelas: "VII-2",
    tahunMasuk: "2025",
    statusKelulusan: "Belum Ditentukan"
  },
  {
    id: "siswa-07",
    foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    nis: "222309003",
    nisn: "0102834710",
    nama: "Gilang Ramadhan",
    jk: "L",
    tempatLahir: "Medan",
    tanggalLahir: "2010-09-18",
    agama: "Islam",
    alamat: "Pondok Pinang Raya No. 44",
    rtRw: "08/01",
    desa: "Gambir",
    kecamatan: "Gambir",
    kabupaten: "Jakarta Pusat",
    provinsi: "DKI Jakarta",
    namaAyah: "Achmad Yusuf",
    namaIbu: "Rina Marlina",
    namaWali: "-",
    pekerjaanOrtu: "Wiraswasta",
    noHp: "081312345678",
    kip: "-",
    pkh: "-",
    noKk: "3171011809100003",
    noAkta: "3171-LU-18092010-0081",
    statusAktif: "Lulus",
    kelas: "IX-1",
    tahunMasuk: "2022",
    alumniTahun: "2025",
    statusKelulusan: "Lulus"
  },
  {
    id: "siswa-08",
    foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    nis: "222309004",
    nisn: "0108374612",
    nama: "Hana Lestari",
    jk: "P",
    tempatLahir: "Surabaya",
    tanggalLahir: "2010-12-05",
    agama: "Islam",
    alamat: "Jl. Anggrek No. 12B, Cideng",
    rtRw: "05/02",
    desa: "Cideng",
    kecamatan: "Gambir",
    kabupaten: "Jakarta Pusat",
    provinsi: "DKI Jakarta",
    namaAyah: "Wahyu Lestari",
    namaIbu: "Kartika Sari",
    namaWali: "-",
    pekerjaanOrtu: "Karyawan BUMN",
    noHp: "081412345678",
    kip: "-",
    pkh: "-",
    noKk: "3171010512100001",
    noAkta: "3171-LU-05122010-0023",
    statusAktif: "Lulus",
    kelas: "IX-3",
    tahunMasuk: "2022",
    alumniTahun: "2025",
    statusKelulusan: "Lulus"
  },
  {
    id: "siswa-09",
    foto: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80",
    nis: "242508003",
    nisn: "0117263510",
    nama: "Indra Lesmana",
    jk: "L",
    tempatLahir: "Denpasar",
    tanggalLahir: "2011-11-22",
    agama: "Hindu",
    alamat: "Apartemen Harmoni Tower A Lantai 8",
    rtRw: "01/01",
    desa: "Petojo Utara",
    kecamatan: "Gambir",
    kabupaten: "Jakarta Pusat",
    provinsi: "DKI Jakarta",
    namaAyah: "I Ketut Lesmana",
    namaIbu: "Ni Made Wardani",
    namaWali: "-",
    pekerjaanOrtu: "Arsitek",
    noHp: "081512345678",
    kip: "-",
    pkh: "-",
    noKk: "3171012211110002",
    noAkta: "3171-LU-22112011-0001",
    statusAktif: "Mutasi Keluar",
    kelas: "VIII-1",
    tahunMasuk: "2024",
    statusKelulusan: "Belum Ditentukan"
  },
  {
    id: "siswa-10",
    foto: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    nis: "252607003",
    nisn: "0129384751",
    nama: "Jovanka Putri",
    jk: "P",
    tempatLahir: "Malang",
    tanggalLahir: "2012-10-18",
    agama: "Katolik",
    alamat: "Jl. Teratai Indah No. 89",
    rtRw: "03/07",
    desa: "Kebon Kelapa",
    kecamatan: "Gambir",
    kabupaten: "Jakarta Pusat",
    provinsi: "DKI Jakarta",
    namaAyah: "Markus Sutrisno",
    namaIbu: "Maria Jovita",
    namaWali: "-",
    pekerjaanOrtu: "Dokter",
    noHp: "081612345678",
    kip: "-",
    pkh: "-",
    noKk: "3171011810120005",
    noAkta: "3171-LU-18102012-0012",
    statusAktif: "Aktif",
    kelas: "VII-3",
    tahunMasuk: "2025",
    statusKelulusan: "Belum Ditentukan"
  }
];

const DEFAULT_NILAI: SiswaNilai[] = DEFAULT_SISWA.map(s => {
  const isHigh = s.nama.startsWith("A") || s.nama.startsWith("B") || s.nama.startsWith("J");
  const baseGrade = isHigh ? 84 : 77;
  return {
    siswaId: s.id,
    s1: createInitialGrades(baseGrade),
    s2: createInitialGrades(baseGrade + 1),
    s3: createInitialGrades(baseGrade + Math.floor(Math.random() * 3)),
    s4: createInitialGrades(baseGrade + Math.floor(Math.random() * 3)),
    s5: createInitialGrades(baseGrade + 2),
    s6: createInitialGrades(baseGrade + Math.floor(Math.random() * 4)),
    ujianSekolah: createInitialGrades(baseGrade + Math.floor(Math.random() * 4))
  };
});

const DEFAULT_MUTASI: Mutasi[] = [
  {
    id: "mutasi-01",
    siswaId: "siswa-09",
    siswaNama: "Indra Lesmana",
    nis: "242508003",
    nisn: "0117263510",
    jenis: "Keluar",
    tanggal: "2025-11-10",
    noSurat: "421.3/283/SMP-C/XI/2025",
    sekolahAsalTujuan: "SMP Negeri 2 Denpasar",
    alasan: "Ikut kepindahan dinas orang tua ke Bali",
    kelasSaatMutasi: "VIII"
  },
  {
    id: "mutasi-02",
    siswaId: "siswa-new-mutasi",
    siswaNama: "Rahmat Hidayat",
    nis: "252607999",
    nisn: "0131112223",
    jenis: "Masuk",
    tanggal: "2025-07-20",
    noSurat: "421/102/SMPN3/VII/2025",
    sekolahAsalTujuan: "SMP Negeri 3 Depok",
    alasan: "Pindah domisili orang tua ke Jakarta Pusat",
    kelasSaatMutasi: "VII"
  }
];

const DEFAULT_BUKU_INDUK: BukuIndukRecord[] = DEFAULT_SISWA.map(s => {
  const isMale = s.jk === 'L';
  return {
    siswaId: s.id,
    riwayatKelas: [
      { tahunPelajaran: "2023/2024", kelas: "VII", status: "Naik Kelas" },
      { tahunPelajaran: "2024/2025", kelas: "VIII", status: "Naik Kelas" },
      { tahunPelajaran: "2025/2026", kelas: "IX", status: "Aktif" }
    ],
    prestasi: s.nama.startsWith("A") ? [
      { id: "p1", nama: "Juara 1 Olimpiade Matematika Tingkat Kota", tingkat: "Kota", tahun: "2024", keterangan: "Medali Emas" },
      { id: "p2", nama: "Juara 3 Lomba Karya Ilmiah Remaja Nasional", tingkat: "Nasional", tahun: "2025", keterangan: "Bidang IPA" }
    ] : s.nama.startsWith("B") ? [
      { id: "p3", nama: "Juara 2 FLS2N Musik Tradisional", tingkat: "Provinsi", tahun: "2024", keterangan: "Kategori Solo" }
    ] : [],
    pelanggaran: s.nama.startsWith("C") ? [
      { id: "pl1", nama: "Terlambat masuk sekolah", tanggal: "2025-02-14", poin: 5, keterangan: "Sudah diberi pembinaan" }
    ] : [],
    ekstrakurikuler: [
      { id: "ek1", nama: isMale ? "Pramuka" : "Pramuka", nilai: "A", keterangan: "Sangat aktif berorganisasi" },
      { id: "ek2", nama: isMale ? "Futsal" : "Tari Kreasi", nilai: "B", keterangan: "Menunjukkan minat yang tinggi" }
    ],
    kehadiran: {
      "1": { sakit: 1, izin: 2, alfa: 0 },
      "2": { sakit: 2, izin: 0, alfa: 0 },
      "3": { sakit: 0, izin: 1, alfa: 0 },
      "4": { sakit: 3, izin: 2, alfa: 1 },
      "5": { sakit: 1, izin: 0, alfa: 0 },
      "6": { sakit: 0, izin: 0, alfa: 0 }
    }
  };
});

const DEFAULT_SPMB: SPMBRecord[] = [
  {
    id: "spmb-01",
    nama: "Fahri Ramadhan",
    jk: "L",
    nisn: "0142837499",
    tempatLahir: "Jakarta",
    tanggalLahir: "2014-02-18",
    agama: "Islam",
    alamat: "Jl. Salak No. 12, Senen, Jakarta Pusat",
    namaAyah: "Suparman",
    namaIbu: "Sumiati",
    asalSd: "SDN Gambir 01",
    noHp: "08987733441",
    tanggalDaftar: "2026-05-10",
    status: "Terverifikasi",
    biayaDaftarUlangLunas: false
  },
  {
    id: "spmb-02",
    nama: "Nabila Syahira",
    jk: "P",
    nisn: "0149988776",
    tempatLahir: "Depok",
    tanggalLahir: "2014-06-21",
    agama: "Islam",
    alamat: "Jl. Melati Blok G No. 4, Kebon Sirih",
    namaAyah: "Rizal Syahira",
    namaIbu: "Rina Kumala",
    asalSd: "SD Al-Azhar 1",
    noHp: "081211112222",
    tanggalDaftar: "2026-05-12",
    status: "Diterima",
    biayaDaftarUlangLunas: true
  },
  {
    id: "spmb-03",
    nama: "Raymond Tan",
    jk: "L",
    nisn: "0145522331",
    tempatLahir: "Jakarta",
    tanggalLahir: "2014-09-02",
    agama: "Kristen",
    alamat: "Menteng Indah No. 10B",
    namaAyah: "Stephen Tan",
    namaIbu: "Juliana",
    asalSd: "SD Kristen Yusuf",
    noHp: "087855667788",
    tanggalDaftar: "2026-05-14",
    status: "Lulus Seleksi",
    biayaDaftarUlangLunas: false
  }
];

const DEFAULT_ARSIP: ArsipDokumen[] = [
  {
    id: "arsip-01",
    siswaId: "siswa-01",
    namaDokumen: "Kartu Keluarga",
    fileName: "kk_andika_pratama.pdf",
    fileType: "application/pdf",
    fileData: "PDF_MOCK_BASE64_DATA",
    uploadedAt: "2025-07-20",
    keterangan: "KK Ter-update Kelurahan Gambir"
  },
  {
    id: "arsip-02",
    siswaId: "siswa-01",
    namaDokumen: "Akta Kelahiran",
    fileName: "akta_andika.pdf",
    fileType: "application/pdf",
    fileData: "PDF_MOCK_BASE64_DATA",
    uploadedAt: "2025-07-20",
    keterangan: "Scan Akta Kelahiran Asli"
  }
];

const DEFAULT_AGENDA: AgendaItem[] = [
  { id: "ag-1", tanggal: "2026-07-05", title: "Rapat Pleno Komite Sekolah", type: "Rapat", keterangan: "Rapat kerja pengurus Komite Sekolah awal tahun ajaran" },
  { id: "ag-2", tanggal: "2026-07-12", title: "Verifikasi Berkas Calon Siswa Baru", type: "Kegiatan", keterangan: "Verifikasi administrasi pendaftar SPMB gelombang ke-2" },
  { id: "ag-3", tanggal: "2026-07-17", title: "Upacara Hari Kesadaran Nasional", type: "Upacara", keterangan: "Wajib diikuti seluruh tenaga pendidik, kependidikan, dan siswa" },
  { id: "ag-4", tanggal: "2026-07-22", title: "Sosialisasi Buku Induk Digital", type: "Kegiatan", keterangan: "Pelatihan penggunaan sistem digitalisasi administrasi" },
  { id: "ag-5", tanggal: "2026-07-28", title: "Batas Akhir Pelaporan Mutasi Bulanan", type: "Administrasi", keterangan: "Penyerahan berkas mutasi ke dinas pendidikan kabupaten" },
  { id: "ag-6", tanggal: "2026-09-14", title: "Ujian Tengah Semester Ganjil", type: "Ujian", keterangan: "Pelaksanaan UTS secara daring/luring mandiri" },
  { id: "ag-7", tanggal: "2026-12-10", title: "Pembagian Rapor Semester Ganjil", type: "Administrasi", keterangan: "Penerimaan hasil belajar siswa oleh orang tua/wali" },
  { id: "ag-8", tanggal: "2026-06-15", title: "Libur Kenaikan Kelas & Akhir Tahun", type: "Libur", keterangan: "Libur semester genap tahun pelajaran berjalan" },
  
  // Indonesian National Holidays 2025
  { id: "h25-1", tanggal: "2025-01-01", title: "Tahun Baru Masehi", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h25-2", tanggal: "2025-01-27", title: "Isra Mi'raj Nabi Muhammad SAW", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h25-3", tanggal: "2025-01-29", title: "Tahun Baru Imlek", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h25-4", tanggal: "2025-03-29", title: "Hari Suci Nyepi", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h25-5", tanggal: "2025-03-31", title: "Hari Raya Idul Fitri 1446 H", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h25-6", tanggal: "2025-04-01", title: "Hari Raya Idul Fitri 1446 H (Hari Kedua)", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h25-7", tanggal: "2025-04-18", title: "Wafat Yesus Kristus", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h25-8", tanggal: "2025-05-01", title: "Hari Buruh Internasional", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h25-9", tanggal: "2025-05-12", title: "Hari Raya Waisak 2569 BE", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h25-10", tanggal: "2025-05-29", title: "Kenaikan Yesus Kristus", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h25-11", tanggal: "2025-06-01", title: "Hari Lahir Pancasila", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h25-12", tanggal: "2025-06-06", title: "Hari Raya Idul Adha 1446 H", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h25-13", tanggal: "2025-06-27", title: "Tahun Baru Islam 1447 H", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h25-14", tanggal: "2025-08-17", title: "Hari Kemerdekaan RI (HUT RI Ke-80)", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h25-15", tanggal: "2025-09-05", title: "Maulid Nabi Muhammad SAW", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h25-16", tanggal: "2025-12-25", title: "Hari Raya Natal", type: "Libur", keterangan: "Hari Libur Nasional" },

  // Indonesian National Holidays 2026
  { id: "h26-1", tanggal: "2026-01-01", title: "Tahun Baru Masehi", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h26-2", tanggal: "2026-01-15", title: "Isra Mi'raj Nabi Muhammad SAW", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h26-3", tanggal: "2026-02-17", title: "Tahun Baru Imlek 2577 Kongzili", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h26-4", tanggal: "2026-03-19", title: "Hari Suci Nyepi (Saka 1948)", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h26-5", tanggal: "2026-03-20", title: "Hari Raya Idul Fitri 1447 H", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h26-6", tanggal: "2026-03-21", title: "Hari Raya Idul Fitri 1447 H (Hari Kedua)", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h26-7", tanggal: "2026-04-03", title: "Wafat Yesus Kristus (Jumat Agung)", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h26-8", tanggal: "2026-05-01", title: "Hari Buruh Internasional", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h26-9", tanggal: "2026-05-14", title: "Kenaikan Yesus Kristus", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h26-10", tanggal: "2026-05-27", title: "Hari Raya Idul Adha 1447 H", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h26-11", tanggal: "2026-05-31", title: "Hari Raya Waisak 2570 BE", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h26-12", tanggal: "2026-06-01", title: "Hari Lahir Pancasila", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h26-13", tanggal: "2026-06-15", title: "Tahun Baru Islam 1448 H", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h26-14", tanggal: "2026-08-17", title: "Hari Kemerdekaan RI (HUT RI Ke-81)", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h26-15", tanggal: "2026-08-25", title: "Maulid Nabi Muhammad SAW", type: "Libur", keterangan: "Hari Libur Nasional" },
  { id: "h26-16", tanggal: "2026-12-25", title: "Hari Raya Natal", type: "Libur", keterangan: "Hari Libur Nasional" }
];

const DEFAULT_PEGAWAI: Pegawai[] = [
  {
    id: "pegawai-01",
    foto: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    nip: "197205151998031004",
    nuptk: "4839182746190283",
    namaLengkap: "Drs. H. Syamsuddin, M.Pd.",
    jk: "L",
    tempatLahir: "Selatpanjang",
    tanggalLahir: "1972-05-15",
    agama: "Islam",
    pendidikanTerakhir: "S2 - Administrasi Pendidikan",
    mataPelajaran: "Pendidikan Pancasila dan Kewarganegaraan",
    jabatan: "Kepala Sekolah",
    statusKepegawaian: "ASN",
    golongan: "IV/a",
    pangkat: "Pembina",
    tmt: "2018-04-01",
    noSk: "821.2/BKD-KP/2018/142",
    noHp: "081277334411",
    email: "syamsuddin.mpd@gmail.com",
    alamat: "Jl. Merdeka No. 15, Tanjung Samak, Rangsang",
    tipePegawai: "Guru",
    riwayatPangkat: [
      { id: "rp1", golongan: "III/c", pangkat: "Penata", tmt: "2010-04-01", noSk: "823/BKD-KP/2010/88", keterangan: "Kenaikan Pangkat Reguler" },
      { id: "rp2", golongan: "III/d", pangkat: "Penata Tingkat I", tmt: "2014-04-01", noSk: "823/BKD-KP/2014/122", keterangan: "Kenaikan Pangkat Pilihan" },
      { id: "rp3", golongan: "IV/a", pangkat: "Pembina", tmt: "2018-04-01", noSk: "821.2/BKD-KP/2018/142", keterangan: "Penyesuaian Jabatan Baru" }
    ],
    riwayatJabatan: [
      { id: "rj1", jabatan: "Guru Pertama", tmt: "1998-03-01", noSk: "813/Dinas-Pnd/1998/12" },
      { id: "rj2", jabatan: "Wakil Kepala Sekolah Bid. Kurikulum", tmt: "2010-07-01", noSk: "421.3/SMPN1-R/2010/04" },
      { id: "rj3", jabatan: "Kepala Sekolah", tmt: "2018-03-12", noSk: "821.2/BKD-KP/2018/142" }
    ],
    riwayatPendidikan: [
      { id: "rpe1", tingkat: "S1", namaSekolah: "Universitas Riau", jurusan: "Pendidikan Pancasila & Kewarganegaraan", tahunLulus: "1996", noIjazah: "UR-1996-93872" },
      { id: "rpe2", tingkat: "S2", namaSekolah: "Universitas Negeri Padang", jurusan: "Administrasi Pendidikan", tahunLulus: "2012", noIjazah: "UNP-2012-48291" }
    ],
    riwayatDiklat: [
      { id: "rd1", namaDiklat: "Diklat Penguatan Kepala Sekolah", penyelenggara: "LPPKS Solo", tahun: "2019", durasiJam: "120", noSertifikat: "LPPKS-2019-83912" },
      { id: "rd2", namaDiklat: "Bimtek Implementasi Kurikulum Merdeka", penyelenggara: "BPMP Riau", tahun: "2023", durasiJam: "32", noSertifikat: "BPMP-2023-3892" }
    ],
    riwayatSertifikasi: [
      { id: "rs1", jenisSertifikasi: "Sertifikasi Pendidik", nomorSertifikat: "081292019382", tahun: "2008", bidangStudi: "PPKn" }
    ],
    riwayatSK: [
      { id: "rsk1", tentang: "SK Pengangkatan CPNS", noSk: "813/BKD-KP/1998/02", tanggalSk: "1998-02-15", pejabatPenandatangan: "Bupati Bengkalis" },
      { id: "rsk2", tentang: "SK Kepala Sekolah SMPN 1 Rangsang", noSk: "821.2/BKD-KP/2018/142", tanggalSk: "2018-03-10", pejabatPenandatangan: "Bupati Kepulauan Meranti" }
    ],
    riwayatPenugasan: [
      { id: "rtn1", tugas: "Ketua Musyawarah Kerja Kepala Sekolah (MKKS) Rangsang", lokasi: "Kecamatan Rangsang", tmtMulai: "2020-01-01", noSk: "421.3/Disdik-Meranti/2020/45" }
    ]
  },
  {
    id: "pegawai-02",
    foto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    nip: "198008122005012003",
    nuptk: "4839281923746231",
    namaLengkap: "Sri Wahyuni, S.Pd.",
    jk: "P",
    tempatLahir: "Tanjung Samak",
    tanggalLahir: "1980-08-12",
    agama: "Islam",
    pendidikanTerakhir: "S1 - Pendidikan Bahasa Indonesia",
    mataPelajaran: "Bahasa Indonesia",
    jabatan: "Guru Madya / Wali Kelas VII-1",
    statusKepegawaian: "ASN",
    golongan: "III/c",
    pangkat: "Penata",
    tmt: "2012-10-01",
    noSk: "823/Disdik-KP/2012/91",
    noHp: "081299887766",
    email: "sri.wahyuni@yahoo.com",
    alamat: "Jl. Jenderal Sudirman No. 44, Tanjung Samak",
    tipePegawai: "Guru",
    riwayatPangkat: [
      { id: "rp2_1", golongan: "III/a", pangkat: "Penata Muda", tmt: "2005-01-01", noSk: "813/Disdik/2005/01" },
      { id: "rp2_2", golongan: "III/b", pangkat: "Penata Muda Tingkat I", tmt: "2009-04-01", noSk: "823/Disdik/2009/42" },
      { id: "rp2_3", golongan: "III/c", pangkat: "Penata", tmt: "2012-10-01", noSk: "823/Disdik-KP/2012/91" }
    ],
    riwayatJabatan: [
      { id: "rj2_1", jabatan: "Guru Pertama", tmt: "2005-01-01", noSk: "813/Disdik/2005/01" },
      { id: "rj2_2", jabatan: "Guru Muda", tmt: "2009-04-01", noSk: "823/Disdik/2009/42" }
    ],
    riwayatPendidikan: [
      { id: "rpe2_1", tingkat: "S1", namaSekolah: "Universitas Riau", jurusan: "Pendidikan Bahasa & Sastra Indonesia", tahunLulus: "2003", noIjazah: "UR-2003-83912" }
    ],
    riwayatDiklat: [
      { id: "rd2_1", namaDiklat: "Diklat Teknis PKG & PKB", penyelenggara: "Kementerian Pendidikan", tahun: "2015", durasiJam: "40", noSertifikat: "PKG-2015-8491" }
    ],
    riwayatSertifikasi: [
      { id: "rs2_1", jenisSertifikasi: "Sertifikasi Pendidik", nomorSertifikat: "091283721092", tahun: "2011", bidangStudi: "Bahasa Indonesia" }
    ],
    riwayatSK: [
      { id: "rsk2_1", tentang: "SK CPNS", noSk: "813/Disdik/2005/01", tanggalSk: "2004-12-15", pejabatPenandatangan: "Bupati Bengkalis" }
    ],
    riwayatPenugasan: [
      { id: "rtn2_1", tugas: "Wali Kelas VII-1", lokasi: "SMPN 1 Rangsang", tmtMulai: "2025-07-01", noSk: "421.3/SMPN1-R/2025/11" }
    ]
  },
  {
    id: "pegawai-03",
    foto: "https://images.unsplash.com/photo-1573566152434-1515256540c7?w=150&auto=format&fit=crop&q=80",
    nip: "-",
    nuptk: "-",
    namaLengkap: "Yudi Hartono, S.Pd.",
    jk: "L",
    tempatLahir: "Tanjung Samak",
    tanggalLahir: "1990-11-11",
    agama: "Islam",
    pendidikanTerakhir: "S1 - Pendidikan Teknologi Informasi",
    mataPelajaran: "TIK",
    jabatan: "Guru / Operator SIM",
    statusKepegawaian: "ASN",
    golongan: "III/b",
    pangkat: "Penata Muda Tingkat I",
    tmt: "2015-03-01",
    noSk: "823/Disdik-KP/2015/12",
    noHp: "08123456789",
    email: "yudihartono@gmail.com",
    alamat: "Jl. Diponegoro No. 12, Tanjung Samak",
    tipePegawai: "Guru",
    riwayatPangkat: [
      { id: "rp3_1", golongan: "III/a", pangkat: "Penata Muda", tmt: "2011-03-01", noSk: "813/BKD/2011/12" },
      { id: "rp3_2", golongan: "III/b", pangkat: "Penata Muda Tingkat I", tmt: "2015-03-01", noSk: "823/Disdik-KP/2015/12" }
    ],
    riwayatJabatan: [
      { id: "rj3_1", jabatan: "Guru Pertama", tmt: "2011-03-01", noSk: "813/BKD/2011/12" }
    ],
    riwayatPendidikan: [
      { id: "rpe3_1", tingkat: "S1", namaSekolah: "Universitas Negeri Padang", jurusan: "Pendidikan Teknik Informatika", tahunLulus: "2010", noIjazah: "UNP-2010-839" }
    ],
    riwayatDiklat: [
      { id: "rd3_1", namaDiklat: "Diklat Jaringan & Keamanan Sistem", penyelenggara: "Pusdatin Kemendikbud", tahun: "2018", durasiJam: "32", noSertifikat: "PUS-2018-129" }
    ],
    riwayatSertifikasi: [],
    riwayatSK: [],
    riwayatPenugasan: []
  },
  {
    id: "pegawai-04",
    foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    nip: "-",
    nuptk: "-",
    namaLengkap: "Aisyah, A.Md.Keb.",
    jk: "P",
    tempatLahir: "Selatpanjang",
    tanggalLahir: "1994-11-21",
    agama: "Islam",
    pendidikanTerakhir: "D3 - Kebidanan (Pendidikan Kesehatan)",
    mataPelajaran: "UKS / Administrasi Kesehatan",
    jabatan: "Staf Tata Usaha / UKS",
    statusKepegawaian: "Honorer",
    golongan: "-",
    pangkat: "-",
    tmt: "2021-07-15",
    noSk: "421.3/SMPN1-R/2021/45",
    noHp: "085278129034",
    email: "aisyah.smpn1r@gmail.com",
    alamat: "Jl. Kartini, Tanjung Samak, Rangsang",
    tipePegawai: "Tendik",
    riwayatPangkat: [],
    riwayatJabatan: [
      { id: "rj4_1", jabatan: "Staf Tata Usaha Honor Komite", tmt: "2021-07-15", noSk: "421.3/SMPN1-R/2021/45" }
    ],
    riwayatPendidikan: [
      { id: "rpe4_1", tingkat: "D3", namaSekolah: "Poltekkes Pekanbaru", jurusan: "Kebidanan", tahunLulus: "2015", noIjazah: "POL-2015-748" }
    ],
    riwayatDiklat: [
      { id: "rd4_1", namaDiklat: "Diklat Teknis UKS & P3K", penyelenggara: "Dinas Kesehatan Meranti", tahun: "2022", durasiJam: "32", noSertifikat: "DISKES-2022-120" }
    ],
    riwayatSertifikasi: [],
    riwayatSK: [
      { id: "rsk4_1", tentang: "SK Staf Tata Usaha Komite", noSk: "421.3/SMPN1-R/2021/45", tanggalSk: "2021-07-10", pejabatPenandatangan: "Kepala Sekolah" }
    ],
    riwayatPenugasan: []
  }
];

const DEFAULT_ARSIP_PEGAWAI: ArsipPegawai[] = [
  {
    id: "ap-1",
    pegawaiId: "pegawai-01",
    namaDokumen: "Ijazah",
    fileName: "ijazah_s2_syamsuddin.pdf",
    fileType: "application/pdf",
    fileData: "PDF_MOCK_BASE64_DATA",
    uploadedAt: "2025-08-10",
    keterangan: "Ijazah S2 Administrasi Pendidikan UNP"
  },
  {
    id: "ap-2",
    pegawaiId: "pegawai-01",
    namaDokumen: "Sertifikat Pendidik",
    fileName: "serdik_syamsuddin.jpg",
    fileType: "image/jpeg",
    fileData: "IMAGE_MOCK_BASE64_DATA",
    uploadedAt: "2025-08-10",
    keterangan: "Sertifikat Pendidik Profesional Kemendikbud"
  }
];

// Initialize Local Storage if empty
const initLocalStorage = () => {
  if (!localStorage.getItem("sim_school_settings")) {
    safeSetItem("sim_school_settings", JSON.stringify(DEFAULT_SCHOOL_SETTINGS));
  }
  if (!localStorage.getItem("sim_siswa")) {
    safeSetItem("sim_siswa", JSON.stringify(DEFAULT_SISWA));
  }
  if (!localStorage.getItem("sim_nilai")) {
    safeSetItem("sim_nilai", JSON.stringify(DEFAULT_NILAI));
  }
  if (!localStorage.getItem("sim_mutasi")) {
    safeSetItem("sim_mutasi", JSON.stringify(DEFAULT_MUTASI));
  }
  if (!localStorage.getItem("sim_buku_induk")) {
    safeSetItem("sim_buku_induk", JSON.stringify(DEFAULT_BUKU_INDUK));
  }
  if (!localStorage.getItem("sim_spmb")) {
    safeSetItem("sim_spmb", JSON.stringify(DEFAULT_SPMB));
  }
  if (!localStorage.getItem("sim_arsip")) {
    safeSetItem("sim_arsip", JSON.stringify(DEFAULT_ARSIP));
  }
  if (!localStorage.getItem("sim_agenda")) {
    safeSetItem("sim_agenda", JSON.stringify(DEFAULT_AGENDA));
  }
  if (!localStorage.getItem("sim_pegawai")) {
    safeSetItem("sim_pegawai", JSON.stringify(DEFAULT_PEGAWAI));
  }
  if (!localStorage.getItem("sim_arsip_pegawai")) {
    safeSetItem("sim_arsip_pegawai", JSON.stringify(DEFAULT_ARSIP_PEGAWAI));
  }
};

initLocalStorage();

// ==========================================
// CENTRAL DATABASE SERVICE OBJECT
// ==========================================

export const dbService = {
  // 1. SCHOOL SETTINGS
  getSchoolSettings: async (): Promise<SchoolSettings> => {
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, "settings", "school_identity");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as SchoolSettings;
        } else {
          // If Firestore is empty, seed it
          const localData = JSON.parse(localStorage.getItem("sim_school_settings") || "{}");
          await setDoc(docRef, localData);
          return localData;
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, "settings/school_identity");
      }
    }
    // Fallback
    return JSON.parse(localStorage.getItem("sim_school_settings") || JSON.stringify(DEFAULT_SCHOOL_SETTINGS));
  },

  saveSchoolSettings: async (settings: SchoolSettings): Promise<void> => {
    safeSetItem("sim_school_settings", JSON.stringify(settings));
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "settings", "school_identity"), settings);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "settings/school_identity");
      }
    }
  },

  // 2. DATA SISWA
  getSiswaList: async (): Promise<Siswa[]> => {
    if (isFirebaseConfigured && db) {
      try {
        const colRef = collection(db, "siswa");
        const snapshot = await getDocs(colRef);
        const list: Siswa[] = [];
        snapshot.forEach((doc) => {
          list.push({ ...doc.data() as Siswa, id: doc.id });
        });
        if (list.length > 0) {
          return list;
        } else {
          // Seed Firestore if empty
          const localList = JSON.parse(localStorage.getItem("sim_siswa") || "[]");
          const batch = writeBatch(db);
          for (const item of localList) {
            batch.set(doc(db, "siswa", item.id), item);
          }
          await batch.commit();
          return localList;
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "siswa");
      }
    }
    return JSON.parse(localStorage.getItem("sim_siswa") || "[]");
  },

  saveSiswa: async (siswa: Siswa): Promise<void> => {
    const localList: Siswa[] = JSON.parse(localStorage.getItem("sim_siswa") || "[]");
    const index = localList.findIndex(item => item.id === siswa.id);
    if (index >= 0) {
      localList[index] = siswa;
    } else {
      localList.push(siswa);
    }
    safeSetItem("sim_siswa", JSON.stringify(localList));

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "siswa", siswa.id), siswa);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `siswa/${siswa.id}`);
      }
    }
  },

  deleteSiswa: async (id: string): Promise<void> => {
    const localList: Siswa[] = JSON.parse(localStorage.getItem("sim_siswa") || "[]");
    const updated = localList.filter(item => item.id !== id);
    safeSetItem("sim_siswa", JSON.stringify(updated));

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, "siswa", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `siswa/${id}`);
      }
    }
  },

  // 3. GRADES (NILAI RAPOR SEMESTER 1-6 + US)
  getGradesList: async (): Promise<SiswaNilai[]> => {
    if (isFirebaseConfigured && db) {
      try {
        const colRef = collection(db, "nilai");
        const snapshot = await getDocs(colRef);
        const list: SiswaNilai[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as SiswaNilai);
        });
        if (list.length > 0) {
          return list;
        } else {
          // Seed Firestore
          const localList = JSON.parse(localStorage.getItem("sim_nilai") || "[]");
          const batch = writeBatch(db);
          for (const item of localList) {
            batch.set(doc(db, "nilai", item.siswaId), item);
          }
          await batch.commit();
          return localList;
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "nilai");
      }
    }
    return JSON.parse(localStorage.getItem("sim_nilai") || "[]");
  },

  getGradesForSiswa: async (siswaId: string): Promise<SiswaNilai> => {
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, "nilai", siswaId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as SiswaNilai;
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `nilai/${siswaId}`);
      }
    }
    const localList: SiswaNilai[] = JSON.parse(localStorage.getItem("sim_nilai") || "[]");
    let grades = localList.find(item => item.siswaId === siswaId);
    if (!grades) {
      // Create empty grades structure if not exists
      const blankGrades: MapelGrades = { pai: 0, ppkn: 0, indo: 0, mtk: 0, ipa: 0, ips: 0, inggris: 0, seni: 0, pjok: 0, tik: 0, mulok: 0 };
      grades = {
        siswaId,
        s1: { ...blankGrades },
        s2: { ...blankGrades },
        s3: { ...blankGrades },
        s4: { ...blankGrades },
        s5: { ...blankGrades },
        s6: { ...blankGrades },
        ujianSekolah: { ...blankGrades }
      };
      localList.push(grades);
      safeSetItem("sim_nilai", JSON.stringify(localList));
    }
    return grades;
  },

  saveGrades: async (grades: SiswaNilai): Promise<void> => {
    const localList: SiswaNilai[] = JSON.parse(localStorage.getItem("sim_nilai") || "[]");
    const index = localList.findIndex(item => item.siswaId === grades.siswaId);
    if (index >= 0) {
      localList[index] = grades;
    } else {
      localList.push(grades);
    }
    safeSetItem("sim_nilai", JSON.stringify(localList));

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "nilai", grades.siswaId), grades);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `nilai/${grades.siswaId}`);
      }
    }
  },

  // 4. MUTASI SISWA
  getMutasiList: async (): Promise<Mutasi[]> => {
    if (isFirebaseConfigured && db) {
      try {
        const colRef = collection(db, "mutasi");
        const snapshot = await getDocs(colRef);
        const list: Mutasi[] = [];
        snapshot.forEach((doc) => {
          list.push({ ...doc.data() as Mutasi, id: doc.id });
        });
        if (list.length > 0) {
          return list;
        } else {
          // Seed Firestore
          const localList = JSON.parse(localStorage.getItem("sim_mutasi") || "[]");
          const batch = writeBatch(db);
          for (const item of localList) {
            batch.set(doc(db, "mutasi", item.id), item);
          }
          await batch.commit();
          return localList;
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "mutasi");
      }
    }
    return JSON.parse(localStorage.getItem("sim_mutasi") || "[]");
  },

  saveMutasi: async (mutasi: Mutasi): Promise<void> => {
    const localList: Mutasi[] = JSON.parse(localStorage.getItem("sim_mutasi") || "[]");
    const index = localList.findIndex(item => item.id === mutasi.id);
    if (index >= 0) {
      localList[index] = mutasi;
    } else {
      localList.push(mutasi);
    }
    safeSetItem("sim_mutasi", JSON.stringify(localList));

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "mutasi", mutasi.id), mutasi);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `mutasi/${mutasi.id}`);
      }
    }
  },

  deleteMutasi: async (id: string): Promise<void> => {
    const localList: Mutasi[] = JSON.parse(localStorage.getItem("sim_mutasi") || "[]");
    const updated = localList.filter(item => item.id !== id);
    safeSetItem("sim_mutasi", JSON.stringify(updated));

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, "mutasi", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `mutasi/${id}`);
      }
    }
  },

  // 5. BUKU INDUK RECORDS
  getBukuIndukRecords: async (): Promise<BukuIndukRecord[]> => {
    if (isFirebaseConfigured && db) {
      try {
        const colRef = collection(db, "bukuInduk");
        const snapshot = await getDocs(colRef);
        const list: BukuIndukRecord[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as BukuIndukRecord);
        });
        if (list.length > 0) {
          return list;
        } else {
          const localList = JSON.parse(localStorage.getItem("sim_buku_induk") || "[]");
          const batch = writeBatch(db);
          for (const item of localList) {
            batch.set(doc(db, "bukuInduk", item.siswaId), item);
          }
          await batch.commit();
          return localList;
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "bukuInduk");
      }
    }
    return JSON.parse(localStorage.getItem("sim_buku_induk") || "[]");
  },

  getBukuIndukForSiswa: async (siswaId: string): Promise<BukuIndukRecord> => {
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, "bukuInduk", siswaId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as BukuIndukRecord;
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `bukuInduk/${siswaId}`);
      }
    }
    const localList: BukuIndukRecord[] = JSON.parse(localStorage.getItem("sim_buku_induk") || "[]");
    let rec = localList.find(item => item.siswaId === siswaId);
    if (!rec) {
      rec = {
        siswaId,
        riwayatKelas: [
          { tahunPelajaran: "2025/2026", kelas: "VII", status: "Aktif" }
        ],
        prestasi: [],
        pelanggaran: [],
        ekstrakurikuler: [],
        kehadiran: {
          "1": { sakit: 0, izin: 0, alfa: 0 },
          "2": { sakit: 0, izin: 0, alfa: 0 },
          "3": { sakit: 0, izin: 0, alfa: 0 },
          "4": { sakit: 0, izin: 0, alfa: 0 },
          "5": { sakit: 0, izin: 0, alfa: 0 },
          "6": { sakit: 0, izin: 0, alfa: 0 }
        }
      };
      localList.push(rec);
      safeSetItem("sim_buku_induk", JSON.stringify(localList));
    }
    return rec;
  },

  saveBukuIndukRecord: async (record: BukuIndukRecord): Promise<void> => {
    const localList: BukuIndukRecord[] = JSON.parse(localStorage.getItem("sim_buku_induk") || "[]");
    const index = localList.findIndex(item => item.siswaId === record.siswaId);
    if (index >= 0) {
      localList[index] = record;
    } else {
      localList.push(record);
    }
    safeSetItem("sim_buku_induk", JSON.stringify(localList));

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "bukuInduk", record.siswaId), record);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `bukuInduk/${record.siswaId}`);
      }
    }
  },

  // 6. SPMB RECRUITMENT
  getSPMBList: async (): Promise<SPMBRecord[]> => {
    if (isFirebaseConfigured && db) {
      try {
        const colRef = collection(db, "spmb");
        const snapshot = await getDocs(colRef);
        const list: SPMBRecord[] = [];
        snapshot.forEach((doc) => {
          list.push({ ...doc.data() as SPMBRecord, id: doc.id });
        });
        if (list.length > 0) {
          return list;
        } else {
          const localList = JSON.parse(localStorage.getItem("sim_spmb") || "[]");
          const batch = writeBatch(db);
          for (const item of localList) {
            batch.set(doc(db, "spmb", item.id), item);
          }
          await batch.commit();
          return localList;
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "spmb");
      }
    }
    return JSON.parse(localStorage.getItem("sim_spmb") || "[]");
  },

  saveSPMB: async (record: SPMBRecord): Promise<void> => {
    const localList: SPMBRecord[] = JSON.parse(localStorage.getItem("sim_spmb") || "[]");
    const index = localList.findIndex(item => item.id === record.id);
    if (index >= 0) {
      localList[index] = record;
    } else {
      localList.push(record);
    }
    safeSetItem("sim_spmb", JSON.stringify(localList));

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "spmb", record.id), record);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `spmb/${record.id}`);
      }
    }
  },

  deleteSPMB: async (id: string): Promise<void> => {
    const localList: SPMBRecord[] = JSON.parse(localStorage.getItem("sim_spmb") || "[]");
    const updated = localList.filter(item => item.id !== id);
    safeSetItem("sim_spmb", JSON.stringify(updated));

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, "spmb", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `spmb/${id}`);
      }
    }
  },

  // 7. ARSIP DOKUMEN DIGITAL
  getArsipList: async (siswaId: string): Promise<ArsipDokumen[]> => {
    if (isFirebaseConfigured && db) {
      try {
        const colRef = collection(db, "arsip");
        const q = query(colRef, where("siswaId", "==", siswaId));
        const snapshot = await getDocs(q);
        const list: ArsipDokumen[] = [];
        snapshot.forEach((doc) => {
          list.push({ ...doc.data() as ArsipDokumen, id: doc.id });
        });
        if (list.length > 0) {
          return list;
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, `arsip (siswaId=${siswaId})`);
      }
    }
    const localList: ArsipDokumen[] = JSON.parse(localStorage.getItem("sim_arsip") || "[]");
    return localList.filter(item => item.siswaId === siswaId);
  },

  saveArsip: async (docRecord: ArsipDokumen): Promise<void> => {
    const localList: ArsipDokumen[] = JSON.parse(localStorage.getItem("sim_arsip") || "[]");
    const index = localList.findIndex(item => item.id === docRecord.id);
    if (index >= 0) {
      localList[index] = docRecord;
    } else {
      localList.push(docRecord);
    }
    safeSetItem("sim_arsip", JSON.stringify(localList));

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "arsip", docRecord.id), docRecord);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `arsip/${docRecord.id}`);
      }
    }
  },

  deleteArsip: async (id: string): Promise<void> => {
    const localList: ArsipDokumen[] = JSON.parse(localStorage.getItem("sim_arsip") || "[]");
    const updated = localList.filter(item => item.id !== id);
    safeSetItem("sim_arsip", JSON.stringify(updated));

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, "arsip", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `arsip/${id}`);
      }
    }
  },

  // 8. ACADEMIC CALENDAR AGENDA
  getAgendaList: async (): Promise<AgendaItem[]> => {
    if (isFirebaseConfigured && db) {
      try {
        const colRef = collection(db, "agenda");
        const snapshot = await getDocs(colRef);
        const list: AgendaItem[] = [];
        snapshot.forEach((doc) => {
          list.push({ ...doc.data() as AgendaItem, id: doc.id });
        });
        if (list.length > 0) {
          return list;
        } else {
          const localList = JSON.parse(localStorage.getItem("sim_agenda") || "[]");
          const batch = writeBatch(db);
          for (const item of localList) {
            batch.set(doc(db, "agenda", item.id), item);
          }
          await batch.commit();
          return localList;
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "agenda");
      }
    }
    return JSON.parse(localStorage.getItem("sim_agenda") || "[]");
  },

  saveAgendaItem: async (agenda: AgendaItem): Promise<void> => {
    const localList: AgendaItem[] = JSON.parse(localStorage.getItem("sim_agenda") || "[]");
    const index = localList.findIndex(item => item.id === agenda.id);
    if (index >= 0) {
      localList[index] = agenda;
    } else {
      localList.push(agenda);
    }
    safeSetItem("sim_agenda", JSON.stringify(localList));

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "agenda", agenda.id), agenda);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `agenda/${agenda.id}`);
      }
    }
  },

  deleteAgendaItem: async (id: string): Promise<void> => {
    const localList: AgendaItem[] = JSON.parse(localStorage.getItem("sim_agenda") || "[]");
    const updated = localList.filter(item => item.id !== id);
    safeSetItem("sim_agenda", JSON.stringify(updated));

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, "agenda", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `agenda/${id}`);
      }
    }
  },

  // 9. KEPEGAWAIAN (GURU & TENDIK)
  getPegawaiList: async (): Promise<Pegawai[]> => {
    if (isFirebaseConfigured && db) {
      try {
        const colRef = collection(db, "pegawai");
        const snapshot = await getDocs(colRef);
        const list: Pegawai[] = [];
        snapshot.forEach((doc) => {
          list.push({ ...doc.data() as Pegawai, id: doc.id });
        });
        if (list.length > 0) {
          return list;
        } else {
          const localList = JSON.parse(localStorage.getItem("sim_pegawai") || "[]");
          const batch = writeBatch(db);
          for (const item of localList) {
            batch.set(doc(db, "pegawai", item.id), item);
          }
          await batch.commit();
          return localList;
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "pegawai");
      }
    }
    return JSON.parse(localStorage.getItem("sim_pegawai") || "[]");
  },

  savePegawai: async (record: Pegawai): Promise<void> => {
    const localList: Pegawai[] = JSON.parse(localStorage.getItem("sim_pegawai") || "[]");
    const index = localList.findIndex(item => item.id === record.id);
    if (index >= 0) {
      localList[index] = record;
    } else {
      localList.push(record);
    }
    safeSetItem("sim_pegawai", JSON.stringify(localList));

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "pegawai", record.id), record);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `pegawai/${record.id}`);
      }
    }
  },

  deletePegawai: async (id: string): Promise<void> => {
    const localList: Pegawai[] = JSON.parse(localStorage.getItem("sim_pegawai") || "[]");
    const updated = localList.filter(item => item.id !== id);
    safeSetItem("sim_pegawai", JSON.stringify(updated));

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, "pegawai", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `pegawai/${id}`);
      }
    }
  },

  // 10. ARSIP PEGAWAI DIGITAL
  getArsipPegawaiList: async (pegawaiId: string): Promise<ArsipPegawai[]> => {
    if (isFirebaseConfigured && db) {
      try {
        const colRef = collection(db, "arsip_pegawai");
        const q = query(colRef, where("pegawaiId", "==", pegawaiId));
        const snapshot = await getDocs(q);
        const list: ArsipPegawai[] = [];
        snapshot.forEach((doc) => {
          list.push({ ...doc.data() as ArsipPegawai, id: doc.id });
        });
        if (list.length > 0) {
          return list;
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, `arsip_pegawai (pegawaiId=${pegawaiId})`);
      }
    }
    const localList: ArsipPegawai[] = JSON.parse(localStorage.getItem("sim_arsip_pegawai") || "[]");
    return localList.filter(item => item.pegawaiId === pegawaiId);
  },

  saveArsipPegawai: async (record: ArsipPegawai): Promise<void> => {
    const localList: ArsipPegawai[] = JSON.parse(localStorage.getItem("sim_arsip_pegawai") || "[]");
    const index = localList.findIndex(item => item.id === record.id);
    if (index >= 0) {
      localList[index] = record;
    } else {
      localList.push(record);
    }
    safeSetItem("sim_arsip_pegawai", JSON.stringify(localList));

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "arsip_pegawai", record.id), record);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `arsip_pegawai/${record.id}`);
      }
    }
  },

  deleteArsipPegawai: async (id: string): Promise<void> => {
    const localList: ArsipPegawai[] = JSON.parse(localStorage.getItem("sim_arsip_pegawai") || "[]");
    const updated = localList.filter(item => item.id !== id);
    safeSetItem("sim_arsip_pegawai", JSON.stringify(updated));

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, "arsip_pegawai", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `arsip_pegawai/${id}`);
      }
    }
  },

  // BACKUP & RESTORE DATABASE JSON FILE
  backupDatabase: (): string => {
    const dbData = {
      sim_school_settings: JSON.parse(localStorage.getItem("sim_school_settings") || "{}"),
      sim_siswa: JSON.parse(localStorage.getItem("sim_siswa") || "[]"),
      sim_nilai: JSON.parse(localStorage.getItem("sim_nilai") || "[]"),
      sim_mutasi: JSON.parse(localStorage.getItem("sim_mutasi") || "[]"),
      sim_buku_induk: JSON.parse(localStorage.getItem("sim_buku_induk") || "[]"),
      sim_spmb: JSON.parse(localStorage.getItem("sim_spmb") || "[]"),
      sim_arsip: JSON.parse(localStorage.getItem("sim_arsip") || "[]"),
      sim_agenda: JSON.parse(localStorage.getItem("sim_agenda") || "[]"),
      sim_pegawai: JSON.parse(localStorage.getItem("sim_pegawai") || "[]"),
      sim_arsip_pegawai: JSON.parse(localStorage.getItem("sim_arsip_pegawai") || "[]")
    };
    return JSON.stringify(dbData, null, 2);
  },

  restoreDatabase: async (jsonString: string): Promise<boolean> => {
    try {
      const dbData = JSON.parse(jsonString);
      if (dbData.sim_school_settings) {
        safeSetItem("sim_school_settings", JSON.stringify(dbData.sim_school_settings));
      }
      if (dbData.sim_siswa) {
        safeSetItem("sim_siswa", JSON.stringify(dbData.sim_siswa));
      }
      if (dbData.sim_nilai) {
        safeSetItem("sim_nilai", JSON.stringify(dbData.sim_nilai));
      }
      if (dbData.sim_mutasi) {
        safeSetItem("sim_mutasi", JSON.stringify(dbData.sim_mutasi));
      }
      if (dbData.sim_buku_induk) {
        safeSetItem("sim_buku_induk", JSON.stringify(dbData.sim_buku_induk));
      }
      if (dbData.sim_spmb) {
        safeSetItem("sim_spmb", JSON.stringify(dbData.sim_spmb));
      }
      if (dbData.sim_arsip) {
        safeSetItem("sim_arsip", JSON.stringify(dbData.sim_arsip));
      }
      if (dbData.sim_agenda) {
        safeSetItem("sim_agenda", JSON.stringify(dbData.sim_agenda));
      }
      if (dbData.sim_pegawai) {
        safeSetItem("sim_pegawai", JSON.stringify(dbData.sim_pegawai));
      }
      if (dbData.sim_arsip_pegawai) {
        safeSetItem("sim_arsip_pegawai", JSON.stringify(dbData.sim_arsip_pegawai));
      }

      // Sync with Firestore if active
      if (isFirebaseConfigured && db) {
        const batch = writeBatch(db);
        
        // Settings
        if (dbData.sim_school_settings) {
          batch.set(doc(db, "settings", "school_identity"), dbData.sim_school_settings);
        }
        
        // Students
        if (dbData.sim_siswa && Array.isArray(dbData.sim_siswa)) {
          for (const item of dbData.sim_siswa) {
            batch.set(doc(db, "siswa", item.id), item);
          }
        }

        // Grades
        if (dbData.sim_nilai && Array.isArray(dbData.sim_nilai)) {
          for (const item of dbData.sim_nilai) {
            batch.set(doc(db, "nilai", item.siswaId), item);
          }
        }

        // Mutations
        if (dbData.sim_mutasi && Array.isArray(dbData.sim_mutasi)) {
          for (const item of dbData.sim_mutasi) {
            batch.set(doc(db, "mutasi", item.id), item);
          }
        }

        // Buku Induk
        if (dbData.sim_buku_induk && Array.isArray(dbData.sim_buku_induk)) {
          for (const item of dbData.sim_buku_induk) {
            batch.set(doc(db, "bukuInduk", item.siswaId), item);
          }
        }

        // SPMB
        if (dbData.sim_spmb && Array.isArray(dbData.sim_spmb)) {
          for (const item of dbData.sim_spmb) {
            batch.set(doc(db, "spmb", item.id), item);
          }
        }

        // Archives
        if (dbData.sim_arsip && Array.isArray(dbData.sim_arsip)) {
          for (const item of dbData.sim_arsip) {
            batch.set(doc(db, "arsip", item.id), item);
          }
        }

        // Agenda
        if (dbData.sim_agenda && Array.isArray(dbData.sim_agenda)) {
          for (const item of dbData.sim_agenda) {
            batch.set(doc(db, "agenda", item.id), item);
          }
        }

        // Pegawai
        if (dbData.sim_pegawai && Array.isArray(dbData.sim_pegawai)) {
          for (const item of dbData.sim_pegawai) {
            batch.set(doc(db, "pegawai", item.id), item);
          }
        }

        // Arsip Pegawai
        if (dbData.sim_arsip_pegawai && Array.isArray(dbData.sim_arsip_pegawai)) {
          for (const item of dbData.sim_arsip_pegawai) {
            batch.set(doc(db, "arsip_pegawai", item.id), item);
          }
        }

        await batch.commit();
      }

      return true;
    } catch (err) {
      console.error("Database restore failed:", err);
      return false;
    }
  }
};
