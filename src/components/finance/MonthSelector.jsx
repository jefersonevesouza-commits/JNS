import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MONTH_NAMES } from '@/lib/utils';

export default function MonthSelector({ value, onChange }) {
  const [year, month] = value.split('-').map(Number);

  const navigate = (dir) => {
    let m = month + dir;
    let y = year;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    onChange(`${y}-${String(m).padStart(2, '0')}`);
  };

  return (
    <div className="flex items-center justify-between bg-card rounded-[22px] px-1.5 py-1 shadow-sm border border-border/30">
      <button
        onClick={() => navigate(-1)}
        className="w-9 h-9 rounded-full flex items-center justify-center text-foreground/60 hover:bg-muted transition-colors"
      >
        <ChevronLeft size={18} strokeWidth={2} />
      </button>
      <span className="text-[15px] font-semibold tracking-[-0.2px] text-foreground">
        {MONTH_NAMES[month - 1]} {year}
      </span>
      <button
        onClick={() => navigate(1)}
        className="w-9 h-9 rounded-full flex items-center justify-center text-foreground/60 hover:bg-muted transition-colors"
      >
        <ChevronRight size={18} strokeWidth={2} />
      </button>
    </div>
  );
}