import { DataPoint, PhysicalMetrics, PinnStepLog, SeasonConfig, SimulationParams } from '../types/pinn';

export const SEASONS: SeasonConfig[] = [
  {
    id: 'Sp',
    name: 'Spring',
    vietnameseName: 'Mùa Xuân (Spring)',
    englishName: 'Spring',
    icon: '🌸',
    color: '#10b981', // emerald
    bgGradient: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30',
    description: 'Độ ẩm cao, nồng độ chất hữu cơ TOC cao (6.25 mg/L). Phụ phẩm THM hình thành từ 70 đến 130 µg/L (vượt ngưỡng MAC).',
    englishDescription: 'High humidity, high natural organic matter TOC (6.25 mg/L). THM formation from 70 to 130 µg/L (exceeds MAC limit).',
    defaultParams: {
      C0_Clo: 0.70,
      C_end_Clo: 0.02,
      THM_initial: 70,
      THM_end: 130,
      TOC: 6.25,
      t_min: 0,
      t_max: 72,
      S: 1.0,
      V: 12.5,
      k_b: 0.02,
      cloSafeMin: 0.20,
      thmSafeMax: 100.0,
    },
  },
  {
    id: 'Au',
    name: 'Autumn',
    vietnameseName: 'Mùa Thu (Autumn)',
    englishName: 'Autumn / Fall',
    icon: '🍂',
    color: '#f59e0b', // amber
    bgGradient: 'from-amber-500/10 to-orange-500/10 border-amber-500/30',
    description: 'Nhiệt độ dịu mát, TOC là 4.55 mg/L. THM tăng chậm từ 65 đến 75 µg/L, duy trì an toàn dưới ngưỡng 100 µg/L.',
    englishDescription: 'Cooler temperatures, TOC of 4.55 mg/L. THM rises gradually from 65 to 75 µg/L, safely maintained below the 100 µg/L threshold.',
    defaultParams: {
      C0_Clo: 0.70,
      C_end_Clo: 0.02,
      THM_initial: 65,
      THM_end: 75,
      TOC: 4.55,
      t_min: 0,
      t_max: 72,
      S: 1.0,
      V: 12.5,
      k_b: 0.02,
      cloSafeMin: 0.20,
      thmSafeMax: 100.0,
    },
  },
  {
    id: 'Su',
    name: 'Summer',
    vietnameseName: 'Mùa Hè (Summer)',
    englishName: 'Summer',
    icon: '☀️',
    color: '#ef4444', // red
    bgGradient: 'from-rose-500/10 to-red-500/10 border-rose-500/30',
    description: 'Nhiệt độ nước cao, TOC là 4.05 mg/L. THM ban đầu đã cao (117 µg/L) và tăng lên 138 µg/L (vượt ngưỡng an toàn).',
    englishDescription: 'High water temperature, TOC of 4.05 mg/L. Baseline THM (117 µg/L) climbing to 138 µg/L (exceeds MAC limit).',
    defaultParams: {
      C0_Clo: 0.70,
      C_end_Clo: 0.02,
      THM_initial: 117,
      THM_end: 138,
      TOC: 4.05,
      t_min: 0,
      t_max: 72,
      S: 1.0,
      V: 12.5,
      k_b: 0.02,
      cloSafeMin: 0.20,
      thmSafeMax: 100.0,
    },
  },
  {
    id: 'Custom',
    name: 'Custom',
    vietnameseName: 'Tùy Chỉnh (Custom)',
    englishName: 'Custom Parameters',
    icon: '⚙️',
    color: '#6366f1', // indigo
    bgGradient: 'from-indigo-500/10 to-violet-500/10 border-indigo-500/30',
    description: 'Tự do hiệu chỉnh tất cả nồng độ biên đầu vào/đầu ra, TOC, kích thước bể/ống và tốc độ suy giảm theo thực tế của nhà máy nước.',
    englishDescription: 'Freely customize all inlet/outlet boundaries, TOC, pipe/tank geometry, and kinetics to match site-specific water plant measurements.',
    defaultParams: {
      C0_Clo: 0.80,
      C_end_Clo: 0.03,
      THM_initial: 40,
      THM_end: 95,
      TOC: 5.0,
      t_min: 0,
      t_max: 72,
      S: 1.0,
      V: 12.5,
      k_b: 0.02,
      cloSafeMin: 0.20,
      thmSafeMax: 100.0,
    },
  },
];

/**
 * Calculates physical parameters (kw, kf, K_eff, critical times, etc.)
 */
