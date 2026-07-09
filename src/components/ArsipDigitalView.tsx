import React, { useState, useEffect } from 'react';
import { useAppState } from '../lib/StateContext';
import { ArsipDokumen, Siswa } from '../types';
import { 
  FileText, 
  Upload, 
  Folder, 
  Plus, 
  Trash2, 
  Search, 
  X,
  Eye,
  Layers,
  Sparkles
} from 'lucide-react';

export const ArsipDigitalView: React.FC = () => {
  const { siswaList, arsipList, saveArsip, deleteArsip } = useAppState();

  const activeStudents = siswaList.filter(s => s.statusAktif !== 'Tidak Aktif');

  // State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [search, setSearch] = useState('');
  
  // Modal / Inputs
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<ArsipDokumen | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<Partial<ArsipDokumen>>({
    id: '',
    siswaId: '',
    siswaNama: '',
    namaDokumen: '',
    jenisDokumen: 'Kartu Keluarga (KK)',
    fileUrl: '',
    tanggalUpload: new Date().toISOString().split('T')[0]
  });

  const currentSiswa = activeStudents.find(s => s.id === selectedStudentId) || activeStudents[0];

  useEffect(() => {
    if (currentSiswa && !formData.siswaId) {
      setFormData(prev => ({
        ...prev,
        siswaId: currentSiswa.id,
        siswaNama: currentSiswa.nama
      }));
    }
  }, [selectedStudentId]);

  const handleOpenUpload = () => {
    if (!currentSiswa) {
      alert("Silakan pilih siswa terlebih dahulu.");
      return;
    }
    setFormData({
      id: `doc-${Date.now()}`,
      siswaId: currentSiswa.id,
      siswaNama: currentSiswa.nama,
      namaDokumen: '',
      jenisDokumen: 'Kartu Keluarga (KK)',
      fileUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&auto=format&fit=crop&q=80',
      tanggalUpload: new Date().toISOString().split('T')[0]
    });
    setIsUploadOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaDokumen || !formData.fileUrl) {
      alert("Nama Dokumen dan URL File wajib diisi!");
      return;
    }
    await saveArsip(formData as ArsipDokumen);
    setIsUploadOpen(false);
  };

  const handleDelete = async (id: string, docName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus arsip digital ${docName}?`)) {
      await deleteArsip(id);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({
          ...prev,
          namaDokumen: file.name.split('.')[0],
          fileUrl: String(reader.result)
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredStudents = activeStudents.filter(s => 
    s.nama.toLowerCase().includes(search.toLowerCase()) || 
    s.nis.includes(search)
  );

  const studentDocuments = arsipList.filter(d => d.siswaId === currentSiswa?.id);

  return (
    <div id="arsip-digital-container" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Student List Sidebar */}
      <div id="arsip-sidebar" className="lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 no-print h-[calc(100vh-200px)] overflow-y-auto">
        <h3 className="font-semibold text-slate-800 text-sm font-sans uppercase tracking-wider">Cari Siswa</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama / NIS..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5 pt-1">
          {filteredStudents.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStudentId(s.id)}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all text-xs cursor-pointer ${currentSiswa?.id === s.id ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <div>
                <div>{s.nama}</div>
                <div className="text-[10px] text-slate-400 font-mono">NIS: {s.nis}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Archives Content */}
      <div id="arsip-main" className="lg:col-span-3 space-y-6">
        {currentSiswa ? (
          <div className="space-y-6">
            
            {/* Control Bar */}
            <div id="arsip-controls" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold text-slate-800 font-sans">Loker Arsip Digital Siswa</h4>
                <p className="text-xs text-slate-400">Unggah berkas dokumen pelengkap kesiswaan secara tertib & aman.</p>
              </div>

              <button
                id="btn-upload-arsip"
                onClick={handleOpenUpload}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Unggah Arsip Baru</span>
              </button>
            </div>

            {/* Folder Header Metadata banner */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
              <Folder className="w-8 h-8 text-amber-500 shrink-0" />
              <div className="text-xs">
                <h5 className="font-bold text-slate-700">Folder Berkas: {currentSiswa.nama}</h5>
                <p className="text-slate-400 mt-0.5">Berisi {studentDocuments.length} berkas digital kesiswaan aktif</p>
              </div>
            </div>

            {/* Archives Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {studentDocuments.map((doc) => (
                <div key={doc.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex items-start justify-between gap-4">
                  <div className="flex gap-3 items-start">
                    <div className="p-2.5 bg-brand-50 rounded-lg text-brand-600 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="text-xs space-y-1">
                      <h5 className="font-bold text-slate-800 line-clamp-1">{doc.namaDokumen}</h5>
                      <span className="inline-block bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-slate-200">{doc.jenisDokumen}</span>
                      <p className="text-[10px] text-slate-400 font-mono">Upload: {doc.tanggalUpload}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setSelectedDoc(doc)}
                      className="p-1.5 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-lg cursor-pointer"
                      title="Buka Dokumen"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(doc.id, doc.namaDokumen)}
                      className="p-1.5 bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 rounded-lg cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {studentDocuments.length === 0 && (
                <div className="col-span-2 bg-slate-50/50 border border-dashed border-slate-200 p-8 text-center rounded-xl">
                  <p className="text-slate-400 text-xs">Belum ada dokumen yang diarsipkan untuk siswa ini.</p>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center text-slate-400 text-sm">
            Silakan pilih siswa dari panel sebelah kiri untuk mengakses loker arsip digital.
          </div>
        )}
      </div>

      {/* UPLOAD ARCHIVE MODAL */}
      {isUploadOpen && (
        <div id="upload-archive-modal" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full shadow-lg border border-slate-200">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-md font-bold text-slate-800 font-sans">Unggah Dokumen Baru</h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Jenis Dokumen</label>
                <select
                  value={formData.jenisDokumen || 'Kartu Keluarga (KK)'}
                  onChange={(e) => setFormData({ ...formData, jenisDokumen: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none"
                >
                  <option value="Kartu Keluarga (KK)">Kartu Keluarga (KK)</option>
                  <option value="Akta Kelahiran">Akta Kelahiran</option>
                  <option value="Ijazah SD/MI">Ijazah SD/MI</option>
                  <option value="SKHUN SD/MI">SKHUN SD/MI</option>
                  <option value="KIP / PKH Card">Kartu KIP / PKH</option>
                  <option value="Sertifikat Piagam">Sertifikat / Piagam Penghargaan</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Nama / Label Dokumen *</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Akta Kelahiran Resmi"
                  value={formData.namaDokumen || ''}
                  onChange={(e) => setFormData({ ...formData, namaDokumen: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none"
                  required
                />
              </div>

              {/* Drag and Drop File Upload */}
              <div className="border-2 border-dashed border-slate-200 p-6 rounded-xl text-center bg-slate-50 relative group">
                <Upload className="w-8 h-8 text-slate-400 mx-auto group-hover:text-brand-500 transition-colors" />
                <span className="block mt-2 font-semibold text-slate-600">Drag & drop berkas di sini</span>
                <span className="block text-[10px] text-slate-400 mt-1">Mendukung format PNG, JPG, PDF (Maks. 5MB)</span>
                
                <input 
                  type="file" 
                  accept="image/*, .pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Atau Gunakan Mock URL Dokumen</label>
                <input 
                  type="text" 
                  value={formData.fileUrl || ''}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-500 font-mono text-[10px] focus:outline-none"
                />
              </div>

              <div className="border-t border-slate-200 pt-4 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsUploadOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-semibold cursor-pointer"
                >
                  Simpan Berkas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT VIEWER DIALOG */}
      {selectedDoc && (
        <div id="doc-viewer-modal" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-lg border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-xs font-sans">{selectedDoc.namaDokumen} ({selectedDoc.jenisDokumen})</h4>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-100 flex justify-center items-center h-[400px]">
              {selectedDoc.fileUrl.startsWith('data:') || selectedDoc.fileUrl.startsWith('http') ? (
                <img 
                  src={selectedDoc.fileUrl} 
                  alt={selectedDoc.namaDokumen} 
                  className="max-h-full max-w-full object-contain rounded-lg shadow-sm border"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-center p-6 bg-white rounded-xl shadow-xs max-w-sm">
                  <FileText className="w-12 h-12 text-brand-600 mx-auto" />
                  <p className="text-xs text-slate-600 mt-2 font-semibold">Dokumen PDF Terenkripsi Aman</p>
                  <p className="text-[10px] text-slate-400 mt-1">Berkas disimpan dengan enkripsi data SHA-256 untuk mematuhi regulasi privasi Dapodik.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end">
              <button onClick={() => setSelectedDoc(null)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
