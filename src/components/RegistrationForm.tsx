/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, ChevronRight, FileText, CheckCircle, AlertCircle, Trash2, User, Mail, Phone, Scale, BookOpen, ShieldAlert } from 'lucide-react';
import { Candidate, FileInfo } from '../types';
import { MINIMUM_HEIGHT_MALE, MINIMUM_HEIGHT_FEMALE } from '../data';

interface RegistrationFormProps {
  onRegisterSuccess: (candidate: Candidate) => void;
  existingNisns: string[];
  isRegistrationOpen?: boolean;
}

export default function RegistrationForm({ onRegisterSuccess, existingNisns, isRegistrationOpen = true }: RegistrationFormProps) {
  if (!isRegistrationOpen) {
    return (
      <div className="bg-[#181818] border border-[#303030] p-12 text-center rounded-none space-y-4">
        <ShieldAlert size={48} className="mx-auto text-[#da291c]" />
        <h3 className="text-xl font-medium tracking-tight text-white uppercase">PENDAFTARAN DITUTUP SEMENTARA</h3>
        <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
          Mohon maaf, penyerahan formulir seleksi administrasi online di portal ini sedang ditutup atau dinonaktifkan sementara oleh Pembina Paskibra Sekolah. Silakan hubungi Panitia Rekrutmen di Sekretariat OSIS.
        </p>
        <div className="pt-2">
          <span className="inline-block border border-[#303030] px-3 py-1 text-[10px] uppercase font-mono text-gray-500">
            KONTAK SEKRETARIAT: 021-3845672
          </span>
        </div>
      </div>
    );
  }

  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    fullName: '',
    nisn: '',
    email: '',
    phone: '',
    className: 'X-MIPA-1',
    height: '',
    weight: '',
    gender: 'L' as 'L' | 'P',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Document uploading state
  const [documents, setDocuments] = useState<{
    registrationForm: FileInfo | null;
    parentConsent: FileInfo | null;
    healthCertificate: FileInfo | null;
  }>({
    registrationForm: null,
    parentConsent: null,
    healthCertificate: null,
  });

  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [dragActive, setDragActive] = useState<Record<string, boolean>>({});

  const fileInputRefReg = useRef<HTMLInputElement>(null);
  const fileInputRefParent = useRef<HTMLInputElement>(null);
  const fileInputRefHealth = useRef<HTMLInputElement>(null);

  // Validation
  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Nama lengkap wajib diisi';
    
    if (!formData.nisn.trim()) {
      errors.nisn = 'NISN wajib diisi';
    } else if (!/^\d+$/.test(formData.nisn)) {
      errors.nisn = 'NISN harus berupa angka saja';
    } else if (existingNisns.includes(formData.nisn)) {
      errors.nisn = 'NISN sudah terdaftar di sistem. Gunakan tab "Cek Status" untuk melihat.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'No. Telepon / WhatsApp wajib diisi';
    } else if (!/^\d+$/.test(formData.phone)) {
      errors.phone = 'No. Telepon harus berupa angka';
    }

    const h = Number(formData.height);
    if (!formData.height) {
      errors.height = 'Tinggi badan wajib diisi';
    } else if (isNaN(h) || h < 100 || h > 250) {
      errors.height = 'Tinggi badan tidak wajar';
    }

    const w = Number(formData.weight);
    if (!formData.weight) {
      errors.weight = 'Berat badan wajib diisi';
    } else if (isNaN(w) || w < 30 || w > 150) {
      errors.weight = 'Berat badan tidak wajar';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  // Drag and Drop support
  const handleDrag = (e: React.DragEvent, id: string, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [id]: active }));
  };

  const handleDrop = (e: React.DragEvent, id: 'registrationForm' | 'parentConsent' | 'healthCertificate') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [id]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0], id);
    }
  };

  const triggerFileSelect = (id: 'registrationForm' | 'parentConsent' | 'healthCertificate') => {
    if (id === 'registrationForm' && fileInputRefReg.current) fileInputRefReg.current.click();
    if (id === 'parentConsent' && fileInputRefParent.current) fileInputRefParent.current.click();
    if (id === 'healthCertificate' && fileInputRefHealth.current) fileInputRefHealth.current.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, id: 'registrationForm' | 'parentConsent' | 'healthCertificate') => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0], id);
    }
  };

  const handleFileUpload = (file: File, id: 'registrationForm' | 'parentConsent' | 'healthCertificate') => {
    // Check type/size roughly
    const isPDFOrImg = file.type === 'application/pdf' || file.type.startsWith('image/');
    
    // Set simulated upload
    setUploading(prev => ({ ...prev, [id]: true }));
    
    // Simulate premium upload progress
    setTimeout(() => {
      setDocuments(prev => ({
        ...prev,
        [id]: {
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          uploadedAt: new Date().toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      }));
      setUploading(prev => ({ ...prev, [id]: false }));
    }, 1500);
  };

  const handleRemoveFile = (id: 'registrationForm' | 'parentConsent' | 'healthCertificate') => {
    setDocuments(prev => ({ ...prev, [id]: null }));
  };

  const handleFinalSubmit = () => {
    // At least Form biodata and consent is recommended
    if (!documents.registrationForm || !documents.parentConsent) {
      alert('Mohon unggah berkas wajib: Formulir Pendaftaran dan Surat Izin Orang Tua.');
      return;
    }

    const newCandidate: Candidate = {
      id: `cand-${Date.now()}`,
      fullName: formData.fullName,
      nisn: formData.nisn,
      email: formData.email,
      phone: formData.phone,
      className: formData.className,
      height: Number(formData.height),
      weight: Number(formData.weight),
      gender: formData.gender,
      documents: {
        registrationForm: documents.registrationForm,
        parentConsent: documents.parentConsent,
        healthCertificate: documents.healthCertificate,
      },
      status: 'Ditinjau',
      submittedAt: new Date().toISOString()
    };

    onRegisterSuccess(newCandidate);
    
    // Reset
    setStep(1);
    setFormData({
      fullName: '',
      nisn: '',
      email: '',
      phone: '',
      className: 'X-MIPA-1',
      height: '',
      weight: '',
      gender: 'L',
    });
    setDocuments({
      registrationForm: null,
      parentConsent: null,
      healthCertificate: null,
    });
  };

  const hVal = Number(formData.height) || 0;
  const isHeightEligible = formData.gender === 'L' 
    ? hVal >= MINIMUM_HEIGHT_MALE 
    : hVal >= MINIMUM_HEIGHT_FEMALE;

  return (
    <div id="form-pendaftaran-section" className="bg-[#181818] border border-[#303030] p-6 md:p-8 rounded-none">
      <div className="flex justify-between items-center mb-8 border-b border-[#303030] pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#da291c] font-semibold block mb-1">
            FORMULIR OFFICIAL
          </span>
          <h2 className="text-2xl font-medium tracking-tight text-white">
            PENDAFTARAN ANGGOTA BARU
          </h2>
        </div>
        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className={`px-2 py-1 ${step === 1 ? 'bg-[#da291c] text-white' : 'text-gray-400 border border-[#303030]'}`}>
            01. BIODATA
          </span>
          <ChevronRight className="h-4 w-4 text-gray-600" />
          <span className={`px-2 py-1 ${step === 2 ? 'bg-[#da291c] text-white' : 'text-gray-400 border border-[#303030]'}`}>
            02. UNGGAH BERKAS
          </span>
        </div>
      </div>

      {step === 1 ? (
        <form onSubmit={handleNextStep} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Nama Lengkap */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-gray-400 font-medium block">
                Nama Lengkap Siswa/i <span className="text-[#da291c]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-4 text-gray-500">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Contoh: Muhammad Bagus"
                  className="w-full bg-[#181818] border border-[#303030] focus:border-[#da291c] text-white py-3 pl-11 pr-4 rounded-none text-sm outline-none transition-all duration-200"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              {formErrors.fullName && (
                <p className="text-xs text-[#f13a2c] flex items-center gap-1">
                  <AlertCircle size={12} /> {formErrors.fullName}
                </p>
              )}
            </div>

            {/* NISN */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-gray-400 font-medium block">
                NISN (Nomor Induk Siswa Nasional) <span className="text-[#da291c]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-4 text-gray-500 font-mono text-xs font-semibold">
                  ID
                </span>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="Contoh: 202603 (10 digit angka)"
                  className="w-full bg-[#181818] border border-[#303030] focus:border-[#da291c] text-white py-3 pl-11 pr-4 rounded-none text-sm outline-none font-mono transition-all duration-200"
                  value={formData.nisn}
                  onChange={e => setFormData({ ...formData, nisn: e.target.value })}
                />
              </div>
              {formErrors.nisn && (
                <p className="text-xs text-[#f13a2c] flex items-center gap-1">
                  <AlertCircle size={12} /> {formErrors.nisn}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-gray-400 font-medium block">
                Alamat Email Aktif <span className="text-[#da291c]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-4 text-gray-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  placeholder="email.aktif@sch.id"
                  className="w-full bg-[#181818] border border-[#303030] focus:border-[#da291c] text-white py-3 pl-11 pr-4 rounded-none text-sm outline-none transition-all duration-200"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <p className="text-[11px] text-gray-500">
                Email ini digunakan untuk mengirim surat konfirmasi pendaftaran & undangan tes latihan fisik secara otomatis.
              </p>
              {formErrors.email && (
                <p className="text-xs text-[#f13a2c] flex items-center gap-1">
                  <AlertCircle size={12} /> {formErrors.email}
                </p>
              )}
            </div>

            {/* Telepon */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-gray-400 font-medium block">
                No. HP atau WhatsApp Aktif <span className="text-[#da291c]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-4 text-gray-500">
                  <Phone size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Contoh: 0812XXXXXXXX"
                  className="w-full bg-[#181818] border border-[#303030] focus:border-[#da291c] text-white py-3 pl-11 pr-4 rounded-none text-sm outline-none font-mono transition-all duration-200"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              {formErrors.phone && (
                <p className="text-xs text-[#f13a2c] flex items-center gap-1">
                  <AlertCircle size={12} /> {formErrors.phone}
                </p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-gray-400 font-medium block">
                Jenis Kelamin <span className="text-[#da291c]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'L' })}
                  className={`py-3 text-center text-sm rounded-none border font-medium uppercase tracking-wider transition-all duration-200 ${
                    formData.gender === 'L'
                      ? 'border-[#da291c] bg-[#da291c]/10 text-white'
                      : 'border-[#303030] bg-[#181818] text-gray-400 hover:text-white'
                  }`}
                >
                  Laki-Laki (Putra)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'P' })}
                  className={`py-3 text-center text-sm rounded-none border font-medium uppercase tracking-wider transition-all duration-200 ${
                    formData.gender === 'P'
                      ? 'border-[#da291c] bg-[#da291c]/10 text-white'
                      : 'border-[#303030] bg-[#181818] text-gray-400 hover:text-white'
                  }`}
                >
                  Perempuan (Putri)
                </button>
              </div>
            </div>

            {/* Kelas/Jurusan */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-gray-400 font-medium block">
                Kelas (Tingkat X / XI Baru) <span className="text-[#da291c]">*</span>
              </label>
              <select
                className="w-full bg-[#181818] border border-[#303030] focus:border-[#da291c] text-white py-3 px-4 rounded-none text-sm outline-none transition-all duration-200"
                value={formData.className}
                onChange={e => setFormData({ ...formData, className: e.target.value })}
              >
                <option value="X-MIPA-1">Kelas X - MIPA 1</option>
                <option value="X-MIPA-2">Kelas X - MIPA 2</option>
                <option value="X-IPS-1">Kelas X - IPS 1</option>
                <option value="X-IPS-2">Kelas X - IPS 2</option>
                <option value="X-IPS-3">Kelas X - IPS 3</option>
                <option value="X-BAHASA">Kelas X - Bahasa</option>
                <option value="XI-MIPA-1">Kelas XI - MIPA 1</option>
                <option value="XI-IPS-1">Kelas XI - IPS 1</option>
              </select>
            </div>

            {/* Tinggi Badan */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-gray-400 font-medium block">
                Tinggi Badan (cm) <span className="text-[#da291c]">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Contoh: 172"
                  className="w-full bg-[#181818] border border-[#303030] focus:border-[#da291c] text-white py-3 px-4 rounded-none text-sm outline-none font-mono transition-all duration-200"
                  value={formData.height}
                  onChange={e => setFormData({ ...formData, height: e.target.value })}
                />
                <span className="absolute right-4 top-3 text-xs text-gray-500 font-mono">
                  CM
                </span>
              </div>
              {formErrors.height && (
                <p className="text-xs text-[#f13a2c] flex items-center gap-1">
                  <AlertCircle size={12} /> {formErrors.height}
                </p>
              )}
            </div>

            {/* Berat Badan */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-gray-400 font-medium block">
                Berat Badan (kg) <span className="text-[#da291c]">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Contoh: 62"
                  className="w-full bg-[#181818] border border-[#303030] focus:border-[#da291c] text-white py-3 px-4 rounded-none text-sm outline-none font-mono transition-all duration-200"
                  value={formData.weight}
                  onChange={e => setFormData({ ...formData, weight: e.target.value })}
                />
                <span className="absolute right-4 top-3 text-xs text-gray-500 font-mono">
                  KG
                </span>
              </div>
              {formErrors.weight && (
                <p className="text-xs text-[#f13a2c] flex items-center gap-1">
                  <AlertCircle size={12} /> {formErrors.weight}
                </p>
              )}
            </div>

          </div>

          {/* Quick eligibility gauge */}
          {formData.height && (
            <div className={`p-4 border ${isHeightEligible ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300' : 'bg-amber-950/20 border-amber-900/40 text-amber-300'} text-xs flex items-start gap-3`}>
              <div className="mt-0.5">
                {isHeightEligible ? <CheckCircle size={16} /> : <ShieldAlert size={16} className="text-[#da291c]" />}
              </div>
              <div>
                <p className="font-semibold uppercase tracking-wider">
                  {isHeightEligible ? 'MEMENUHI PERSYARATAN FISIK DASAR' : 'EVALUASI PERSYARATAN FISIK DAN POSTUR'}
                </p>
                <p className="mt-1 text-gray-400">
                  Tinggi minimal Paskibra resmi SMAN: <strong>Putra {MINIMUM_HEIGHT_MALE} cm</strong> dan <strong>Putri {MINIMUM_HEIGHT_FEMALE} cm</strong>. Tinggi badan Anda diinput {formData.height} cm. Anda tetap dapat melanjutkan pendaftaran dan akan ditinjau tim kepelatihan selama tes parade/postur berlangsung.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-[#303030]">
            <button
              type="submit"
              className="bg-[#da291c] hover:bg-[#b01e0a] text-white px-8 py-4 font-bold text-xs uppercase tracking-[0.15em] flex items-center gap-3 rounded-none transition-all duration-300"
            >
              LANJUT UNGGAH BERKAS
              <ChevronRight size={14} />
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-8">
          
          <div className="p-4 bg-[#303030]/40 border border-[#303030] text-xs text-gray-300 space-y-1">
            <h4 className="font-semibold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <CheckCircle size={14} className="text-[#da291c]" /> RINGKASAN DATA IDENTITAS
            </h4>
            <p>Nama Lengkap: <span className="text-white font-medium">{formData.fullName}</span> ({formData.gender === 'L' ? 'Putra' : 'Putri'})</p>
            <p>NISN: <span className="text-white font-mono">{formData.nisn}</span> | Kelas: <span className="text-white">{formData.className}</span></p>
            <p>Email: <span className="text-white font-mono">{formData.email}</span> | Tinggi: <span className="text-white font-mono">{formData.height} cm</span> | Berat: <span className="text-white font-mono">{formData.weight} kg</span></p>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-[#da291c]">
              BERKAS VERIFIKASI SELEKSI WAJIB
            </h3>

            {/* Document 1: Formulir Biodata Fisik */}
            <DocumentUploadSlot
              id="registrationForm"
              label="1. Formulir Pendaftaran & Riwayat Hidup (Wajib)*"
              description="Unduh berkas kosong di koridor sekolah. Isi data tanda tangan, scan menjadi format PDF / Gambar."
              file={documents.registrationForm}
              uploading={uploading.registrationForm}
              dragActive={dragActive.registrationForm}
              onDrag={(e, active) => handleDrag(e, 'registrationForm', active)}
              onDrop={(e) => handleDrop(e, 'registrationForm')}
              onBrowse={() => triggerFileSelect('registrationForm')}
              onRemove={() => handleRemoveFile('registrationForm')}
              fileInputRef={fileInputRefReg}
              onFileChange={(e) => handleFileChange(e, 'registrationForm')}
            />

            {/* Document 2: Surat Izin Orang Tua */}
            <DocumentUploadSlot
              id="parentConsent"
              label="2. Surat Izin Tertulis Orang Tua / Wali (Wajib)*"
              description="Dokumen persetujuan orang tua untuk keikutsertaan seleksi berjenjang, latihan fisik berat, dan kegiatan upacara resmi."
              file={documents.parentConsent}
              uploading={uploading.parentConsent}
              dragActive={dragActive.parentConsent}
              onDrag={(e, active) => handleDrag(e, 'parentConsent', active)}
              onDrop={(e) => handleDrop(e, 'parentConsent')}
              onBrowse={() => triggerFileSelect('parentConsent')}
              onRemove={() => handleRemoveFile('parentConsent')}
              fileInputRef={fileInputRefParent}
              onFileChange={(e) => handleFileChange(e, 'parentConsent')}
            />

            {/* Document 3: Surat Sehat */}
            <DocumentUploadSlot
              id="healthCertificate"
              label="3. Surat Keterangan Sehat Kedokteran (Opsional / Dianjurkan)"
              description="Surat keterangan sehat fisik dari Puskesmas / Klinik Dokter terbaru untuk mengantisipasi asma/masalah jantung berat."
              file={documents.healthCertificate}
              uploading={uploading.healthCertificate}
              dragActive={dragActive.healthCertificate}
              onDrag={(e, active) => handleDrag(e, 'healthCertificate', active)}
              onDrop={(e) => handleDrop(e, 'healthCertificate')}
              onBrowse={() => triggerFileSelect('healthCertificate')}
              onRemove={() => handleRemoveFile('healthCertificate')}
              fileInputRef={fileInputRefHealth}
              onFileChange={(e) => handleFileChange(e, 'healthCertificate')}
            />
          </div>

          <div className="flex md:flex-row flex-col justify-between items-center gap-4 pt-6 border-t border-[#303030]">
            <button
              onClick={() => setStep(1)}
              className="text-gray-400 hover:text-white uppercase font-bold text-xs tracking-wider md:w-auto w-full text-center py-3"
            >
              KEMBALI EDIT DATA SISWA
            </button>
            <button
              onClick={handleFinalSubmit}
              disabled={!documents.registrationForm || !documents.parentConsent}
              className={`px-8 py-4 font-bold text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-3 rounded-none transition-all duration-300 md:w-auto w-full ${
                documents.registrationForm && documents.parentConsent
                  ? 'bg-[#da291c] hover:bg-[#b01e0a] text-white cursor-pointer'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-[#303030]'
              }`}
            >
              KIRIM PENDAFTARAN FINAL
              <CheckCircle size={14} />
            </button>
          </div>
          
          {!documents.registrationForm || !documents.parentConsent ? (
            <p className="text-right text-[11px] text-[#da291c]">
              * Unggah minimal berkas nomor 1 & 2 untuk mengaktifkan tombol Kirim Final.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

// Sub-component for individual file slot to save lines & avoid repetitive JSX
interface DocumentUploadSlotProps {
  id: string;
  label: string;
  description: string;
  file: FileInfo | null;
  uploading: boolean;
  dragActive: boolean;
  onDrag: (e: React.DragEvent, active: boolean) => void;
  onDrop: (e: React.DragEvent) => void;
  onBrowse: () => void;
  onRemove: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function DocumentUploadSlot({
  id,
  label,
  description,
  file,
  uploading,
  dragActive,
  onDrag,
  onDrop,
  onBrowse,
  onRemove,
  fileInputRef,
  onFileChange
}: DocumentUploadSlotProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs uppercase tracking-wide text-white font-medium">
        {label}
      </h4>
      <p className="text-xs text-gray-500 leading-relaxed md:max-w-2xl">
        {description}
      </p>

      {file ? (
        <div className="flex justify-between items-center bg-[#303030] p-4 text-xs font-mono border border-emerald-900/50">
          <div className="flex items-center gap-3">
            <div className="bg-[#181818] p-2 text-emerald-500">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-white line-clamp-1">{file.name}</p>
              <div className="flex gap-2 text-gray-500 mt-1">
                <span>{file.size}</span>
                <span>•</span>
                <span>Telah diunggah {file.uploadedAt}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-[#da291c] p-2 transition-colors duration-200"
            title="Hapus Dokumen"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : uploading ? (
        <div className="bg-[#181818] border border-dashed border-[#da291c] p-6 text-center text-xs text-gray-400 animate-pulse font-mono">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-1 bg-[#303030] relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-1/2 bg-[#da291c] animate-infinite-slide"></div>
            </div>
          </div>
          MENGUNGGAH BERKAS DAN MEMINDAI INTEGRITAS FILE...
        </div>
      ) : (
        <div
          onDragOver={e => onDrag(e, true)}
          onDragEnter={e => onDrag(e, true)}
          onDragLeave={e => onDrag(e, false)}
          onDrop={onDrop}
          onClick={onBrowse}
          className={`border border-dashed p-6 text-center transition-all duration-300 cursor-pointer ${
            dragActive
              ? 'border-[#da291c] bg-[#da291c]/5'
              : 'border-[#303030] bg-[#181818] hover:border-[#da291c]/60'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            className="hidden"
            accept=".pdf,image/*"
          />
          <Upload className="mx-auto mb-3 text-gray-500 h-6 w-6" />
          <p className="text-xs text-gray-300">
            Seret & taruh file di sini, atau <span className="text-[#da291c] font-semibold hover:underline">cari dokumen</span>
          </p>
          <p className="text-[10px] text-gray-500 font-mono mt-1">
            Format yang didukung: PDF, JPEG, PNG (Maks. 5MB)
          </p>
        </div>
      )}
    </div>
  );
}