export function calculatePhysicalMetrics(params: SimulationParams): PhysicalMetrics {
  const { C0_Clo, C_end_Clo, THM_initial, THM_end, TOC, t_max, S, V, k_b, cloSafeMin, thmSafeMax } = params;

  const SV_ratio = V > 0 ? S / V : 0.08;

  // Effective decay constant K_eff
  // C_end = C0 * exp(-K_eff * t_max)
  let K_eff = 0.04;
  if (C0_Clo > 0 && C_end_Clo > 0 && C0_Clo > C_end_Clo && t_max > 0) {
    K_eff = Math.log(C0_Clo / C_end_Clo) / t_max;
  }

  // kw = (K_eff - kb) / (S/V)
  let k_w = 0.5;
  if (SV_ratio > 0) {
    k_w = Math.max(0.0001, (K_eff - k_b) / SV_ratio);
  }

  // THM formation rate kf
  // dTHM/dt = kf * TOC * C_Cl(t)
  // THM(t_max) - THM(0) = kf * TOC * C0 / K_eff * (1 - exp(-K_eff * t_max))
  // Since 1 - exp(-K_eff * t_max) = (C0 - C_end) / C0:
  // kf = (THM_end - THM_initial) * K_eff / (TOC * (C0 - C_end))
  let k_f = 0.01;
  const deltaTHM = THM_end - THM_initial;
  const deltaClo = C0_Clo - C_end_Clo;
  if (TOC > 0 && deltaClo > 0 && deltaTHM >= 0) {
    k_f = Math.max(0.00001, (deltaTHM * K_eff) / (TOC * deltaClo));
  } else if (deltaTHM < 0) {
    k_f = 0;
  }

  // Critical time for Chlorine: time when C_Cl(t) drops below cloSafeMin (e.g. 0.2 mg/L)
  let t_clo_critical: number | null = null;
  if (C0_Clo >= cloSafeMin && C_end_Clo < cloSafeMin && K_eff > 0) {
    const t_crit = Math.log(C0_Clo / cloSafeMin) / K_eff;
    if (t_crit >= 0 && t_crit <= t_max) {
      t_clo_critical = t_crit;
    }
  } else if (C0_Clo < cloSafeMin) {
    t_clo_critical = 0;
  }

  // Critical time for THM: time when THM(t) exceeds thmSafeMax (e.g. 100 ug/L)
  let t_thm_critical: number | null = null;
  if (THM_initial >= thmSafeMax) {
    t_thm_critical = 0;
  } else if (THM_end > thmSafeMax) {
    // Solve for t: THM_initial + (kf * TOC * C0 / K_eff) * (1 - exp(-K_eff * t)) = thmSafeMax
    const totalPotentialIncrease = (k_f * TOC * C0_Clo) / K_eff;
    const requiredIncrease = thmSafeMax - THM_initial;
    if (totalPotentialIncrease > 0 && requiredIncrease < totalPotentialIncrease) {
      const ratio = 1 - requiredIncrease / totalPotentialIncrease;
      if (ratio > 0) {
        const t_crit = -Math.log(ratio) / K_eff;
        if (t_crit >= 0 && t_crit <= t_max) {
          t_thm_critical = t_crit;
        }
      }
    }
  }

  const cloDecayPercent = C0_Clo > 0 ? ((C0_Clo - C_end_Clo) / C0_Clo) * 100 : 0;
  const thmIncreasePercent = THM_initial > 0 ? ((THM_end - THM_initial) / THM_initial) * 100 : (THM_end > 0 ? 100 : 0);

  // Overall water safety status
  let overallStatus: 'good' | 'warning' | 'danger' = 'good';
  let overallStatusText = 'Chất lượng nước tối ưu trong ngưỡng kiểm soát';
  let overallStatusTextEn = 'Water quality is optimal and within all regulatory safety limits';

  if (THM_end > thmSafeMax && t_clo_critical !== null && t_clo_critical < t_max) {
    overallStatus = 'danger';
    overallStatusText = 'Nguy cấp: Clo khử trùng giảm quá thấp và THM vượt ngưỡng độc hại!';
    overallStatusTextEn = 'Critical Alert: Disinfectant chlorine residual drops too low and THM exceeds toxic limits!';
  } else if (THM_end > thmSafeMax) {
    overallStatus = 'warning';
    overallStatusText = 'Cảnh báo: THM vượt giới hạn an toàn MAC (100 µg/L) tại cuối mạng lưới.';
    overallStatusTextEn = 'Warning: THM exceeds the MAC regulatory threshold (100 µg/L) at network endpoints.';
  } else if (t_clo_critical !== null && t_clo_critical < t_max * 0.7) {
    overallStatus = 'warning';
    overallStatusText = 'Cảnh báo: Clo suy giảm nhanh, cần trạm châm Clo bổ sung (Booster).';
    overallStatusTextEn = 'Warning: Rapid chlorine decay; secondary booster chlorination is recommended.';
  }

  return {
    k_w,
    k_f,
    K_eff,
    SV_ratio,
    t_clo_critical,
    t_thm_critical,
    cloDecayPercent,
    thmIncreasePercent,
    overallStatus,
    overallStatusText,
    overallStatusTextEn,
  };
}

/**
 * Generates high-density simulation data points (e.g. 200 points) for plotting and table view
 */
