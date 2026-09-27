import React from 'react';
import { Language, SimulationParams } from '../types/pinn';
import { Sliders, RotateCcw, Droplets, ShieldAlert, Activity, Gauge } from 'lucide-react';

interface Props {
  params: SimulationParams;
  onChangeParams: (newParams: SimulationParams) => void;
  onReset: () => void;
  lang?: Language;
}

export const ParameterPanel: React.FC<Props> = ({ params, onChangeParams, onReset, lang = 'en' }) => {
  const isEn = lang === 'en';

  const handleChange = (key: keyof SimulationParams, value: number) => {
    onChangeParams({
      ...params,
      [key]: value,
      seasonId: 'Custom', // mark as custom if user edits parameters
    });
  };

  const svRatio = params.V > 0 ? (params.S / params.V).toFixed(4) : '0.0800';

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Sliders className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              {isEn ? 'Inlet & Outlet Boundary Parameters' : 'Tùy Chỉnh Thông Số Biên Đầu Vào & Đầu Ra'}
            </h2>
            <p className="text-xs text-slate-400">
              {isEn
                ? 'Tune Chlorine, THM, TOC concentrations and tank/pipe hydraulic dimensions'
                : 'Hiệu chỉnh nồng độ Clo, THM, TOC và thông số bể/ống dẫn nước'}
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          title={isEn ? 'Reset to current season default values' : 'Khôi phục thông số mặc định của mùa hiện tại'}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isEn ? 'Reset' : 'Đặt lại'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* GROUP 1: CHLORINE (CLO) */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-rose-900/30 flex flex-col gap-3.5">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm border-b border-slate-800/80 pb-2">
            <Droplets className="w-4 h-4" />
            <span>{isEn ? 'Disinfectant Chlorine (C_Cl)' : 'Nồng Độ Clo Khử Trùng (C_Cl)'}</span>
          </div>

          {/* C0 Clo */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="text-slate-300 font-medium">
                {isEn ? 'Inlet Chlorine C₀ (t = 0):' : 'Clo Ban Đầu C₀ (t = 0):'}
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.01"
                  min="0.05"
                  max="3.0"
                  value={params.C0_Clo}
                  onChange={(e) => handleChange('C0_Clo', Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                  className="w-16 px-2 py-0.5 text-right text-xs bg-slate-900 border border-slate-700 rounded text-rose-300 font-mono focus:border-rose-400 focus:outline-none"
                />
                <span className="text-slate-400 text-xs">mg/L</span>
              </div>
            </div>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.01"
              value={params.C0_Clo}
              onChange={(e) => handleChange('C0_Clo', parseFloat(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* C_end Clo */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="text-slate-300 font-medium">
                {isEn ? `Endpoint Chlorine C_end (t = ${params.t_max}h):` : `Clo Cuối Mạng Lưới C_end (t = ${params.t_max}h):`}
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.005"
                  min="0.001"
                  max={params.C0_Clo}
                  value={params.C_end_Clo}
                  onChange={(e) => handleChange('C_end_Clo', Math.max(0.001, parseFloat(e.target.value) || 0.001))}
                  className="w-16 px-2 py-0.5 text-right text-xs bg-slate-900 border border-slate-700 rounded text-rose-300 font-mono focus:border-rose-400 focus:outline-none"
                />
                <span className="text-slate-400 text-xs">mg/L</span>
              </div>
            </div>
            <input
              type="range"
              min="0.005"
              max={Math.min(0.5, params.C0_Clo * 0.8)}
              step="0.005"
              value={params.C_end_Clo}
              onChange={(e) => handleChange('C_end_Clo', parseFloat(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Safe Clo Threshold */}
          <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              {isEn ? 'Safe Min Threshold:' : 'Ngưỡng tối thiểu:'}
            </span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.05"
                min="0.05"
                max="1.0"
                value={params.cloSafeMin}
                onChange={(e) => handleChange('cloSafeMin', Math.max(0.05, parseFloat(e.target.value) || 0.05))}
                className="w-14 px-1.5 py-0.5 text-right text-xs bg-slate-900 border border-slate-700 rounded text-amber-300 font-mono"
              />
              <span className="text-slate-400 text-xs">mg/L</span>
            </div>
          </div>
        </div>

        {/* GROUP 2: THM (TRIHALOMETHANE) */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-blue-900/30 flex flex-col gap-3.5">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm border-b border-slate-800/80 pb-2">
            <Activity className="w-4 h-4" />
            <span>{isEn ? 'Disinfection Byproducts (C_THM)' : 'Phụ Phẩm Khử Trùng (C_THM)'}</span>
          </div>

          {/* THM Initial */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="text-slate-300 font-medium">
                {isEn ? 'Inlet THM₀ (t = 0):' : 'THM Ban Đầu THM₀ (t = 0):'}
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="250"
                  value={params.THM_initial}
                  onChange={(e) => handleChange('THM_initial', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-16 px-2 py-0.5 text-right text-xs bg-slate-900 border border-slate-700 rounded text-blue-300 font-mono focus:border-blue-400 focus:outline-none"
                />
                <span className="text-slate-400 text-xs">µg/L</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="1"
              value={params.THM_initial}
              onChange={(e) => handleChange('THM_initial', parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* THM End */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="text-slate-300 font-medium">
                {isEn ? `Endpoint THM_end (t = ${params.t_max}h):` : `THM Cuối Mạng Lưới THM_end (t = ${params.t_max}h):`}
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="1"
                  min={params.THM_initial}
                  max="350"
                  value={params.THM_end}
                  onChange={(e) => handleChange('THM_end', Math.max(params.THM_initial, parseFloat(e.target.value) || params.THM_initial))}
                  className="w-16 px-2 py-0.5 text-right text-xs bg-slate-900 border border-slate-700 rounded text-blue-300 font-mono focus:border-blue-400 focus:outline-none"
                />
                <span className="text-slate-400 text-xs">µg/L</span>
              </div>
            </div>
            <input
              type="range"
              min={Math.max(10, params.THM_initial)}
              max="300"
              step="1"
              value={params.THM_end}
              onChange={(e) => handleChange('THM_end', parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Safe MAC Threshold */}
          <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              {isEn ? 'Safe MAC Limit:' : 'Giới hạn tối đa MAC:'}
            </span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="5"
                min="50"
                max="150"
                value={params.thmSafeMax}
                onChange={(e) => handleChange('thmSafeMax', Math.max(10, parseFloat(e.target.value) || 10))}
                className="w-14 px-1.5 py-0.5 text-right text-xs bg-slate-900 border border-slate-700 rounded text-red-300 font-mono"
              />
              <span className="text-slate-400 text-xs">µg/L</span>
            </div>
          </div>
        </div>

        {/* GROUP 3: SYSTEM, WATER QUALITY & PIPE GEOMETRY */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-emerald-900/30 flex flex-col gap-3.5 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Gauge className="w-4 h-4" />
              <span>{isEn ? 'Water Quality & Hydraulics' : 'Chất Lượng Nước & Bể/Ống'}</span>
            </div>
            <span className="text-[11px] text-emerald-300/80 font-mono">
              S/V = {svRatio} m⁻¹
            </span>
          </div>

          {/* TOC and t_max */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-slate-300">
                <label title="Total Organic Carbon">TOC (mg/L):</label>
                <span className="font-mono text-emerald-300">{params.TOC}</span>
              </div>
              <input
                type="number"
                step="0.05"
                min="0.5"
                max="15.0"
                value={params.TOC}
                onChange={(e) => handleChange('TOC', Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-emerald-300 font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-slate-300">
                <label>{isEn ? 'Detention t (h):' : 'Thời gian t (h):'}</label>
                <span className="font-mono text-emerald-300">{params.t_max}h</span>
              </div>
              <input
                type="number"
                step="1"
                min="12"
                max="168"
                value={params.t_max}
                onChange={(e) => handleChange('t_max', Math.max(6, parseFloat(e.target.value) || 6))}
                className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-emerald-300 font-mono"
              />
            </div>
          </div>

          {/* S, V, and kb */}
          <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-800/60">
            <div>
              <label className="text-slate-400 text-[11px] block">{isEn ? 'Area S (m²):' : 'Diện tích S (m²):'}</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="50"
                value={params.S}
                onChange={(e) => handleChange('S', Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                className="w-full mt-1 px-1.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 text-[11px] block">{isEn ? 'Volume V (m³):' : 'Thể tích V (m³):'}</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="500"
                value={params.V}
                onChange={(e) => handleChange('V', Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                className="w-full mt-1 px-1.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 text-[11px] block" title="Bulk decay rate">kb (h⁻¹):</label>
              <input
                type="number"
                step="0.005"
                min="0.001"
                max="0.5"
                value={params.k_b}
                onChange={(e) => handleChange('k_b', Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full mt-1 px-1.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
