import React, { useState, useMemo, useCallback } from 'react';
import { DataPoint, Language, PhysicalMetrics, SimulationParams } from '../types/pinn';
import { Pin } from 'lucide-react';

interface Props {
  params: SimulationParams;
  metrics: PhysicalMetrics;
  data: DataPoint[];
  seasonName: string;
  lang?: Language;
}

export const InteractivePlot: React.FC<Props> = ({ params, metrics, data, seasonName, lang = 'en' }) => {
  const isEn = lang === 'en';
  const [hoveredTime, setHoveredTime] = useState<number | null>(36.0); // default focus on 36h
  const [pinnedTime, setPinnedTime] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'combined'>('split');

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 360;
  const padding = { top: 45, right: 35, bottom: 50, left: 65 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Domain extents
  const tMin = params.t_min;
  const tMax = params.t_max;

  // Clo Y-axis range
  const cloMax = Math.max(params.C0_Clo * 1.15, params.cloSafeMin * 1.5, 0.8);
  const cloMin = 0;

  // THM Y-axis range
  const thmMax = Math.max(params.THM_end * 1.15, params.thmSafeMax * 1.25, 120);
  const thmMin = 0;

  // Scale helpers
  const scaleX = useCallback((t: number) => {
    return padding.left + ((t - tMin) / (tMax - tMin)) * plotWidth;
  }, [tMin, tMax, plotWidth, padding.left]);

  const scaleYClo = useCallback((clo: number) => {
    return padding.top + plotHeight - ((clo - cloMin) / (cloMax - cloMin)) * plotHeight;
  }, [cloMin, cloMax, plotHeight, padding.top]);

  const scaleYThm = useCallback((thm: number) => {
    return padding.top + plotHeight - ((thm - thmMin) / (thmMax - thmMin)) * plotHeight;
  }, [thmMin, thmMax, plotHeight, padding.top]);

  // Inverse scale for mouse tracking
  const invertX = useCallback((pixelX: number) => {
    const clampedX = Math.max(padding.left, Math.min(padding.left + plotWidth, pixelX));
    const ratio = (clampedX - padding.left) / plotWidth;
    return tMin + ratio * (tMax - tMin);
  }, [tMin, tMax, plotWidth, padding.left]);

  // Handle mouse move on SVG
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (pinnedTime !== null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pixelX = ((e.clientX - rect.left) / rect.width) * svgWidth;
    const t = invertX(pixelX);
    setHoveredTime(Number(t.toFixed(2)));
  };

  const handleMouseLeave = () => {
    if (pinnedTime === null) {
      setHoveredTime(null);
    }
  };

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pixelX = ((e.clientX - rect.left) / rect.width) * svgWidth;
    const t = invertX(pixelX);
    if (pinnedTime !== null) {
      setPinnedTime(null);
    } else {
      setPinnedTime(Number(t.toFixed(2)));
    }
  };

  // Find data point nearest to hovered or pinned time
  const activeTime = pinnedTime !== null ? pinnedTime : hoveredTime;
  const activeDataPoint = useMemo(() => {
    if (activeTime === null || data.length === 0) return null;
    let closest = data[0];
    let minDiff = Math.abs(data[0].t - activeTime);
    for (let i = 1; i < data.length; i++) {
      const diff = Math.abs(data[i].t - activeTime);
      if (diff < minDiff) {
        minDiff = diff;
        closest = data[i];
      }
    }
    return closest;
  }, [activeTime, data]);

  // SVG Path generator for Clo line
  const cloPath = useMemo(() => {
    if (data.length === 0) return '';
    return data.reduce((acc, pt, idx) => {
      const x = scaleX(pt.t);
      const y = scaleYClo(pt.clo);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [data, scaleX, scaleYClo]);

  // SVG Path generator for THM line
  const thmPath = useMemo(() => {
    if (data.length === 0) return '';
    return data.reduce((acc, pt, idx) => {
      const x = scaleX(pt.t);
      const y = scaleYThm(pt.thm);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [data, scaleX, scaleYThm]);

  // Grid Ticks
  const xTicks = useMemo(() => {
    const ticks = [];
    const count = 6;
    for (let i = 0; i <= count; i++) {
      const t = tMin + (i / count) * (tMax - tMin);
      ticks.push(Number(t.toFixed(0)));
    }
    return ticks;
  }, [tMin, tMax]);

  const cloTicks = useMemo(() => {
    const ticks = [];
    const count = 5;
    for (let i = 0; i <= count; i++) {
      const v = cloMin + (i / count) * (cloMax - cloMin);
      ticks.push(Number(v.toFixed(2)));
    }
    return ticks;
  }, [cloMin, cloMax]);

  const thmTicks = useMemo(() => {
    const ticks = [];
    const count = 5;
    for (let i = 0; i <= count; i++) {
      const v = thmMin + (i / count) * (thmMax - thmMin);
      ticks.push(Number(v.toFixed(0)));
    }
    return ticks;
  }, [thmMin, thmMax]);

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-2xl flex flex-col gap-4">
      {/* Top Header & Interactive Tools */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{isEn ? 'PINN Predictive Curves & Hover Coordinates' : 'Đồ Thị Dự Báo PINN & Tọa Độ Tương Tác'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-normal">
                Live Crosshair (x, y)
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isEn
              ? 'Move your mouse anywhere across the curve to instantly inspect retention time t (x) and concentration (y).'
              : 'Di chuyển con chuột lên bất kỳ vị trí nào trên đường cong để hiển thị ngay lập tức tọa độ thời gian t (x) và nồng độ (y).'}
          </p>
        </div>

        {/* View toggles */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'split' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isEn ? 'Side-by-Side (2 Plots)' : '2 Biểu đồ song song'}
            </button>
            <button
              onClick={() => setViewMode('combined')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'combined' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isEn ? 'Dual-Axis Overlay' : 'Gộp trục kép'}
            </button>
          </div>

          {pinnedTime !== null && (
            <button
              onClick={() => setPinnedTime(null)}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs hover:bg-amber-500/30 transition-colors cursor-pointer"
            >
              <Pin className="w-3.5 h-3.5" />
              <span>{isEn ? `Unpin (${pinnedTime}h)` : `Bỏ ghim (${pinnedTime}h)`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating HUD readout showing exact (x, y) coordinates */}
      {activeDataPoint ? (
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-xl p-3.5 border border-cyan-500/30 shadow-lg flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-sm font-bold flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-normal">{isEn ? 'X Axis:' : 'Trục X:'}</span>
              <span>t = {activeDataPoint.t} {isEn ? 'hours' : 'giờ'}</span>
            </div>
            {pinnedTime !== null && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                <Pin className="w-3 h-3" /> {isEn ? 'Pinned Position' : 'Đã ghim tọa độ'}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Clo readout */}
            <div className="flex items-center gap-1.5 bg-rose-950/40 px-3 py-1 rounded-lg border border-rose-500/30">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="text-slate-300 font-medium">{isEn ? 'Chlorine (Y₁):' : 'Clo (Y₁):'}</span>
              <strong className="text-rose-300 font-mono text-sm">
                {activeDataPoint.clo} mg/L
              </strong>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ml-1 ${
                activeDataPoint.cloStatus === 'safe'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}>
                {activeDataPoint.cloStatus === 'safe'
                  ? (isEn ? '≥ 0.2 Safe' : '≥ 0.2 Đạt')
                  : (isEn ? '< 0.2 Low Disinfectant' : '< 0.2 Thiếu clo')}
              </span>
            </div>

            {/* THM readout */}
            <div className="flex items-center gap-1.5 bg-blue-950/40 px-3 py-1 rounded-lg border border-blue-500/30">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              <span className="text-slate-300 font-medium">THM (Y₂):</span>
              <strong className="text-blue-300 font-mono text-sm">
                {activeDataPoint.thm} µg/L
              </strong>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ml-1 ${
                activeDataPoint.thmStatus === 'safe'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
              }`}>
                {activeDataPoint.thmStatus === 'safe'
                  ? (isEn ? '≤ 100 Safe MAC' : '≤ 100 An toàn')
                  : (isEn ? '> 100 Exceeds MAC' : '> 100 Vượt MAC')}
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-slate-400 text-[11px] font-mono">
              <span>dClo/dt: {activeDataPoint.dClo_dt}</span>
              <span>•</span>
              <span>dTHM/dt: {activeDataPoint.dThm_dt}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950/60 rounded-xl p-2.5 text-center text-xs text-slate-400 border border-slate-800/80">
          {isEn
            ? '👉 Hover your mouse over the plot plane below to inspect x and y values at any timestamp'
            : '👉 Rê chuột vào mặt phẳng đồ thị bên dưới để xem nồng độ x, y tại mọi thời điểm'}
        </div>
      )}

      {/* CHARTS CONTAINER */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* PLOT 1: CHLORINE DECAY */}
          <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 relative flex flex-col">
            <div className="flex items-center justify-between mb-1 px-2">
              <h3 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>{isEn ? `Chlorine Decay Prediction (kw = ${metrics.k_w.toFixed(4)} m/h)` : `Dự báo suy giảm Clo (kw = ${metrics.k_w.toFixed(4)} m/h)`}</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                C₀: {params.C0_Clo} → C_end: {params.C_end_Clo} mg/L
              </span>
            </div>

            <div className="relative w-full aspect-[600/360] select-none">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-full cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
              >
                <defs>
                  <pattern id="grid1" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
                  </pattern>
                  <linearGradient id="cloGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Plot Background Area */}
                <rect
                  x={padding.left}
                  y={padding.top}
                  width={plotWidth}
                  height={plotHeight}
                  fill="#030712"
                  stroke="#334155"
                  strokeWidth="1"
                />
                <rect
                  x={padding.left}
                  y={padding.top}
                  width={plotWidth}
                  height={plotHeight}
                  fill="url(#grid1)"
                />

                {/* Horizontal Safe Threshold Line (y = 0.2 mg/L) */}
                {params.cloSafeMin >= cloMin && params.cloSafeMin <= cloMax && (
                  <g>
                    <line
                      x1={padding.left}
                      y1={scaleYClo(params.cloSafeMin)}
                      x2={padding.left + plotWidth}
                      y2={scaleYClo(params.cloSafeMin)}
                      stroke="#f59e0b"
                      strokeWidth="1.8"
                      strokeDasharray="6 4"
                    />
                    <text
                      x={padding.left + plotWidth - 8}
                      y={scaleYClo(params.cloSafeMin) - 6}
                      fill="#f59e0b"
                      fontSize="10"
                      textAnchor="end"
                      fontWeight="600"
                    >
                      {isEn ? `Minimum safe residual (${params.cloSafeMin} mg/L)` : `Ngưỡng an toàn tối thiểu (${params.cloSafeMin} mg/L)`}
                    </text>
                  </g>
                )}

                {/* Shaded Area under Curve */}
                <path
                  d={`${cloPath} L ${scaleX(params.t_max)} ${scaleYClo(0)} L ${scaleX(params.t_min)} ${scaleYClo(0)} Z`}
                  fill="url(#cloGradient)"
                />

                {/* Main Clo Curve (Red solid) */}
                <path
                  d={cloPath}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Experimental Boundary Scatter Dots (0, C0) and (t_max, C_end) */}
                <circle
                  cx={scaleX(params.t_min)}
                  cy={scaleYClo(params.C0_Clo)}
                  r="5"
                  fill="#0f172a"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
                <text
                  x={scaleX(params.t_min) + 8}
                  y={scaleYClo(params.C0_Clo) + 4}
                  fill="#f8fafc"
                  fontSize="10"
                  fontWeight="600"
                >
                  t=0 ({params.C0_Clo})
                </text>

                <circle
                  cx={scaleX(params.t_max)}
                  cy={scaleYClo(params.C_end_Clo)}
                  r="5"
                  fill="#0f172a"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
                <text
                  x={scaleX(params.t_max) - 10}
                  y={scaleYClo(params.C_end_Clo) - 10}
                  fill="#f8fafc"
                  fontSize="10"
                  fontWeight="600"
                  textAnchor="end"
                >
                  t={params.t_max}h ({params.C_end_Clo})
                </text>

                {/* Y Axis Ticks and Labels */}
                {cloTicks.map((val) => (
                  <g key={`clo-tick-${val}`}>
                    <line
                      x1={padding.left - 4}
                      y1={scaleYClo(val)}
                      x2={padding.left}
                      y2={scaleYClo(val)}
                      stroke="#64748b"
                    />
                    <text
                      x={padding.left - 8}
                      y={scaleYClo(val) + 3.5}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {val}
                    </text>
                  </g>
                ))}

                {/* X Axis Ticks and Labels */}
                {xTicks.map((val) => (
                  <g key={`x-tick-clo-${val}`}>
                    <line
                      x1={scaleX(val)}
                      y1={padding.top + plotHeight}
                      x2={scaleX(val)}
                      y2={padding.top + plotHeight + 4}
                      stroke="#64748b"
                    />
                    <text
                      x={scaleX(val)}
                      y={padding.top + plotHeight + 18}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {val}
                    </text>
                  </g>
                ))}

                {/* Axis Titles */}
                <text
                  x={padding.left + plotWidth / 2}
                  y={svgHeight - 12}
                  fill="#cbd5e1"
                  fontSize="11"
                  textAnchor="middle"
                  fontWeight="500"
                >
                  {isEn ? 'Storage / Detention Time t (hours)' : 'Thời gian lưu trữ t (giờ)'}
                </text>
                <text
                  x={-(padding.top + plotHeight / 2)}
                  y={18}
                  fill="#cbd5e1"
                  fontSize="11"
                  textAnchor="middle"
                  fontWeight="500"
                  transform="rotate(-90)"
                >
                  {isEn ? 'Free Chlorine Concentration C_Cl (mg/L)' : 'Nồng độ Clo tự do C_Cl (mg/L)'}
                </text>

                {/* Active Hover Crosshair Line & Target Marker */}
                {activeDataPoint && (
                  <g className="transition-opacity duration-150">
                    <line
                      x1={scaleX(activeDataPoint.t)}
                      y1={padding.top}
                      x2={scaleX(activeDataPoint.t)}
                      y2={padding.top + plotHeight}
                      stroke="#06b6d4"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1={padding.left}
                      y1={scaleYClo(activeDataPoint.clo)}
                      x2={padding.left + plotWidth}
                      y2={scaleYClo(activeDataPoint.clo)}
                      stroke="#f43f5e"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                      strokeOpacity="0.7"
                    />
                    <circle
                      cx={scaleX(activeDataPoint.t)}
                      cy={scaleYClo(activeDataPoint.clo)}
                      r="6"
                      fill="#f43f5e"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      className="animate-pulse"
                    />
                    <circle
                      cx={scaleX(activeDataPoint.t)}
                      cy={scaleYClo(activeDataPoint.clo)}
                      r="12"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="1.2"
                      strokeOpacity="0.5"
                    />

                    {/* Floating Callout Tag */}
                    <g transform={`translate(${scaleX(activeDataPoint.t)}, ${scaleYClo(activeDataPoint.clo)})`}>
                      <rect
                        x={activeDataPoint.t > params.t_max * 0.7 ? -135 : 12}
                        y={activeDataPoint.clo < 0.2 ? -45 : -20}
                        width="125"
                        height="38"
                        rx="6"
                        fill="#020617"
                        stroke="#f43f5e"
                        strokeWidth="1.2"
                        filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
                      />
                      <text
                        x={activeDataPoint.t > params.t_max * 0.7 ? -128 : 19}
                        y={activeDataPoint.clo < 0.2 ? -30 : -5}
                        fill="#f8fafc"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        t = {activeDataPoint.t} h
                      </text>
                      <text
                        x={activeDataPoint.t > params.t_max * 0.7 ? -128 : 19}
                        y={activeDataPoint.clo < 0.2 ? -16 : 9}
                        fill="#fca5a5"
                        fontSize="10.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        Clo = {activeDataPoint.clo} mg/L
                      </text>
                    </g>
                  </g>
                )}
              </svg>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 mt-2 px-2 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-rose-500 rounded" />
                <span>PINN Predicted C_Cl(t)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-white bg-slate-900" />
                <span>{isEn ? `Benchmarks (${params.C0_Clo} & ${params.C_end_Clo})` : `Mốc thực nghiệm (${params.C0_Clo} & ${params.C_end_Clo})`}</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400">
                <span className="w-3 border-b-2 border-dashed border-amber-400" />
                <span>{isEn ? 'Safe Min (0.2 mg/L)' : 'Ngưỡng tối thiểu (0.2 mg/L)'}</span>
              </div>
            </div>
          </div>

          {/* PLOT 2: THM FORMATION */}
          <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 relative flex flex-col">
            <div className="flex items-center justify-between mb-1 px-2">
              <h3 className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>{isEn ? `THM Formation Prediction - Season ${seasonName} (kf = ${metrics.k_f.toFixed(5)})` : `Dự báo hình thành THM - Mùa ${seasonName} (kf = ${metrics.k_f.toFixed(5)})`}</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                THM₀: {params.THM_initial} → THM_end: {params.THM_end} µg/L
              </span>
            </div>

            <div className="relative w-full aspect-[600/360] select-none">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-full cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
              >
                <defs>
                  <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
                  </pattern>
                  <linearGradient id="thmGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Plot Background Area */}
                <rect
                  x={padding.left}
                  y={padding.top}
                  width={plotWidth}
                  height={plotHeight}
                  fill="#030712"
                  stroke="#334155"
                  strokeWidth="1"
                />
                <rect
                  x={padding.left}
                  y={padding.top}
                  width={plotWidth}
                  height={plotHeight}
                  fill="url(#grid2)"
                />

                {/* Horizontal Safe MAC Limit Line (y = 100 ug/L) */}
                {params.thmSafeMax >= thmMin && params.thmSafeMax <= thmMax && (
                  <g>
                    <line
                      x1={padding.left}
                      y1={scaleYThm(params.thmSafeMax)}
                      x2={padding.left + plotWidth}
                      y2={scaleYThm(params.thmSafeMax)}
                      stroke="#ef4444"
                      strokeWidth="1.8"
                      strokeDasharray="6 4"
                    />
                    <text
                      x={padding.left + plotWidth - 8}
                      y={scaleYThm(params.thmSafeMax) - 6}
                      fill="#ef4444"
                      fontSize="10"
                      textAnchor="end"
                      fontWeight="600"
                    >
                      {isEn ? `Safe MAC Limit (${params.thmSafeMax} µg/L)` : `Giới hạn an toàn MAC (${params.thmSafeMax} µg/L)`}
                    </text>
                  </g>
                )}

                {/* Shaded Area under Curve */}
                <path
                  d={`${thmPath} L ${scaleX(params.t_max)} ${scaleYThm(0)} L ${scaleX(params.t_min)} ${scaleYThm(0)} Z`}
                  fill="url(#thmGradient)"
                />

                {/* Main THM Curve (Blue solid) */}
                <path
                  d={thmPath}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Experimental Boundary Scatter Dots */}
                <circle
                  cx={scaleX(params.t_min)}
                  cy={scaleYThm(params.THM_initial)}
                  r="5"
                  fill="#0f172a"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
                <text
                  x={scaleX(params.t_min) + 8}
                  y={scaleYThm(params.THM_initial) + 12}
                  fill="#f8fafc"
                  fontSize="10"
                  fontWeight="600"
                >
                  t=0 ({params.THM_initial})
                </text>

                <circle
                  cx={scaleX(params.t_max)}
                  cy={scaleYThm(params.THM_end)}
                  r="5"
                  fill="#0f172a"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
                <text
                  x={scaleX(params.t_max) - 10}
                  y={scaleYThm(params.THM_end) - 10}
                  fill="#f8fafc"
                  fontSize="10"
                  fontWeight="600"
                  textAnchor="end"
                >
                  t={params.t_max}h ({params.THM_end})
                </text>

                {/* Y Axis Ticks and Labels */}
                {thmTicks.map((val) => (
                  <g key={`thm-tick-${val}`}>
                    <line
                      x1={padding.left - 4}
                      y1={scaleYThm(val)}
                      x2={padding.left}
                      y2={scaleYThm(val)}
                      stroke="#64748b"
                    />
                    <text
                      x={padding.left - 8}
                      y={scaleYThm(val) + 3.5}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {val}
                    </text>
                  </g>
                ))}

                {/* X Axis Ticks and Labels */}
                {xTicks.map((val) => (
                  <g key={`x-tick-thm-${val}`}>
                    <line
                      x1={scaleX(val)}
                      y1={padding.top + plotHeight}
                      x2={scaleX(val)}
                      y2={padding.top + plotHeight + 4}
                      stroke="#64748b"
                    />
                    <text
                      x={scaleX(val)}
                      y={padding.top + plotHeight + 18}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {val}
                    </text>
                  </g>
                ))}

                {/* Axis Titles */}
                <text
                  x={padding.left + plotWidth / 2}
                  y={svgHeight - 12}
                  fill="#cbd5e1"
                  fontSize="11"
                  textAnchor="middle"
                  fontWeight="500"
                >
                  {isEn ? 'Storage / Detention Time t (hours)' : 'Thời gian lưu trữ t (giờ)'}
                </text>
                <text
                  x={-(padding.top + plotHeight / 2)}
                  y={18}
                  fill="#cbd5e1"
                  fontSize="11"
                  textAnchor="middle"
                  fontWeight="500"
                  transform="rotate(-90)"
                >
                  {isEn ? 'THM Concentration C_THM (µg/L)' : 'Nồng độ THM C_THM (µg/L)'}
                </text>

                {/* Active Hover Crosshair Line & Target Marker */}
                {activeDataPoint && (
                  <g className="transition-opacity duration-150">
                    <line
                      x1={scaleX(activeDataPoint.t)}
                      y1={padding.top}
                      x2={scaleX(activeDataPoint.t)}
                      y2={padding.top + plotHeight}
                      stroke="#06b6d4"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1={padding.left}
                      y1={scaleYThm(activeDataPoint.thm)}
                      x2={padding.left + plotWidth}
                      y2={scaleYThm(activeDataPoint.thm)}
                      stroke="#3b82f6"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                      strokeOpacity="0.7"
                    />
                    <circle
                      cx={scaleX(activeDataPoint.t)}
                      cy={scaleYThm(activeDataPoint.thm)}
                      r="6"
                      fill="#3b82f6"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      className="animate-pulse"
                    />
                    <circle
                      cx={scaleX(activeDataPoint.t)}
                      cy={scaleYThm(activeDataPoint.thm)}
                      r="12"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="1.2"
                      strokeOpacity="0.5"
                    />

                    {/* Floating Callout Tag */}
                    <g transform={`translate(${scaleX(activeDataPoint.t)}, ${scaleYThm(activeDataPoint.thm)})`}>
                      <rect
                        x={activeDataPoint.t > params.t_max * 0.7 ? -135 : 12}
                        y={activeDataPoint.thm > 100 ? -20 : -45}
                        width="125"
                        height="38"
                        rx="6"
                        fill="#020617"
                        stroke="#3b82f6"
                        strokeWidth="1.2"
                        filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
                      />
                      <text
                        x={activeDataPoint.t > params.t_max * 0.7 ? -128 : 19}
                        y={activeDataPoint.thm > 100 ? -5 : -30}
                        fill="#f8fafc"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        t = {activeDataPoint.t} h
                      </text>
                      <text
                        x={activeDataPoint.t > params.t_max * 0.7 ? -128 : 19}
                        y={activeDataPoint.thm > 100 ? 9 : -16}
                        fill="#93c5fd"
                        fontSize="10.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        THM = {activeDataPoint.thm} µg/L
                      </text>
                    </g>
                  </g>
                )}
              </svg>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 mt-2 px-2 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-blue-500 rounded" />
                <span>PINN Predicted C_THM(t)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-white bg-slate-900" />
                <span>{isEn ? `Benchmarks (${params.THM_initial} & ${params.THM_end})` : `Mốc thực nghiệm (${params.THM_initial} & ${params.THM_end})`}</span>
              </div>
              <div className="flex items-center gap-1.5 text-red-400">
                <span className="w-3 border-b-2 border-dashed border-red-500" />
                <span>{isEn ? 'MAC Limit (100 µg/L)' : 'Giới hạn MAC (100 µg/L)'}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* COMBINED DUAL-AXIS OVERLAY PLOT */
        <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 relative">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>{isEn ? 'Dual-Axis Dynamics: Chlorine Decay vs. THM Formation' : 'Biểu đồ gộp tương quan Clo & THM trên cùng trục thời gian'}</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {isEn ? 'Left Axis: Chlorine (mg/L, red) | Right Axis: THM (µg/L, blue)' : 'Trục trái: Clo (mg/L, đỏ) | Trục phải: THM (µg/L, xanh)'}
            </span>
          </div>

          <div className="relative w-full aspect-[1200/500] select-none">
            <svg
              viewBox="0 0 1200 500"
              className="w-full h-full cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={handleClick}
            >
              <defs>
                <pattern id="gridCombined" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
                </pattern>
              </defs>

              {/* Background */}
              <rect x="75" y="40" width="1050" height="400" fill="#030712" stroke="#334155" strokeWidth="1" />
              <rect x="75" y="40" width="1050" height="400" fill="url(#gridCombined)" />

              {/* Threshold Lines */}
              <line
                x1="75"
                y1={40 + 400 - (params.cloSafeMin / cloMax) * 400}
                x2="1125"
                y2={40 + 400 - (params.cloSafeMin / cloMax) * 400}
                stroke="#f59e0b"
                strokeWidth="1.8"
                strokeDasharray="6 4"
              />
              <text
                x="85"
                y={40 + 400 - (params.cloSafeMin / cloMax) * 400 - 8}
                fill="#f59e0b"
                fontSize="11"
                fontWeight="600"
              >
                {isEn ? `Min Chlorine Threshold (${params.cloSafeMin} mg/L)` : `Ngưỡng Clo tối thiểu (${params.cloSafeMin} mg/L)`}
              </text>

              <line
                x1="75"
                y1={40 + 400 - (params.thmSafeMax / thmMax) * 400}
                x2="1125"
                y2={40 + 400 - (params.thmSafeMax / thmMax) * 400}
                stroke="#ef4444"
                strokeWidth="1.8"
                strokeDasharray="6 4"
              />
              <text
                x="1115"
                y={40 + 400 - (params.thmSafeMax / thmMax) * 400 - 8}
                fill="#ef4444"
                fontSize="11"
                fontWeight="600"
                textAnchor="end"
              >
                {isEn ? `Safe THM MAC Limit (${params.thmSafeMax} µg/L)` : `Giới hạn THM MAC (${params.thmSafeMax} µg/L)`}
              </text>

              {/* Clo Curve */}
              <path
                d={data.reduce((acc, pt, idx) => {
                  const x = 75 + ((pt.t - tMin) / (tMax - tMin)) * 1050;
                  const y = 40 + 400 - ((pt.clo - cloMin) / (cloMax - cloMin)) * 400;
                  return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                }, '')}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="3"
              />

              {/* THM Curve */}
              <path
                d={data.reduce((acc, pt, idx) => {
                  const x = 75 + ((pt.t - tMin) / (tMax - tMin)) * 1050;
                  const y = 40 + 400 - ((pt.thm - thmMin) / (thmMax - thmMin)) * 400;
                  return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                }, '')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
              />

              {/* Left Y Axis (Clo) */}
              <text x="-240" y="24" fill="#f43f5e" fontSize="13" fontWeight="bold" transform="rotate(-90)" textAnchor="middle">
                {isEn ? 'Chlorine Concentration (mg/L)' : 'Nồng độ Clo (mg/L)'}
              </text>
              {cloTicks.map((val) => {
                const y = 40 + 400 - ((val - cloMin) / (cloMax - cloMin)) * 400;
                return (
                  <g key={`comb-clo-${val}`}>
                    <text x="68" y={y + 4} fill="#f87171" fontSize="11" textAnchor="end" fontFamily="monospace">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Right Y Axis (THM) */}
              <text x="240" y="-1175" fill="#3b82f6" fontSize="13" fontWeight="bold" transform="rotate(90)" textAnchor="middle">
                {isEn ? 'THM Concentration (µg/L)' : 'Nồng độ THM (µg/L)'}
              </text>
              {thmTicks.map((val) => {
                const y = 40 + 400 - ((val - thmMin) / (thmMax - thmMin)) * 400;
                return (
                  <g key={`comb-thm-${val}`}>
                    <text x="1132" y={y + 4} fill="#60a5fa" fontSize="11" textAnchor="start" fontFamily="monospace">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* X Axis */}
              <text x="600" y="480" fill="#cbd5e1" fontSize="13" fontWeight="bold" textAnchor="middle">
                {isEn ? 'Detention / Storage Time t (hours)' : 'Thời gian lưu trữ t (giờ)'}
              </text>
              {xTicks.map((val) => {
                const x = 75 + ((val - tMin) / (tMax - tMin)) * 1050;
                return (
                  <g key={`comb-x-${val}`}>
                    <text x={x} y="460" fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="monospace">
                      {val}h
                    </text>
                  </g>
                );
              })}

              {/* Active Hover Crosshair in Combined View */}
              {activeDataPoint && (
                <g>
                  <line
                    x1={75 + ((activeDataPoint.t - tMin) / (tMax - tMin)) * 1050}
                    y1="40"
                    x2={75 + ((activeDataPoint.t - tMin) / (tMax - tMin)) * 1050}
                    y2="440"
                    stroke="#06b6d4"
                    strokeWidth="1.8"
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx={75 + ((activeDataPoint.t - tMin) / (tMax - tMin)) * 1050}
                    cy={40 + 400 - ((activeDataPoint.clo - cloMin) / (cloMax - cloMin)) * 400}
                    r="6"
                    fill="#f43f5e"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx={75 + ((activeDataPoint.t - tMin) / (tMax - tMin)) * 1050}
                    cy={40 + 400 - ((activeDataPoint.thm - thmMin) / (thmMax - thmMin)) * 400}
                    r="6"
                    fill="#3b82f6"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />
                </g>
              )}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
