export type SeasonId = 'Sp' | 'Au' | 'Su' | 'Custom';
export type Language = 'en' | 'vi';

export interface SeasonConfig {
  id: SeasonId;
  name: string;
  vietnameseName: string;
  englishName: string;
  icon: string;
  color: string;
  bgGradient: string;
  description: string;
  englishDescription: string;
  defaultParams: {
    C0_Clo: number;      // Initial Clo concentration at t=0 (mg/L)
    C_end_Clo: number;   // Clo concentration at t=t_max (mg/L)
    THM_initial: number; // Initial THM at t=0 (ug/L)
    THM_end: number;     // THM concentration at t=t_max (ug/L)
    TOC: number;         // Total Organic Carbon (mg/L)
    t_min: number;       // Start time (hours)
    t_max: number;       // End time (hours)
    S: number;           // Surface area (m2)
    V: number;           // Volume (m3)
    k_b: number;         // Bulk decay rate (1/h)
    cloSafeMin: number;  // Minimum safe chlorine threshold (mg/L, standard 0.2)
    thmSafeMax: number;  // Maximum safe THM threshold (ug/L, standard 100)
  };
}

export interface SimulationParams {
  C0_Clo: number;
  C_end_Clo: number;
  THM_initial: number;
  THM_end: number;
  TOC: number;
  t_min: number;
  t_max: number;
  S: number;
  V: number;
  k_b: number;
  cloSafeMin: number;
  thmSafeMax: number;
  seasonId: SeasonId;
}

export interface DataPoint {
  t: number;          // time in hours
  clo: number;        // Clo concentration in mg/L
  thm: number;        // THM concentration in ug/L
  dClo_dt?: number;   // derivative
  dThm_dt?: number;   // derivative
  cloStatus: 'safe' | 'low';
  thmStatus: 'safe' | 'exceeded';
}

export interface PhysicalMetrics {
  k_w: number;               // Wall reaction decay rate (m/h)
  k_f: number;               // THM formation rate (L/(mg*h))
  K_eff: number;             // Total effective Clo decay rate (1/h)
  SV_ratio: number;          // S/V ratio (m^-1)
  t_clo_critical: number | null; // Hour when Clo falls below safe min
  t_thm_critical: number | null; // Hour when THM exceeds safe max
  cloDecayPercent: number;   // % decay
  thmIncreasePercent: number;// % increase
  overallStatus: 'good' | 'warning' | 'danger';
  overallStatusText: string;
  overallStatusTextEn: string;
}

export interface PinnStepLog {
  step: number;
  realMse: number;
  kw: number;
  kf: number;
  w_bc_clo: number;
  w_bc_thm: number;
  lossBc: number;
  lossPde: number;
}
