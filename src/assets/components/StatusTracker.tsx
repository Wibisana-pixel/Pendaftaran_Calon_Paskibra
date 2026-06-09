/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Candidate } from '../types';
import { Search, ShieldAlert, FileText, CheckCircle2, XCircle, Clock, QrCode } from 'lucide-react';

interface StatusTrackerProps {
  candidates: Candidate[];
}

export default function StatusTracker({ candidates }: StatusTrackerProps) {
  const [searchNisn, setSearchNisn] = useState('');
  const [searchedCandidate, setSearchedCandidate] = useState<Candidate | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchNisn.trim()) return;
    
    const found = candidates.find(c => c.nisn === searchNisn.trim());
    setSearchedCandidate(found || null);
    setHasSearched(true);
  };

  const statusColors: Record<Candidate['status'], string> = {
    'Draft': 'bg-gray-800 text-gray-400 border-gray-700',
    'Ditinjau': 'bg-amber-950/50 text-amber-300 border-amber-900',
    'Terverifikasi': 'bg-emerald-950/50 text-emerald-300 border-emerald-900',
    'Lolos Seleksi': 'bg-red-950/20 text-[#da291c] border-[#da291c]/40',
    'Tidak Lolos': 'bg-gray-900 text-gray-500 border-gray-800'
  };

  const statusLabels: Record<Candidate['status'], string> = {
    'Draft': 'Draf Formulir',
    'Ditinjau': 'Menunggu Verifikasi Pembina',
    'Terverifikasi': 'Terverifikasi (Siap Seleksi Fisik)',
    'Lolos Seleksi': 'Dinyatakan Lolos Anggota Paskibra',
    'Tidak Lolos': 'Tidak Memenuhi Syarat'
  };

  return (
    <div className="space-y-8">
      
      {/* Top Welcome Student Banner */}
      <div className="space-y-2 text-left">
        <span className="text-[10px] uppercase font-mono tracking-widest text-[#da291c] font-bold">
          PORTAL SISWA / PENDAFTAR SMAN 1
        </span>
        <h2 className="text-xl md:text-2xl font-medium text-white uppercase tracking-tight">
          Pemantauan Status Seleksi Administratif & Fisik
        </h2>
        <p className="text-gray-400 text-xs">
          Cek kelengkapan berkas Anda, cetak kartu ujian lapangan, dan pantau keputusan dewan pelatih secara transparan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Tracking Search Input */}
        <div className="md:col-span-4 bg-[#181818] border border-[#303030] p-6 rounded-none h-fit space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-[#da291c]">
            PEMANTAUAN STATUS SISWA
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Ketikkan 10 digit <strong>NISN</strong> (Nomor Induk Siswa Nasional) yang telah didaftarkan untuk mengunduh Kartu Peserta dan memantau status persetujuan dokumen Anda.
          </p>
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Masukkan NISN (contoh: 202601)"
                className="w-full bg-[#181818] border border-[#303030] focus:border-[#da291c] text-white py-2.5 px-4 pr-10 rounded-none text-xs outline-none font-mono"
                value={searchNisn}
                onChange={e => setSearchNisn(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-3 text-gray-400 hover:text-white">
                <Search size={14} />
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-[#da291c] hover:bg-[#b01e0a] text-white text-xs font-bold py-2.5 uppercase tracking-wider rounded-none font-mono transition-colors"
            >
              CARI DATA NISN
            </button>
          </form>

          <div className="border-t border-[#303030] pt-3">
            <p className="text-[10px] text-gray-500 font-mono leading-normal">
              DATA NISN CEPAT (DEMO):<br />
              • <span className="text-white cursor-pointer hover:underline" onClick={() => { setSearchNisn('202601'); setSearchNisn('202601'); }}>202601</span> (Terverifikasi)<br />
              • <span className="text-white cursor-pointer hover:underline" onClick={() => { setSearchNisn('202602'); setSearchNisn('202602'); }}>202602</span> (Ditinjau)
            </p>
          </div>
        </div>

        {/* Tracking Result Panel */}
        <div className="md:col-span-8">
          {hasSearched ? (
            searchedCandidate ? (
              /* Found applicant */
              <div className="bg-[#181818] border border-[#303030] p-6 md:p-8 rounded-none space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#303030] pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400">
                      HASIL PENELUSURAN NISN {searchedCandidate.nisn}
                    </span>
                    <h3 className="text-xl font-medium tracking-tight text-white mt-1">
                      {searchedCandidate.fullName}
                    </h3>
                    <p className="text-xs text-gray-400">Kelas: {searchedCandidate.className} ({searchedCandidate.gender === 'L' ? 'Putra' : 'Putri'})</p>
                  </div>
                  <div>
                    <span className={`inline-block border px-3 py-1 text-xs font-mono font-medium tracking-wide ${statusColors[searchedCandidate.status]}`}>
                      {statusLabels[searchedCandidate.status]}
                    </span>
                  </div>
                </div>

                {/* Flow tracker display */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Step 1 */}
                  <div className="p-4 bg-[#181818] border border-[#303030] relative">
                    <div className="flex items-center space-x-2 text-emerald-500">
                      <CheckCircle2 size={16} />
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider">01. Registrasi Identitas</span>
                    </div>
                    <p className="text-xs text-white mt-2">Selesai</p>
                    <p className="text-[10px] text-gray-400 mt-1 font-mono">Telah terdata di pangkalan data.</p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 bg-[#181818] border border-[#303030]">
                    <div className={`flex items-center space-x-2 ${
                      searchedCandidate.status !== 'Draft' ? 'text-emerald-500' : 'text-amber-500'
                    }`}>
                      {searchedCandidate.status !== 'Draft' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider">02. Peninjauan Berkas</span>
                    </div>
                    <p className="text-xs text-white mt-2">
                      {searchedCandidate.status === 'Draft' ? 'Menunggu Berkas' : 'Berkas Terupload'}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 font-mono">
                      {searchedCandidate.documents.registrationForm ? 'Formulir, Izin Ortu masuk.' : 'Mohon upload berkas.'}
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 bg-[#181818] border border-[#303030]">
                    <div className={`flex items-center space-x-2 ${
                      searchedCandidate.status === 'Terverifikasi' || searchedCandidate.status === 'Lolos Seleksi'
                        ? 'text-emerald-500' 
                        : searchedCandidate.status === 'Tidak Lolos' 
                          ? 'text-red-500' 
                          : 'text-gray-600'
                    }`}>
                      {searchedCandidate.status === 'Terverifikasi' || searchedCandidate.status === 'Lolos Seleksi' ? (
                        <CheckCircle2 size={16} />
                      ) : searchedCandidate.status === 'Tidak Lolos' ? (
                        <XCircle size={16} />
                      ) : (
                        <Clock size={16} />
                      )}
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider">03. Hasil Kelayakan</span>
                    </div>
                    <p className="text-xs text-white mt-2">
                      {searchedCandidate.status === 'Terverifikasi' ? 'Siap Tes Fisik' : 
                       searchedCandidate.status === 'Lolos Seleksi' ? 'LOLOS SELEKSI' :
                       searchedCandidate.status === 'Tidak Lolos' ? 'Gagal Persyaratan' : 'Sedang Ditinjau'}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 font-mono">Simak pembaruan jadwal.</p>
                  </div>
                </div>

                {/* Document and Details Check */}
                <div className="space-y-4 pt-4 border-t border-[#303030]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#da291c]">
                    BERKAS DAN HASIL EVALUASI FISIK:
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="space-y-2">
                      <p className="text-gray-400">Berkas Formulir Pendaftaran:</p>
                      <p className="text-white flex items-center gap-2">
                        <FileText size={14} className="text-[#da291c]" /> 
                        {searchedCandidate.documents.registrationForm?.name || 'Belum diunggah'}
                      </p>
                      
                      <p className="text-gray-400 pt-2">Surat Izin Orang Tua:</p>
                      <p className="text-white flex items-center gap-2">
                        <FileText size={14} className="text-[#da291c]" /> 
                        {searchedCandidate.documents.parentConsent?.name || 'Belum diunggah'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-gray-400">Postur Tinggi Badan:</p>
                      <p className="text-white">{searchedCandidate.height} cm | Berat: {searchedCandidate.weight} kg</p>
                      
                      <p className="text-gray-400 pt-2">Surat Keterangan Sehat:</p>
                      <p className="text-white flex items-center gap-2">
                        <FileText size={14} className="text-[#da291c]" /> 
                        {searchedCandidate.documents.healthCertificate?.name || 'Belum diunggah (opsional)'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Score section for student display if graded */}
                {searchedCandidate.scores && (searchedCandidate.scores.pbb > 0 || searchedCandidate.scores.physicalFit > 0 || searchedCandidate.scores.interview > 0) && (
                  <div className="space-y-3 bg-[#303030]/20 p-4 border border-[#303030] font-mono text-xs">
                    <h4 className="text-[10px] uppercase tracking-wider font-bold text-[#da291c]">
                      REKAPITULASI PENILAIAN FISIK LAPANGAN & KEPEMIMPINAN
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-center text-white pt-2">
                      <div className="bg-[#181818] p-2 border border-[#303030]">
                        <p className="text-gray-500 text-[9px]">PBB & SIKAP</p>
                        <p className="text-base font-bold text-[#da291c]">{searchedCandidate.scores.pbb || '-'}</p>
                      </div>
                      <div className="bg-[#181818] p-2 border border-[#303030]">
                        <p className="text-gray-500 text-[9px]">KESAMAPTAAN</p>
                        <p className="text-base font-bold text-[#da291c]">{searchedCandidate.scores.physicalFit || '-'}</p>
                      </div>
                      <div className="bg-[#181818] p-2 border border-[#303030]">
                        <p className="text-gray-500 text-[9px]">WAWANCARA</p>
                        <p className="text-base font-bold text-[#da291c]">{searchedCandidate.scores.interview || '-'}</p>
                      </div>
                    </div>
                    {searchedCandidate.scores.notes && (
                      <div className="pt-2 text-gray-400 text-[11px] leading-relaxed">
                        <span className="font-bold text-gray-300">Catatan Dewan Pelatih:</span> "{searchedCandidate.scores.notes}"
                      </div>
                    )}
                  </div>
                )}

                {/* Card Admission Pass: Only if Verified or Lolos Seleksi */}
                {(searchedCandidate.status === 'Terverifikasi' || searchedCandidate.status === 'Lolos Seleksi') && (
                  <div className="bg-[#303030]/20 border border-[#da291c]/30 p-6 rounded-none flex flex-col sm:flex-row items-center gap-6">
                    <div className="bg-white p-3 rounded-none flex-shrink-0">
                      <QrCode size={100} className="text-black" />
                    </div>
                    <div className="space-y-2 text-center sm:text-left">
                      <span className="bg-[#da291c] text-white font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 font-bold">
                        KARTU ADMISI SELEKSI FISIK
                      </span>
                      <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                        KARTU PESERTA PASKIBRA SMAN 1
                      </h4>
                      <p className="text-xs text-gray-500 max-w-md font-mono leading-normal">
                        Tunjukkan QR CODE ini kepada panitia rekrutmen di lapangan atletik. Harap datang sesuai jadwal dengan atribut kaos olahraga rapi.
                      </p>
                      <p className="text-xs text-white font-mono font-semibold pt-1">
                        KODE ADMISI: PKB-{searchedCandidate.id.split('-')[1]?.substring(0, 6) || '2026'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Description notice */}
                <div className="p-4 bg-[#303030]/10 border border-[#303030] text-xs text-gray-400 leading-relaxed text-justify">
                  <strong>Catatan Pembina: </strong> 
                  {searchedCandidate.status === 'Ditinjau' && 'Daftar berkas Anda sedang di-review oleh Pembina Paskibra Sekolah. Mohon cek berkala atau periksa kotak masuk virtual untuk melihat status real-time.'}
                  {searchedCandidate.status === 'Terverifikasi' && 'Selamat! Berkas administrasi lengkap. Tinggi dan berat Anda memenuhi kriteria uji awal. Silakan ikuti tes lari ketahanan 12 menit sesuai koordinasi tab jadwal.'}
                  {searchedCandidate.status === 'Lolos Seleksi' && 'KORPS PASKIBRA SMAN - Selamat! Anda lolos seluruh rangkaian seleksi fisik dan resmi dikukuhkan sebagai Calon Paskibra Baru.'}
                  {searchedCandidate.status === 'Tidak Lolos' && 'Terimakasih atas ketertarikan Anda. Mohon maaf postur fisik atau kelengkapan berkas belum memenuhi standar Paskibra resmi SMAN tahun ini.'}
                </div>
              </div>
            ) : (
              /* Search non-found info */
              <div className="bg-[#181818] border border-[#303030] p-8 text-center rounded-none space-y-4">
                <ShieldAlert size={48} className="mx-auto text-gray-600" />
                <h4 className="text-base text-white tracking-tight uppercase font-medium">
                  NISN TIDAK DIKETEMUKAN
                </h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                  Mohon maaf, nomor induk siswa <strong>{searchNisn}</strong> belum terdata di sistem. Pastikan Anda telah mengonfirmasi NISN pada pendaftaran online.
                </p>
                <button
                  type="button"
                  onClick={() => setHasSearched(false)}
                  className="bg-[#da291c] text-white text-xs font-bold px-4 py-2 uppercase tracking-wider font-mono rounded-none"
                >
                  COBA LAGI
                </button>
              </div>
            )
          ) : (
            /* Initial state */
            <div className="bg-[#181818] border border-[#303030] p-12 text-center rounded-none">
              <FileText size={40} className="mx-auto text-gray-700 mb-3" />
              <h4 className="text-xs uppercase tracking-[0.2em] text-gray-500 font-mono">
                MENUNGGU PENELUSURAN DATA
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-2 leading-relaxed">
                Ketikkan nomor NISN pendaftar di formulir sebelah kiri untuk memproses draf kartu peserta, skor kesamaptaan fisik, dan persetujuan panitia SMAN.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
