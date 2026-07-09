import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, BookOpen, ArrowLeftRight, CreditCard, FolderArchive, Milestone, UserPlus, Mail,
  Calculator, FileText, GraduationCap, Award,
  UserCheck, FolderOpen, History, PlusCircle, Settings, BarChart3, School, KeyRound,
  FileCheck, ChevronRight
} from 'lucide-react';

interface HubCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient?: string;
}

const kesiswaanCards: HubCard[] = [
  {
    id: 'siswa',
    title: 'Data Siswa',
    description: 'Kelola data pokok siswa, filter kelas, status keaktifan, pencarian biodata lengkap secara real-time.',
    icon: Users,
    gradient: 'from-blue-500/10 to-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30 hover:border-indigo-500'
  },
  {
    id: 'buku-induk',
    title: 'Buku Induk Digital',
    description: 'Sistem pengarsipan data buku induk elektronik (E-Buku Induk) yang teratur, rapi, dan mudah dicari.',
    icon: BookOpen,
    gradient: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-500'
  },
  {
    id: 'mutasi',
    title: 'Mutasi Siswa',
    description: 'Pencatatan silsilah perpindahan siswa, baik mutasi masuk, keluar, maupun mutasi internal kelas.',
    icon: ArrowLeftRight,
    gradient: 'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30 hover:border-amber-500'
  },
  {
    id: 'kartu-pelajar',
    title: 'Kartu Pelajar',
    description: 'Modul cetak kartu tanda pelajar digital instan lengkap dengan barcode, foto siswa, dan kustomisasi kop.',
    icon: CreditCard,
    gradient: 'from-purple-500/10 to-fuchsia-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30 hover:border-purple-500'
  },
  {
    id: 'arsip',
    title: 'Arsip Digital Siswa',
    description: 'Penyimpanan digital berkas pendukung siswa seperti Akta Lahir, Kartu Keluarga, dan Ijazah jenjang sebelumnya.',
    icon: FolderArchive,
    gradient: 'from-cyan-500/10 to-blue-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/30 hover:border-cyan-500'
  },
  {
    id: 'alumni',
    title: 'Alumni',
    description: 'Penelusuran data alumni (Tracer Study), tahun kelulusan, histori karir, serta studi lanjut pasca kelulusan.',
    icon: Milestone,
    gradient: 'from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30 hover:border-rose-500'
  },
  {
    id: 'spmb',
    title: 'SPMB',
    description: 'Sistem Penerimaan Murid Baru dengan manajemen berkas pendaftaran dan seleksi administratif.',
    icon: UserPlus,
    gradient: 'from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-900/30 hover:border-violet-500'
  },
  {
    id: 'surat-baru',
    title: 'Surat Menyurat Siswa',
    description: 'Pembuatan surat keterangan aktif sekolah, dispensasi, serta surat kelakuan baik siswa secara instan.',
    icon: Mail,
    gradient: 'from-sky-500/10 to-blue-500/10 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/30 hover:border-sky-500'
  }
];

const akademikCards: HubCard[] = [
  {
    id: 'ijazah',
    title: 'Pengolahan Nilai Ijazah',
    description: 'Kalkulasi otomatis nilai rata-rata ujian, pembobotan nilai rapor, dan cetak lampiran nilai ijazah.',
    icon: Calculator,
    gradient: 'from-indigo-500/10 to-blue-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30 hover:border-indigo-500'
  },
  {
    id: 'skl',
    title: 'Surat Nilai Rata-rata',
    description: 'Cetak surat keterangan nilai rata-rata rapor siswa untuk pendaftaran jenjang berikutnya / beasiswa.',
    icon: FileText,
    gradient: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-500'
  },
  {
    id: 'kelulusan',
    title: 'SKL (Surat Keterangan Kelulusan)',
    description: 'Penerbitan surat keterangan kelulusan (SKL) resmi sementara sebelum ijazah asli diterbitkan kementerian.',
    icon: GraduationCap,
    gradient: 'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30 hover:border-amber-500'
  },
  {
    id: 'transkrip',
    title: 'Transkrip Nilai',
    description: 'Penyusunan dan pencetakan transkrip nilai komparatif siswa selama menempuh pendidikan di sekolah.',
    icon: Award,
    gradient: 'from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30 hover:border-purple-500'
  }
];

