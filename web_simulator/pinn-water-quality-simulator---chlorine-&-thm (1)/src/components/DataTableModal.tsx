import React, { useState } from 'react';
import { DataPoint, Language, PhysicalMetrics, SimulationParams } from '../types/pinn';
import { Download, Copy, Check, Table, X } from 'lucide-react';

interface Props {
  data: DataPoint[];
  params: SimulationParams;
  metrics: PhysicalMetrics;
  seasonName: string;
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const DataTableModal: React.FC<Props> = ({
  data,
  params,
  metrics,
  seasonName,
  isOpen,
  onClose,
  lang = 'en',
}) => {
  const isEn = lang === 'en';
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Filter 13 milestone checkpoints (e.g. every 6 hours)
  const milestoneData = data.filter((_, idx) => idx % Math.max(1, Math.floor(data.length / 12)) === 0 || idx === data.length - 1);

  // Generate CSV text
  const generateCSV = () => {
    const headers = isEn
      ? ['Time t (hours)', 'Chlorine (mg/L)', 'Chlorine Status', 'THM (ug/L)', 'THM Status', 'dClo/dt', 'dTHM/dt']
      : ['Thời gian t (giờ)', 'Nồng độ Clo (mg/L)', 'Trạng thái Clo', 'Nồng độ THM (µg/L)', 'Trạng thái THM', 'Tốc độ dClo/dt', 'Tốc độ dTHM/dt'];

    const rows = data.map((d) => [
      d.t,
      d.clo,
      d.cloStatus === 'safe' ? (isEn ? 'Safe (>=0.2)' : 'An toan') : (isEn ? 'Low (<0.2)' : 'Thieu clo (<0.2)'),
      d.thm,
      d.thmStatus === 'safe' ? (isEn ? 'Safe MAC (<=100)' : 'Dat chuan (<100)') : (isEn ? 'Exceeded MAC (>100)' : 'Vuot nguong MAC'),
      d.dClo_dt,
      d.dThm_dt,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PINN_Chlorine_THM_${params.seasonId}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copySummary = () => {
    const summary = isEn
      ? `=== PINN SIMULATION REPORT: CHLORINE & THM ===
Scenario: ${seasonName}
Retention Time: ${params.t_min}h -> ${params.t_max}h
Inlet Chlorine C0: ${params.C0_Clo} mg/L | Outlet: ${params.C_end_Clo} mg/L
Inlet THM0: ${params.THM_initial} µg/L | Outlet: ${params.THM_end} µg/L
TOC: ${params.TOC} mg/L | S/V Ratio: ${metrics.SV_ratio.toFixed(2)} m⁻¹
Wall decay coefficient kw: ${metrics.k_w.toFixed(4)} m/h
THM formation coefficient kf: ${metrics.k_f.toFixed(5)} L/(mg·h)
Chlorine < 0.2 mg/L time: ${metrics.t_clo_critical !== null ? `${metrics.t_clo_critical.toFixed(1)} hours` : 'Always Compliant'}
THM > 100 µg/L time: ${metrics.t_thm_critical !== null ? `${metrics.t_thm_critical.toFixed(1)} hours` : 'Always Safe'}
Assessment: ${metrics.overallStatusTextEn}`
      : `=== BÁO CÁO MÔ PHỎNG PINN CLO & THM ===
Mùa: ${seasonName}
Thời gian lưu trữ: ${params.t_min}h -> ${params.t_max}h
Nồng độ Clo đầu vào: ${params.C0_Clo} mg/L | Đầu ra: ${params.C_end_Clo} mg/L
Nồng độ THM ban đầu: ${params.THM_initial} µg/L | Điểm cuối: ${params.THM_end} µg/L
TOC: ${params.TOC} mg/L | S/V: ${metrics.SV_ratio.toFixed(2)} m⁻¹
Hệ số phân rã thành ống kw: ${metrics.k_w.toFixed(4)} m/h
Hệ số hình thành THM kf: ${metrics.k_f.toFixed(5)} L/(mg·h)
Thời điểm Clo < 0.2 mg/L: ${metrics.t_clo_critical !== null ? `${metrics.t_clo_critical.toFixed(1)} giờ` : 'Luôn đạt chuẩn'}
Thời điểm THM > 100 µg/L: ${metrics.t_thm_critical !== null ? `${metrics.t_thm_critical.toFixed(1)} giờ` : 'Luôn an toàn'}
Đánh giá: ${metrics.overallStatusText}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Table className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEn ? 'Detailed Time-Series Simulation Data' : 'Bảng Số Liệu Chi Tiết Theo Thời Gian'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEn
                  ? `${data.length} simulation points from t = ${params.t_min}h to ${params.t_max}h`
                  : `${data.length} điểm dữ liệu mô phỏng từ t = ${params.t_min}h đến ${params.t_max}h`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isEn ? 'Copied' : 'Đã chép') : (isEn ? 'Copy Summary' : 'Chép tóm tắt')}</span>
            </button>

            <button
              onClick={generateCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isEn ? 'Export CSV' : 'Tải file CSV'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="text-[11px] uppercase bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">{isEn ? 'Time t (h)' : 'Thời gian t (h)'}</th>
                <th className="py-2.5 px-3">{isEn ? 'Chlorine C_Cl (mg/L)' : 'Clo C_Cl (mg/L)'}</th>
                <th className="py-2.5 px-3">{isEn ? 'Chlorine Status' : 'Trạng thái Clo'}</th>
                <th className="py-2.5 px-3">{isEn ? 'THM C_THM (µg/L)' : 'THM C_THM (µg/L)'}</th>
                <th className="py-2.5 px-3">{isEn ? 'THM Status' : 'Trạng thái THM'}</th>
                <th className="py-2.5 px-3">{isEn ? 'Rate dClo/dt' : 'Tốc độ dClo/dt'}</th>
                <th className="py-2.5 px-3">{isEn ? 'Rate dTHM/dt' : 'Tốc độ dTHM/dt'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {milestoneData.map((pt) => (
                <tr key={`table-pt-${pt.t}`} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-3 font-bold text-white">{pt.t}h</td>
                  <td className="py-2 px-3 text-rose-300 font-semibold">{pt.clo}</td>
                  <td className="py-2 px-3 font-sans">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        pt.cloStatus === 'safe'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {pt.cloStatus === 'safe'
                        ? (isEn ? '≥ 0.2 Compliant' : '≥ 0.2 Đạt chuẩn')
                        : (isEn ? '< 0.2 Deficient' : '< 0.2 Thiếu clo')}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-blue-300 font-semibold">{pt.thm}</td>
                  <td className="py-2 px-3 font-sans">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        pt.thmStatus === 'safe'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}
                    >
                      {pt.thmStatus === 'safe'
                        ? (isEn ? '≤ 100 Safe' : '≤ 100 An toàn')
                        : (isEn ? '> 100 Exceeds MAC' : '> 100 Vượt MAC')}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-400">{pt.dClo_dt}</td>
                  <td className="py-2 px-3 text-slate-400">{pt.dThm_dt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
