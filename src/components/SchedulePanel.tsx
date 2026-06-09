/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SelectionSchedule } from '../types';
import { Calendar, MapPin, Award, CheckCircle, Scale, Eye, Dumbbell, Square } from 'lucide-react';
import { MINIMUM_HEIGHT_MALE, MINIMUM_HEIGHT_FEMALE } from '../data';

interface SchedulePanelProps {
  schedules: SelectionSchedule[];
}

export default function SchedulePanel({ schedules }: SchedulePanelProps) {
  // Calculator state
  const [calcGender, setCalcGender] = useState<'L' | 'P'>('L');
  const [calcHeight, setCalcHeight] = useState<string>('');
  const [calcWeight, setCalcWeight] = useState<string>('');
  const [calcResult, setCalcResult] = useState<{
    bmi: number;
    category: string;
    heightOk: boolean;
    bmiOk: boolean;
    overallOk: boolean;
    suggestion: string;
  } | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const hCm = Number(calcHeight);
    const wKg = Number(calcWeight);

    if (!hCm || !wKg || hCm <= 0 || wKg <= 0) return;

    const hM = hCm / 100;
    const bmi = Number((wKg / (hM * hM)).toFixed(1));
    
    // Height qualification check
    const heightOk = calcGender === 'L' ? hCm >= MINIMUM_HEIGHT_MALE : hCm >= MINIMUM_HEIGHT_FEMALE;
    
    // BMI qualification check (ideal standard is 18.5 - 24.9)
    const bmiOk = bmi >= 18.5 && bmi <= 24.9;

    let category = '';
    let suggestion = '';
    if (bmi < 18.5) {
      category = 'Kurang Ideal (Underweight)';
      suggestion = 'Tingkatkan asupan kalori dan latihan kekuatan (push-up/pull-up) untuk meningkatkan massa otot agar postur tampak mantap.';
    } else if (bmiOk) {
      category = 'Sangat Proporsional / Ideal';
      suggestion = 'Pertahankan komposisi tubuh ini. Fokus pada ketahanan paru (kardio) untuk menjamin stamina saat baris-berbaris lama.';
    } else if (bmi < 29.9) {
      category = 'Kelebihan Berat Badan (Overweight)';
      suggestion = 'Fokus pada defisit kalori sehat dan latihan ketahanan kardio (jogging pelan) untuk mencapai kelincahan formasi barisan.';
    } else {
      category = 'Obesitas';
      suggestion = 'Disarankan untuk berkonsultasi kesehatan. Prioritaskan latihan kardio intensitas sedang untuk mengurangi beban kerja lutut.';
    }

    const overallOk = heightOk && bmiOk;

    setCalcResult({
      bmi,
      category,
      heightOk,
      bmiOk,
      overallOk,
      suggestion,
    });
  };

  const handleReset = () => {
    setCalcHeight('');
    setCalcWeight('');
    setCalcResult(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Selection Schedule Timeline: Left 7 columns */}
      <div className="lg:col-span-7 space-y-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#da291c] font-semibold block mb-1">
            KALENDER KEGIATAN
          </span>
          <h2 className="text-xl md:text-2xl font-medium tracking-tight text-white uppercase">
            Jadwal Tahapan Seleksi Fisik
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Persiapkan fisik Anda sesuai dengan tanggal dan kriteria penilaian di bawah ini. Harap datang 30 menit sebelum jadwal dengan kaos olahraga sekolah.
          </p>
        </div>

        <div className="space-y-6">
          {schedules.map((sch, i) => (
            <div 
              key={sch.id}
              className="bg-[#181818] border border-[#303030] p-5 relative rounded-none transition-all duration-300 hover:border-gray-700"
            >
              {/* Vertical line badge marker */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#da291c]"></div>
              
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#303030] text-[#ffffff] font-mono text-[9px] uppercase tracking-wider px-2 py-0.5">
                      {sch.type}
                    </span>
                    <span className="text-[11px] text-gray-500 font-mono">
                      Tahap {i + 1}
                    </span>
                  </div>
                  
                  <h3 className="text-base text-white tracking-tight uppercase font-medium">
                    {sch.title}
                  </h3>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    {sch.description}
                  </p>
                </div>

                {/* Date-Time / Place Block */}
                <div className="pt-2 md:pt-0 border-t md:border-t-0 border-[#303030] flex flex-col space-y-1.5 md:items-end min-w-[200px]">
                  <div className="flex items-center text-xs text-white space-x-2">
                    <Calendar size={14} className="text-[#da291c] flex-shrink-0" />
                    <span className="font-mono text-[11px]">{sch.dateTime}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400 space-x-2">
                    <MapPin size={14} className="text-gray-600 flex-shrink-0" />
                    <span>{sch.location}</span>
                  </div>
                </div>
              </div>

              {/* Benchmarks / Target Kelulusan */}
              <div className="mt-4 pt-4 border-t border-[#303030] space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#da291c] block">
                  STANDAR KELULUSAN GURU & PELATIH:
                </span>
                <ul className="text-xs text-gray-300 space-y-1.5 grid grid-cols-1 md:grid-cols-2 gap-x-4">
                  {sch.benchmarks.map((b, idx) => (
                    <li key={idx} className="flex items-start space-x-2 leading-relaxed">
                      <span className="text-[#da291c] mt-1 font-semibold select-none">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fitness Eligibility Panel: Right 5 columns */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-[#181818] border border-[#303030] p-6 rounded-none">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#da291c] font-semibold block mb-1">
            KALKULATOR MANDIRI
          </span>
          <h2 className="text-lg font-medium text-white uppercase tracking-tight">
            Cek Kelayakan Fisik Paskibra
          </h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Kalkulator khusus siswa untuk mengukur kepatuhan tinggi badan dan Indeks Massa Tubuh (IMT / BMI) ideal pasukan pengibar bendera.
          </p>

          {!calcResult ? (
            <form onSubmit={handleCalculate} className="mt-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gray-400 font-medium block">
                  Pilih Jenis Kelamin Anda
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCalcGender('L')}
                    className={`py-2 text-center text-xs rounded-none border font-mono transition-all duration-200 ${
                      calcGender === 'L'
                        ? 'border-[#da291c] bg-[#da291c]/10 text-white'
                        : 'border-[#303030] bg-[#181818] text-gray-400'
                    }`}
                  >
                    PUTRA (LAKI-LAKI)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcGender('P')}
                    className={`py-2 text-center text-xs rounded-none border font-mono transition-all duration-200 ${
                      calcGender === 'P'
                        ? 'border-[#da291c] bg-[#da291c]/10 text-white'
                        : 'border-[#303030] bg-[#181818] text-gray-400'
                    }`}
                  >
                    PUTRI (PEREMPUAN)
                  </button>
                </div>
              </div>

              {/* Height Input */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gray-400 font-medium block">
                  Tinggi Badan saat ini (cm)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 172"
                    className="w-full bg-[#181818] border border-[#303030] focus:border-[#da291c] text-white py-2.5 px-4 rounded-none text-sm outline-none font-mono"
                    value={calcHeight}
                    onChange={e => setCalcHeight(e.target.value)}
                  />
                  <span className="absolute right-4 top-2 text-xs text-gray-500 font-mono">CM</span>
                </div>
              </div>

              {/* Weight Input */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gray-400 font-medium block">
                  Berat Badan saat ini (kg)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 61"
                    className="w-full bg-[#181818] border border-[#303030] focus:border-[#da291c] text-white py-2.5 px-4 rounded-none text-sm outline-none font-mono"
                    value={calcWeight}
                    onChange={e => setCalcWeight(e.target.value)}
                  />
                  <span className="absolute right-4 top-2 text-xs text-gray-500 font-mono">KG</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#da291c] hover:bg-[#b01e0a] text-white text-xs font-bold py-3 uppercase tracking-[0.15em] rounded-none transition-all duration-200"
              >
                HITUNG SKOR KELAYAKAN
              </button>
            </form>
          ) : (
            <div className="mt-6 space-y-5">
              
              {/* BMI score indicator */}
              <div className="bg-[#181818] border border-[#303030] p-4 text-center">
                <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500">
                  INDEKS MASSA TUBUH (BMI)
                </span>
                <p className="text-4xl font-mono font-bold text-white mt-1">
                  {calcResult.bmi}
                </p>
                <span className={`text-xs inline-block px-2.5 py-0.5 mt-2 uppercase font-mono ${
                  calcResult.bmiOk ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                }`}>
                  {calcResult.category}
                </span>
              </div>

              <div className="space-y-3">
                {/* Metric list */}
                <div className="flex justify-between items-center text-xs py-2 border-b border-[#303030]">
                  <span className="text-gray-400">Standar Tinggi Minimal ({calcGender === 'L' ? 'Putra' : 'Putri'})</span>
                  <span className="text-white font-mono font-semibold">
                    {calcGender === 'L' ? MINIMUM_HEIGHT_MALE : MINIMUM_HEIGHT_FEMALE} cm
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs py-2 border-b border-[#303030]">
                  <span className="text-gray-400">Tinggi Badan Anda</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-mono font-semibold">{calcHeight} cm</span>
                    <span className={`px-2 py-0.5 text-[10px] font-mono ${calcResult.heightOk ? 'bg-emerald-950/80 text-emerald-300' : 'bg-red-950/80 text-red-300'}`}>
                      {calcResult.heightOk ? 'Lolos' : 'Kurang'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs py-2 border-b border-[#303030]">
                  <span className="text-gray-400">Proporsionalitas Tubuh (BMI)</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-mono font-semibold">{calcResult.bmi}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-mono ${calcResult.bmiOk ? 'bg-emerald-950/80 text-emerald-300' : 'bg-amber-950/80 text-amber-300'}`}>
                      {calcResult.bmiOk ? 'Ideal' : 'Evaluasi'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status conclusion message box */}
              <div className={`p-4 text-xs ${calcResult.overallOk ? 'bg-emerald-950/20 border border-emerald-900/40 text-emerald-300' : 'bg-amber-950/20 border border-amber-900/40 text-amber-300'}`}>
                <h4 className="font-bold uppercase tracking-wider mb-1">
                  {calcResult.overallOk ? 'Sangat Layak (Memenuhi Kriteria)' : 'Rekomendasi Pembenahan Fisik'}
                </h4>
                <p className="text-gray-400 mt-1">
                  {calcResult.suggestion}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full bg-[#303030] hover:bg-gray-800 text-white text-xs font-bold py-3 uppercase tracking-wider rounded-none transition-all duration-200"
                >
                  HITUNG ULANG
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#181818] border border-[#303030] p-6 rounded-none space-y-4">
          <h3 className="text-xs uppercase tracking-[0.2em] text-[#da291c] font-bold">
            KENAPA BERAT BADAN & PERSYARATAN TINGGI BADAN DIPATUHI?
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Pembawa baki bendera pusaka nasional dan penjaga barisan kehormatan memerlukan sinkronisasi tinggi badan yang hampir seragam untuk menjaga keseimbangan ayunan barisan dada tegap. BMI proporsional menjamin latihan ketahanan baris berbaris (PBB) di bawah matahari terik tidak membebani pergelangan kaki dan tulang belakang secara kronis.
          </p>
        </div>
      </div>
    
    </div>
  );
}
