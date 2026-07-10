import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Mutasi, BukuIndukRecord, SPMBRecord, ArsipDokumen, 
  SuratTemplate, SuratArsip, AgendaItem, Pegawai 
} from '../types';
import { auth as firebaseAuth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const isFirebaseConfigured = true;

// Buat Context-nya
export const StateContext = createContext<any>(null);

export const StateProvider = ({ children }: { children: React.ReactNode }) => {
  // Inisialisasi state di DALAM provider
  const [mutasilist, setMutasiList] = useState<Mutasi[]>([]);
  const [bukuIndukList, setBukuIndukList] = useState<BukuIndukRecord[]>([]);
  const [spmbList, setSpmbList] = useState<SPMBRecord[]>([]);
  const [arsipList, setArsipList] = useState<ArsipDokumen[]>([]);
  const [suratTemplates, setSuratTemplates] = useState<SuratTemplate[]>([]);
  const [suratArsipList, setSuratArsipList] = useState<SuratArsip[]>([]);
  const [agendaList, setAgendaList] = useState<AgendaItem[]>([]);
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);

  // Masukkan logika listener Firebase di sini (useEffect)
  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        // Logika user login Anda
      });
      return unsubscribe;
    }
  }, []);
// Fungsi untuk menyimpan pengaturan sekolah
  const saveSchoolSettings = async (settings: any) => {
    // Tambahkan logika simpan Anda di sini
    console.log("Saving settings:", settings);
  };

  // Fungsi untuk menyimpan agenda
  const saveAgendaItem = async (item: any) => {
    // Tambahkan logika simpan Anda di sini
    console.log("Saving agenda:", item);
  };

  // Jangan lupa masukkan fungsi-fungsi ini ke dalam 'value' di provider
  return (
    <StateContext.Provider value={{ 
      mutasilist, bukuIndukList, spmbList, arsipList, 
      suratTemplates, suratArsipList, agendaList, pegawaiList,
      saveSchoolSettings, saveAgendaItem 
    }}>
      {children}
    </StateContext.Provider>
  );
  return (
    <StateContext.Provider value={{ mutasilist, bukuIndukList }}>
      {children}
    </StateContext.Provider>
  );
};