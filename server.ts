/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'database.json');

app.use(express.json());

// Initial Seed Data
const INITIAL_CANDIDATES = [
  {
    id: "cand-1",
    fullName: "Bagus Adi Nugroho",
    nisn: "202601",
    email: "bagus.adi@sch.id",
    phone: "081234567890",
    className: "X-MIPA-1",
    height: 173,
    weight: 65,
    gender: "L",
    documents: {
      registrationForm: {
        name: "Form_Bagus_Paskibra.pdf",
        size: "1.4 MB",
        uploadedAt: "05/06/2026 14:22"
      },
      parentConsent: {
        name: "Izin_Ortu_Bagus.pdf",
        size: "950 KB",
        uploadedAt: "05/06/2026 14:23"
      },
      healthCertificate: {
        name: "Surat_Sehat_Klinik_Bagus.pdf",
        size: "1.1 MB",
        uploadedAt: "05/06/2026 14:25"
      }
    },
    status: "Terverifikasi",
    submittedAt: "2026-06-05T14:25:00Z",
    scores: {
      pbb: 85,
      physicalFit: 90,
      interview: 88,
      notes: "Sangat antusias, suara lantang, postur punggung tegap sempurna."
    }
  },
  {
    id: "cand-2",
    fullName: "Dinda Shafira Lestari",
    nisn: "202602",
    email: "dindashaf@sch.id",
    phone: "085712123434",
    className: "X-IPS-3",
    height: 165,
    weight: 52,
    gender: "P",
    documents: {
      registrationForm: {
        name: "Formulir_Paskibra_Dinda.pdf",
        size: "1.3 MB",
        uploadedAt: "06/06/2026 09:41"
      },
      parentConsent: {
        name: "Surat_OrangTua_Dinda.pdf",
        size: "820 KB",
        uploadedAt: "06/06/2026 09:42"
      },
      healthCertificate: null
    },
    status: "Ditinjau",
    submittedAt: "2026-06-06T09:42:00Z",
    scores: {
      pbb: 0,
      physicalFit: 0,
      interview: 0,
      notes: ""
    }
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: "email-1",
    recipientName: "Bagus Adi Nugroho",
    recipientEmail: "bagus.adi@sch.id",
    subject: "✓ DOKUMEN PENDAFTARAN DITERIMA — PASKIBRA ACADEMY SMAN 1",
    body: `Yth. Bagus Adi Nugroho,\n\nTerimakasih telah menyelesaikan rangkaian pendaftaran online Paskibra SMAN 1.\n\nDokumen formulir pendaftaran fisik diri Anda beserta surat persetujuan tertulis orang tua/wali telah BERHASIL diunggah dan diverifikasi aman oleh gerbang unggah rekrutmen.\n\nBerikut ringkasan data awal Anda:\n- NISN: 202601\n- Kelas: X-MIPA-1\n- Tinggi / Berat: 173 cm / 65 kg (BMI Ideal)\n\nDATA STATUS SELEKSI ADMINISTRASI Anda telah diubah oleh tim Pembina menjadi: TERVERIFIKASI.\n\nSelamat, Anda berhak mengikuti pekan pengujian fisik pertama, mengacu pada tab 'Jadwal Seleksi' di portal online. Silakan unduh KARTU ADMISI BER-QR CODE Anda pada tab 'Cek Status' untuk diperlihatkan di lapangan atletik. Tetap jaga stamina, pelihara kedisiplinan mental, dan hadapi seleksi dengan mata lurus tegap!`,
    sentAt: "2026-06-05T14:26:00Z",
    type: "RegistrationSuccess"
  },
  {
    id: "email-2",
    recipientName: "Dinda Shafira Lestari",
    recipientEmail: "dindashaf@sch.id",
    subject: "📩 PENERIMAAN BERKAS PENDAFTARAN — PASKIBRA ACADEMY SMAN 1",
    body: `Yth. Dinda Shafira Lestari,\n\nTerimakasih telah melakukan pengisian biodata online calon siswa-siswi Paskibra SMAN 1.\n\nDokumen penting yang berhasil terunggah:\n- Formulir Seleksi Dasar (Formulir_Paskibra_Dinda.pdf)\n- Surat Izin Orang Tua/Wali Wali (Surat_OrangTua_Dinda.pdf)\n- Lampiran Surat Sehat: Belum Ada (Dianjurkan menyusul)\n\nBerkas Anda sedang dalam proses peninjauan (STATUS: DITINJAU) oleh Pembina Paskibra Sekolah untuk validasi tinggi badan dasar dan restu orang tua.\n\nUndangan resmi beserta panduan tes latihan fisik tahap I akan dikirimkan otomatis ke alamat email ini segera setelah berkas dinyatakan lolos seleksi berkas. Silakan pantau portal web rekrutmen ini secara berkala menggunakan NISN: 202602 Anda.`,
    sentAt: "2026-06-06T09:44:00Z",
    type: "RegistrationSuccess"
  }
];

