import React, { useState, useMemo } from 'react';
import { Language, SeasonId, SimulationParams } from './types/pinn';
import { SEASONS, calculatePhysicalMetrics, generateSimulationData } from './utils/pinnMath';
import { SeasonSelector } from './components/SeasonSelector';
import { ParameterPanel } from './components/ParameterPanel';
import { InteractivePlot } from './components/InteractivePlot';
import { MetricsCards } from './components/MetricsCards';
import { PinnLiveTrainer } from './components/PinnLiveTrainer';
import { DataTableModal } from './components/DataTableModal';
import { TheoryModal } from './components/TheoryModal';
import {
  Activity,
  AlertOctagon,
  BookOpen,
  Cpu,
  Droplet,
  Languages,
  Table,
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('en'); // Default to English as requested
  const isEn = lang === 'en';

  const [selectedSeasonId, setSelectedSeasonId] = useState<SeasonId>('Sp');
  const [activeTab, setActiveTab] = useState<'plots' | 'trainer'>('plots');
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isTheoryModalOpen, setIsTheoryModalOpen] = useState(false);

  // Initial simulation parameters
  const [params, setParams] = useState<SimulationParams>(() => {
    const defaultSeason = SEASONS[0];
    return {
      ...defaultSeason.defaultParams,
      seasonId: 'Sp',
    };
  });

  // Handle season switch
  const handleSelectSeason = (seasonId: SeasonId) => {
    setSelectedSeasonId(seasonId);
    const targetSeason = SEASONS.find((s) => s.id === seasonId);
    if (targetSeason) {
      setParams({
        ...targetSeason.defaultParams,
        seasonId,
      });
    }
  };

  // Reset to default of current season
  const handleReset = () => {
    const targetSeason = SEASONS.find((s) => s.id === selectedSeasonId) || SEASONS[0];
    setParams({
      ...targetSeason.defaultParams,
      seasonId: selectedSeasonId,
    });
  };

  // Physical calculations and analytical simulation
  const metrics = useMemo(() => calculatePhysicalMetrics(params), [params]);
  const simulationData = useMemo(() => generateSimulationData(params, metrics, 200), [params, metrics]);

  const currentSeason = SEASONS.find((s) => s.id === selectedSeasonId) || SEASONS[0];
  const seasonDisplayName = isEn ? currentSeason.englishName : currentSeason.vietnameseName;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30">
      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Droplet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  PINN Water Quality Simulator
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Physics-Informed Neural Network
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isEn
                  ? 'Kinetics of Chlorine Decay (C_Cl) & Disinfection Byproducts (C_THM)'
                  : 'Mô phỏng suy giảm Clo (C_Cl) & Hình thành THM (C_THM)'}
              </p>
            </div>
          </div>

          {/* Quick Actions & Language Switcher */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded font-semibold transition-colors cursor-pointer ${
                  lang === 'en' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => setLang('vi')}
                className={`px-2 py-1 rounded font-semibold transition-colors cursor-pointer ${
                  lang === 'vi' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Chuyển sang Tiếng Việt"
              >
                VI
              </button>
            </div>

            <button
              onClick={() => setIsTheoryModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 transition-colors border border-slate-700 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">{isEn ? 'ODE Theory' : 'Lý thuyết ODE'}</span>
            </button>

            <button
              onClick={() => setIsTableModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 transition-colors border border-slate-700 cursor-pointer"
            >
              <Table className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">{isEn ? 'Data Table & CSV' : 'Bảng số liệu & CSV'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col gap-6 w-full">
        {/* SEASON SELECTION COMPONENT */}
        <SeasonSelector
          currentSeasonId={selectedSeasonId}
          onSelectSeason={handleSelectSeason}
          lang={lang}
        />

        {/* METRICS & WATER SAFETY DIAGNOSTICS CARDS */}
        <MetricsCards metrics={metrics} params={params} lang={lang} />

        {/* WATER QUALITY ADVISORY BANNER */}
        {metrics.overallStatus !== 'good' && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
            metrics.overallStatus === 'danger'
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
          }`}>
            <AlertOctagon className={`w-5 h-5 shrink-0 mt-0.5 ${
              metrics.overallStatus === 'danger' ? 'text-rose-400' : 'text-amber-400'
            }`} />
            <div className="flex-1">
              <strong className="font-bold text-sm block mb-0.5">
                {isEn ? metrics.overallStatusTextEn : metrics.overallStatusText}
              </strong>
              <span>
                {metrics.t_clo_critical !== null && (
                  isEn
                    ? `Disinfectant chlorine falls below 0.2 mg/L after ${metrics.t_clo_critical.toFixed(1)} hours (pathogen regrowth hazard). `
                    : `Nồng độ Clo dư rớt dưới 0.2 mg/L sau ${metrics.t_clo_critical.toFixed(1)} giờ (nguy cơ tái nhiễm vi sinh). `
                )}
                {metrics.t_thm_critical !== null && (
                  isEn
                    ? `Trihalomethanes breach the 100 µg/L MAC limit after ${metrics.t_thm_critical.toFixed(1)} hours (toxic chronic risk). `
                    : `Phụ phẩm THM vượt ngưỡng cho phép 100 µg/L sau ${metrics.t_thm_critical.toFixed(1)} giờ (nguy cơ độc tính tích lũy). `
                )}
                {isEn
                  ? 'Operational Guidance: Adjust booster chlorination dosage, enhance TOC removal via enhanced coagulation, or optimize hydraulic turnover.'
                  : 'Đề xuất vận hành: Điều chỉnh liều lượng Clo ban đầu C0, bổ sung trạm châm Clo tăng áp (Booster chlorination), hoặc giảm chất hữu cơ TOC bằng keo tụ nâng cao.'}
              </span>
            </div>
          </div>
        )}

        {/* INPUT/OUTPUT BOUNDARY CUSTOMIZATION PANEL */}
        <ParameterPanel
          params={params}
          onChangeParams={setParams}
          onReset={handleReset}
          lang={lang}
        />

        {/* TABS: PLOTS VS LIVE PINN TRAINER */}
        <div className="flex items-center gap-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('plots')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'plots'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{isEn ? 'Predictive Plot & Hover Tracker (x, y)' : 'Đồ Thị Dự Báo & Rê Chuột (x, y)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('trainer')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'trainer'
                ? 'border-violet-400 text-violet-400 bg-violet-950/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>{isEn ? 'PINN Live Training Engine (PyTorch Simulation)' : 'Mạng Nơ-ron PINN Tự Chạy (PyTorch Simulation)'}</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        {activeTab === 'plots' ? (
          <InteractivePlot
            params={params}
            metrics={metrics}
            data={simulationData}
            seasonName={seasonDisplayName}
            lang={lang}
          />
        ) : (
          <PinnLiveTrainer
            params={params}
            lang={lang}
            onTrainingComplete={(kw, kf) => {
              // Training complete callback
            }}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/90 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <span>
              {isEn
                ? 'PINN Framework: Solving coupled ODEs & Inverse Parameter Estimation (kw, kf)'
                : 'Mô hình hóa PINN: Giải bài toán vi phân ODE & suy biến tham số kw, kf'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>{isEn ? 'WHO / EPA / QCVN Standard (Clo ≥ 0.2 mg/L)' : 'QCVN 01-1:2018/BYT (Clo ≥ 0.2 mg/L)'}</span>
            <span>•</span>
            <span>{isEn ? 'Safe MAC Drinking Standard (THM ≤ 100 µg/L)' : 'Tiêu chuẩn MAC THM (≤ 100 µg/L)'}</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <DataTableModal
        data={simulationData}
        params={params}
        metrics={metrics}
        seasonName={seasonDisplayName}
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        lang={lang}
      />

      <TheoryModal
        isOpen={isTheoryModalOpen}
        onClose={() => setIsTheoryModalOpen(false)}
        lang={lang}
      />
    </div>
  );
}