const kepegawaianCards: HubCard[] = [
  {
    id: 'pegawai-guru',
    title: 'Data Guru',
    description: 'Informasi biodata lengkap pendidik, kompetensi mata pelajaran, status sertifikasi, dan riwayat mengajar.',
    icon: Users,
    gradient: 'from-blue-500/10 to-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30 hover:border-indigo-500'
  },
  {
    id: 'pegawai-tendik',
    title: 'Data Tendik',
    description: 'Profil administrasi tenaga kependidikan, tata usaha, laboran, pustakawan, dan staf operasional sekolah.',
    icon: UserCheck,
    gradient: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-500'
  },
  {
    id: 'pegawai-arsip-guru',
    title: 'Arsip Digital Guru',
    description: 'E-portfolio berkas fisik digital guru seperti SK Pengangkatan, ijazah terakhir, dan sertifikat pendidik.',
    icon: FolderArchive,
    gradient: 'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30 hover:border-amber-500'
  },
  {
    id: 'pegawai-arsip-tendik',
    title: 'Arsip Digital Tendik',
    description: 'Penyimpanan berkas administrasi dan folder dokumen digital pendukung staf tenaga kependidikan.',
    icon: FolderOpen,
    gradient: 'from-purple-500/10 to-fuchsia-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30 hover:border-purple-500'
  },
  {
    id: 'pegawai-duk',
    title: 'DUK Guru',
    description: 'Daftar Urut Kepangkatan (DUK) pegawai negeri sipil/GTT berdasarkan pangkat, masa kerja, dan eselon.',
    icon: Award,
    gradient: 'from-cyan-500/10 to-blue-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/30 hover:border-cyan-500'
  }
];

const riwayatKepegawaianCards: HubCard[] = [
  {
    id: 'pegawai-riwayat-pangkat',
    title: 'Riwayat Pangkat',
    description: 'Histori pangkat, golongan, dan kenaikan pangkat berkala pendidik.',
    icon: History,
    gradient: 'from-slate-500/10 to-slate-600/10 text-slate-600 dark:text-slate-400 border-slate-150 dark:border-slate-800/60 hover:border-slate-400'
  },
  {
    id: 'pegawai-riwayat-jabatan',
    title: 'Riwayat Jabatan',
    description: 'Pencatatan riwayat jabatan fungsional maupun struktural di instansi.',
    icon: History,
    gradient: 'from-slate-500/10 to-slate-600/10 text-slate-600 dark:text-slate-400 border-slate-150 dark:border-slate-800/60 hover:border-slate-400'
  },
  {
    id: 'pegawai-riwayat-pendidikan',
    title: 'Riwayat Pendidikan',
    description: 'Histori kualifikasi akademis formal pegawai dari dasar hingga lanjutan.',
    icon: History,
    gradient: 'from-slate-500/10 to-slate-600/10 text-slate-600 dark:text-slate-400 border-slate-150 dark:border-slate-800/60 hover:border-slate-400'
  },
  {
    id: 'pegawai-riwayat-diklat',
    title: 'Riwayat Diklat',
    description: 'Catatan workshop, bimbingan teknis, kepelatihan, dan sertifikat diklat guru.',
    icon: History,
    gradient: 'from-slate-500/10 to-slate-600/10 text-slate-600 dark:text-slate-400 border-slate-150 dark:border-slate-800/60 hover:border-slate-400'
  },
  {
    id: 'pegawai-riwayat-sertifikasi',
    title: 'Riwayat Sertifikasi',
    description: 'Database nomor registrasi pendidik (NRG) dan riwayat sertifikasi profesi.',
    icon: History,
    gradient: 'from-slate-500/10 to-slate-600/10 text-slate-600 dark:text-slate-400 border-slate-150 dark:border-slate-800/60 hover:border-slate-400'
  },
  {
    id: 'pegawai-riwayat-sk',
    title: 'Riwayat SK',
    description: 'Daftar Surat Keputusan dinas, pembagian beban mengajar, dan SK bupati/ypt.',
    icon: FileCheck,
    gradient: 'from-slate-500/10 to-slate-600/10 text-slate-600 dark:text-slate-400 border-slate-150 dark:border-slate-800/60 hover:border-slate-400'
  },
  {
    id: 'pegawai-riwayat-penugasan',
    title: 'Riwayat Penugasan',
    description: 'Riwayat tugas tambahan staf (Wali Kelas, Kepala Lab, Kepala Perpus, dsb).',
    icon: History,
    gradient: 'from-slate-500/10 to-slate-600/10 text-slate-600 dark:text-slate-400 border-slate-150 dark:border-slate-800/60 hover:border-slate-400'
  }
];

