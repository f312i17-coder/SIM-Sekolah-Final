export interface Siswa {
  id: string;
  foto: string; // Base64 or URL
  nis: string;
  nisn: string;
  nama: string;
  jk: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  alamat: string;
  rtRw: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  namaAyah: string;
  namaIbu: string;
  namaWali: string;
  pekerjaanOrtu: string;
  noHp: string;
  kip: string;
  pkh: string;
  noKk: string;
  noAkta: string;
  statusAktif: 'Aktif' | 'Mutasi Keluar' | 'Lulus' | 'Tidak Aktif';
  kelas: 'VII' | 'VIII' | 'IX' | 'VII-1' | 'VII-2' | 'VII-3' | 'VIII-1' | 'VIII-2' | 'VIII-3' | 'IX-1' | 'IX-2' | 'IX-3';
  tahunMasuk: string;
  alumniTahun?: string;
  statusKelulusan?: 'Lulus' | 'Tidak Lulus' | 'Belum Ditentukan';
}

export interface MapelGrades {
  pai: number;
  ppkn: number;
  indo: number;
  mtk: number;
  ipa: number;
  ips: number;
  inggris: number;
  seni: number;
  pjok: number;
  tik: number;
  mulok: number;
}

export interface SiswaNilai {
  siswaId: string;
  s1: MapelGrades;
  s2: MapelGrades;
  s3: MapelGrades;
  s4: MapelGrades;
  s5: MapelGrades;
  s6: MapelGrades;
  ujianSekolah: MapelGrades;
}

export interface Mutasi {
  id: string;
  siswaId: string;
  siswaNama: string;
  nis: string;
  nisn: string;
  jenis: 'Masuk' | 'Keluar';
  tanggal: string;
  noSurat: string;
  sekolahAsalTujuan: string;
  alasan: string;
  kelasSaatMutasi: 'VII' | 'VIII' | 'IX' | 'VII-1' | 'VII-2' | 'VII-3' | 'VIII-1' | 'VIII-2' | 'VIII-3' | 'IX-1' | 'IX-2' | 'IX-3';
}

export interface Prestasi {
  id: string;
  nama: string;
  tingkat: string;
  tahun: string;
  keterangan: string;
}

export interface Pelanggaran {
  id: string;
  nama: string;
  tanggal: string;
  poin: number;
  keterangan: string;
}

export interface Ekstrakurikuler {
  id: string;
  nama: string;
  nilai: 'A' | 'B' | 'C' | 'D';
  keterangan: string;
}

export interface Kehadiran {
  sakit: number;
  izin: number;
  alfa: number;
}

export interface RiwayatKelas {
  tahunPelajaran: string;
  kelas: 'VII' | 'VIII' | 'IX' | 'VII-1' | 'VII-2' | 'VII-3' | 'VIII-1' | 'VIII-2' | 'VIII-3' | 'IX-1' | 'IX-2' | 'IX-3';
  status: string;
}

export interface BukuIndukRecord {
  siswaId: string;
  riwayatKelas: RiwayatKelas[];
  prestasi: Prestasi[];
  pelanggaran: Pelanggaran[];
  ekstrakurikuler: Ekstrakurikuler[];
  kehadiran: { [semester: string]: Kehadiran }; // e.g. "1": Kehadiran, "2": Kehadiran, etc.
}

export interface SPMBRecord {
  id: string;
  nama: string;
  jk: 'L' | 'P';
  nisn: string;
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  alamat: string;
  namaAyah: string;
  namaIbu: string;
  asalSd: string;
  noHp: string;
  tanggalDaftar: string;
  status: 'Pendaftaran' | 'Terverifikasi' | 'Lulus Seleksi' | 'Tidak Lulus' | 'Daftar Ulang' | 'Diterima';
  biayaDaftarUlangLunas: boolean;
}

export interface ArsipDokumen {
  id: string;
  siswaId: string;
  namaDokumen: 'Akta Kelahiran' | 'Kartu Keluarga' | 'KIP' | 'PKH' | 'Ijazah SD' | 'SKL SD' | 'Rapor' | 'Surat Pindah' | 'Surat Keterangan' | 'Dokumen Lainnya';
  fileName: string;
  fileType: string; // "application/pdf" or "image/*"
  fileData: string; // base64
  uploadedAt: string;
  keterangan?: string;
}

