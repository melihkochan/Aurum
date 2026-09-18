import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check } from 'lucide-react';
import { GoldModal } from '../ui/GoldModal';

interface GoalDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
  onSelectDate: (dateStr: string) => void;
}

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const WEEKDAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export const GoalDatePicker: React.FC<GoalDatePickerProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
}) => {
  // Parse initial date or default to 1 year from now
  const parseInitialDate = () => {
    if (selectedDate) {
      // Try to parse "18 Eylül 2027"
      const parts = selectedDate.split(' ');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const monthIdx = MONTH_NAMES.indexOf(parts[1]);
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && monthIdx !== -1 && !isNaN(year)) {
          return new Date(year, monthIdx, day);
        }
      }
      const parsed = new Date(selectedDate);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d;
  };

  const [activeDate, setActiveDate] = useState<Date>(parseInitialDate);
  const [viewYear, setViewYear] = useState<number>(activeDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(activeDate.getMonth());

  const formatDisplayDate = (d: Date) => {
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const newDate = new Date(viewYear, viewMonth, day);
    setActiveDate(newDate);
  };

  const handleQuickAddMonths = (months: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    setActiveDate(d);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const handleConfirm = () => {
    onSelectDate(formatDisplayDate(activeDate));
    onClose();
  };

  // Compute days in month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  // Day of week for 1st day (0 = Sunday in JS, convert to 0 = Monday)
  const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

  const today = new Date();
  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear;

  const isSelected = (day: number) =>
    activeDate.getDate() === day && activeDate.getMonth() === viewMonth && activeDate.getFullYear() === viewYear;

  return (
    <GoldModal
      isOpen={isOpen}
      onClose={onClose}
      title="HEDEF TARİHİ"
      subtitle="Bu birikim hedefine ne zamana kadar ulaşmak istiyorsun?"
      maxWidth="max-w-sm"
    >
      <div className="space-y-4 pt-1">
        {/* Selected Date Callout */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E5B85C]/15 text-[#F5C042] flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Seçilen Hedef Tarihi</span>
              <span className="text-sm font-extrabold text-white">{formatDisplayDate(activeDate)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleQuickAddMonths(0)}
            className="text-[11px] font-bold text-[#E5B85C] hover:text-[#F5C042] transition-colors cursor-pointer"
          >
            Bugün
          </button>
        </div>

        {/* Quick Shortcuts */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => handleQuickAddMonths(6)}
            className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.05] text-[11px] font-semibold transition-all cursor-pointer"
          >
            +6 Ay
          </button>
          <button
            type="button"
            onClick={() => handleQuickAddMonths(12)}
            className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.05] text-[11px] font-semibold transition-all cursor-pointer"
          >
            +1 Yıl
          </button>
          <button
            type="button"
            onClick={() => handleQuickAddMonths(24)}
            className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.05] text-[11px] font-semibold transition-all cursor-pointer"
          >
            +2 Yıl
          </button>
          <button
            type="button"
            onClick={() => handleQuickAddMonths(36)}
            className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.05] text-[11px] font-semibold transition-all cursor-pointer"
          >
            +3 Yıl
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between px-1 pt-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-bold text-white text-sm">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="rounded-2xl bg-black/40 border border-white/[0.06] p-3">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {WEEKDAY_NAMES.map((d) => (
              <span key={d} className="text-[10px] font-bold uppercase text-zinc-500">
                {d}
              </span>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots for month start offset */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const selected = isSelected(day);
              const currentDay = isToday(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center relative ${
                    selected
                      ? 'bg-gradient-to-r from-[#F3C969] to-[#E5B85C] text-black font-extrabold shadow-[0_0_12px_rgba(229,184,92,0.4)] scale-105'
                      : currentDay
                      ? 'border border-[#E5B85C]/60 text-[#F5C042] bg-white/[0.04]'
                      : 'text-zinc-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#F3C969] via-[#E5B85C] to-[#D6A84F] text-[#0A0A0C] text-xs font-extrabold shadow-[0_4px_16px_rgba(229,184,92,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Tarihi Seç</span>
          </button>
        </div>
      </div>
    </GoldModal>
  );
};
