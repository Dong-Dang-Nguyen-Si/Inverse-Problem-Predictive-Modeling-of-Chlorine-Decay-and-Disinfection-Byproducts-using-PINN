import React from 'react';
import { Language, SeasonId } from '../types/pinn';
import { SEASONS } from '../utils/pinnMath';
import { Sparkles } from 'lucide-react';

interface Props {
  currentSeasonId: SeasonId;
  onSelectSeason: (id: SeasonId) => void;
  lang?: Language;
}

export const SeasonSelector: React.FC<Props> = ({ currentSeasonId, onSelectSeason, lang = 'en' }) => {
  const isEn = lang === 'en';

  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              {isEn ? 'Seasonal Environmental Scenarios' : 'Chọn Mùa Môi Trường'}
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
                {isEn ? 'Experimental Presets' : 'Theo kịch bản thực nghiệm'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {isEn
                ? 'Select a season to automatically load baseline TOC, initial and endpoint THM / Chlorine bounds'
                : 'Chọn mùa để tự động áp dụng thông số TOC, THM ban đầu và THM điểm cuối'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {SEASONS.map((season) => {
          const isSelected = currentSeasonId === season.id;
          return (
            <button
              key={season.id}
              onClick={() => onSelectSeason(season.id)}
              className={`relative text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                isSelected
                  ? `border-cyan-400 ring-2 ring-cyan-400/30 bg-gradient-to-br ${season.bgGradient} shadow-lg shadow-cyan-950/40`
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60 text-slate-300'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              )}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-2xl">{season.icon}</span>
                <span className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                  {isEn ? season.englishName : season.vietnameseName}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {isEn ? season.englishDescription : season.description}
              </p>
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>TOC: <strong className="text-slate-200">{season.defaultParams.TOC}</strong> mg/L</span>
                <span>THM: <strong className="text-slate-200">{season.defaultParams.THM_initial} → {season.defaultParams.THM_end}</strong> µg/L</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

