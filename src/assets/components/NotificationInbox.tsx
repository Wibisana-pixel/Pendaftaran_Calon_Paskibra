/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EmailNotification } from '../types';
import { Mail, MailOpen, Calendar, Clock, User, CheckCircle2, ShieldCheck, ChevronRight, Inbox, RefreshCcw } from 'lucide-react';

interface NotificationInboxProps {
  notifications: EmailNotification[];
  onClearInbox?: () => void;
}

export default function NotificationInbox({ notifications, onClearInbox }: NotificationInboxProps) {
  const [selectedMailId, setSelectedMailId] = useState<string | null>(null);

  const activeMail = notifications.find(m => m.id === selectedMailId) || notifications[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Email Inbox Sidebar: Left 5 columns */}
      <div className="lg:col-span-5 bg-[#181818] border border-[#303030] h-[550px] flex flex-col rounded-none">
        <div className="p-4 border-b border-[#303030] bg-[#303030]/10 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Inbox className="h-4 w-4 text-[#da291c]" />
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white">
              SURAT KOTAK MASUK (EMAIL LOGS)
            </h3>
          </div>
          <span className="bg-[#da291c] text-white font-mono text-[9px] px-2 py-0.5 tracking-wider uppercase font-bold">
            {notifications.length} DISPATCHED
          </span>
        </div>

        {/* Mail Queue List scrolling */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#303030]">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-mono space-y-2">
              <Mail className="h-8 w-8 mx-auto text-gray-700" />
              <p className="text-xs uppercase font-bold text-white">BELUM ADA EMAIL TERKIRIM</p>
              <p className="text-[10px] text-gray-600">
                Isi form pendaftaran & unggah berkas untuk memicu pengiriman email notifikasi pertama.
              </p>
            </div>
          ) : (
            notifications.map(mail => (
              <div
                key={mail.id}
                onClick={() => setSelectedMailId(mail.id)}
                className={`p-4 cursor-pointer text-xs font-mono transition-all duration-200 border-l-[2px] ${
                  (selectedMailId === mail.id || (!selectedMailId && activeMail?.id === mail.id))
                    ? 'bg-[#303030]/50 border-l-[#da291c]' 
                    : 'border-l-transparent hover:bg-[#303030]/20'
                }`}
              >
                <div className="flex justify-between text-gray-500 mb-1">
                  <span className="text-white font-semibold truncate max-w-[200px]">{mail.recipientName}</span>
                  <span className="text-[10px] text-gray-600">
                    {new Date(mail.sentAt).toLocaleTimeString('id-US', {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <p className="text-gray-300 font-medium truncate mb-1">{mail.subject}</p>
                <p className="text-gray-500 text-[11px] truncate">{mail.recipientEmail}</p>
              </div>
            ))
          )}
        </div>
        
        {onClearInbox && notifications.length > 2 && (
          <div className="p-3 bg-[#181818] border-t border-[#303030] text-right">
            <button
              onClick={onClearInbox}
              className="text-[10px] font-mono tracking-wider text-gray-500 hover:text-[#da291c] cursor-pointer"
            >
              [ RESET SIMULATOR EMAIL LOGS ]
            </button>
          </div>
        )}
      </div>

      {/* Email Body Viewer: Right 7 columns */}
      <div className="lg:col-span-7 bg-[#181818] border border-[#303030] min-h-[550px] p-6 rounded-none space-y-6 flex flex-col justify-between">
        {activeMail ? (
          <div className="space-y-6 flex-1">
            
            {/* Header Email Protocol */}
            <div className="border-b border-[#303030] pb-4 space-y-2 font-mono text-xs text-gray-400">
              <div className="flex justify-between">
                <span>DARI:</span>
                <span className="text-white font-medium">REKRUTMEN KORPS PASKIBRA SMA &lt;rekrutmen.paskibra@sch.id&gt;</span>
              </div>
              <div className="flex justify-between">
                <span>KEPADA:</span>
                <span className="text-white font-medium">{activeMail.recipientName} &lt;{activeMail.recipientEmail}&gt;</span>
              </div>
              <div className="flex justify-between">
                <span>SUBJEK:</span>
                <span className="text-[#da291c] font-bold uppercase tracking-tight">{activeMail.subject}</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-600">
                <span>TANGGAL DISPATCH:</span>
                <span>{new Date(activeMail.sentAt).toLocaleString('id-ID', {
                  day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })} WIB</span>
              </div>
            </div>

            {/* Premium Editorial Letterhead Body */}
            <div className="bg-[#181818] border border-[#303030] p-6 space-y-6 leading-relaxed relative">
              
              {/* Watermark Logo Accent background */}
              <div className="absolute right-6 top-6 opacity-5 select-none pointer-events-none">
                <ShieldCheck size={120} className="text-white" />
              </div>

              {/* School Emblem Mock Title */}
              <div className="text-center pb-4 border-b border-[#303030]/60 space-y-1">
                <span className="text-[12px] font-bold font-mono uppercase tracking-widest text-[#da291c] block">
                  PANITIA REKRUTMEN SELEKSI ANGGOTA PASKIBRA SMAN
                </span>
                <span className="text-[10px] text-gray-500 font-mono block">
                  KORPS PENGAWAL BENDERA PUSAKA SEKOLAH MENENGAH ATAS. KODE SURAT: REG-OFF/2026/XI
                </span>
              </div>

              {/* Letter content */}
              <div className="text-xs text-gray-300 space-y-4 whitespace-pre-line font-sans">
                <p className="font-semibold text-white">Dengan Hormat,</p>
                
                {activeMail.body}

                <div className="pt-4 border-t border-[#303030] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 text-[11px] font-mono">
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase">KEPUTUSAN OTOMATIS OLEH</span>
                    <span className="text-white font-semibold flex items-center gap-1">
                      <ShieldCheck size={13} className="text-[#da291c]" /> SISTEM VERIFIKASI SELEKSI SMAN
                    </span>
                  </div>
                  <div className="text-right sm:text-left">
                    <span className="text-[10px] text-gray-500 block uppercase">DIKIRIM KE</span>
                    <span className="font-semibold text-white">{activeMail.recipientEmail}</span>
                  </div>
                </div>
              </div>

              {/* Simulated Signature Section */}
              <div className="flex justify-between items-center pt-4 border-t border-[#303030]/40 font-mono text-[11px]">
                <div className="text-gray-500">
                  <span className="block italic text-[#da291c]">Kop Resmi Sekolah Terverifikasi</span>
                  <span className="block mt-1">Sistem Rekrutmen Paskibra Berjenjang SMAN</span>
                </div>
                <div className="text-right text-gray-400">
                  <p>Hormat Kami,</p>
                  <p className="italic text-white underline mt-3 pb-1">Pembina Paskibra SMAN</p>
                  <p className="text-[10px] text-gray-500 font-semibold">[KOMPOL (Purn) YUDI S.Pd]</p>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-500 font-mono py-12">
            <MailOpen className="h-12 w-12 text-gray-700 mb-3" />
            <p className="uppercase text-xs font-bold text-white tracking-widest">TIADA DESKRIPSI SURAT TERSEDIA</p>
            <p className="text-[10px] text-gray-600 max-w-sm mt-1">
              Daftar email masuk kosong. Pendaftar baru yang melengkapi berkas akan langsung melahirkan email konfirmasi di dashboard ini.
            </p>
          </div>
        )}

        <div className="p-4 bg-[#303030]/10 border border-[#303030] text-xs text-gray-500 leading-relaxed font-mono">
          <span className="text-white font-semibold block mb-1">💡 MENGAPA METODE INI DIGUNAKAN DI PREVIEW?</span>
          Sistem virtual inbox ini mensimulasikan SMTP server nyata secara real-time. Saat Anda mengetuk 'Kirim Pendaftaran Final', surat bersubjek konfirmasi berhasil terunggah dan admisi langsung dikonstruksi secara instan tanpa memerlukan kredensial khusus, sehingga mudah didebug dan dipresentasikan.
        </div>
      </div>

    </div>
  );
}
