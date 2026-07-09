import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../lib/StateContext';
import { compressImage } from '../lib/imageCompress';
import { 
  Pegawai, 
  ArsipPegawai,
  RiwayatPangkat,
  RiwayatJabatan,
  RiwayatPendidikan,
  RiwayatDiklat,
  RiwayatSertifikasi,
  RiwayatSK,
  RiwayatPenugasan
} from '../types';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Printer, 
  FileSpreadsheet, 
  Upload, 
  FolderOpen, 
  FileText, 
  Award, 
  GraduationCap, 
  Briefcase, 
  ShieldAlert, 
  Calendar, 
  MapPin, 
  Mail, 
  Phone,
  User,
  Clock,
  ArrowUpDown,
  BookOpen,
  ChevronRight,
  Download,
  Eye,
  FileDown
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface KepegawaianViewProps {
  activeSubTab: string;
}

export const KepegawaianView: React.FC<KepegawaianViewProps> = ({ activeSubTab }) => {
  const { 
    pegawaiList, 
    savePegawai, 
    deletePegawai, 
    getArsipPegawaiList, 
    saveArsipPegawai, 
    deleteArsipPegawai,
    schoolSettings
  } = useAppState();

  // Dialog State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPegawai, setEditingPegawai] = useState<Pegawai | null>(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [golonganFilter, setGolonganFilter] = useState('Semua');

  // Selected Pegawai for Sub-Tabs (History / Archives)
  const [selectedPegawaiId, setSelectedPegawaiId] = useState('');
  const [arsipList, setArsipList] = useState<ArsipPegawai[]>([]);

  // History Edit State
  const [isHistoryFormOpen, setIsHistoryFormOpen] = useState(false);
  const [historyType, setHistoryType] = useState<'pangkat' | 'jabatan' | 'pendidikan' | 'diklat' | 'sertifikasi' | 'sk' | 'penugasan' | null>(null);
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  
  // History Record Fields State
  const [pangkatFields, setPangkatFields] = useState<Partial<RiwayatPangkat>>({});
  const [jabatanFields, setJabatanFields] = useState<Partial<RiwayatJabatan>>({});
  const [pendidikanFields, setPendidikanFields] = useState<Partial<RiwayatPendidikan>>({});
  const [diklatFields, setDiklatFields] = useState<Partial<RiwayatDiklat>>({});
  const [sertifikasiFields, setSertifikasiFields] = useState<Partial<RiwayatSertifikasi>>({});
  const [skFields, setSkFields] = useState<Partial<RiwayatSK>>({});
  const [penugasanFields, setPenugasanFields] = useState<Partial<RiwayatPenugasan>>({});

  // Archive upload state
  const [archiveFile, setArchiveFile] = useState<File | null>(null);
  const [archiveDocName, setArchiveDocName] = useState('');
  const [archiveKeterangan, setArchiveKeterangan] = useState('');

  // Photo upload drag & drop states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64DataUrl = await compressImage(file, 400, 400, 0.8);
        setFormFields(prev => ({ ...prev, foto: base64DataUrl }));
      } catch (err) {
        console.error(err);
        alert("Gagal mengompres gambar.");
      }
    }
  };

  const handlePhotoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPhoto(true);
  };

  const handlePhotoDragLeave = () => {
    setIsDraggingPhoto(false);
  };

  const handlePhotoDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPhoto(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert("Hanya file gambar (JPG, JPEG, PNG) yang diperbolehkan.");
        return;
      }
      try {
        const base64DataUrl = await compressImage(file, 400, 400, 0.8);
        setFormFields(prev => ({ ...prev, foto: base64DataUrl }));
      } catch (err) {
        console.error(err);
        alert("Gagal mengompres gambar.");
      }
    }
  };

  // Main Form fields
  const [formFields, setFormFields] = useState<Partial<Pegawai>>({
    id: '',
    foto: '',
    nip: '',
    nuptk: '',
    namaLengkap: '',
    jk: 'L',
    tempatLahir: '',
    tanggalLahir: '',
    agama: 'Islam',
    pendidikanTerakhir: '',
    mataPelajaran: '',
    jabatan: '',
    statusKepegawaian: 'ASN',
    golongan: '',
    pangkat: '',
    tmt: '',
    noSk: '',
    noHp: '',
    email: '',
    alamat: '',
    tipePegawai: 'Guru',
    riwayatPangkat: [],
    riwayatJabatan: [],
    riwayatPendidikan: [],
    riwayatDiklat: [],
    riwayatSertifikasi: [],
    riwayatSK: [],
    riwayatPenugasan: []
  });

  // Automatically select first staff if none selected
  useEffect(() => {
    const staffType = activeSubTab.includes('tendik') ? 'Tendik' : 'Guru';
    const list = pegawaiList.filter(p => p.tipePegawai === staffType);
    if (list.length > 0 && !selectedPegawaiId) {
      setSelectedPegawaiId(list[0].id);
    } else if (pegawaiList.length > 0 && !selectedPegawaiId) {
      setSelectedPegawaiId(pegawaiList[0].id);
    }
  }, [activeSubTab, pegawaiList]);

  // Load Archives when selected pegawai changes
  useEffect(() => {
    if (selectedPegawaiId) {
      getArsipPegawaiList(selectedPegawaiId).then(setArsipList);
    } else {
      setArsipList([]);
    }
  }, [selectedPegawaiId, pegawaiList]);

  // Filtered List
  const currentTipe = activeSubTab.includes('tendik') ? 'Tendik' : 'Guru';
  const displayPegawaiList = pegawaiList.filter(p => {
    // Filter by Tab (Data Guru vs Tendik vs other sub menus)
    if (activeSubTab === 'pegawai-guru' || activeSubTab === 'pegawai-arsip-guru') {
      if (p.tipePegawai !== 'Guru') return false;
    }
    if (activeSubTab === 'pegawai-tendik' || activeSubTab === 'pegawai-arsip-tendik') {
      if (p.tipePegawai !== 'Tendik') return false;
    }

    // Search Query
    const matchesSearch = p.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.nip.includes(searchQuery) || 
                          p.nuptk.includes(searchQuery) || 
                          (p.mataPelajaran || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filters
    const matchesStatus = statusFilter === 'Semua' || p.statusKepegawaian === statusFilter;
    const matchesGolongan = golonganFilter === 'Semua' || p.golongan === golonganFilter;

    return matchesSearch && matchesStatus && matchesGolongan;
  });

  const activePegawai = pegawaiList.find(p => p.id === selectedPegawaiId) || pegawaiList[0];

  // Print list
  const handlePrint = () => {
    window.print();
  };

  // Export to Excel
  const handleExportExcel = () => {
    const dataToExport = displayPegawaiList.map((p, idx) => ({
      "No": idx + 1,
      "NIP": p.nip,
      "NUPTK": p.nuptk,
      "Nama Lengkap": p.namaLengkap,
      "L/P": p.jk,
      "Tempat Lahir": p.tempatLahir,
      "Tanggal Lahir": p.tanggalLahir,
      "Jabatan": p.jabatan,
      "Golongan/Pangkat": `${p.golongan || '-'} / ${p.pangkat || '-'}`,
      "Pendidikan Terakhir": p.pendidikanTerakhir,
      "Mata Pelajaran / Tugas": p.mataPelajaran || '-',
      "Status Kepegawaian": p.statusKepegawaian,
      "No HP": p.noHp,
      "Email": p.email,
      "Alamat": p.alamat
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    const fileName = activeSubTab.includes('tendik') ? 'Data_Tenaga_Kependidikan' : 'Data_Tenaga_Pendidik_Guru';
    XLSX.utils.book_append_sheet(wb, ws, "Kepegawaian");
    XLSX.writeFile(wb, `${fileName}_${schoolSettings.namaSekolah.replace(/\s+/g, '_')}.xlsx`);
  };

  // Import from Excel MOCK / Helper
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const bstr = event.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        const rawData: any[] = XLSX.utils.sheet_to_json(ws);

        if (rawData.length === 0) {
          alert("Berkas Excel kosong atau format tidak sesuai.");
          return;
        }

        // Map rawData to Pegawai type
        for (const row of rawData) {
          const newPeg: Pegawai = {
            id: `peg-${Math.random().toString(36).substr(2, 9)}`,
            foto: row["Foto URL"] || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
            nip: String(row["NIP"] || "-"),
            nuptk: String(row["NUPTK"] || "-"),
            namaLengkap: String(row["Nama Lengkap"] || row["Nama"] || "Pegawai Baru"),
            jk: String(row["L/P"] || "L") as 'L' | 'P',
            tempatLahir: String(row["Tempat Lahir"] || "-"),
            tanggalLahir: String(row["Tanggal Lahir"] || "1985-01-01"),
            agama: String(row["Agama"] || "Islam"),
            pendidikanTerakhir: String(row["Pendidikan Terakhir"] || "S1"),
            mataPelajaran: String(row["Mata Pelajaran"] || row["Mata Pelajaran / Tugas"] || "-"),
            jabatan: String(row["Jabatan"] || "Guru"),
            statusKepegawaian: String(row["Status Kepegawaian"] || "ASN") as 'ASN' | 'Honorer' | 'PPPK',
            golongan: String(row["Golongan"] || "-"),
            pangkat: String(row["Pangkat"] || "-"),
            tmt: String(row["TMT"] || "-"),
            noSk: String(row["No SK"] || "-"),
            noHp: String(row["No HP"] || "-"),
            email: String(row["Email"] || "-"),
            alamat: String(row["Alamat"] || "-"),
            tipePegawai: currentTipe,
            riwayatPangkat: [],
            riwayatJabatan: [],
            riwayatPendidikan: [],
            riwayatDiklat: [],
            riwayatSertifikasi: [],
            riwayatSK: [],
            riwayatPenugasan: []
          };
          await savePegawai(newPeg);
        }

        alert(`Berhasil mengimpor ${rawData.length} data pegawai.`);
      } catch (err) {
        console.error(err);
        alert("Gagal membaca berkas Excel. Pastikan format kolom sesuai.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // Open Add Dialog
  const openAddForm = () => {
    setEditingPegawai(null);
    setFormFields({
      id: `peg-${Math.random().toString(36).substr(2, 9)}`,
      foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      nip: '',
      nuptk: '',
      namaLengkap: '',
      jk: 'L',
      tempatLahir: '',
      tanggalLahir: '',
      agama: 'Islam',
      pendidikanTerakhir: '',
      mataPelajaran: '',
      jabatan: '',
      statusKepegawaian: 'ASN',
      golongan: '',
      pangkat: '',
      tmt: '',
      noSk: '',
      noHp: '',
      email: '',
      alamat: '',
      tipePegawai: currentTipe,
      riwayatPangkat: [],
      riwayatJabatan: [],
      riwayatPendidikan: [],
      riwayatDiklat: [],
      riwayatSertifikasi: [],
      riwayatSK: [],
      riwayatPenugasan: []
    });
    setIsFormOpen(true);
  };

  // Open Edit Dialog
  const openEditForm = (peg: Pegawai) => {
    setEditingPegawai(peg);
    setFormFields({ ...peg });
    setIsFormOpen(true);
  };

  // Submit Main Pegawai Form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFields.namaLengkap) {
      alert("Nama lengkap wajib diisi.");
      return;
    }
    await savePegawai(formFields as Pegawai);
    setIsFormOpen(false);
    alert("Data pegawai berhasil disimpan.");
  };

  const handleDeletePegawai = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data pegawai ini beserta seluruh riwayatnya?")) {
      await deletePegawai(id);
      if (selectedPegawaiId === id) setSelectedPegawaiId('');
      alert("Data pegawai berhasil dihapus.");
    }
  };

  // DUK Sorting Algorithm based on indonesian official regulations
  // Rank criteria sequence:
  // 1. Golongan Ruang (Pembina IV/e highest, Juru I/a lowest)
  // 2. TMT Golongan Ruang (older is higher)
  // 3. Tingkat Pendidikan Terakhir (S3, S2, S1, etc)
  // 4. Umur / Usia (older is higher)
  const getSortedDUKList = (): Pegawai[] => {
    const asnList = pegawaiList.filter(p => p.statusKepegawaian === 'ASN' && p.tipePegawai === 'Guru');
    
    const parseGolonganRank = (gol: string): number => {
      const ranks: { [key: string]: number } = {
        'IV/e': 17, 'IV/d': 16, 'IV/c': 15, 'IV/b': 14, 'IV/a': 13,
        'III/d': 12, 'III/c': 11, 'III/b': 10, 'III/a': 9,
        'II/d': 8, 'II/c': 7, 'II/b': 6, 'II/a': 5,
        'I/d': 4, 'I/c': 3, 'I/b': 2, 'I/a': 1
      };
      return ranks[gol] || 0;
    };

    const parsePendidikanRank = (edu: string): number => {
      const e = edu.toUpperCase();
      if (e.includes('S3')) return 5;
      if (e.includes('S2')) return 4;
      if (e.includes('S1') || e.includes('D4')) return 3;
      if (e.includes('D3')) return 2;
      if (e.includes('D2') || e.includes('D1')) return 1;
      return 0;
    };

    return [...asnList].sort((a, b) => {
      // 1. Compare Golongan
      const rankA = parseGolonganRank(a.golongan || '');
      const rankB = parseGolonganRank(b.golongan || '');
      if (rankA !== rankB) return rankB - rankA;

      // 2. Compare TMT Golongan
      const tmtA = new Date(a.tmt || '1990-01-01').getTime();
      const tmtB = new Date(b.tmt || '1990-01-01').getTime();
      if (tmtA !== tmtB) return tmtA - tmtB;

      // 3. Compare Pendidikan Last Level
      const eduA = parsePendidikanRank(a.pendidikanTerakhir || '');
      const eduB = parsePendidikanRank(b.pendidikanTerakhir || '');
      if (eduA !== eduB) return eduB - eduA;

      // 4. Compare Age (Older first)
      const birthA = new Date(a.tanggalLahir || '1990-01-01').getTime();
      const birthB = new Date(b.tanggalLahir || '1990-01-01').getTime();
      return birthA - birthB;
    });
  };

  // Upload/Create Digital Archive
  const handleUploadArchive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPegawaiId) {
      alert("Silakan pilih pegawai terlebih dahulu.");
      return;
    }
    if (!archiveDocName) {
      alert("Nama dokumen wajib diisi.");
      return;
    }

    const newArchive: ArsipPegawai = {
      id: `ap-${Math.random().toString(36).substr(2, 9)}`,
      pegawaiId: selectedPegawaiId,
      namaDokumen: archiveDocName,
      fileName: archiveFile ? archiveFile.name : `${archiveDocName.replace(/\s+/g, '_').toLowerCase()}.pdf`,
      fileType: archiveFile ? archiveFile.type : 'application/pdf',
      fileData: 'PDF_MOCK_BASE64_DATA',
      uploadedAt: new Date().toISOString().split('T')[0],
      keterangan: archiveKeterangan
    };

    await saveArsipPegawai(newArchive);
    setArsipList(prev => [...prev, newArchive]);
    setArchiveDocName('');
    setArchiveKeterangan('');
    setArchiveFile(null);
    alert("Arsip dokumen berhasil diunggah.");
  };

  const handleDeleteArchive = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus dokumen arsip digital ini?")) {
      await deleteArsipPegawai(id);
      setArsipList(prev => prev.filter(item => item.id !== id));
      alert("Arsip dokumen berhasil dihapus.");
    }
  };

  // HISTORY RECORDS MANAGEMENT (Save & Edit)
  const openHistoryForm = (type: typeof historyType, item: any = null) => {
    setHistoryType(type);
    setEditingHistoryId(item ? item.id : null);

    if (type === 'pangkat') {
      setPangkatFields(item || { id: `rp-${Math.random().toString(36).substr(2, 9)}`, golongan: '', pangkat: '', tmt: '', noSk: '', keterangan: '' });
    } else if (type === 'jabatan') {
      setJabatanFields(item || { id: `rj-${Math.random().toString(36).substr(2, 9)}`, jabatan: '', tmt: '', noSk: '' });
    } else if (type === 'pendidikan') {
      setPendidikanFields(item || { id: `rpe-${Math.random().toString(36).substr(2, 9)}`, tingkat: 'S1', namaSekolah: '', jurusan: '', tahunLulus: '', noIjazah: '' });
    } else if (type === 'diklat') {
      setDiklatFields(item || { id: `rd-${Math.random().toString(36).substr(2, 9)}`, namaDiklat: '', penyelenggara: '', tahun: '', durasiJam: '', noSertifikat: '' });
    } else if (type === 'sertifikasi') {
      setSertifikasiFields(item || { id: `rs-${Math.random().toString(36).substr(2, 9)}`, jenisSertifikasi: '', nomorSertifikat: '', tahun: '', bidangStudi: '' });
    } else if (type === 'sk') {
      setSkFields(item || { id: `rsk-${Math.random().toString(36).substr(2, 9)}`, tentang: '', noSk: '', tanggalSk: '', pejabatPenandatangan: '' });
    } else if (type === 'penugasan') {
      setPenugasanFields(item || { id: `rtn-${Math.random().toString(36).substr(2, 9)}`, tugas: '', lokasi: '', tmtMulai: '', noSk: '' });
    }

    setIsHistoryFormOpen(true);
  };

  const handleHistorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePegawai) {
      alert("Pegawai belum dipilih.");
      return;
    }

    const updatedPegawai = { ...activePegawai };

    if (historyType === 'pangkat') {
      const list = [...(updatedPegawai.riwayatPangkat || [])];
      if (editingHistoryId) {
        const idx = list.findIndex(item => item.id === editingHistoryId);
        if (idx >= 0) list[idx] = pangkatFields as RiwayatPangkat;
      } else {
        list.push(pangkatFields as RiwayatPangkat);
      }
      updatedPegawai.riwayatPangkat = list;
    } else if (historyType === 'jabatan') {
      const list = [...(updatedPegawai.riwayatJabatan || [])];
      if (editingHistoryId) {
        const idx = list.findIndex(item => item.id === editingHistoryId);
        if (idx >= 0) list[idx] = jabatanFields as RiwayatJabatan;
      } else {
        list.push(jabatanFields as RiwayatJabatan);
      }
      updatedPegawai.riwayatJabatan = list;
    } else if (historyType === 'pendidikan') {
      const list = [...(updatedPegawai.riwayatPendidikan || [])];
      if (editingHistoryId) {
        const idx = list.findIndex(item => item.id === editingHistoryId);
        if (idx >= 0) list[idx] = pendidikanFields as RiwayatPendidikan;
      } else {
        list.push(pendidikanFields as RiwayatPendidikan);
      }
      updatedPegawai.riwayatPendidikan = list;
    } else if (historyType === 'diklat') {
      const list = [...(updatedPegawai.riwayatDiklat || [])];
      if (editingHistoryId) {
        const idx = list.findIndex(item => item.id === editingHistoryId);
        if (idx >= 0) list[idx] = diklatFields as RiwayatDiklat;
      } else {
        list.push(diklatFields as RiwayatDiklat);
      }
      updatedPegawai.riwayatDiklat = list;
    } else if (historyType === 'sertifikasi') {
      const list = [...(updatedPegawai.riwayatSertifikasi || [])];
      if (editingHistoryId) {
        const idx = list.findIndex(item => item.id === editingHistoryId);
        if (idx >= 0) list[idx] = sertifikasiFields as RiwayatSertifikasi;
      } else {
        list.push(sertifikasiFields as RiwayatSertifikasi);
      }
      updatedPegawai.riwayatSertifikasi = list;
    } else if (historyType === 'sk') {
      const list = [...(updatedPegawai.riwayatSK || [])];
      if (editingHistoryId) {
        const idx = list.findIndex(item => item.id === editingHistoryId);
        if (idx >= 0) list[idx] = skFields as RiwayatSK;
      } else {
        list.push(skFields as RiwayatSK);
      }
      updatedPegawai.riwayatSK = list;
    } else if (historyType === 'penugasan') {
      const list = [...(updatedPegawai.riwayatPenugasan || [])];
      if (editingHistoryId) {
        const idx = list.findIndex(item => item.id === editingHistoryId);
        if (idx >= 0) list[idx] = penugasanFields as RiwayatPenugasan;
      } else {
        list.push(penugasanFields as RiwayatPenugasan);
      }
      updatedPegawai.riwayatPenugasan = list;
    }

    await savePegawai(updatedPegawai);
    setIsHistoryFormOpen(false);
    alert("Data riwayat kepegawaian berhasil diperbarui.");
  };

  const handleHistoryDelete = async (type: string, itemId: string) => {
    if (!activePegawai) return;
    if (confirm("Apakah Anda yakin ingin menghapus data riwayat ini?")) {
      const updatedPegawai = { ...activePegawai };

      if (type === 'pangkat') {
        updatedPegawai.riwayatPangkat = (updatedPegawai.riwayatPangkat || []).filter(i => i.id !== itemId);
      } else if (type === 'jabatan') {
        updatedPegawai.riwayatJabatan = (updatedPegawai.riwayatJabatan || []).filter(i => i.id !== itemId);
      } else if (type === 'pendidikan') {
        updatedPegawai.riwayatPendidikan = (updatedPegawai.riwayatPendidikan || []).filter(i => i.id !== itemId);
      } else if (type === 'diklat') {
        updatedPegawai.riwayatDiklat = (updatedPegawai.riwayatDiklat || []).filter(i => i.id !== itemId);
      } else if (type === 'sertifikasi') {
        updatedPegawai.riwayatSertifikasi = (updatedPegawai.riwayatSertifikasi || []).filter(i => i.id !== itemId);
      } else if (type === 'sk') {
        updatedPegawai.riwayatSK = (updatedPegawai.riwayatSK || []).filter(i => i.id !== itemId);
      } else if (type === 'penugasan') {
        updatedPegawai.riwayatPenugasan = (updatedPegawai.riwayatPenugasan || []).filter(i => i.id !== itemId);
      }

      await savePegawai(updatedPegawai);
      alert("Data riwayat berhasil dihapus.");
    }
  };

  // RENDER DUK GURU VIEW
  if (activeSubTab === 'pegawai-duk') {
    const dukList = getSortedDUKList();
    return (
      <div className="bg-white dark:bg-[#131b2e] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg font-sans">Daftar Urut Kepangkatan (DUK) Guru</h3>
            <p className="text-slate-400 text-xs mt-0.5">Urutan kepangkatan guru ASN berdasarkan regulasi kepegawaian resmi (Golongan, TMT, Jabatan, Pendidikan, Usia).</p>
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Lembar DUK</span>
          </button>
        </div>

        {/* School official heading for print */}
        <div className="hidden print:block text-center space-y-1 mb-6 border-b-2 border-slate-900 pb-3">
          <h2 className="font-bold text-lg uppercase">PEMERINTAH KABUPATEN KEPULAUAN MERANTI</h2>
          <h1 className="font-black text-xl uppercase">DINAS PENDIDIKAN DAN KEBUDAYAAN</h1>
          <h2 className="font-bold text-base uppercase">SMP NEGERI 1 RANGSANG</h2>
          <p className="text-xs italic text-slate-500">Alamat: {schoolSettings.alamat} Kode Pos {schoolSettings.kodePos}</p>
          <div className="font-bold text-sm uppercase pt-3 border-t border-slate-300 mt-2">DAFTAR URUT KEPANGKATAN (DUK) TENAGA PENDIDIK</div>
          <p className="text-xs">Tahun Pelajaran {schoolSettings.tahunPelajaran}</p>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="p-3 text-center w-12">No DUK</th>
                <th className="p-3">Nama Lengkap / NIP</th>
                <th className="p-3 text-center">Golongan</th>
                <th className="p-3 text-center">Pangkat</th>
                <th className="p-3 text-center">TMT Gol</th>
                <th className="p-3">Jabatan Administrasi</th>
                <th className="p-3">Pendidikan Terakhir</th>
                <th className="p-3 text-center">Tanggal Lahir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-600 dark:text-slate-300">
              {dukList.map((p, idx) => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="p-3 text-center font-bold text-brand-600 dark:text-brand-400 font-mono text-sm">{idx + 1}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-800 dark:text-slate-100">{p.namaLengkap}</div>
                    <div className="text-[10px] text-slate-400 font-mono">NIP: {p.nip}</div>
                  </td>
                  <td className="p-3 text-center font-semibold text-slate-700 dark:text-slate-200">{p.golongan || '-'}</td>
                  <td className="p-3 text-center text-slate-500">{p.pangkat || '-'}</td>
                  <td className="p-3 text-center font-mono text-slate-500">{p.tmt || '-'}</td>
                  <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{p.jabatan || '-'}</td>
                  <td className="p-3 text-slate-500">{p.pendidikanTerakhir}</td>
                  <td className="p-3 text-center font-mono text-slate-500">{p.tanggalLahir}</td>
                </tr>
              ))}
              {dukList.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-sm">Belum ada Guru ASN berstatus ASN terdaftar untuk penyusunan DUK.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // RENDER DIGITAL ARCHIVE VIEWS (ARSIP GURU & ARSIP TENDIK)
  if (activeSubTab === 'pegawai-arsip-guru' || activeSubTab === 'pegawai-arsip-tendik') {
    const listStaff = pegawaiList.filter(p => p.tipePegawai === currentTipe);
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Staff Selector */}
        <div className="lg:col-span-1 bg-white dark:bg-[#131b2e] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-[calc(100vh-200px)] overflow-y-auto space-y-3 transition-colors no-print">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">Daftar {currentTipe}</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
            />
          </div>
          <div className="space-y-1.5 pt-1">
            {listStaff.filter(p => p.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase())).map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPegawaiId(p.id)}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all text-xs cursor-pointer ${activePegawai?.id === p.id ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                <div>
                  <div>{p.namaLengkap}</div>
                  <div className="text-[10px] text-slate-400 font-mono">NIP: {p.nip}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Digital Archive Folder */}
        <div className="lg:col-span-3 space-y-6">
          {activePegawai ? (
            <div className="bg-white dark:bg-[#131b2e] rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg font-sans">Berkas Folder Arsip Digital</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Sistem penyimpanan dokumen kepegawaian Guru & Tenaga Kependidikan untuk keperluan berkas kenaikan pangkat.</p>
                </div>
              </div>

              {/* Staff mini Profile Card */}
              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-colors">
                <img 
                  src={activePegawai.foto} 
                  alt={activePegawai.namaLengkap} 
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  referrerPolicy="no-referrer"
                />
                <div className="text-xs">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{activePegawai.namaLengkap}</h4>
                  <p className="text-slate-500 mt-0.5">Jabatan: {activePegawai.jabatan} | Status: {activePegawai.statusKepegawaian} | NIP: {activePegawai.nip}</p>
                </div>
              </div>

              {/* Upload Document Form Inline */}
              <form onSubmit={handleUploadArchive} className="bg-slate-50/50 dark:bg-slate-800/10 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 items-end transition-colors no-print">
                <div className="md:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Jenis Dokumen</label>
                  <select 
                    value={archiveDocName}
                    onChange={(e) => setArchiveDocName(e.target.value)}
                    className="w-full text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 text-slate-800 dark:text-slate-200 focus:outline-none transition-colors"
                  >
                    <option value="">-- Pilih Dokumen --</option>
                    <option value="Ijazah">Ijazah Terakhir</option>
                    <option value="SK CPNS">SK CPNS</option>
                    <option value="SK PNS">SK PNS</option>
                    <option value="Sertifikat Pendidik">Sertifikat Pendidik (Serdik)</option>
                    <option value="SK Kenaikan Pangkat">SK Kenaikan Pangkat</option>
                    <option value="SK Pembagian Tugas">SK Pembagian Tugas (SKBM)</option>
                    <option value="Piagam Penghargaan">Piagam Penghargaan</option>
                    <option value="Sertifikat Diklat">Sertifikat Diklat</option>
                  </select>
                </div>
                <div className="md:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pilih File (PDF/Image)</label>
                  <input 
                    type="file" 
                    onChange={(e) => setArchiveFile(e.target.files?.[0] || null)}
                    className="w-full text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 focus:outline-none text-slate-500"
                  />
                </div>
                <div className="md:col-span-1 flex gap-2">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Catatan</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: SK Kenaikan Pangkat IV/a"
                      value={archiveKeterangan}
                      onChange={(e) => setArchiveKeterangan(e.target.value)}
                      className="w-full text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 text-slate-800 dark:text-slate-200 focus:outline-none transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-brand-600 hover:bg-brand-700 text-white p-2.5 rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Archive List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {arsipList.map((doc) => (
                  <div key={doc.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-start justify-between gap-3 bg-white dark:bg-[#151e33] hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="text-xs space-y-0.5">
                        <h5 className="font-bold text-slate-800 dark:text-slate-200">{doc.namaDokumen}</h5>
                        <p className="text-slate-400 font-mono text-[9px]">{doc.fileName}</p>
                        <p className="text-slate-500 font-medium text-[10px] mt-1">{doc.keterangan || '-'}</p>
                        <p className="text-slate-400 text-[9px] mt-0.5">Diunggah pada: {doc.uploadedAt}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0 no-print">
                      <button
                        onClick={() => alert(`Pratinjau berkas digital: ${doc.namaDokumen} - Simulasi viewer PDF Berhasil.`)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
                        title="Lihat Berkas"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteArchive(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
                        title="Hapus Berkas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {arsipList.length === 0 && (
                  <div className="col-span-2 p-8 text-center text-slate-400 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    Belum ada berkas arsip digital diunggah untuk pegawai ini.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#131b2e] p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center text-slate-400 text-sm transition-colors">
              Silakan pilih pegawai untuk menampilkan dan mengunggah berkas arsip digital.
            </div>
          )}
        </div>
      </div>
    );
  }

  // RENDER HISTORICAL RECORDS VIEWS (Riwayat Pangkat, Riwayat Jabatan, Riwayat Pendidikan, Riwayat Diklat, Riwayat Sertifikasi, Riwayat SK, Riwayat Penugasan)
  const isHistoryTab = activeSubTab.includes('riwayat');
  if (isHistoryTab) {
    const currentHistType = activeSubTab.replace('pegawai-riwayat-', '') as typeof historyType;
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Staff List */}
        <div className="lg:col-span-1 bg-white dark:bg-[#131b2e] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-[calc(100vh-200px)] overflow-y-auto space-y-3 transition-colors no-print">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">Pilih Pegawai</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-1.5 pt-1">
            {pegawaiList.filter(p => p.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase())).map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPegawaiId(p.id)}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all text-xs cursor-pointer ${activePegawai?.id === p.id ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                <div>
                  <div>{p.namaLengkap}</div>
                  <div className="text-[10px] text-slate-400 font-mono">NIP: {p.nip}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Career Historical Timelines */}
        <div className="lg:col-span-3 space-y-6">
          {activePegawai ? (
            <div className="bg-white dark:bg-[#131b2e] rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg font-sans uppercase tracking-wider">
                    {activeSubTab.replace('pegawai-', '').replace('-', ' ')}
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">Kelola data riwayat jejak karir dan portofolio kepegawaian staf terkait secara berurutan.</p>
                </div>
                <button
                  onClick={() => openHistoryForm(currentHistType)}
                  className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Jejak Riwayat</span>
                </button>
              </div>

              {/* Staff mini Profile Card */}
              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-colors">
                <img 
                  src={activePegawai.foto} 
                  alt={activePegawai.namaLengkap} 
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  referrerPolicy="no-referrer"
                />
                <div className="text-xs">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{activePegawai.namaLengkap}</h4>
                  <p className="text-slate-500 mt-0.5">NIP: {activePegawai.nip} | Status: {activePegawai.statusKepegawaian} | Jabatan: {activePegawai.jabatan}</p>
                </div>
              </div>

              {/* Display list based on active sub tab */}
              <div className="space-y-4 pt-2">
                {/* 1. Riwayat Pangkat */}
                {currentHistType === 'pangkat' && (activePegawai.riwayatPangkat || []).map((rp) => (
                  <div key={rp.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex justify-between items-start gap-4 bg-white dark:bg-[#151e33] hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 shrink-0">
                        <ArrowUpDown className="w-5 h-5" />
                      </div>
                      <div className="text-xs space-y-1">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Pangkat: {rp.pangkat} ({rp.golongan})</h4>
                        <p className="text-slate-500 font-semibold">TMT Golongan: <span className="font-mono">{rp.tmt}</span></p>
                        <p className="text-slate-400">Nomor SK: <span className="font-mono">{rp.noSk}</span></p>
                        {rp.keterangan && <p className="text-slate-500 italic mt-1 bg-slate-50 dark:bg-slate-900 p-1.5 rounded border dark:border-slate-800">{rp.keterangan}</p>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openHistoryForm('pangkat', rp)} className="p-1.5 text-slate-400 hover:text-brand-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleHistoryDelete('pangkat', rp.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}

                {/* 2. Riwayat Jabatan */}
                {currentHistType === 'jabatan' && (activePegawai.riwayatJabatan || []).map((rj) => (
                  <div key={rj.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex justify-between items-start gap-4 bg-white dark:bg-[#151e33] hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 shrink-0">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div className="text-xs space-y-1">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{rj.jabatan}</h4>
                        <p className="text-slate-500 font-semibold">TMT Jabatan: <span className="font-mono">{rj.tmt}</span></p>
                        <p className="text-slate-400">Nomor SK Pengangkatan: <span className="font-mono">{rj.noSk}</span></p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openHistoryForm('jabatan', rj)} className="p-1.5 text-slate-400 hover:text-brand-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleHistoryDelete('jabatan', rj.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}

                {/* 3. Riwayat Pendidikan */}
                {currentHistType === 'pendidikan' && (activePegawai.riwayatPendidikan || []).map((rpe) => (
                  <div key={rpe.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex justify-between items-start gap-4 bg-white dark:bg-[#151e33] hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div className="text-xs space-y-1">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{rpe.tingkat} - {rpe.jurusan}</h4>
                        <p className="text-slate-700 font-bold">{rpe.namaSekolah}</p>
                        <p className="text-slate-500">Tahun Lulus: <span className="font-mono font-bold">{rpe.tahunLulus}</span></p>
                        <p className="text-slate-400">No Ijazah: <span className="font-mono">{rpe.noIjazah}</span></p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openHistoryForm('pendidikan', rpe)} className="p-1.5 text-slate-400 hover:text-brand-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleHistoryDelete('pendidikan', rpe.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}

                {/* 4. Riwayat Diklat */}
                {currentHistType === 'diklat' && (activePegawai.riwayatDiklat || []).map((rd) => (
                  <div key={rd.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex justify-between items-start gap-4 bg-white dark:bg-[#151e33] hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="text-xs space-y-1">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{rd.namaDiklat}</h4>
                        <p className="text-slate-700 font-semibold">Penyelenggara: {rd.penyelenggara} | Tahun: {rd.tahun}</p>
                        <p className="text-slate-500">Durasi: <span className="font-bold">{rd.durasiJam} Jam</span></p>
                        <p className="text-slate-400">No Sertifikat: <span className="font-mono">{rd.noSertifikat}</span></p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openHistoryForm('diklat', rd)} className="p-1.5 text-slate-400 hover:text-brand-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleHistoryDelete('diklat', rd.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}

                {/* 5. Riwayat Sertifikasi */}
                {currentHistType === 'sertifikasi' && (activePegawai.riwayatSertifikasi || []).map((rs) => (
                  <div key={rs.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex justify-between items-start gap-4 bg-white dark:bg-[#151e33] hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="text-xs space-y-1">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{rs.jenisSertifikasi}</h4>
                        <p className="text-slate-700 font-semibold">Bidang Studi: {rs.bidangStudi} | Tahun: {rs.tahun}</p>
                        <p className="text-slate-400">No Sertifikat Pendidik: <span className="font-mono">{rs.nomorSertifikat}</span></p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openHistoryForm('sertifikasi', rs)} className="p-1.5 text-slate-400 hover:text-brand-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleHistoryDelete('sertifikasi', rs.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}

                {/* 6. Riwayat SK */}
                {currentHistType === 'sk' && (activePegawai.riwayatSK || []).map((rsk) => (
                  <div key={rsk.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex justify-between items-start gap-4 bg-white dark:bg-[#151e33] hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="text-xs space-y-1">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{rsk.tentang}</h4>
                        <p className="text-slate-700">Nomor SK: <span className="font-mono font-bold">{rsk.noSk}</span></p>
                        <p className="text-slate-500">Tanggal SK: <span className="font-mono">{rsk.tanggalSk}</span></p>
                        <p className="text-slate-400">Pejabat Penandatangan: {rsk.pejabatPenandatangan}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openHistoryForm('sk', rsk)} className="p-1.5 text-slate-400 hover:text-brand-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleHistoryDelete('sk', rsk.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}

                {/* 7. Riwayat Penugasan */}
                {currentHistType === 'penugasan' && (activePegawai.riwayatPenugasan || []).map((rtn) => (
                  <div key={rtn.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex justify-between items-start gap-4 bg-white dark:bg-[#151e33] hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="text-xs space-y-1">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{rtn.tugas}</h4>
                        <p className="text-slate-700">Lokasi / Instansi: {rtn.lokasi}</p>
                        <p className="text-slate-500">TMT Mulai Tugas: <span className="font-mono">{rtn.tmtMulai}</span></p>
                        <p className="text-slate-400">Nomor Surat Tugas: <span className="font-mono">{rtn.noSk}</span></p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openHistoryForm('penugasan', rtn)} className="p-1.5 text-slate-400 hover:text-brand-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleHistoryDelete('penugasan', rtn.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}

                {(!activePegawai[`riwayat${currentHistType ? currentHistType.charAt(0).toUpperCase() + currentHistType.slice(1) : ''}`] || activePegawai[`riwayat${currentHistType ? currentHistType.charAt(0).toUpperCase() + currentHistType.slice(1) : ''}`].length === 0) && (
                  <div className="p-8 text-center text-slate-400 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    Belum ada catatan riwayat karir kategori ini terdaftar untuk pegawai ini.
                  </div>
                )}
              </div>

              {/* MOCK POPUP HISTORY FORM */}
              {isHistoryFormOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-[#131b2e] border dark:border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base uppercase">Isi Data Riwayat - {historyType}</h3>
                    
                    <form onSubmit={handleHistorySubmit} className="space-y-3.5">
                      {historyType === 'pangkat' && (
                        <>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Golongan Ruang</label>
                            <input type="text" value={pangkatFields.golongan || ''} onChange={(e) => setPangkatFields({...pangkatFields, golongan: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" placeholder="Contoh: III/c" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Nama Pangkat</label>
                            <input type="text" value={pangkatFields.pangkat || ''} onChange={(e) => setPangkatFields({...pangkatFields, pangkat: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" placeholder="Contoh: Penata" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">TMT Pangkat</label>
                            <input type="date" value={pangkatFields.tmt || ''} onChange={(e) => setPangkatFields({...pangkatFields, tmt: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Nomor SK</label>
                            <input type="text" value={pangkatFields.noSk || ''} onChange={(e) => setPangkatFields({...pangkatFields, noSk: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" placeholder="Contoh: 823/Disdik-KP/2026/02" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Keterangan / Catatan</label>
                            <input type="text" value={pangkatFields.keterangan || ''} onChange={(e) => setPangkatFields({...pangkatFields, keterangan: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" placeholder="Contoh: Kenaikan pangkat reguler" />
                          </div>
                        </>
                      )}

                      {historyType === 'jabatan' && (
                        <>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Nama Jabatan Administrasi</label>
                            <input type="text" value={jabatanFields.jabatan || ''} onChange={(e) => setJabatanFields({...jabatanFields, jabatan: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" placeholder="Contoh: Guru Madya" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">TMT Jabatan</label>
                            <input type="date" value={jabatanFields.tmt || ''} onChange={(e) => setJabatanFields({...jabatanFields, tmt: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Nomor SK Pengangkatan</label>
                            <input type="text" value={jabatanFields.noSk || ''} onChange={(e) => setJabatanFields({...jabatanFields, noSk: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" placeholder="Contoh: 821.2/Disdik-KP/2026/02" required />
                          </div>
                        </>
                      )}

                      {historyType === 'pendidikan' && (
                        <>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Tingkat Pendidikan</label>
                            <select value={pendidikanFields.tingkat || 'S1'} onChange={(e) => setPendidikanFields({...pendidikanFields, tingkat: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900">
                              <option value="D1">D1</option>
                              <option value="D2">D2</option>
                              <option value="D3">D3</option>
                              <option value="D4">D4</option>
                              <option value="S1">S1</option>
                              <option value="S2">S2</option>
                              <option value="S3">S3</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Nama Lembaga / Universitas</label>
                            <input type="text" value={pendidikanFields.namaSekolah || ''} onChange={(e) => setPendidikanFields({...pendidikanFields, namaSekolah: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" placeholder="Contoh: Universitas Riau" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Jurusan / Program Studi</label>
                            <input type="text" value={pendidikanFields.jurusan || ''} onChange={(e) => setPendidikanFields({...pendidikanFields, jurusan: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" placeholder="Contoh: Pendidikan Fisika" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Tahun Lulus</label>
                            <input type="text" value={pendidikanFields.tahunLulus || ''} onChange={(e) => setPendidikanFields({...pendidikanFields, tahunLulus: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" placeholder="Contoh: 2012" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Nomor Ijazah</label>
                            <input type="text" value={pendidikanFields.noIjazah || ''} onChange={(e) => setPendidikanFields({...pendidikanFields, noIjazah: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" placeholder="Contoh: UR-129-83921" required />
                          </div>
                        </>
                      )}

                      {historyType === 'diklat' && (
                        <>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Nama Diklat / Pelatihan</label>
                            <input type="text" value={diklatFields.namaDiklat || ''} onChange={(e) => setDiklatFields({...diklatFields, namaDiklat: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" placeholder="Contoh: Diklat Guru Penggerak" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Penyelenggara</label>
                            <input type="text" value={diklatFields.penyelenggara || ''} onChange={(e) => setDiklatFields({...diklatFields, penyelenggara: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" placeholder="Contoh: BPMP Riau" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Tahun</label>
                            <input type="text" value={diklatFields.tahun || ''} onChange={(e) => setDiklatFields({...diklatFields, tahun: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" placeholder="Contoh: 2023" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Durasi (JP)</label>
                            <input type="number" value={diklatFields.durasiJam || ''} onChange={(e) => setDiklatFields({...diklatFields, durasiJam: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" placeholder="Contoh: 32" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Nomor Sertifikat</label>
                            <input type="text" value={diklatFields.noSertifikat || ''} onChange={(e) => setDiklatFields({...diklatFields, noSertifikat: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" placeholder="Contoh: SER-82912-2023" required />
                          </div>
                        </>
                      )}

                      {historyType === 'sertifikasi' && (
                        <>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Jenis Sertifikasi</label>
                            <input type="text" value={sertifikasiFields.jenisSertifikasi || ''} onChange={(e) => setSertifikasiFields({...sertifikasiFields, jenisSertifikasi: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" placeholder="Contoh: Sertifikasi Pendidik Profesional" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Nomor Registrasi / Sertifikat</label>
                            <input type="text" value={sertifikasiFields.nomorSertifikat || ''} onChange={(e) => setSertifikasiFields({...sertifikasiFields, nomorSertifikat: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" placeholder="Contoh: 1202839120" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Tahun Kelulusan</label>
                            <input type="text" value={sertifikasiFields.tahun || ''} onChange={(e) => setSertifikasiFields({...sertifikasiFields, tahun: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" placeholder="Contoh: 2018" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Bidang Studi Sertifikasi</label>
                            <input type="text" value={sertifikasiFields.bidangStudi || ''} onChange={(e) => setSertifikasiFields({...sertifikasiFields, bidangStudi: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" placeholder="Contoh: Matematika" required />
                          </div>
                        </>
                      )}

                      {historyType === 'sk' && (
                        <>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Perihal SK / Tentang</label>
                            <input type="text" value={skFields.tentang || ''} onChange={(e) => setSkFields({...skFields, tentang: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" placeholder="Contoh: SK Pengangkatan Guru Inti Kabupaten" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Nomor SK Resmi</label>
                            <input type="text" value={skFields.noSk || ''} onChange={(e) => setSkFields({...skFields, noSk: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" placeholder="Contoh: 821.3/SK-G/2025/12" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Tanggal Penetapan SK</label>
                            <input type="date" value={skFields.tanggalSk || ''} onChange={(e) => setSkFields({...skFields, tanggalSk: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Pejabat Penandatangan</label>
                            <input type="text" value={skFields.pejabatPenandatangan || ''} onChange={(e) => setSkFields({...skFields, pejabatPenandatangan: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" placeholder="Contoh: Kepala Dinas Pendidikan Kep. Meranti" required />
                          </div>
                        </>
                      )}

                      {historyType === 'penugasan' && (
                        <>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Tugas / Jabatan Tugas</label>
                            <input type="text" value={penugasanFields.tugas || ''} onChange={(e) => setPenugasanFields({...penugasanFields, tugas: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" placeholder="Contoh: Bendahara BOS Sekolah" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Lokasi / Instansi</label>
                            <input type="text" value={penugasanFields.lokasi || ''} onChange={(e) => setPenugasanFields({...penugasanFields, lokasi: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" placeholder="Contoh: SMPN 1 Rangsang" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">TMT Mulai Tugas</label>
                            <input type="date" value={penugasanFields.tmtMulai || ''} onChange={(e) => setPenugasanFields({...penugasanFields, tmtMulai: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Nomor Surat Tugas</label>
                            <input type="text" value={penugasanFields.noSk || ''} onChange={(e) => setPenugasanFields({...penugasanFields, noSk: e.target.value})} className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900" placeholder="Contoh: 421.3/SMPN1-R/ST/2025/09" required />
                          </div>
                        </>
                      )}

                      <div className="flex justify-end gap-2 pt-2 border-t dark:border-slate-800">
                        <button type="button" onClick={() => setIsHistoryFormOpen(false)} className="px-4 py-2 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer">Batal</button>
                        <button type="submit" className="px-4 py-2 text-xs bg-brand-600 hover:bg-brand-700 text-white rounded-lg cursor-pointer font-semibold">Simpan Riwayat</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white dark:bg-[#131b2e] p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center text-slate-400 text-sm transition-colors">
              Silakan pilih pegawai untuk mengelola data riwayat kepegawaian.
            </div>
          )}
        </div>
      </div>
    );
  }

  // DEFAULT: DATA GURU & DATA TENAGA KEPENDIDIKAN (CRUD LIST VIEW)
  return (
    <div className="space-y-6">
      {/* Search and Action Filter Banner */}
      <div className="bg-white dark:bg-[#131b2e] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 transition-colors no-print">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama lengkap, NIP, NUPTK, mapel..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option value="Semua">Semua Status</option>
            <option value="ASN">ASN (PNS)</option>
            <option value="PPPK">ASN (PPPK)</option>
            <option value="Honorer">Honorer Komite</option>
          </select>

          <button 
            onClick={openAddForm}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah {currentTipe}</span>
          </button>

          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer border dark:border-slate-700"
            title="Export Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>

          <label className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer border dark:border-slate-700">
            <Upload className="w-4 h-4" />
            <input type="file" accept=".xlsx, .xls" onChange={handleImportExcel} className="hidden" />
          </label>
        </div>
      </div>

      {/* Grid of Staff Members Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayPegawaiList.map((p) => (
          <div key={p.id} className="bg-white dark:bg-[#131b2e] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group relative">
            <div className="p-5 space-y-4">
              {/* Profile Top Row */}
              <div className="flex items-start gap-3">
                <img 
                  src={p.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                  alt={p.namaLengkap} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 dark:border-slate-800 shadow-inner shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm font-sans line-clamp-2" title={p.namaLengkap}>{p.namaLengkap}</h4>
                  <span className={`inline-block text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full mt-1.5 ${p.statusKepegawaian === 'ASN' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : p.statusKepegawaian === 'PPPK' ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    {p.statusKepegawaian}
                  </span>
                </div>
              </div>

              {/* Civil Service Identifiers */}
              <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-3.5 text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-400">NIP</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{p.nip || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-400">NUPTK</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{p.nuptk || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-400">Jabatan</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-40">{p.jabatan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-400">Golongan / Pangkat</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{p.golongan ? `${p.golongan} - ${p.pangkat}` : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-400">{currentTipe === 'Guru' ? 'Mata Pelajaran' : 'Area Tugas'}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-40">{p.mataPelajaran || '-'}</span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-1 border-t border-slate-100 dark:border-slate-800/60 pt-3 text-[10px] text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 shrink-0 text-slate-400" />
                  <span className="truncate">{p.noHp || '-'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 shrink-0 text-slate-400" />
                  <span className="truncate">{p.email || '-'}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3 h-3 shrink-0 text-slate-400 mt-0.5" />
                  <span className="line-clamp-2 leading-relaxed">{p.alamat || '-'}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions Area */}
            <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center gap-2 no-print">
              <span className="text-[10px] text-slate-400 font-mono">ID: {p.id}</span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => openEditForm(p)}
                  className="p-1.5 text-slate-500 hover:text-brand-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Edit Data"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleDeletePegawai(p.id)}
                  className="p-1.5 text-slate-500 hover:text-red-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {displayPegawaiList.length === 0 && (
          <div className="col-span-4 bg-white dark:bg-[#131b2e] p-8 text-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm transition-colors">
            Belum ada data {currentTipe} yang sesuai dengan kriteria pencarian.
          </div>
        )}
      </div>

      {/* FULL LARGE POPUP DIALOG FORM (CREATE / EDIT PEGAWAI) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-white dark:bg-[#131b2e] border dark:border-slate-800 rounded-xl max-w-4xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto my-8">
            <div className="pb-3 border-b dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base uppercase">
                {editingPegawai ? `Edit Data ${currentTipe}` : `Tambah ${currentTipe} Baru`}
              </h3>
              <span className="text-[10px] bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300 font-bold px-2.5 py-0.5 rounded-full">{currentTipe}</span>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6 text-xs">
              {/* Form Grid 3 columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Section 1: Identity */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider border-b pb-1 dark:border-slate-800">1. Identitas Pokok</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Lengkap & Gelar</label>
                    <input 
                      type="text" 
                      value={formFields.namaLengkap || ''}
                      onChange={(e) => setFormFields({ ...formFields, namaLengkap: e.target.value })}
                      className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                      placeholder="Contoh: Drs. H. Syamsuddin, M.Pd."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Jenis Kelamin</label>
                      <select 
                        value={formFields.jk || 'L'}
                        onChange={(e) => setFormFields({ ...formFields, jk: e.target.value as 'L' | 'P' })}
                        className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none transition-colors"
                      >
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Agama</label>
                      <select 
                        value={formFields.agama || 'Islam'}
                        onChange={(e) => setFormFields({ ...formFields, agama: e.target.value })}
                        className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none transition-colors"
                      >
                        <option value="Islam">Islam</option>
                        <option value="Kristen">Kristen Protestan</option>
                        <option value="Katolik">Katolik</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Buddha">Buddha</option>
                        <option value="Konghucu">Konghucu</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Tempat Lahir</label>
                      <input 
                        type="text" 
                        value={formFields.tempatLahir || ''}
                        onChange={(e) => setFormFields({ ...formFields, tempatLahir: e.target.value })}
                        className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900 focus:outline-none transition-colors"
                        placeholder="Contoh: Selatpanjang"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Tanggal Lahir</label>
                      <input 
                        type="date" 
                        value={formFields.tanggalLahir || ''}
                        onChange={(e) => setFormFields({ ...formFields, tanggalLahir: e.target.value })}
                        className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">Foto Pegawai</label>
                    
                    {/* Drag and drop zone & Click selection */}
                    <div 
                      onDragOver={handlePhotoDragOver}
                      onDragLeave={handlePhotoDragLeave}
                      onDrop={handlePhotoDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                        isDraggingPhoto 
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30'
                      }`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handlePhotoFileChange}
                        accept="image/*"
                        className="hidden" 
                      />
                      
                      {formFields.foto ? (
                        <div className="relative group/photo">
                          <img 
                            src={formFields.foto} 
                            alt="Preview Staf" 
                            className="w-20 h-20 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700 shadow-md"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity">
                            <Upload className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                          <Upload className="w-5 h-5" />
                        </div>
                      )}

                      <div className="text-center">
                        <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          Seret & Lepas foto di sini, atau <span className="text-brand-600 dark:text-brand-400 font-bold">Pilih Berkas</span>
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Mendukung format JPG, JPEG, PNG (otomatis dikompresi)</p>
                      </div>
                    </div>

                    {/* Fallback text URL input */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-semibold text-slate-400 block uppercase">Atau gunakan URL Gambar alternatif:</label>
                      <input 
                        type="text" 
                        value={formFields.foto || ''}
                        onChange={(e) => setFormFields({ ...formFields, foto: e.target.value })}
                        className="w-full text-[10px] rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900 focus:outline-none transition-colors"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Civil Service / Employment */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider border-b pb-1 dark:border-slate-800">2. Kepegawaian & Jabatan</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">NIP</label>
                      <input 
                        type="text" 
                        value={formFields.nip || ''}
                        onChange={(e) => setFormFields({ ...formFields, nip: e.target.value })}
                        className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900 focus:outline-none transition-colors font-mono"
                        placeholder="Contoh: 1972..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">NUPTK</label>
                      <input 
                        type="text" 
                        value={formFields.nuptk || ''}
                        onChange={(e) => setFormFields({ ...formFields, nuptk: e.target.value })}
                        className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900 focus:outline-none transition-colors font-mono"
                        placeholder="Contoh: 4839..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Status Kerja</label>
                      <select 
                        value={formFields.statusKepegawaian || 'ASN'}
                        onChange={(e) => setFormFields({ ...formFields, statusKepegawaian: e.target.value as 'ASN' | 'Honorer' | 'PPPK' })}
                        className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900 focus:outline-none transition-colors"
                      >
                        <option value="ASN">ASN (PNS)</option>
                        <option value="PPPK">ASN (PPPK)</option>
                        <option value="Honorer">Honorer Komite</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Pendidikan Terakhir</label>
                      <input 
                        type="text" 
                        value={formFields.pendidikanTerakhir || ''}
                        onChange={(e) => setFormFields({ ...formFields, pendidikanTerakhir: e.target.value })}
                        className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900 focus:outline-none transition-colors"
                        placeholder="Contoh: S1 - Pendidikan PPKn"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Golongan</label>
                      <input 
                        type="text" 
                        value={formFields.golongan || ''}
                        onChange={(e) => setFormFields({ ...formFields, golongan: e.target.value })}
                        className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900 focus:outline-none transition-colors"
                        placeholder="Contoh: IV/a"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Pangkat</label>
                      <input 
                        type="text" 
                        value={formFields.pangkat || ''}
                        onChange={(e) => setFormFields({ ...formFields, pangkat: e.target.value })}
                        className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900 focus:outline-none transition-colors"
                        placeholder="Contoh: Pembina"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Jabatan Administrasi</label>
                      <input 
                        type="text" 
                        value={formFields.jabatan || ''}
                        onChange={(e) => setFormFields({ ...formFields, jabatan: e.target.value })}
                        className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900 focus:outline-none transition-colors"
                        placeholder="Contoh: Kepala Sekolah / Wali Kelas"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">{currentTipe === 'Guru' ? 'Mata Pelajaran' : 'Area Tugas'}</label>
                      <input 
                        type="text" 
                        value={formFields.mataPelajaran || ''}
                        onChange={(e) => setFormFields({ ...formFields, mataPelajaran: e.target.value })}
                        className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900 focus:outline-none transition-colors"
                        placeholder={currentTipe === 'Guru' ? "Contoh: PPKn" : "Contoh: UKS / Operator"}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Contact Details */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider border-b pb-1 dark:border-slate-800">3. Kontak & SK Pengangkatan</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">TMT SK Kerja</label>
                      <input 
                        type="date" 
                        value={formFields.tmt || ''}
                        onChange={(e) => setFormFields({ ...formFields, tmt: e.target.value })}
                        className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900 focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">No SK Pengangkatan</label>
                      <input 
                        type="text" 
                        value={formFields.noSk || ''}
                        onChange={(e) => setFormFields({ ...formFields, noSk: e.target.value })}
                        className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900 focus:outline-none transition-colors"
                        placeholder="821.2/BKD-KP/2018..."
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">No Telepon / WhatsApp</label>
                    <input 
                      type="text" 
                      value={formFields.noHp || ''}
                      onChange={(e) => setFormFields({ ...formFields, noHp: e.target.value })}
                      className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900 focus:outline-none transition-colors font-mono"
                      placeholder="0812..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Email Resmi</label>
                    <input 
                      type="email" 
                      value={formFields.email || ''}
                      onChange={(e) => setFormFields({ ...formFields, email: e.target.value })}
                      className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900 focus:outline-none transition-colors font-mono"
                      placeholder="staf@gmail.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Alamat Rumah Lengkap</label>
                    <textarea 
                      rows={2}
                      value={formFields.alamat || ''}
                      onChange={(e) => setFormFields({ ...formFields, alamat: e.target.value })}
                      className="w-full text-xs rounded-lg border dark:border-slate-800 p-2 dark:bg-slate-900 focus:outline-none transition-colors"
                      placeholder="Jl. Merdeka No. 15..."
                    />
                  </div>
                </div>

              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg cursor-pointer font-semibold shadow-md"
                >
                  Simpan Pegawai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