// Helper to load database
function loadDb() {
  if (!fs.existsSync(DB_FILE)) {
    const defaultDb = {
      candidates: INITIAL_CANDIDATES,
      notifications: INITIAL_NOTIFICATIONS,
      isRegistrationOpen: true,
      announcementText: "Pengumuman: Gelombang pengisian formulir seleksi administrasi gelombang pertama dibuka s.d 30 Juni 2026. Persiapkan berkas kesehatan Anda!"
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
    return defaultDb;
  }
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading database, resetting to default', error);
    const defaultDb = {
      candidates: INITIAL_CANDIDATES,
      notifications: INITIAL_NOTIFICATIONS,
      isRegistrationOpen: true,
      announcementText: "Pengumuman: Gelombang pengisian formulir seleksi administrasi gelombang pertama dibuka s.d 30 Juni 2026. Persiapkan berkas kesehatan Anda!"
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
    return defaultDb;
  }
}

// Helper to save database
function saveDb(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// REST API Endpoints

// 1. Get entire app state
app.get('/api/data', (req, res) => {
  const data = loadDb();
  res.json(data);
});

// 2. Add New Candidate
app.post('/api/candidates', (req, res) => {
  const dbData = loadDb();
  const newCandidate = req.body;
  
  dbData.candidates = [newCandidate, ...dbData.candidates];
  
  // Also push a confirmation notification
  const newEmail = {
    id: `email-${Date.now()}`,
    recipientName: newCandidate.fullName,
    recipientEmail: newCandidate.email,
    subject: `📩 PENERIMAAN BERKAS PENDAFTARAN — PASKIBRA ACADEMY SMAN 1`,
    body: `Yth. ${newCandidate.fullName},\n\nTerimakasih telah melakukan pendaftaran mandiri secara online Calon Anggota Paskibra SMAN 1.\n\nDokumen pendaftaran penting Anda telah berhasil diunggah secara aman di portal digital:\n- Formulir Biodata Rekrutmen (OK - ${newCandidate.documents.registrationForm?.name})\n- Surat Izin Orang Tua Mandat Fisik (OK - ${newCandidate.documents.parentConsent?.name})\n- Surat Keterangan Sehat Kedokteran: ${newCandidate.documents.healthCertificate ? `OK - ${newCandidate.documents.healthCertificate.name}` : "Belum diunggah (Dianjurkan melengkapi saat seleksi awal)"}\n\nStatus Berkas Anda saat ini adalah: DITINJAU.\n\nTim Pembina Paskibra SMAN 1 akan memvalidasi kesesuaian berkas serta data tinggi badan Anda (${newCandidate.height} cm). Begitu berkas terverifikasi, Anda akan menerima email notifikasi undangan seleksi fisik resmi kedua yang memuat Admission Pass QR Code untuk mengikuti uji lari ketahanan.\n\nHarap simpan NISN Anda: ${newCandidate.nisn} untuk mengunduh Kartu Admisi di portal web kami.`,
    sentAt: new Date().toISOString(),
    type: 'RegistrationSuccess'
  };
  
  dbData.notifications = [newEmail, ...dbData.notifications];
  saveDb(dbData);
  
  res.status(201).json({
    candidates: dbData.candidates,
    notifications: dbData.notifications
  });
});

// 3. Verify Candidate Status
app.put('/api/candidates/:id/verify', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const dbData = loadDb();
  
  const idx = dbData.candidates.findIndex((c: any) => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Candidate not found' });
  }
  
  const targetCand = dbData.candidates[idx];
  targetCand.status = status;
  dbData.candidates[idx] = targetCand;
  
  // Generate appropriate automated notification
  let emailSubject = '';
  let emailBody = '';
  
  if (status === 'Terverifikasi') {
    emailSubject = `✓ UNDANGAN SELEKSI FISIK RESMI PASKIBRA — ${targetCand.fullName}`;
    emailBody = `Yth. ${targetCand.fullName},\n\nKabar Gembira. Berkas pendaftaran dan dokumen perizinan fisik Anda telah resmi DI-REVIEW dan dinyatakan LOLOS TAHAP VERIFIKASI ADMINISTRASI oleh Tim Kepelatihan Paskibra SMAN 1.\n\nStatus Pendaftaran Anda saat ini ditingkatkan menjadi: TERVERIFIKASI.\n\nDengan ini, Anda diundang secara resmi untuk hadir dan mengikuti:\n\n1. Tes Fisik Tahap I - Ketahanan Kardio (Cooper Test / Lari 12 Menit)\n   Jadwal Sesi: Sabtu, 13 Juni 2026 - Pukul 06:00 WIB\n   Tempat Uji: Lapangan Atletik Sempur\n   Pakaian: Kaos Olahraga Sekolah & Sepatu Kets Rapi.\n\nSilakan kunjungi tab 'Cek Status' di portal online pendaftaran, cari NISN ${targetCand.nisn} Anda, lalu unduh KARTU ADMISI SELEKSI FISIK berlogokan QR Code resmi. Sampaikan kartu tersebut kepada pelatih di pintu koordinasi lapangan.\n\nSelamat berlatih, jaga asupan gizi, dan kobarkan semangat Paskibra!`;
  } else if (status === 'Lolos Seleksi') {
    emailSubject = `🏆 KELULUSAN AKHIR: SELAMAT BERGABUNG DI KORPS PASKIBRA SMAN 1`;
    emailBody = `Yth. ${targetCand.fullName},\n\nDEKLARASI RESMI KELULUSAN ANGGOTA BARU.\n\nBerdasarkan akumulasi nilai ketahanan kardio (lari 12 menit), kekuatan push-up/sit-up, keselarasan postur, ketegapan parade, serta kedisiplinan sikap baris-berbaris (PBB) Anda,\n\nTim Dewan Guru Kehormatan & Pelatih Paskibra menetapkan bahwa Anda:\n\nDINYATAKAN LOLOS SELEKSI AKHIR & RESMI DIKUKUHKAN SEBAGAI CALON ANGGOTA PASKIBRA SMAN 1 ANGKATAN 2026.\n\nSelamat atas ketekunan fisik dan mental baja yang telah Anda buktikan di lapangan atletik. Langkah perdana latihan gabungan pra-diklat di koridor sekolah akan dimulai pada pertengahan bulan Juni mendatang.\n\nHarap simpan surat keputusan ini sebagai admisi sah siswa aktif Paskibra.\n\n"Disiplin Tinggi, Jiwa Patriot, Setia Pada Bendera!"`;
  } else if (status === 'Tidak Lolos') {
    emailSubject = `✉ PEMBERITAHUAN HASIL EVALUASI ADMISI PASKIBRA SMAN 1`;
    emailBody = `Yth. ${targetCand.fullName},\n\nTerimakasih telah menyelesaikan pengajuan berkas dan mendaftarkan diri Anda pada program ekstrakurikuler kepemimpinan Paskibra SMAN 1.\n\nTim pelaksana rekrutmen telah melakukan peninjauan terhadap keseluruhan aspek berkas administrasi dan data postur fisik yang terdaftar.\n\nDengan ini kami menyampaikan permohonan maaf, pendaftaran Anda atas nama ${targetCand.fullName} dinyatakan BELUM DAPAT LOLOS PERSYARATAN tahun ini disebabkan keterbatasan kuota barisan seragam dan persyaratan tinggi badan utama.\n\nPembina sangat mengapresiasi minat tinggi dan keberanian Anda untuk mendaftar. Jangan berkecil hati, tetap kembangkan karakter kedisiplinan dan kepemimpinan di program penempaan ekstrakurikuler SMAN 1 lainnya.\n\nSalam Juang, Tetap Semangat!`;
  }
  
  if (emailSubject) {
    const nextEmail = {
      id: `email-${Date.now()}`,
      recipientName: targetCand.fullName,
      recipientEmail: targetCand.email,
      subject: emailSubject,
      body: emailBody,
      sentAt: new Date().toISOString(),
      type: status === 'Terverifikasi' ? 'DocumentApproved' : 'ScheduleUpdate'
    };
    dbData.notifications = [nextEmail, ...dbData.notifications];
  }
  
  saveDb(dbData);
  res.json({
    candidates: dbData.candidates,
    notifications: dbData.notifications
  });
});

// 4. Update Candidate Scores
app.put('/api/candidates/:id/scores', (req, res) => {
  const { id } = req.params;
  const { scores } = req.body;
  const dbData = loadDb();
  
  const idx = dbData.candidates.findIndex((c: any) => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Candidate not found' });
  }
  
  dbData.candidates[idx].scores = scores;
  saveDb(dbData);
  
  res.json({
    candidates: dbData.candidates
  });
});

// 5. Update Configurations
app.put('/api/config', (req, res) => {
  const { isRegistrationOpen, announcementText } = req.body;
  const dbData = loadDb();
  
  if (isRegistrationOpen !== undefined) {
    dbData.isRegistrationOpen = isRegistrationOpen;
  }
  if (announcementText !== undefined) {
    dbData.announcementText = announcementText;
  }
  
  saveDb(dbData);
  res.json(dbData);
});

// 6. Reset Database
app.post('/api/reset', (req, res) => {
  const defaultDb = {
    candidates: INITIAL_CANDIDATES,
    notifications: INITIAL_NOTIFICATIONS,
    isRegistrationOpen: true,
    announcementText: "Pengumuman: Gelombang pengisian formulir seleksi administrasi gelombang pertama dibuka s.d 30 Juni 2026. Persiapkan berkas kesehatan Anda!"
  };
  saveDb(defaultDb);
  res.json(defaultDb);
});

// 7. Secure Admin Credentials Verification
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const expectedEmail = process.env.ADMIN_EMAIL || 'pembina@sman1.sch.id';
  const expectedPassword = process.env.ADMIN_PASSWORD || 'pembina2026';

  if (email === expectedEmail && password === expectedPassword) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Email atau kata sandi penguji salah!' });
  }
});


// Express + Vite Asset Serving & Fallback routing
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA Fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
