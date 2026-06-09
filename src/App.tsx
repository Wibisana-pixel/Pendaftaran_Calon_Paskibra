/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Calendar, 
  ClipboardList, 
  Mail, 
  Search, 
  Users, 
  Award, 
  Flame, 
  ChevronRight, 
  HelpCircle, 
  FileText, 
  CheckSquare, 
  Sparkles,
  Info
} from 'lucide-react';
import { Candidate, EmailNotification, SelectionSchedule } from './types';
import { INITIAL_CANDIDATES, INITIAL_SCHEDULES } from './data';
import RegistrationForm from './components/RegistrationForm';
import SchedulePanel from './components/SchedulePanel';
import StatusTracker from './components/StatusTracker';
import NotificationInbox from './components/NotificationInbox';
import AdminPanel from './components/AdminPanel';

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'beranda' | 'daftar' | 'jadwal' | 'status' | 'admin' | 'inbox'>('beranda');

  // Candidate Data State
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  
  // Notification Data State
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);

  // Web control states
  const [isRegistrationOpen, setIsRegistrationOpen] = useState<boolean>(true);
  const [announcementText, setAnnouncementText] = useState<string>('Memuat informasi rekrutmen...');
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and load state from real persistent server database
  const fetchData = async () => {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates || []);
        setNotifications(data.notifications || []);
        setIsRegistrationOpen(data.isRegistrationOpen !== false);
        setAnnouncementText(data.announcementText || '');
      }
    } catch (e) {
      console.error("Error connecting to full-stack database server:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleRegistration = async () => {
    const nextVal = !isRegistrationOpen;
    setIsRegistrationOpen(nextVal);
    try {
      await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRegistrationOpen: nextVal })
      });
    } catch (err) {
      console.error("Error saving configuration status:", err);
    }
  };

  const handleUpdateAnnouncement = async (text: string) => {
    setAnnouncementText(text);
    try {
      await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcementText: text })
      });
    } catch (err) {
      console.error("Error saving announcement text:", err);
    }
  };

  const handleUpdateCandidateScores = async (candidateId: string, scores: { pbb: number; physicalFit: number; interview: number; notes: string }) => {
    const idx = candidates.findIndex(c => c.id === candidateId);
    if (idx === -1) return;
    
    // Optimistic local update
    const updated = [...candidates];
    updated[idx] = { ...updated[idx], scores };
    setCandidates(updated);

    try {
      const res = await fetch(`/api/candidates/${candidateId}/scores`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.candidates) {
          setCandidates(data.candidates);
        }
      }
    } catch (err) {
      console.error("Error updating scores on server:", err);
    }
  };

  // Add Candidate via POST with automatic confirmation email dispatched by the backend database
  const handleAddNewCandidate = async (candidate: Candidate) => {
    setLoading(true);
    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidate)
      });
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates);
        setNotifications(data.notifications);
        
        setActiveTab('inbox');
        setTimeout(() => {
          alert(`Pendaftaran Siswa/i ${candidate.fullName} Berhasil Dikirim!\nNotifikasi konfirmasi otomatis telah tersimpan di pangkalan data backend.`);
        }, 200);
      }
    } catch (err) {
      console.error("Error submitting registration application to backend:", err);
    } finally {
      setLoading(false);
    }
  };

  // Evaluator reviews documents and mutates state on the server, triggers automatic notification emails
  const handleVerifyCandidate = async (candidateId: string, newStatus: Candidate['status'], reason?: string) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates);
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Error verifying candidate status on database:", err);
    }
  };

  // Reset database completely
  const handleClearInbox = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates);
        setNotifications(data.notifications);
        setIsRegistrationOpen(data.isRegistrationOpen);
        setAnnouncementText(data.announcementText);
      }
    } catch (err) {
      console.error("Error resetting database:", err);
    } finally {
      setLoading(false);
    }
  };

  const getActiveTabClass = (tab: typeof activeTab) => {
    return activeTab === tab
      ? 'border-[#da291c] text-[#da291c] bg-[#da291c]/5'
      : 'border-transparent text-gray-400 hover:text-white';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] text-white flex flex-col items-center justify-center font-mono">
        <div className="space-y-4 text-center">
          <div className="w-8 h-8 border-2 border-t-[#da291c] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#da291c] font-bold">MEMUAT PORTAL REKRUTMEN PORT-3000...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-white flex flex-col justify-between selection:bg-[#da291c] selection:text-white">
      
      {/* 1. Header (Premium Top Navigation) */}
      <header className="sticky top-0 z-50 bg-[#181818]/95 backdrop-blur-md border-b border-[#303030] h-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('beranda')}>
            <div className="bg-[#da291c] p-2 text-white">
              <ShieldCheck className="h-5 w-5 font-bold" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-[0.2em] uppercase font-mono text-white block">
                PASKIBRA ACADEMY
              </span>
              <span className="text-[9px] text-[#969696] font-mono block">
                SMAN 1 OFFICIAL PORTAL
              </span>
            </div>
          </div>

          {/* Nav Items Link List */}
          <nav className="hidden md:flex items-center h-full space-x-1 font-mono text-[11px] font-semibold tracking-wider">
            <button
              onClick={() => setActiveTab('beranda')}
              className={`h-full px-4 border-b-2 uppercase transition-all duration-300 ${getActiveTabClass('beranda')}`}
            >
              BERANDA
            </button>
            <button
              onClick={() => setActiveTab('daftar')}
              className={`h-full px-4 border-b-2 uppercase transition-all duration-300 ${getActiveTabClass('daftar')}`}
            >
              DAFTAR SEKARANG
            </button>
            <button
              onClick={() => setActiveTab('jadwal')}
              className={`h-full px-4 border-b-2 uppercase transition-all duration-300 ${getActiveTabClass('jadwal')}`}
            >
              JADWAL SELEKSI
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`h-full px-4 border-b-2 uppercase transition-all duration-300 ${getActiveTabClass('status')}`}
            >
              CEK STATUS
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`h-full px-4 border-b-2 uppercase transition-all duration-300 flex items-center gap-1.5 ${getActiveTabClass('admin')}`}
            >
              🔐 RUANG ADMIN
            </button>
            <button
              onClick={() => setActiveTab('inbox')}
              className={`h-full px-4 border-b-2 uppercase transition-all duration-300 flex items-center gap-1.5 ${getActiveTabClass('inbox')}`}
            >
              EMAIL NOTIFIKASI
              <span className="bg-[#da291c] text-white px-1.5 py-0.5 text-[9px] font-bold">
                {notifications.length}
              </span>
            </button>
          </nav>

          {/* Quick Info bar */}
          <div className="flex items-center space-x-2 font-mono text-[10px] text-gray-500 bg-[#303030]/20 px-3 py-1.5 border border-[#303030] rounded-none">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-gray-400">BATCH 2026</span>
          </div>
        </div>
      </header>

      {/* Mobile nav indicator bar */}
      <div className="md:hidden flex bg-[#181818] border-b border-[#303030] overflow-x-auto divide-x divide-[#303030] font-mono text-[10px] font-bold">
        <button onClick={() => setActiveTab('beranda')} className={`flex-1 py-3 text-center uppercase min-w-[75px] ${activeTab === 'beranda' ? 'bg-[#da291c]/10 text-[#da291c]' : 'text-gray-400'}`}>BERANDA</button>
        <button onClick={() => setActiveTab('daftar')} className={`flex-1 py-3 text-center uppercase min-w-[95px] ${activeTab === 'daftar' ? 'bg-[#da291c]/10 text-[#da291c]' : 'text-gray-400'}`}>DAFTAR</button>
        <button onClick={() => setActiveTab('jadwal')} className={`flex-1 py-3 text-center uppercase min-w-[95px] ${activeTab === 'jadwal' ? 'bg-[#da291c]/10 text-[#da291c]' : 'text-gray-400'}`}>JADWAL</button>
        <button onClick={() => setActiveTab('status')} className={`flex-1 py-3 text-center uppercase min-w-[95px] ${activeTab === 'status' ? 'bg-[#da291c]/10 text-[#da291c]' : 'text-gray-400'}`}>CEK STATUS</button>
        <button onClick={() => setActiveTab('admin')} className={`flex-1 py-3 text-center uppercase min-w-[95px] ${activeTab === 'admin' ? 'bg-[#da291c]/10 text-[#da291c]' : 'text-gray-400'}`}>ADMIN</button>
        <button onClick={() => setActiveTab('inbox')} className={`flex-1 py-3 text-center uppercase min-w-[95px] ${activeTab === 'inbox' ? 'bg-[#da291c]/10 text-[#da291c]' : 'text-gray-400'}`}>INBOX ({notifications.length})</button>
      </div>

      {/* 2. Main Space Content wrapping with Animation */}
      <main className="flex-1 w-full py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <AnimatePresence mode="wait">
            
            {/* TAB: BERANDA */}
            {activeTab === 'beranda' && (
              <motion.div
                key="beranda-pane"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {/* Custom Banner Announcement */}
                <div className="bg-[#da291c]/10 border border-[#da291c]/30 p-4 rounded-none flex items-center gap-3">
                  <div className="bg-[#da291c] p-1.5 text-white animate-pulse">
                    <Info size={16} />
                  </div>
                  <div className="text-[11px] sm:text-xs">
                    <span className="font-bold text-[#da291c] uppercase block tracking-wider text-[9px] font-mono">INFORMASI DAN KEPUTUSAN TERBARU</span>
                    <p className="text-gray-200 mt-0.5 font-medium">{announcementText}</p>
                  </div>
                </div>
                {/* Full Bleed Cinematic Hero Photograph placeholder with editorial styling overlay */}
                <div className="relative h-[480px] w-full bg-gradient-to-r from-stone-900 to-[#181818] overflow-hidden border border-[#303030]">
                  {/* Highly polished cinematic dark photograph overlay */}
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540304453527-62f979142a17?auto=format&fit=crop&w=1500&q=80')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
                  
                  {/* Visual identity stripes inside hero (Ferrari Livery reference) */}
                  <div className="absolute top-0 right-12 w-[4px] h-[35px] bg-[#da291c]"></div>
                  <div className="absolute top-0 right-[20px] w-[2px] h-[35px] bg-white opacity-40"></div>

                  {/* Absolute positioning Content */}
                  <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between">
                    <div>
                      <span className="inline-block bg-[#da291c] text-white text-[9px] uppercase font-mono tracking-widest px-2.5 py-0.5 font-bold">
                        PASKIBRA ACADEMY SMAN 1
                      </span>
                    </div>

                    <div className="max-w-3xl space-y-4">
                      <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-white leading-tight uppercase">
                        Disiplin. Setia.<br />
                        <span className="text-[#da291c] font-semibold">Bermartabat.</span>
                      </h1>
                      <p className="text-gray-300 text-xs md:text-sm leading-relaxed max-w-xl">
                        Rekrutmen resmi Calon Siswa & Siswi Dewan Pengibar Bendera Pusaka (Paskibra). Persiapkan berkas, ukur proporsionalitas tinggi badan, dan ikuti pekan latihan fisik intensif.
                      </p>
                      
                      <div className="pt-4 flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => setActiveTab('daftar')}
                          className="bg-[#da291c] hover:bg-[#b01e0a] text-white text-xs font-bold uppercase tracking-[0.14em] px-8 py-4 rounded-none transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          DAFTAR SEBAGAI CALON
                          <ChevronRight size={14} />
                        </button>
                        <button
                          onClick={() => setActiveTab('jadwal')}
                          className="bg-transparent border border-white hover:bg-white hover:text-black text-white text-xs font-bold uppercase tracking-[0.14em] px-8 py-4 rounded-none transition-all duration-300"
                        >
                          PELAJARI JADWAL FISIK
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-4 flex justify-between items-center text-[10px] font-mono text-gray-400">
                      <span>TAHAP ADMINISTRASI: JUNI - JULI 2026</span>
                      <span>DIREKTORAT KESISWAAN SMAN 1</span>
                    </div>
                  </div>
                </div>

                {/* Primary Stats Panel (Bento Grid Style) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Stat 1 */}
                  <div className="bg-[#181818] border border-[#303030] p-6 rounded-none space-y-1">
                    <span className="text-[10px] font-mono text-[#da291c] uppercase tracking-wider block">
                      TOTAL REGISTRAN AKTIF
                    </span>
                    <p className="text-4xl font-mono text-white font-bold leading-none">
                      {candidates.length} <span className="text-xs font-sans text-gray-500 font-normal">Siswa</span>
                    </p>
                    <p className="text-[11px] text-gray-500 leading-normal">
                      Siswa melengkapi biodata & berkas di database.
                    </p>
                  </div>

                  {/* Stat 2 */}
                  <div className="bg-[#181818] border border-[#303030] p-6 rounded-none space-y-1">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                      TINGGI KELAYAKAN PUTRA
                    </span>
                    <p className="text-4xl font-mono text-white font-bold leading-none">
                      170 <span className="text-xs font-sans text-gray-500 font-normal">cm</span>
                    </p>
                    <p className="text-[11px] text-gray-500 leading-normal">
                      Batas tinggi tegak minimal untuk petugas sayap luar.
                    </p>
                  </div>

                  {/* Stat 3 */}
                  <div className="bg-[#181818] border border-[#303030] p-6 rounded-none space-y-1">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                      TINGGI KELAYAKAN PUTRI
                    </span>
                    <p className="text-4xl font-mono text-white font-bold leading-none">
                      160 <span className="text-xs font-sans text-gray-500 font-normal">cm</span>
                    </p>
                    <p className="text-[11px] text-gray-500 leading-normal">
                      Batas tinggi lurus minimal pembawa baki utama.
                    </p>
                  </div>

                  {/* Stat 4 */}
                  <div className="bg-[#181818] border border-[#303030] p-6 rounded-none space-y-1">
                    <span className="text-[10px] font-mono text-green-500 uppercase tracking-wider block">
                      TAHAP SELEKSI FISIK
                    </span>
                    <p className="text-4xl font-mono text-white font-bold leading-none">
                      4 <span className="text-xs font-sans text-gray-500 font-normal">Agenda</span>
                    </p>
                    <p className="text-[11px] text-gray-500 leading-normal">
                      Uji kardio lari 12 menit, push-up, baris PBB, wawancara.
                    </p>
                  </div>
                </div>

                {/* Editorial Columns / Focus Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-[#303030]">
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-[#da291c]">
                      <Flame size={16} />
                      <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white">
                        KETAHANAN & KEDISIPLINAN FISIK
                      </h3>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed text-justify">
                      Menjadi anggota Paskibra adalah puncak integritas fisik di tingkatan sekolah. Calon siswa-siswi dididik lari konstan 12 menit tanpa henti, memantapkan kekuatan dada untuk menjaga tiang pengibaran tetap tegak presisi, serta kelenturan tubuh saat baris-berbaris formal di bawah sinar matahari.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-[#da291c]">
                      <Award size={16} />
                      <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white">
                        PEMBANGUNAN MENTAL PATRIOT
                      </h3>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed text-justify">
                      Selain keselarasan gerak kaki kiri dan kanan, nilai luhur seorang Paskibra bersandar pada keutamaan mental. Pelatihan wawancara dan pembekalan materi kepanduan mengasah integritas kepemimpinan, persaudaraan erat korps, stabilitas emosi di bawah instruksi, serta komitmen ideologi merah putih.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-[#da291c]">
                      <HelpCircle size={16} />
                      <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white">
                        ALUR PENDAFTARAN MAHASISWA BARU
                      </h3>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed text-left">
                      <strong>Langkah 1:</strong> Isi lengkap formulir identitas dan postur.<br />
                      <strong>Langkah 2:</strong> Unduh formulir manual sekolah, minta restu orang tua (izin tertulis), lalu unggah scan dokumen PDF Anda.<br />
                      <strong>Langkah 3:</strong> Cek status NISN untuk mengunduh Kartu Admisi ber-QR Code untuk syarat uji latihan fisik.
                    </p>
                  </div>

                </div>

                {/* Simulated Email Automation Banner */}
                <div className="bg-[#303030]/20 border border-[#303030] p-6 rounded-none flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="space-y-2 text-left">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#da291c]">
                      <Sparkles size={14} className="animate-spin" />
                      <span>FEAT: REALTIME SMTP NOTIFICATION SYSTEM SIMULATION</span>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      Notifikasi Otomatis Terintegrasi Instan
                    </p>
                    <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
                      Sistem kami dirancang untuk mengirimkan surat elektronik resmi secara instan secepat dokumen Anda berhasil diupload atau diverifikasi oleh Pembina. Anda dapat menyaksikan surat tersebut di-dispatch nyata di tab "Box Email" di sudut kanan atas menu navigasi.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('daftar')}
                    className="w-full md:w-auto text-center bg-white hover:bg-gray-200 text-black text-xs font-bold px-6 py-3 uppercase tracking-wider rounded-none font-mono flex-shrink-0"
                  >
                    COBA PENDAFTARAN SEKARANG
                  </button>
                </div>

              </motion.div>
            )}

            {/* TAB: REGISTRATION */}
            {activeTab === 'daftar' && (
              <motion.div
                key="daftar-pane"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <RegistrationForm
                  onRegisterSuccess={handleAddNewCandidate}
                  existingNisns={candidates.map(c => c.nisn)}
                  isRegistrationOpen={isRegistrationOpen}
                />
              </motion.div>
            )}

            {/* TAB: SCHEDULE */}
            {activeTab === 'jadwal' && (
              <motion.div
                key="jadwal-pane"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <SchedulePanel schedules={INITIAL_SCHEDULES} />
              </motion.div>
            )}

            {/* TAB: STATUS */}
            {activeTab === 'status' && (
              <motion.div
                key="status-pane"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <StatusTracker candidates={candidates} />
              </motion.div>
            )}

            {/* TAB: ADMIN */}
            {activeTab === 'admin' && (
              <motion.div
                key="admin-pane"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <AdminPanel
                  candidates={candidates}
                  onVerifyCandidate={handleVerifyCandidate}
                  onUpdateCandidateScores={handleUpdateCandidateScores}
                  isRegistrationOpen={isRegistrationOpen}
                  onToggleRegistration={handleToggleRegistration}
                  announcementText={announcementText}
                  onUpdateAnnouncement={handleUpdateAnnouncement}
                />
              </motion.div>
            )}

            {/* TAB: NOTIFICATION INBOX */}
            {activeTab === 'inbox' && (
              <motion.div
                key="inbox-pane"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <div>
                  <div className="mb-6">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#da291c] font-bold block mb-1">
                      MONITOR SURAT ELEKTRONIK
                    </span>
                    <h2 className="text-xl md:text-2xl font-medium text-white uppercase tracking-tight">
                      Simulator Inbox Notifikasi Otomatis
                    </h2>
                    <p className="text-gray-400 text-xs mt-1">
                      Menampilkan simulasi transkrip surat yang dikirimkan server Paskibra resmi SMAN langsung ke email terdaftar pengusul berdasar status berkas.
                    </p>
                  </div>
                  <NotificationInbox 
                    notifications={notifications} 
                    onClearInbox={handleClearInbox}
                  />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* 3. Closing Editorial Dark Footer */}
      <footer className="bg-[#181818] border-t border-[#303030] py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 text-xs text-gray-500">
          
          {/* Trademark and description column */}
          <div className="md:col-span-4 space-y-4">
            <span className="text-sm font-bold tracking-widest text-[#da291c] font-mono">
              PASKIBRA ACADEMY SMAN 1
            </span>
            <p className="leading-relaxed">
              Keluarga Besar Pengibar Bendera Pusaka SMA Negeri. Didirikan sebagai pilar kedisiplinan baris-berbaris dan karakter bela negara siswa didik terbaik berjenjang tingkat Kabupaten dan Nasional.
            </p>
            <p className="text-[10px] font-mono">
              © 2026 Paskibra SMAN. All Rights Kehormatan Terdaftar.
            </p>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3 space-y-3 font-mono">
            <span className="text-[10px] font-bold text-white uppercase tracking-widest block">
              NAVIGASI
            </span>
            <ul className="space-y-1.5 text-[11px]">
              <li><button onClick={() => setActiveTab('beranda')} className="hover:text-white text-left">Beranda Portal</button></li>
              <li><button onClick={() => setActiveTab('daftar')} className="hover:text-white text-left">Pendaftaran Online</button></li>
              <li><button onClick={() => setActiveTab('jadwal')} className="hover:text-white text-left">Kalkulator Fisik & Kalender</button></li>
              <li><button onClick={() => setActiveTab('status')} className="hover:text-white text-left">Status Seleksi NISN</button></li>
              <li><button onClick={() => setActiveTab('admin')} className="hover:text-white text-[#da291c] text-left">🔐 Portal Admin Pembina</button></li>
            </ul>
          </div>

          {/* SMAN Address */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-[10px] font-bold text-white uppercase tracking-widest block font-mono">
              SEKRETARIAT PANITIA
            </span>
            <p className="leading-relaxed">
              Gedung OSIS Plaza SMAN 1 Jakarta Barat<br />
              Jl. Budi Utomo No. 7, Sawah Besar, Jakarta Pusat<br />
              DKI Jakarta, Indonesia
            </p>
            <p className="font-mono text-[10px]">
              Telp: (021) 3845672
            </p>
          </div>

          {/* Technical Info about AI Studio Sandbox */}
          <div className="md:col-span-2 space-y-2 font-mono text-[10px]">
            <span className="text-[9px] font-bold text-[#da291c] block uppercase">
              SANDBOX METRICS
            </span>
            <p className="text-gray-600 leading-normal">
              PROD ENGINE: Active<br />
              SMTP VERIFY: Live Simulated<br />
              PORTAL ENG: React 19 / Tailwind v4
            </p>
            <div className="p-2 border border-dashed border-[#303030] text-[9px] text-[#da291c]">
              DESIGN STYLE: Rosso Corsa Precision
            </div>
          </div>

        </div>
      </footer>
      
    </div>
  );
}