export interface SchoolSettings {
  namaSekolah: string;
  npsn: string;
  nss: string;
  statusSekolah: string;
  akreditasi: string;
  alamat: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  noTelepon: string;
  email: string;
  website: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  operatorName: string;
  tahunPelajaran: string;
  semester: 'Ganjil' | 'Genap';
  visi: string;
  misi: string;
  motto: string;
  
  // Logo & Signatures (Base64 images)
  logoPemkab: string;
  logoDinas: string;
  logoSekolah: string;
  stempelSekolah: string;
  tandaTanganKepala: string;
  tandaTanganOperator: string;

  // Kartu Pelajar configuration
  masaBerlakuKartu: string;
  warnaKartu: string;
  templateKartu: string;

  // Wali Kelas dynamic mapping (key: rombel name, e.g. 'VII-1', value: teacher name)
  waliKelas?: Record<string, string>;
}

export interface SuratTemplate {
  id: string;
  nama: string;
  kode: string;
  formatNomor: string;
  content: string;
}

export interface SuratArsip {
  id: string;
  noSurat: string;
  siswaId: string;
  siswaNama: string;
  siswaKelas: string;
  tanggalSurat: string;
  jenisSurat: string;
  pengirim: string;
  perihal: string;
  isiRingkas: string;
  statusText?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'operator' | 'visitor';
}

export interface AgendaItem {
  id: string;
  tanggal: string; // format: "YYYY-MM-DD"
  title: string;
  type: 'Ujian' | 'Rapat' | 'Libur' | 'Upacara' | 'Kegiatan' | 'Administrasi' | 'Lainnya';
  keterangan?: string;
}

export interface RiwayatPangkat {
  id: string;
  golongan: string;
  pangkat: string;
  tmt: string;
  noSk: string;
  keterangan?: string;
}

export interface RiwayatJabatan {
  id: string;
  jabatan: string;
  tmt: string;
  noSk: string;
  keterangan?: string;
}

export interface RiwayatPendidikan {
  id: string;
  tingkat: string;
  namaSekolah: string;
  jurusan: string;
  tahunLulus: string;
  noIjazah: string;
}

export interface RiwayatDiklat {
  id: string;
  namaDiklat: string;
  penyelenggara: string;
  tahun: string;
  durasiJam: string;
  noSertifikat: string;
}

export interface RiwayatSertifikasi {
  id: string;
  jenisSertifikasi: string;
  nomorSertifikat: string;
  tahun: string;
  bidangStudi: string;
}

export interface RiwayatSK {
  id: string;
  tentang: string;
  noSk: string;
  tanggalSk: string;
  pejabatPenandatangan: string;
}

export interface RiwayatPenugasan {
  id: string;
  tugas: string;
  lokasi: string;
  tmtMulai: string;
  tmtSelesai?: string;
  noSk: string;
}

export interface ArsipPegawai {
  id: string;
  pegawaiId: string;
  namaDokumen: 'SK CPNS/PPPK' | 'SK Pengangkatan' | 'SK Berkala' | 'SK Kenaikan Pangkat' | 'SK Mutasi' | 'Ijazah' | 'Transkrip Nilai' | 'Sertifikat Pendidik' | 'Sertifikat Diklat' | 'Piagam' | 'KTP' | 'KK' | 'NPWP' | 'BPJS' | 'Dokumen lainnya';
  fileName: string;
  fileType: string;
  fileData: string; // Base64 encoded file
  uploadedAt: string;
  keterangan?: string;
}

export interface Pegawai {
  id: string;
  foto: string;
  nip: string;
  nuptk: string;
  namaLengkap: string;
  jk: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  pendidikanTerakhir: string;
  mataPelajaran: string;
  jabatan: string;
  statusKepegawaian: 'ASN' | 'PPPK' | 'Honorer' | 'Lainnya';
  golongan: string;
  pangkat: string;
  tmt: string;
  noSk: string;
  noHp: string;
  email: string;
  alamat: string;
  tipePegawai: 'Guru' | 'Tendik';
  
  // Historical tracks
  riwayatPangkat: RiwayatPangkat[];
  riwayatJabatan: RiwayatJabatan[];
  riwayatPendidikan: RiwayatPendidikan[];
  riwayatDiklat: RiwayatDiklat[];
  riwayatSertifikasi: RiwayatSertifikasi[];
  riwayatSK: RiwayatSK[];
  riwayatPenugasan: RiwayatPenugasan[];
}