export function generateSimulationData(
  params: SimulationParams,
  metrics: PhysicalMetrics,
  steps: number = 200
): DataPoint[] {
  const { C0_Clo, THM_initial, t_min, t_max, TOC, cloSafeMin, thmSafeMax } = params;
  const { K_eff, k_f } = metrics;

  const data: DataPoint[] = [];
  const dt = (t_max - t_min) / (steps - 1);

  for (let i = 0; i < steps; i++) {
    const t = t_min + i * dt;

    // Clo concentration at time t: C_Cl(t) = C0 * exp(-K_eff * t)
    const clo = Math.max(0, C0_Clo * Math.exp(-K_eff * t));

    // Derivative dClo/dt
    const dClo_dt = -K_eff * clo;

    // THM concentration at time t: THM(t) = THM_initial + (k_f * TOC * C0 / K_eff) * (1 - exp(-K_eff * t))
    let thm = THM_initial;
    if (K_eff > 0) {
      thm = THM_initial + ((k_f * TOC * C0_Clo) / K_eff) * (1 - Math.exp(-K_eff * t));
    }
    // Derivative dTHM/dt = k_f * TOC * C_Cl(t)
    const dThm_dt = (k_f * TOC * clo);

    const cloStatus: 'safe' | 'low' = clo >= cloSafeMin ? 'safe' : 'low';
    const thmStatus: 'safe' | 'exceeded' = thm <= thmSafeMax ? 'safe' : 'exceeded';

    data.push({
      t: Number(t.toFixed(3)),
      clo: Number(clo.toFixed(4)),
      thm: Number(thm.toFixed(2)),
      dClo_dt: Number(dClo_dt.toFixed(5)),
      dThm_dt: Number(dThm_dt.toFixed(5)),
      cloStatus,
      thmStatus,
    });
  }

  return data;
}

/**
 * Latin Hypercube Sampling (LHS) for 1D collocation points, matching Python pyDOE2 / scipy.stats.qmc
 */
export function sampleLHS(n: number, min: number, max: number): number[] {
  const result: number[] = [];
  const intervals: number[] = [];
  for (let i = 0; i < n; i++) {
    intervals.push(i);
  }
  // Shuffle intervals
  for (let i = intervals.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [intervals[i], intervals[j]] = [intervals[j], intervals[i]];
  }

  const range = max - min;
  for (let i = 0; i < n; i++) {
    const u = (intervals[i] + Math.random()) / n;
    result.push(min + u * range);
  }
  return result.sort((a, b) => a - b);
}

/**
 * Fast interactive PINN optimizer simulation for web execution
 * Mimics the PyTorch training loop from the notebook with loss logs
 */
export function runPinnTrainingSimulation(
  params: SimulationParams,
  totalSteps: number = 5000,
  logInterval: number = 500
): PinnStepLog[] {
  const { C0_Clo, C_end_Clo, THM_initial, THM_end, TOC, t_max, S, V, k_b } = params;
  const logs: PinnStepLog[] = [];

  const K_true = Math.log(C0_Clo / Math.max(0.001, C_end_Clo)) / t_max;
  const kw_target = Math.max(0.1, (K_true - k_b) / (S / V));
  const deltaTHM = Math.max(0, THM_end - THM_initial);
  const deltaClo = Math.max(0.001, C0_Clo - C_end_Clo);
  const kf_target = Math.max(0.001, (deltaTHM * K_true) / (TOC * deltaClo));

  // Initial values like notebook: k_w_init = 0.5, k_f_init = 0.01
  let kw_current = 0.5;
  let kf_current = 0.01;
  let s_bc_clo = 0.0;
  let s_bc_thm = 0.0;

  for (let step = 0; step <= totalSteps; step += logInterval) {
    const progress = step / totalSteps;
    // Non-linear convergence curve simulating Adam dynamics
    const factor = 1 - Math.exp(-progress * 4.5);

    // Simulated parameter trajectory
    kw_current = 0.5 + (kw_target - 0.5) * factor + (Math.sin(step * 0.02) * 0.015) * (1 - progress);
    kf_current = 0.01 + (kf_target - 0.01) * factor + (Math.cos(step * 0.02) * 0.008) * (1 - progress);

    // Adaptive homoscedastic uncertainty weights s
    s_bc_clo = -Math.log(1.0 + progress * 89.0 + (Math.random() - 0.5) * 2.0);
    s_bc_thm = -Math.log(1.0 + progress * 85.0 + (Math.random() - 0.5) * 2.0);

    const w_bc_c = Math.exp(-s_bc_clo);
    const w_bc_t = Math.exp(-s_bc_thm);

    // Simulated real MSE
    let realMse = 0.21 * Math.exp(-progress * 8.5) + (Math.random() * 0.000008);
    if (step === 0) realMse = 0.212705;
    if (step >= 3500) realMse = Math.max(0.000002, realMse);

    const lossBc = realMse * 0.45;
    const lossPde = realMse * 0.55;

    logs.push({
      step,
      realMse: Number(realMse.toFixed(6)),
      kw: Number(Math.max(0.01, kw_current).toFixed(4)),
      kf: Number(Math.max(0.0001, kf_current).toFixed(5)),
      w_bc_clo: Number(w_bc_c.toFixed(2)),
      w_bc_thm: Number(w_bc_t.toFixed(2)),
      lossBc: Number(lossBc.toFixed(6)),
      lossPde: Number(lossPde.toFixed(6)),
    });
  }

  return logs;
}
