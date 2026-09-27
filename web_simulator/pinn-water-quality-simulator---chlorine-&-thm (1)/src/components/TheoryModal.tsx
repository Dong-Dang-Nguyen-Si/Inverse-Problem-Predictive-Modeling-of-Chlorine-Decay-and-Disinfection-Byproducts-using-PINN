import React from 'react';
import { Language } from '../types/pinn';
import { BookOpen, X, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const TheoryModal: React.FC<Props> = ({ isOpen, onClose, lang = 'en' }) => {
  const isEn = lang === 'en';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEn
                  ? 'Mathematical Formulation: ODE System & Physics-Informed Neural Networks (PINN)'
                  : 'Cơ Sở Lý Thuyết Phương Trình Vi Phân (ODE) & Mạng Nơ-ron PINN'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEn
                  ? 'Kinetics of Chlorine Disinfection Decay & Trihalomethanes (THM) Formation'
                  : 'Mô hình hóa động học Clo khử trùng & Phụ phẩm Trihalomethanes (THM)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 text-xs text-slate-300 space-y-5 leading-relaxed">
          {/* Section 1: System of ODEs */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h4 className="text-sm font-bold text-cyan-400 mb-2">
              {isEn ? '1. Governing Differential Equations (ODE System)' : '1. Hệ phương trình vi phân động học (ODE System)'}
            </h4>
            <p className="text-slate-300 mb-3">
              {isEn
                ? 'Across the water distribution network and storage tanks over retention time t ∈ [0, 72] hours, free chlorine decays while carcinogenic disinfection byproducts (THM) evolve according to:'
                : 'Trong mạng lưới cấp nước và bể lưu chứa thời gian t ∈ [0, 72] giờ, nồng độ Clo tự do suy giảm và phụ phẩm THM được sinh ra theo hệ ODE:'}
            </p>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-sm text-cyan-200 space-y-2">
              <div>
                <strong>{isEn ? '(1) Chlorine Decay:' : '(1) Suy giảm Clo:'}</strong> dC_Cl / dt = -(k_b + (S / V) · k_w) · C_Cl
              </div>
              <div>
                <strong>{isEn ? '(2) THM Formation:' : '(2) Hình thành THM:'}</strong> dC_THM / dt = k_f · [TOC] · C_Cl · tⁿ &nbsp; (with n = 0)
              </div>
            </div>
          </div>

          {/* Section 2: Parameters meaning */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h4 className="text-sm font-bold text-emerald-400 mb-2">
              {isEn ? '2. Physical Interpretation of Model Parameters' : '2. Ý nghĩa vật lý của các thông số'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-bold text-rose-400">k_b (Bulk decay coefficient):</span>
                <p className="text-slate-400 mt-1">
                  {isEn
                    ? 'Decay rate of chlorine in bulk treated water produced by the treatment plant (WTP), typically fixed at 0.02 h⁻¹.'
                    : 'Hệ số phân rã Clo trong khối nước xử lý tại nhà máy nước (WTP), thường cố định khoảng 0.02 h⁻¹.'}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-bold text-rose-400">k_w (Wall reaction coefficient):</span>
                <p className="text-slate-400 mt-1">
                  {isEn
                    ? 'Reaction rate of chlorine with inner pipe wall deposits, biofilms, and corrosion scales (m/h).'
                    : 'Hệ số phản ứng tiêu thụ Clo trên bề mặt thành ống/bể chứa do màng sinh học và cặn gỉ kim loại (m/h).'}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-bold text-blue-400">k_f (THM formation rate):</span>
                <p className="text-slate-400 mt-1">
                  {isEn
                    ? 'Kinetic rate constant governing the formation of carcinogenic THM compounds from residual chlorine and natural organic matter (L/(mg·h)).'
                    : 'Hệ số tốc độ phản ứng tạo phụ phẩm độc hại THM giữa Clo dư và chất hữu cơ tự nhiên (L/(mg·h)).'}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-bold text-emerald-400">TOC (Total Organic Carbon):</span>
                <p className="text-slate-400 mt-1">
                  {isEn
                    ? 'Concentration of natural organic precursors dissolved in raw water (mg/L). High spring runoff elevates TOC and accelerates THM formation.'
                    : 'Tổng cacbon hữu cơ hòa tan trong nước (mg/L). Nước mùa xuân hoặc lũ lụt có TOC cao làm tăng vọt lượng THM.'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: PINN Explanation */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h4 className="text-sm font-bold text-violet-400 mb-2">
              {isEn ? '3. Physics-Informed Neural Network (PINN) Formulation' : '3. Cơ chế hoạt động của Mạng nơ-ron Thông tin Vật lý (PINN)'}
            </h4>
            <p className="text-slate-300 mb-3">
              {isEn
                ? 'Unlike purely data-driven black-box machine learning models that require immense labeled datasets, PINN embeds the actual conservation laws and differential equations directly into the loss function:'
                : 'Khác với Machine Learning truyền thống cần hàng triệu điểm dữ liệu huấn luyện, PINN tận dụng chính phương trình vi phân định luật vật lý để làm hàm mục tiêu (Loss Function):'}
            </p>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span>
                  <strong>{isEn ? 'Boundary Condition Loss (Loss BC):' : 'Loss Điều kiện biên (Loss BC):'}</strong>{' '}
                  {isEn
                    ? 'Constrains the neural network to strictly match the empirical benchmark concentrations at the intake (t=0) and terminal nodes (t=72h): (0, C₀), (72, C_end), (0, THM₀), (72, THM_end).'
                    : 'Bắt mạng nơ-ron phải đi qua đúng điểm thực nghiệm tại đầu mạng lưới t=0 và cuối mạng lưới t=72h: (0, C_0), (72, C_end), (0, THM_0), (72, THM_end).'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span>
                  <strong>{isEn ? 'Physics Residual Loss (Loss PDE):' : 'Loss Phương trình vi phân (Loss PDE):'}</strong>{' '}
                  {isEn
                    ? 'Leverages automatic differentiation (Autograd) to evaluate exact analytical derivatives dC_Cl/dt and dC_THM/dt at Nf = 250 Latin Hypercube Sampled (LHS) collocation points, penalizing violations of physical kinetics.'
                    : 'Sử dụng đạo hàm tự động (Autograd) để tính đạo hàm dC_Cl/dt và dC_THM/dt tại N_f = 250 điểm Collocation lấy mẫu theo Latin Hypercube Sampling (LHS), phạt bất kỳ sai lệch nào so với định luật vật lý.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span>
                  <strong>{isEn ? 'Inverse Parameter Estimation:' : 'Giải bài toán nghịch (Inverse Problem):'}</strong>{' '}
                  {isEn
                    ? 'Instead of costly in-situ tracer studies or underground pipe inspections, the neural network optimizes latent parameters kw and kf alongside network weights via homoscedastic uncertainty self-balancing.'
                    : 'Thay vì phải đo đạc tốn kém trong lòng ống nước ngầm, PINN tự học và suy đoán ra chính xác hệ số bám cặn k_w và hệ số tạo THM k_f tối ưu!'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
