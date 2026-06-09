/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SelectionSchedule, Candidate } from './types';

export const MINIMUM_HEIGHT_MALE = 170;
export const MINIMUM_HEIGHT_FEMALE = 160;

export const INITIAL_SCHEDULES: SelectionSchedule[] = [
  {
    id: "sch-1",
    title: "Tes Fisik Tahap I - Ketahanan Kardio",
    type: "Fisik",
    dateTime: "Sabtu, 13 Juni 2026 - 06:00 WIB",
    location: "Stadion Atletik Lapangan Sempur",
    description: "Evaluasi ketahanan jantung paru melalui Cooper Test (Lari 12 menit uninterrupted) dan pemeriksaan postur tegap.",
    benchmarks: [
      "Lari 12 Menit: Laki-laki min. 2.200 meter | Perempuan min. 1.800 meter",
      "Pemeriksaan Postur: Tulang belakang lurus (tidak skoliosis/lordosis)",
      "Pemeriksaan Fisik Kaki: Tidak ada struktur X atau O ekstrem"
    ],
    status: "Mendatang"
  },
  {
    id: "sch-2",
    title: "Tes Fisik Tahap II - Kekuatan & Kelincahan",
    type: "Fisik",
    dateTime: "Minggu, 14 Juni 2026 - 07:00 WIB",
    location: "Aula Sporthall & Area Gym",
    description: "Sesi uji kekuatan otot skelet (push-up dan sit-up) serta kelincahan arah tubuh (shuttle run) untuk kesiapan barisan.",
    benchmarks: [
      "Push-up (1 Menit): Laki-laki min. 35x | Perempuan min. 22x",
      "Sit-up (1 Menit): Laki-laki min. 40x | Perempuan min. 28x",
      "Shuttle Run (4x10m): Target kecepatan waktu di bawah 19.5 detik"
    ],
    status: "Mendatang"
  },
  {
    id: "sch-3",
    title: "Seleksi Dasar Peraturan Baris-Berbaris (PBB)",
    type: "PBB",
    dateTime: "Sabtu, 20 Juni 2026 - 08:00 WIB",
    location: "Plaza Serbaguna SMAN 1",
    description: "Penilaian presisi gerakan di tempat (hadap kanan/kiri, balik kanan, jalan di tempat) dan dasar barisan berjalan.",
    benchmarks: [
      "Akurasi Patah-Patah Gerakan Dasar PBB",
      "Kekuatan Suara & Kedisiplinan Intruksi",
      "Langkah Tegap Maju: Kekompakan dan sinkronisasi ayunan tangan"
    ],
    status: "Mendatang"
  },
  {
    id: "sch-4",
    title: "Sesi Wawancara Sikap & Kepribadian",
    type: "Wawancara",
    dateTime: "Minggu, 21 Juni 2026 - 09:00 WIB",
    location: "Ruang Rapat Utama Lantai 2",
    description: "Pengukuran komitmen, kedewasaan mental, motivasi dasar, dan kestabilan emosional siswa dalam menghadapi tekanan latihan.",
    benchmarks: [
      "Kerapian Atribut Pakaian & Rambut (Standar Paskibra)",
      "Visi & Motivasi Ikut Serta",
      "Retorika Penyampaian Gagasan & Kepemimpinan"
    ],
    status: "Mendatang"
  }
];

export const INITIAL_CANDIDATES: Candidate[] = [
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
