import React from 'react';
import { Language, PhysicalMetrics, SimulationParams } from '../types/pinn';
import { CheckCircle2, Clock, Flame, ShieldAlert, Waves } from 'lucide-react';

interface Props {
  metrics: PhysicalMetrics;
  params: SimulationParams;
  lang?: Language;
}

export const MetricsCards: React.FC<Props> = ({ metrics, params, lang = 'en' }) => {
  const isEn = lang === 'en';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
      {/* CARD 1: kw (Wall Decay Coefficient) */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-3.5 border border-slate-800 shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="font-medium">{isEn ? 'Wall Reaction kw' : 'Hệ số thành ống kw'}</span>
          <span className="p-1 rounded bg-rose-500/10 text-rose-400">
            <Waves className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="my-1.5">
          <div className="text-xl font-bold font-mono text-rose-400">
            {metrics.k_w.toFixed(4)}
            <span className="text-xs text-slate-400 font-sans ml-1 font-normal">m/h</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isEn ? 'Chlorine reaction with pipe wall deposits' : 'Phản ứng Clo với cặn bám thành ống'}
          </p>
        </div>
        <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-500 flex justify-between font-mono">
          <span>K_eff = {metrics.K_eff.toFixed(4)} h⁻¹</span>
          <span>S/V = {metrics.SV_ratio.toFixed(2)} m⁻¹</span>
        </div>
      </div>

      {/* CARD 2: kf (THM Formation Rate Coefficient) */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-3.5 border border-slate-800 shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="font-medium">{isEn ? 'THM Formation kf' : 'Hệ số tạo THM kf'}</span>
          <span className="p-1 rounded bg-blue-500/10 text-blue-400">
            <Flame className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="my-1.5">
          <div className="text-xl font-bold font-mono text-blue-400">
            {metrics.k_f.toFixed(5)}
            <span className="text-xs text-slate-400 font-sans ml-1 font-normal">L/(mg·h)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isEn ? 'Byproduct yield from Chlorine & TOC' : 'Tốc độ tạo THM từ Clo & TOC'}
          </p>
        </div>
        <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-500 flex justify-between font-mono">
          <span>TOC = {params.TOC} mg/L</span>
          <span>ΔTHM = +{(params.THM_end - params.THM_initial).toFixed(0)} µg/L</span>
        </div>
      </div>

      {/* CARD 3: Critical Chlorine Disinfection Time */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-3.5 border border-slate-800 shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="font-medium">{isEn ? 'Chlorine < 0.2 mg/L Limit' : 'Ngưỡng Clo < 0.2 mg/L'}</span>
          <span className="p-1 rounded bg-amber-500/10 text-amber-400">
            <Clock className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="my-1.5">
          <div className="text-xl font-bold font-mono text-amber-300">
            {metrics.t_clo_critical !== null ? (
              <>
                {metrics.t_clo_critical.toFixed(1)}
                <span className="text-xs text-slate-400 font-sans ml-1 font-normal">{isEn ? 'hours' : 'giờ'}</span>
              </>
            ) : (
              <span className="text-emerald-400 text-sm font-sans">{isEn ? 'Always Safe' : 'Luôn an toàn'}</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {metrics.t_clo_critical !== null
              ? (isEn
                  ? `Chlorine drops below 0.2 mg/L at t = ${metrics.t_clo_critical.toFixed(1)}h`
                  : `Clo rớt dưới 0.2 mg/L sau ${metrics.t_clo_critical.toFixed(1)}h`)
              : (isEn
                  ? 'Maintains safe residual protection throughout the network'
                  : 'Clo duy trì trên ngưỡng khử khuẩn toàn mạng lưới')}
          </p>
        </div>
        <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-500 flex justify-between font-mono">
          <span>{isEn ? 'Inlet:' : 'Đầu vào:'} {params.C0_Clo} mg/L</span>
          <span>{isEn ? 'End:' : 'Đầu ra:'} {params.C_end_Clo} mg/L</span>
        </div>
      </div>

      {/* CARD 4: Critical THM Limit Exceed Time */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-3.5 border border-slate-800 shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="font-medium">{isEn ? 'THM > 100 µg/L MAC Limit' : 'Vượt Ngưỡng MAC 100 µg/L'}</span>
          <span className="p-1 rounded bg-red-500/10 text-red-400">
            <ShieldAlert className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="my-1.5">
          <div className="text-xl font-bold font-mono">
            {metrics.t_thm_critical !== null ? (
              <span className="text-red-400">
                {metrics.t_thm_critical === 0
                  ? (isEn ? 'Exceeded from t=0' : 'Vượt từ t=0')
                  : `${metrics.t_thm_critical.toFixed(1)} ${isEn ? 'hours' : 'giờ'}`}
              </span>
            ) : (
              <span className="text-emerald-400 text-sm font-sans flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 inline" /> {isEn ? 'Compliant < 100' : 'Đạt chuẩn < 100'}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {metrics.t_thm_critical !== null
              ? (isEn
                  ? `Breaches safe MAC drinking limit at t = ${metrics.t_thm_critical.toFixed(1)}h`
                  : `Nguy cơ THM vượt chuẩn an toàn tại t = ${metrics.t_thm_critical.toFixed(1)}h`)
              : (isEn
                  ? 'THM concentration safely remains below limit across full 72h'
                  : 'Nồng độ THM duy trì trong giới hạn an toàn toàn bộ 72h')}
          </p>
        </div>
        <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-500 flex justify-between font-mono">
          <span>{isEn ? 'Initial:' : 'Ban đầu:'} {params.THM_initial} µg/L</span>
          <span>{isEn ? 'End:' : 'Điểm cuối:'} {params.THM_end} µg/L</span>
        </div>
      </div>
    </div>
  );
};