const persuratanCards: HubCard[] = [
  {
    id: 'surat-baru',
    title: 'Buat Surat Baru',
    description: 'Pembuatan naskah dinas, penomoran otomatis, dan cetak kop surat digital instan.',
    icon: PlusCircle,
    gradient: 'from-blue-500/10 to-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30 hover:border-indigo-500'
  },
  {
    id: 'surat-template',
    title: 'Pengaturan Template Surat',
    description: 'Konfigurasi format kepala surat, isi baku, variabel penanda dinamis, dan penandatangan.',
    icon: Settings,
    gradient: 'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30 hover:border-amber-500'
  },
  {
    id: 'surat-arsip',
    title: 'Arsip Surat Keluar',
    description: 'Daftar rekaman nomor surat keluar yang telah diterbitkan lengkap dengan pencarian dokumen cepat.',
    icon: FolderArchive,
    gradient: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-500'
  }
];

const laporanCards: HubCard[] = [
  {
    id: 'laporan-statistik',
    title: 'Laporan Statistik Kesiswaan',
    description: 'Rekap infografis total siswa aktif, perbandingan gender, grafik pertumbuhan, dan rasio kelas.',
    icon: BarChart3,
    gradient: 'from-indigo-500/10 to-blue-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30 hover:border-indigo-500'
  },
  {
    id: 'laporan-mutasi',
    title: 'Laporan Mutasi Bulanan',
    description: 'Rekapitulasi berkala mutasi siswa masuk dan keluar untuk diserahkan ke Dinas Pendidikan.',
    icon: ArrowLeftRight,
    gradient: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-500'
  },
  {
    id: 'laporan-buku-induk',
    title: 'Cetak Buku Induk',
    description: 'Penyusunan cetak lembaran Buku Induk Siswa secara massal per angkatan atau per rombel.',
    icon: BookOpen,
    gradient: 'from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30 hover:border-purple-500'
  }
];

const pengaturanCards: HubCard[] = [
  {
    id: 'pengaturan-identitas',
    title: 'Identitas Sekolah',
    description: 'Konfigurasi profil instansi, NPSN, akreditasi, alamat, email, telepon, dan nama kepala sekolah.',
    icon: School,
    gradient: 'from-blue-500/10 to-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30 hover:border-indigo-500'
  },
  {
    id: 'pengaturan-backup',
    title: 'Database & Backup',
    description: 'Pencadangan data lokal sistem dalam file JSON, pemulihan data cadangan, dan pembersihan cache.',
    icon: Settings,
    gradient: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-500'
  },
  {
    id: 'pengaturan-password',
    title: 'Ganti Password',
    description: 'Perbarui kata sandi akun administratif guna mencegah penyalahgunaan hak akses operator.',
    icon: KeyRound,
    gradient: 'from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30 hover:border-rose-500'
  }
];

