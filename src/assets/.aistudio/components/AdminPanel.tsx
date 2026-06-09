/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Candidate } from '../types';
import { MINIMUM_HEIGHT_MALE, MINIMUM_HEIGHT_FEMALE } from '../data';
import { 
  ShieldCheck, 
  UserCheck, 
  Download, 
  Sliders, 
  Plus, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  FileText 
} from 'lucide-react';

interface AdminPanelProps {
  candidates: Candidate[];
  onVerifyCandidate: (candidateId: string, newStatus: Candidate['status'], reason?: string) => void;
  onUpdateCandidateScores: (candidateId: string, scores: { pbb: number; physicalFit: number; interview: number; notes: string }) => void;
  isRegistrationOpen: boolean;
  onToggleRegistration: () => void;
  announcementText: string;
  onUpdateAnnouncement: (text: string) => void;
}

export default function AdminPanel({
  candidates,
  onVerifyCandidate,
  onUpdateCandidateScores,
  isRegistrationOpen,
  onToggleRegistration,
  announcementText,
  onUpdateAnnouncement
}: AdminPanelProps) {
  // Admin Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('paskibra_admin_auth') === 'true';
  });
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeAdminDetail, setActiveAdminDetail] = useState<Candidate | null>(null);

  // Score Input states
  const [scorePbb, setScorePbb] = useState(0);
  const [scorePhysicalFit, setScorePhysicalFit] = useState(0);
  const [scoreInterview, setScoreInterview] = useState(0);
  const [scoreNotes, setScoreNotes] = useState('');

  // Manage custom accounts
  const [extraEvaluators, setExtraEvaluators] = useState<string[]>(['pembina.sman1@sch.id', 'letda.bambang@mil.id']);
  const [newEvaluatorEmail, setNewEvaluatorEmail] = useState('');

  // Sync state when selection changes
  React.useEffect(() => {
    if (activeAdminDetail) {
      setScorePbb(activeAdminDetail.scores?.pbb || 0);
      setScorePhysicalFit(activeAdminDetail.scores?.physicalFit || 0);
      setScoreInterview(activeAdminDetail.scores?.interview || 0);
      setScoreNotes(activeAdminDetail.scores?.notes || '');
    }
  }, [activeAdminDetail?.id]);

  const handleExportCSV = () => {
    const headers = ["ID", "Nama Lengkap", "NISN", "Email", "Phone", "Kelas", "Tinggi (cm)", "Berat (kg)", "Gender", "Status", "Nilai PBB", "Nilai Kesamaptaan", "Nilai Wawancara", "Catatan"];
    const rows = candidates.map(c => [
      c.id,
      c.fullName,
      c.nisn,
      c.email,
      c.phone,
      c.className,
      c.height,
      c.weight,
      c.gender,
      c.status,
      c.scores?.pbb || 0,
      c.scores?.physicalFit || 0,
      c.scores?.interview || 0,
      c.scores?.notes || ''
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Pendaftar_Paskibra_2026.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusColors: Record<Candidate['status'], string> = {
    'Draft': 'bg-gray-800 text-gray-400 border-gray-700',
    'Ditinjau': 'bg-amber-950/50 text-amber-300 border-amber-900',
    'Terverifikasi': 'bg-emerald-950/50 text-emerald-300 border-emerald-900',
    'Lolos Seleksi': 'bg-red-950/20 text-[#da291c] border-brand/40',
    'Tidak Lolos': 'bg-gray-900 text-gray-500 border-gray-800'
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });
      if (res.ok) {
        setIsAdminAuthenticated(true);
        localStorage.setItem('paskibra_admin_auth', 'true');
        setLoginError('');
      } else {
        const errorData = await res.json();
        setLoginError(errorData.error || 'Email atau kata sandi penguji salah!');
      }
    } catch (err) {
      setLoginError('Koneksi ke server gagal. Pastikan server aktif.');
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="bg-[#181818] border border-[#303030] p-8 max-w-md mx-auto space-y-6">
        <div className="text-center space-y-1">
          <div className="bg-[#da291c] p-2 w-fit mx-auto rounded-none mb-2">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#da291c] font-bold block">
            PORTAL OTENTIKASI PANITIA
          </span>
          <h3 className="text-lg font-medium text-white uppercase tracking-tight">
            Gerbang Keamanan Pembina SMAN 1
          </h3>
          <p className="text-xs text-gray-400">
            Silakan masuk dengan Akun Panitia/Evaluator untuk memproses database seleksi secara langsung.
          </p>
        </div>

        <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
          {loginError && (
            <div className="bg-red-950/40 border border-red-500/40 text-[11px] text-red-500 p-2.5 font-mono text-center">
              ⚠ {loginError}
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase font-mono block">Surel Panitia (Email)</label>
            <input
              type="email"
              required
              className="w-full bg-[#181818] border border-[#303030] focus:border-[#da291c] text-white py-2 px-3 text-xs outline-none font-mono"
              placeholder="pembina@sman1.sch.id"
              value={adminEmail}
              onChange={e => setAdminEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase font-mono block">Sandi Akses</label>
            <input
              type="password"
              required
              className="w-full bg-[#181818] border border-[#303030] focus:border-[#da291c] text-white py-2 px-3 text-xs outline-none font-mono"
              placeholder="••••••••"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#da291c] hover:bg-[#b02016] text-white py-2.5 text-xs text-center font-bold font-mono uppercase tracking-wider transition-colors"
          >
            ✓ MASUK KE DAPUR PANITIA
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-[#181818] border border-[#303030] p-6 rounded-none space-y-8">
      
      {/* Header block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#303030]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#da291c] animate-pulse"></span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#da291c] font-bold">
              RUANG ADMINISTRATOR & PEMBINA UTAMA SMAN 1
            </span>
          </div>
          <h3 className="text-lg font-medium text-white uppercase tracking-tight mt-1">
            Dapur Verifikasi & Pengaturan Sistem
          </h3>
          <p className="text-xs text-gray-400">
            Kelola status rekrutmen, rekap nilai kekuatan peserta, unduh database ekspor, serta atur parameter keterbukaan registrasi siswa.
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[11px] font-bold px-4 py-2.5 uppercase tracking-wider rounded-none flex items-center gap-2 transition-colors duration-200"
          >
            <Download size={13} /> EKSPOR (.CSV)
          </button>
          <button
            onClick={() => {
              setIsAdminAuthenticated(false);
              localStorage.removeItem('paskibra_admin_auth');
              setAdminPassword('');
              alert("Anda telah keluar dari Ruang Admin!");
            }}
            className="bg-[#303030] hover:bg-zinc-800 text-gray-300 font-mono text-[11px] font-bold px-4 py-2.5 uppercase tracking-wider rounded-none flex items-center gap-1.5 transition-colors duration-200"
          >
            KELUAR ADMIN
          </button>
        </div>
      </div>

      {/* Master 3-Column Settings Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Column 1: Quick Metrics & Data Summary */}
        <div className="bg-[#181818] border border-[#303030] p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono uppercase font-bold">
            <Sliders size={12} className="text-[#da291c]" />
            <span>OVERVIEW DATA MASUK</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-[#303030]/20 p-2.5 border border-[#303030]">
              <p className="text-gray-500 text-[10px]">TOTAL PENDAFTAR</p>
              <p className="text-lg font-bold text-white mt-1">{candidates.length} Mhs</p>
            </div>
            <div className="bg-[#303030]/20 p-2.5 border border-[#303030]">
              <p className="text-gray-500 text-[10px]">ANTRE VERIFIKASI</p>
              <p className="text-lg font-bold text-amber-500 mt-1">
                {candidates.filter(c => c.status === 'Ditinjau').length} Siswa
              </p>
            </div>
            <div className="bg-[#303030]/20 p-2.5 border border-[#303030]">
              <p className="text-gray-500 text-[10px]">PETUGAS PUTRA</p>
              <p className="text-base font-bold text-white mt-1">
                {candidates.filter(c => c.gender === 'L').length} orang
              </p>
            </div>
            <div className="bg-[#303030]/20 p-2.5 border border-[#303030]">
              <p className="text-gray-500 text-[10px]">PETUGAS PUTRI</p>
              <p className="text-base font-bold text-white mt-1">
                {candidates.filter(c => c.gender === 'P').length} orang
              </p>
            </div>
          </div>
        </div>

        {/* Column 2: Web Configurations (Reg open/closed & announcments) */}
        <div className="bg-[#181818] border border-[#303030] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono uppercase font-bold">
              <Sliders size={12} className="text-[#da291c]" />
              <span>KONTROL FORM ONLINE</span>
            </div>
            <span className={`text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 ${isRegistrationOpen ? 'bg-emerald-950/40 text-emerald-400' : 'bg-red-950/40 text-red-500'}`}>
              {isRegistrationOpen ? 'DIBUKA' : 'DITUTUP'}
            </span>
          </div>

          <div className="flex items-center justify-between bg-[#303030]/20 p-2 border border-[#303030]">
            <span className="text-xs text-white">Status Registasi Murid:</span>
            <button
              type="button"
              onClick={onToggleRegistration}
              className={`text-[10px] font-mono px-3 py-1 font-bold ${
                isRegistrationOpen 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isRegistrationOpen ? '✕ Tutup Pendaftaran' : '✓ Buka Pendaftaran'}
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase block font-mono">Edit Teks Pengumuman Beranda:</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 bg-[#181818] border border-[#303030] focus:border-[#da291c] text-white text-[11px] px-2 py-1 outline-none"
                value={announcementText}
                onChange={e => onUpdateAnnouncement(e.target.value)}
              />
              <button
                type="button"
                onClick={() => {
                  alert("Teks pengumuman beranda berhasil disimpan!");
                }}
                className="bg-[#da291c] text-white text-[10px] uppercase px-3 font-mono font-bold"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>

        {/* Column 3: Custom Panitia/Evaluators accounts list */}
        <div className="bg-[#181818] border border-[#303030] p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono uppercase font-bold">
            <Users size={12} className="text-[#da291c]" />
            <span>AKUN PANITIA KESAMEKTAAN</span>
          </div>

          <div className="text-[11px] font-mono space-y-1.5">
            <div className="flex justify-between text-white border-b border-[#303030] pb-1">
              <span>Drs. Hariadi M.Si</span>
              <span className="text-gray-500 font-normal">Pembina Utama</span>
            </div>
            {extraEvaluators.map((email, idx) => (
              <div key={idx} className="flex justify-between text-white border-b border-[#303030] pb-1">
                <span className="truncate max-w-[150px]">{email}</span>
                <span className="text-gray-500 font-normal">Seksi Penguji</span>
              </div>
            ))}
          </div>

          <div className="flex gap-1.5 pt-1">
            <input
              type="email"
              placeholder="email.panitia@sch.id"
              className="flex-1 bg-[#181818] border border-[#303030] text-white text-[10px] px-2 py-1 outline-none font-mono"
              value={newEvaluatorEmail}
              onChange={e => setNewEvaluatorEmail(e.target.value)}
            />
            <button
              type="button"
              onClick={() => {
                if (!newEvaluatorEmail) return;
                setExtraEvaluators([...extraEvaluators, newEvaluatorEmail]);
                setNewEvaluatorEmail('');
                alert(`Undangan akses Panitia/Evaluator dikirim ke ${newEvaluatorEmail}!`);
              }}
              className="bg-[#303030] hover:bg-[#da291c] text-white p-1 text-[10px]"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-[#303030]">
        
        {/* Applicant Queue Left list */}
        <div className="bg-[#181818] border border-[#303030] rounded-none overflow-hidden h-fit">
          <div className="bg-[#303030]/20 p-3 border-b border-[#303030]">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-semibold">
              ANTREAN MASUK ({candidates.length} SISWA)
            </span>
          </div>
          
          <div className="divide-y divide-[#303030] max-h-[600px] overflow-y-auto">
            {candidates.map(candidate => (
              <div
                key={candidate.id}
                onClick={() => setActiveAdminDetail(candidate)}
                className={`p-4 cursor-pointer transition-all duration-200 text-xs font-mono space-y-2 hover:bg-[#303030]/30 ${
                  activeAdminDetail?.id === candidate.id ? 'bg-[#303030]/50 border-l-[3px] border-l-[#da291c]' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">{candidate.fullName}</span>
                  <span className={`px-2 py-0.5 text-[9px] uppercase font-bold border ${statusColors[candidate.status]}`}>
                    {candidate.status}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-500">
                  <span>NISN: {candidate.nisn}</span>
                  <span>{candidate.className}</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-600">
                  <span>Postur: {candidate.height}cm / {candidate.weight}kg</span>
                  <span>{candidate.gender === 'L' ? 'Putra' : 'Putri'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Applicant Queue Detail Right 2 Columns */}
        <div className="lg:col-span-2 border border-[#303030] p-6 space-y-6">
          {activeAdminDetail ? (
            <div className="space-y-6">
              
              {/* Title and stats */}
              <div className="flex justify-between items-start border-b border-[#303030] pb-4">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500">
                    MUTASI VERIFIKASI SISWA
                  </span>
                  <h4 className="text-lg font-medium text-white uppercase mt-1">
                    {activeAdminDetail.fullName}
                  </h4>
                  <p className="text-xs text-gray-400">
                    Email: <span className="font-mono text-white text-[11px]">{activeAdminDetail.email}</span> | No. HP: <span className="font-mono text-white text-[11px]">{activeAdminDetail.phone}</span>
                  </p>
                </div>
                <div>
                  <span className={`inline-block border px-2.5 py-1 text-xs font-mono ${statusColors[activeAdminDetail.status]}`}>
                    STATUS: {activeAdminDetail.status}
                  </span>
                </div>
              </div>

              {/* Physical Standard assessment checklist */}
              <div className="space-y-2">
                <h5 className="text-[10px] uppercase tracking-wider font-mono text-[#da291c] font-bold">
                  1. HASIL PEMERIKSAAN POSTUR FISIK AWAL
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#303030]/10 p-4 border border-[#303030] font-mono text-xs">
                  <div className="space-y-2">
                    <p className="text-gray-400">
                      Tinggi Badan: <span className="text-white font-bold">{activeAdminDetail.height} cm</span> 
                    </p>
                    <p className="text-gray-400">
                      Jenis Kelamin: <span className="text-white font-bold">{activeAdminDetail.gender === 'L' ? 'Putra' : 'Putri'}</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-400">
                      Syarat Minimal: <span className="text-white font-bold">{activeAdminDetail.gender === 'L' ? MINIMUM_HEIGHT_MALE : MINIMUM_HEIGHT_FEMALE} cm</span>
                    </p>
                    <p className={`font-semibold ${
                      (activeAdminDetail.gender === 'L' && activeAdminDetail.height >= MINIMUM_HEIGHT_MALE) ||
                      (activeAdminDetail.gender === 'P' && activeAdminDetail.height >= MINIMUM_HEIGHT_FEMALE)
                        ? 'text-emerald-500' : 'text-amber-500'
                    }`}>
                      {(activeAdminDetail.gender === 'L' && activeAdminDetail.height >= MINIMUM_HEIGHT_MALE) ||
                      (activeAdminDetail.gender === 'P' && activeAdminDetail.height >= MINIMUM_HEIGHT_FEMALE)
                        ? '✓ LOLOS TINGGI DASAR' : '⚠ TINJAU KHUSUS DI LAPANGAN'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document downloads list */}
              <div className="space-y-2">
                <h5 className="text-[10px] uppercase tracking-wider font-mono text-[#da291c] font-bold">
                  2. BERKAS PENDAFTARAN YANG DIUNGGAH
                </h5>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-[#181818] border border-[#303030] p-3 text-xs">
                    <span className="text-gray-400">Formulir Pendaftaran</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-white font-mono text-[11px]">{activeAdminDetail.documents.registrationForm?.name || 'BELUM UNGGAH'}</span>
                      {activeAdminDetail.documents.registrationForm && (
                        <button className="bg-[#303030] hover:bg-[#da291c] hover:text-white text-gray-300 font-mono text-[10px] px-2 py-1 font-semibold transition-colors duration-200">
                          PREVIEW FILE
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-[#181818] border border-[#303030] p-3 text-xs">
                    <span className="text-gray-400">Surat Izin Orang Tua</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-white font-mono text-[11px]">{activeAdminDetail.documents.parentConsent?.name || 'BELUM UNGGAH'}</span>
                      {activeAdminDetail.documents.parentConsent && (
                        <button className="bg-[#303030] hover:bg-[#da291c] hover:text-white text-gray-300 font-mono text-[10px] px-2 py-1 font-semibold transition-colors duration-200">
                          PREVIEW FILE
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-[#181818] border border-[#303030] p-3 text-xs">
                    <span className="text-gray-400">Surat Keterangan Sehat</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-white font-mono text-[11px]">{activeAdminDetail.documents.healthCertificate?.name || 'BELUM UNGGAH (OPSIONAL)'}</span>
                      {activeAdminDetail.documents.healthCertificate && (
                        <button className="bg-[#303030] hover:bg-[#da291c] hover:text-white text-gray-300 font-mono text-[10px] px-2 py-1 font-semibold transition-colors duration-200">
                          PREVIEW FILE
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2.5 Input Nilai Tes Fisik */}
              <div className="space-y-3 bg-[#303030]/10 p-4 border border-[#303030] font-mono text-xs">
                <h5 className="text-[10px] uppercase tracking-wider font-mono text-[#da291c] font-bold">
                  2.5 INPUT NILAI SELEKSI FISIK & WAWANCARA
                </h5>
                <p className="text-[11px] text-gray-500 leading-normal">
                  Isi dan simpan pencapaian fisik murid berikut pasca testing lapangan sebelum memberikan ketetapan kelayakan seleksi akhir.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-gray-400 block mb-1">Nilai PBB (0-100)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="w-full bg-[#181818] border border-[#303030] focus:border-[#da291c] text-white py-1.5 px-3 outline-none"
                      value={scorePbb}
                      onChange={e => setScorePbb(Math.min(100, Math.max(0, Number(e.target.value))))}
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Nilai Kesamaptaan (0-100)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="w-full bg-[#181818] border border-[#303030] focus:border-[#da291c] text-white py-1.5 px-3 outline-none"
                      value={scorePhysicalFit}
                      onChange={e => setScorePhysicalFit(Math.min(100, Math.max(0, Number(e.target.value))))}
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Nilai Wawancara (0-100)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="w-full bg-[#181818] border border-[#303030] focus:border-[#da291c] text-white py-1.5 px-3 outline-none"
                      value={scoreInterview}
                      onChange={e => setScoreInterview(Math.min(100, Math.max(0, Number(e.target.value))))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Catatan Khusus Penguji (PBB / Sikap & Kepemimpinan)</label>
                  <textarea
                    rows={2}
                    className="w-full bg-[#181818] border border-[#303030] focus:border-[#da291c] text-white py-1.5 px-3 outline-none resize-none"
                    placeholder="Kelebihan fisik murid atau catatan revisi dokumen..."
                    value={scoreNotes}
                    onChange={e => setScoreNotes(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onUpdateCandidateScores(activeAdminDetail.id, {
                      pbb: scorePbb,
                      physicalFit: scorePhysicalFit,
                      interview: scoreInterview,
                      notes: scoreNotes
                    });
                    // Update active copy
                    setActiveAdminDetail({
                      ...activeAdminDetail,
                      scores: {
                        pbb: scorePbb,
                        physicalFit: scorePhysicalFit,
                        interview: scoreInterview,
                        notes: scoreNotes
                      }
                    });
                    alert(`Berhasil menyimpan nilai untuk ${activeAdminDetail.fullName}!`);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] font-bold px-4 py-2 uppercase tracking-wide rounded-none"
                >
                  ✓ SIMPAN NILAI TES & CATATAN
                </button>
              </div>

              {/* Actions / Status changes mutating global state */}
              <div className="space-y-3 pt-4 border-t border-[#303030]">
                <h5 className="text-[10px] uppercase tracking-wider font-mono text-[#da291c] font-bold block mb-2">
                  3. EKSEKUSI KEPUTUSAN VERIFIKASI (PIC TIM PELATIH)
                </h5>
                
                <div className="flex flex-wrap gap-3 font-mono">
                  {/* Step 1 action: Verify files */}
                  <button
                    onClick={() => {
                      onVerifyCandidate(activeAdminDetail.id, 'Terverifikasi');
                      // Update active detail simulation too
                      setActiveAdminDetail({ ...activeAdminDetail, status: 'Terverifikasi' });
                    }}
                    disabled={activeAdminDetail.status === 'Terverifikasi'}
                    className={`text-[10px] font-bold px-3 py-2.5 uppercase tracking-wider rounded-none transition-all duration-300 flex items-center gap-1 bg-[#303030] text-emerald-400 border border-emerald-900/60 hover:bg-emerald-950/20 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    ✓ VERIFIKASI ADMISI DOKUMEN
                  </button>

                  {/* Step 2 action: Fail admission */}
                  <button
                    onClick={() => {
                      onVerifyCandidate(activeAdminDetail.id, 'Tidak Lolos');
                      setActiveAdminDetail({ ...activeAdminDetail, status: 'Tidak Lolos' });
                    }}
                    disabled={activeAdminDetail.status === 'Tidak Lolos'}
                    className="text-[10px] text-gray-400 border border-red-950 px-3 py-2.5 uppercase tracking-wider rounded-none hover:bg-red-950/10 flex items-center gap-1"
                  >
                    ✕ TIDAK MEMENUHI SYARAT
                  </button>

                  {/* Step 3 action: Pass fully */}
                  <button
                    onClick={() => {
                      onVerifyCandidate(activeAdminDetail.id, 'Lolos Seleksi');
                      setActiveAdminDetail({ ...activeAdminDetail, status: 'Lolos Seleksi' });
                    }}
                    disabled={activeAdminDetail.status === 'Lolos Seleksi'}
                    className="text-[10px] bg-[#da291c] hover:bg-[#b01e0a] text-white px-4 py-2.5 font-bold uppercase tracking-widest flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🏆 LOLOS PEKAN SELEKSI AKHIR (LATIHAN FISIK)
                  </button>
                </div>
                
                <p className="text-[10px] text-gray-500 font-mono mt-2">
                  * Setiap perubahan tombol di atas akan memperbarui basis data lokal dan secara otomatis melahirkan log notifikasi email baru di tab "Kotak Masuk Email".
                </p>
              </div>

            </div>
          ) : (
            <div className="text-center py-24 text-gray-500 font-mono space-y-2">
              <UserCheck className="mx-auto h-12 w-12 text-gray-700" />
              <p className="uppercase text-xs font-bold tracking-widest text-white">BELUM ADA SISWA YANG DIPILIH</p>
              <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                Pilih salah satu antrean pendaftaran di kolom kiri untuk memeriksa dokumen biodata siswa dan memberikan keputusan verifikasi pelatih.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
