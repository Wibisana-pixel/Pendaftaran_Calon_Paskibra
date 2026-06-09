/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Candidate {
  id: string;
  fullName: string;
  nisn: string;
  email: string;
  phone: string;
  className: string;
  height: number; // in cm
  weight: number; // in kg
  gender: 'L' | 'P';
  documents: {
    registrationForm: FileInfo | null;
    parentConsent: FileInfo | null;
    healthCertificate: FileInfo | null;
  };
  status: 'Draft' | 'Ditinjau' | 'Terverifikasi' | 'Lolos Seleksi' | 'Tidak Lolos';
  submittedAt: string;
  scores?: {
    pbb: number;
    physicalFit: number;
    interview: number;
    notes: string;
  };
}

export interface FileInfo {
  name: string;
  size: string;
  uploadedAt: string;
}

export interface SelectionSchedule {
  id: string;
  title: string;
  type: 'Fisik' | 'Administrasi' | 'PBB' | 'Wawancara';
  dateTime: string;
  location: string;
  description: string;
  benchmarks: string[];
  status: 'Telah Selesai' | 'Sedang Berjalan' | 'Mendatang';
}

export interface EmailNotification {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  sentAt: string;
  type: 'RegistrationSuccess' | 'DocumentApproved' | 'ScheduleUpdate';
}