interface HubGridViewProps {
  category: 'kesiswaan' | 'akademik' | 'kepegawaian' | 'persuratan' | 'laporan' | 'pengaturan';
  onSelect: (id: any) => void;
}

export const HubGridView: React.FC<HubGridViewProps> = ({ category, onSelect }) => {
  let cards: HubCard[] = [];
  let title = '';
  let subtitle = '';

  switch (category) {
    case 'kesiswaan':
      cards = kesiswaanCards;
      title = 'Layanan Administrasi Kesiswaan';
      subtitle = 'Kelola biodata, mutasi, digitalisasi buku induk, pencetakan kartu pelajar, serta arsip pendukung siswa.';
      break;
    case 'akademik':
      cards = akademikCards;
      title = 'Pengolahan Nilai & Kelulusan Akademik';
      subtitle = 'Kelola rekapitulasi nilai ijazah, cetak Surat Keterangan Lulus (SKL), transkrip nilai, dan kalkulator rata-rata.';
      break;
    case 'kepegawaian':
      cards = kepegawaianCards;
      title = 'Data Kepegawaian & Pendidik';
      subtitle = 'Sistem informasi guru dan tenaga kependidikan (tendik), portofolio arsip kepegawaian, serta Daftar Urut Kepangkatan.';
      break;
    case 'persuratan':
      cards = persuratanCards;
      title = 'Sistem Surat Menyurat Sekolah';
      subtitle = 'Pembuatan surat dinas sekolah secara otomatis, kustomisasi kop dan template surat, serta pencatatan arsip digital.';
      break;
    case 'laporan':
      cards = laporanCards;
      title = 'Pusat Laporan & Rekapitulasi';
      subtitle = 'Kompilasi berkas laporan bulanan mutasi siswa, grafik perkembangan statistik sekolah, dan lembaran buku induk digital.';
      break;
    case 'pengaturan':
      cards = pengaturanCards;
      title = 'Konfigurasi Sistem & Pengaturan';
      subtitle = 'Atur profil dan identitas sekolah, buat cadangan basis data lokal (backup), serta ubah kata sandi akses operator.';
      break;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8 py-2">
      {/* Category Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1.5 max-w-3xl leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Primary Modules Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5"
      >
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.id}
              variants={cardVariants}
              onClick={() => onSelect(card.id)}
              className="flex flex-col text-left h-full bg-white dark:bg-[#131b2e] p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md cursor-pointer group transition-all duration-300 relative overflow-hidden"
              whileHover={{ y: -4 }}
            >
              {/* Subtle background glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Card Header & Icon */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient || 'from-slate-500/10 to-slate-600/10 text-slate-600'}`}>
                  <Icon className="w-5.5 h-5.5 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div className="text-slate-300 dark:text-slate-700 group-hover:text-brand-500 transition-colors">
                  <ChevronRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Title & Description */}
              <div className="flex-1 relative z-10">
                <h3 className="font-bold text-slate-850 dark:text-slate-100 text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {card.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Special Inner Section for History logs under Kepegawaian */}
      {category === 'kepegawaian' && (
        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Riwayat & Pengembangan Kepegawaian</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Pencatatan riwayat kepangkatan, pendidikan, diklat, penugasan, dan surat keputusan masing-masing pegawai.</p>
          </div>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
          >
            {riwayatKepegawaianCards.map((card) => {
              const Icon = card.icon;
              return (
                <motion.button
                  key={card.id}
                  variants={cardVariants}
                  onClick={() => onSelect(card.id)}
                  className="flex flex-col text-left bg-white dark:bg-[#131b2e] p-4.5 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md cursor-pointer group transition-all duration-200 relative overflow-hidden"
                  whileHover={{ y: -2 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  
                  <div className="flex items-start gap-3.5 relative z-10">
                    <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 group-hover:bg-brand-500/10 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {card.title}
                      </h4>
                      <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-1 leading-normal">
                        {card.description}
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all self-center" />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      )}
    </div>
  );
};
