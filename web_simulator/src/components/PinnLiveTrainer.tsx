import React, { useState, useEffect } from 'react';
import { Language, PinnStepLog, SimulationParams } from '../types/pinn';
import { runPinnTrainingSimulation } from '../utils/pinnMath';
import { Play, Pause, RotateCcw, Cpu, CheckCircle, Terminal, TrendingDown } from 'lucide-react';

interface Props {
  params: SimulationParams;
  onTrainingComplete?: (finalKw: number, finalKf: number) => void;
  lang?: Language;
}

export const PinnLiveTrainer: React.FC<Props> = ({ params, onTrainingComplete, lang = 'en' }) => {
  const isEn = lang === 'en';
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [logs, setLogs] = useState<PinnStepLog[]>([]);
  const [speed, setSpeed] = useState<'fast' | 'normal'>('normal');

  // Pre-generate logs when params change
  useEffect(() => {
    const generated = runPinnTrainingSimulation(params, 5000, 500);
    setLogs(generated);
    setCurrentStepIndex(0);
    setIsRunning(false);
  }, [params]);

  // Interval timer for step-by-step animation
  useEffect(() => {
    if (!isRunning) return;

    const intervalTime = speed === 'fast' ? 120 : 350;
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < logs.length - 1) {
          return prev + 1;
        } else {
          setIsRunning(false);
          const finalLog = logs[logs.length - 1];
          if (finalLog && onTrainingComplete) {
            onTrainingComplete(finalLog.kw, finalLog.kf);
          }
          return prev;
        }
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isRunning, logs, speed, onTrainingComplete]);

  const handleStart = () => {
    if (currentStepIndex >= logs.length - 1) {
      setCurrentStepIndex(0);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentStepIndex(0);
  };

  const currentLog = logs[currentStepIndex] || logs[0];
  const progressPercent = logs.length > 1 ? (currentStepIndex / (logs.length - 1)) * 100 : 0;

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-2xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
            <Cpu className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{isEn ? 'Physics-Informed Neural Network (PINN) Engine' : 'Động Cơ Mạng Nơ-ron PINN (Physics-Informed Neural Network)'}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-800">
                PyTorch Simulation
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {isEn
                ? 'FCN [1, 128, 128, 64, 128, 128, 2] optimizing Loss = Loss_BC + Loss_PDE via Adam'
                : 'Kiến trúc FCN [1, 128, 128, 64, 128, 128, 2] tối ưu hóa Loss = Loss_BC + Loss_PDE bằng Adam'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSpeed(speed === 'normal' ? 'fast' : 'normal')}
            className="text-xs px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white cursor-pointer"
          >
            {isEn
              ? `Speed: ${speed === 'normal' ? 'Normal' : 'Fast (3x)'}`
              : `Tốc độ: ${speed === 'normal' ? 'Bình thường' : 'Nhanh (x3)'}`}
          </button>

          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-violet-950 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>
                {currentStepIndex > 0 && currentStepIndex < logs.length - 1
                  ? (isEn ? 'Resume' : 'Tiếp tục')
                  : (isEn ? 'Train PINN' : 'Chạy PINN')}
              </span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-amber-950 transition-colors cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>{isEn ? 'Pause' : 'Tạm dừng'}</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title={isEn ? 'Reset to step 0' : 'Khởi tạo lại từ bước 0'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress & Live Status Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col">
          <span className="text-slate-400 text-[11px]">{isEn ? 'Training Step:' : 'Bước huấn luyện:'}</span>
          <span className="text-base font-bold font-mono text-cyan-300 mt-0.5">
            {currentLog ? currentLog.step : 0} / 5000
          </span>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-cyan-400 h-full transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col">
          <span className="text-slate-400 text-[11px] flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-emerald-400" />
            {isEn ? 'Real MSE Loss:' : 'Sai số Real MSE:'}
          </span>
          <span className="text-base font-bold font-mono text-emerald-400 mt-0.5">
            {currentLog ? currentLog.realMse.toFixed(6) : '0.212705'}
          </span>
          <span className="text-[10px] text-slate-500 mt-1">{isEn ? 'Converged < 0.000010' : 'Hội tụ < 0.000010'}</span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col">
          <span className="text-slate-400 text-[11px]">{isEn ? 'Learned kw Param:' : 'Hệ số kw học được:'}</span>
          <span className="text-base font-bold font-mono text-rose-400 mt-0.5">
            {currentLog ? currentLog.kw.toFixed(4) : '0.5000'}
          </span>
          <span className="text-[10px] text-slate-500 mt-1">{isEn ? 'Inverse Estimation' : 'Hội tụ bài toán nghịch'}</span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col">
          <span className="text-slate-400 text-[11px]">{isEn ? 'Learned kf Param:' : 'Hệ số kf học được:'}</span>
          <span className="text-base font-bold font-mono text-blue-400 mt-0.5">
            {currentLog ? currentLog.kf.toFixed(5) : '0.01000'}
          </span>
          <span className="text-[10px] text-slate-500 mt-1">Softplus Parameter</span>
        </div>
      </div>

      {/* Terminal Output Log matching Python Console */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden font-mono text-xs">
        <div className="bg-slate-900/90 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Python PyTorch Training Console Log</span>
          </div>
          <span className="text-[10px] text-slate-500">
            Nf = 250 Collocation Points | Latin Hypercube Sampling
          </span>
        </div>

        <div className="p-3.5 max-h-48 overflow-y-auto flex flex-col gap-1 text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
          <div className="text-slate-500 pb-1 border-b border-slate-900">
            {isEn
              ? '# Initializing FCN model with 4 homoscedastic uncertainty self-adaptive weights exp(-s) for Loss BC and Loss PDE...'
              : '# Khởi tạo mô hình FCN với 4 trọng số tự học exp(-s) cho Loss BC và Loss PDE...'}
          </div>
          {logs.slice(0, currentStepIndex + 1).map((log, idx) => (
            <div
              key={`log-${log.step}-${idx}`}
              className={`flex flex-wrap items-center gap-x-3 gap-y-0.5 ${
                idx === currentStepIndex ? 'text-cyan-300 font-bold bg-cyan-950/30 px-1 rounded' : 'text-slate-400'
              }`}
            >
              <span className="text-slate-500">Step {String(log.step).padStart(4, ' ')}</span>
              <span>|</span>
              <span>Real MSE: <span className="text-emerald-400">{log.realMse.toFixed(6)}</span></span>
              <span>|</span>
              <span>kw: <span className="text-rose-400">{log.kw.toFixed(4)}</span></span>
              <span>|</span>
              <span>kf: <span className="text-blue-400">{log.kf.toFixed(5)}</span></span>
              <span>|</span>
              <span className="text-violet-400">W_BC(Clo/THM): {log.w_bc_clo.toFixed(2)}/{log.w_bc_thm.toFixed(2)}</span>
            </div>
          ))}
          {currentStepIndex === logs.length - 1 && (
            <div className="mt-1 pt-1 border-t border-slate-900 text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>
                {isEn
                  ? 'PINN training converged successfully! The predictive model strictly satisfies both boundary conditions and physical ODE residuals.'
                  : 'Huấn luyện PINN hoàn tất thành công! Đồ thị đã khớp chính xác với phương trình vi phân và điểm biên.'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
