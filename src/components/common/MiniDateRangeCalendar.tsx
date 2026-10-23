import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plane,
  Palmtree,
  Clock,
  Sparkles,
  RotateCcw,
  Check,
  ArrowRight,
  Info,
} from 'lucide-react';

export interface MiniDateRangeCalendarProps {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  onChange: (startDate: string, endDate: string, durationNights: number, durationDays: number) => void;
  minDate?: string; // YYYY-MM-DD (defaults to today)
  isLocalTrip?: boolean;
  destinationName?: string;
  className?: string;
}

// Date helper functions (local timezone safe to prevent UTC offset shifts)
export const parseLocalDate = (dateStr: string): Date | null => {
  if (!dateStr || !dateStr.includes('-')) return null;
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
};

export const formatLocalDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (dateStr: string): string => {
  const d = parseLocalDate(dateStr);
  if (!d) return '';
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatShortDisplay = (dateStr: string): string => {
  const d = parseLocalDate(dateStr);
  if (!d) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const MiniDateRangeCalendar: React.FC<MiniDateRangeCalendarProps> = ({
  startDate,
  endDate,
  onChange,
  minDate,
  isLocalTrip = false,
  destinationName,
  className = '',
}) => {
  // Compute minimum selectable date (today by default)
  const todayStr = useMemo(() => {
    return minDate || formatLocalDate(new Date());
  }, [minDate]);

  // Which date is the user currently targeting to select next
  const [activeTarget, setActiveTarget] = useState<'start' | 'end'>('start');
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Calendar displayed month & year
  const initialDate = useMemo(() => {
    if (startDate) {
      const d = parseLocalDate(startDate);
      if (d) return d;
    }
    return parseLocalDate(todayStr) || new Date();
  }, [startDate, todayStr]);

  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth()); // 0-11

  // Handle month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Jump to specific month/year
  const handleJumpMonthYear = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [y, m] = e.target.value.split('-').map(Number);
    setViewYear(y);
    setViewMonth(m);
  };

  // Check if prev month is disabled (cannot go earlier than current month of today)
  const isPrevDisabled = useMemo(() => {
    const t = parseLocalDate(todayStr);
    if (!t) return false;
    return viewYear < t.getFullYear() || (viewYear === t.getFullYear() && viewMonth <= t.getMonth());
  }, [viewYear, viewMonth, todayStr]);

  // Generate 24 upcoming month options for quick jump dropdown
  const monthOptions = useMemo(() => {
    const list: { label: string; value: string }[] = [];
    const now = new Date();
    const currYear = now.getFullYear();
    const currMonth = now.getMonth();

    for (let i = 0; i < 24; i++) {
      const d = new Date(currYear, currMonth + i, 1);
      const val = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      list.push({ label, value: val });
    }
    return list;
  }, []);

  // Compute duration in nights and days
  const { nightsCount, daysCount } = useMemo(() => {
    if (!startDate || !endDate) return { nightsCount: 0, daysCount: 0 };
    const s = parseLocalDate(startDate);
    const e = parseLocalDate(endDate);
    if (!s || !e || e < s) return { nightsCount: 0, daysCount: 0 };
    const diffTime = e.getTime() - s.getTime();
    const nights = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return {
      nightsCount: nights,
      daysCount: nights + 1,
    };
  }, [startDate, endDate]);

  // Calendar matrix calculation for viewYear and viewMonth
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
    const totalDays = lastDayOfMonth.getDate();

    const days: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isPast: boolean;
      isToday: boolean;
    }[] = [];

    // Empty padding slots for days before the 1st
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(viewYear, viewMonth, -startingDayOfWeek + i + 1);
      const str = formatLocalDate(prevMonthDay);
      days.push({
        dateStr: str,
        dayNumber: prevMonthDay.getDate(),
        isCurrentMonth: false,
        isPast: str < todayStr,
        isToday: str === todayStr,
      });
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(viewYear, viewMonth, d);
      const str = formatLocalDate(dateObj);
      days.push({
        dateStr: str,
        dayNumber: d,
        isCurrentMonth: true,
        isPast: str < todayStr,
        isToday: str === todayStr,
      });
    }

    return days;
  }, [viewYear, viewMonth, todayStr]);

  // Handle day click
  const handleDayClick = (dateStr: string) => {
    if (dateStr < todayStr) return; // Ignore past dates

    if (activeTarget === 'start') {
      // User is picking arrival date
      if (!endDate) {
        // No departure yet -> set arrival, prompt for departure next
        onChange(dateStr, '', 0, 0);
        setActiveTarget('end');
      } else {
        // Departure exists
        if (dateStr > endDate) {
          // If clicked date is after current end date, reset end date
          onChange(dateStr, '', 0, 0);
          setActiveTarget('end');
        } else {
          // Valid new start date before current end date
          const s = parseLocalDate(dateStr)!;
          const e = parseLocalDate(endDate)!;
          const nights = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
          onChange(dateStr, endDate, nights, nights + 1);
          setActiveTarget('end');
        }
      }
    } else {
      // User is picking departure date
      if (!startDate) {
        // If start date wasn't set yet, set as start date
        onChange(dateStr, '', 0, 0);
        setActiveTarget('end');
      } else if (dateStr < startDate) {
        // Clicked date is earlier than start date -> set this as new start date
        onChange(dateStr, '', 0, 0);
        setActiveTarget('end');
      } else {
        // Set departure date
        const s = parseLocalDate(startDate)!;
        const e = parseLocalDate(dateStr)!;
        const nights = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
        onChange(startDate, dateStr, nights, nights + 1);
        setActiveTarget('start'); // cycle back or stay
      }
    }
  };

  // Apply quick duration presets from selected start date
  const handleApplyPreset = (nights: number) => {
    let baseDateStr = startDate;
    if (!baseDateStr || baseDateStr < todayStr) {
      // If no start date selected, use tomorrow as base
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      baseDateStr = formatLocalDate(tomorrow);
    }

    const start = parseLocalDate(baseDateStr)!;
    const end = new Date(start);
    end.setDate(end.getDate() + nights);
    const endDateStr = formatLocalDate(end);

    onChange(baseDateStr, endDateStr, nights, nights + 1);
    setActiveTarget('start');

    // Ensure calendar views the departure month if it rolled over
    if (end.getFullYear() !== viewYear || end.getMonth() !== viewMonth) {
      setViewYear(start.getFullYear());
      setViewMonth(start.getMonth());
    }
  };

  // Clear dates
  const handleClear = () => {
    onChange('', '', 0, 0);
    setActiveTarget('start');
  };

  // Month title formatter
  const currentMonthTitle = useMemo(() => {
    return new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [viewYear, viewMonth]);

  const activeValueMonthKey = `${viewYear}-${viewMonth}`;

  return (
    <div
      className={`bg-white border border-purple-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 ${className}`}
      id="mini-date-range-calendar"
    >
      {/* Top Banner & Destination Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#2E0249] text-[#FFC72C] flex items-center justify-center shrink-0 shadow-2xs">
            {isLocalTrip ? <Palmtree className="w-4 h-4" /> : <Plane className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-[#2E0249] flex items-center gap-1.5">
              <span>{isLocalTrip ? 'Local Jamaican Excursion' : 'International Custom Trip'}</span>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.2 rounded-full border border-amber-300">
                Interactive Calendar
              </span>
            </div>
            <div className="text-[11px] text-neutral-500">
              {destinationName
                ? `Select exact dates for ${destinationName}`
                : 'Choose your arrival (check-in) and departure (check-out) dates'}
            </div>
          </div>
        </div>

        {/* Clear or Reset Button */}
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={handleClear}
            className="self-end sm:self-auto text-xs text-neutral-500 hover:text-rose-600 font-bold flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-neutral-100 cursor-pointer"
            title="Reset selected dates"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Dates</span>
          </button>
        )}
      </div>

      {/* Arrival & Departure Dual Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Arrival Date Card */}
        <button
          type="button"
          onClick={() => setActiveTarget('start')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
            activeTarget === 'start'
              ? 'bg-purple-50/80 border-[#2E0249] ring-2 ring-[#2E0249]/20 shadow-xs'
              : 'bg-neutral-50/80 border-neutral-200 hover:border-purple-300'
          }`}
          id="btn-select-arrival-date"
        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-[#2E0249]" />
              <span>{isLocalTrip ? 'Arrival (Check-in)' : 'Departure / Fly Out'}</span>
            </span>
            {activeTarget === 'start' && (
              <span className="text-[10px] bg-[#2E0249] text-[#FFC72C] font-bold px-1.5 py-0.2 rounded-md animate-pulse">
                Click Calendar Day
              </span>
            )}
          </div>
          <div className="text-sm font-black text-neutral-900 truncate">
            {startDate ? formatDisplayDate(startDate) : (
              <span className="text-neutral-400 font-medium">Select Arrival Date</span>
            )}
          </div>
        </button>

        {/* Departure Date Card */}
        <button
          type="button"
          onClick={() => setActiveTarget('end')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
            activeTarget === 'end'
              ? 'bg-purple-50/80 border-[#2E0249] ring-2 ring-[#2E0249]/20 shadow-xs'
              : 'bg-neutral-50/80 border-neutral-200 hover:border-purple-300'
          }`}
          id="btn-select-departure-date"
        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-purple-700" />
              <span>{isLocalTrip ? 'Departure (Check-out)' : 'Return / Fly Home'}</span>
            </span>
            {activeTarget === 'end' && (
              <span className="text-[10px] bg-[#2E0249] text-[#FFC72C] font-bold px-1.5 py-0.2 rounded-md animate-pulse">
                Click Calendar Day
              </span>
            )}
          </div>
          <div className="text-sm font-black text-neutral-900 truncate">
            {endDate ? formatDisplayDate(endDate) : (
              <span className="text-neutral-400 font-medium">Select Departure Date</span>
            )}
          </div>
        </button>
      </div>

      {/* Duration Summary Pill (if dates chosen) */}
      {startDate && endDate && nightsCount > 0 && (
        <div className="bg-gradient-to-r from-purple-50 via-amber-50/70 to-purple-50 p-2.5 rounded-xl border border-purple-200/80 flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#2E0249] text-[#FFC72C] flex items-center justify-center shrink-0 font-black text-[10px]">
              <Clock className="w-3.5 h-3.5" />
            </span>
            <span className="text-neutral-800 font-semibold">
              Trip Duration: <strong className="text-[#2E0249] font-black">{nightsCount} {nightsCount === 1 ? 'Night' : 'Nights'} / {daysCount} Days</strong>
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
            {formatShortDisplay(startDate)} → {formatShortDisplay(endDate)}
          </span>
        </div>
      )}

      {/* Mini Calendar Header: Month navigation & Quick Jump */}
      <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 space-y-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={isPrevDisabled}
            className="p-1.5 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-700 transition-all cursor-pointer"
            aria-label="Previous month"
            id="mini-calendar-prev-month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Month / Year Title with Jump Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-extrabold text-[#2E0249]">
              {currentMonthTitle}
            </span>
            <select
              value={activeValueMonthKey}
              onChange={handleJumpMonthYear}
              className="text-[11px] font-semibold bg-white border border-neutral-300 rounded-lg px-2 py-1 text-neutral-700 outline-none focus:ring-1 focus:ring-[#2E0249] cursor-pointer"
              aria-label="Jump to month and year"
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 transition-all cursor-pointer"
            aria-label="Next month"
            id="mini-calendar-next-month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, idx) => (
            <div
              key={d}
              className={`text-[10px] font-black uppercase tracking-wider py-1 ${
                idx === 0 || idx === 6 ? 'text-purple-900 font-extrabold' : 'text-neutral-500'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center" onMouseLeave={() => setHoverDate(null)}>
          {calendarDays.map((item, idx) => {
            const isStart = startDate === item.dateStr;
            const isEnd = endDate === item.dateStr;
            const inSelectedRange =
              startDate && endDate && item.dateStr > startDate && item.dateStr < endDate;

            // Hover preview range logic
            const inHoverRange =
              startDate &&
              !endDate &&
              hoverDate &&
              hoverDate > startDate &&
              item.dateStr > startDate &&
              item.dateStr <= hoverDate;

            let dayBtnClass = 'text-neutral-800 hover:bg-purple-100 hover:text-[#2E0249]';

            if (!item.isCurrentMonth) {
              dayBtnClass = 'text-neutral-300 hover:bg-neutral-100';
            }

            if (item.isPast) {
              dayBtnClass = 'text-neutral-300 cursor-not-allowed opacity-40 hover:bg-transparent';
            } else if (isStart && isEnd) {
              dayBtnClass = 'bg-[#2E0249] text-[#FFC72C] font-black rounded-xl shadow-xs ring-2 ring-[#FFC72C]';
            } else if (isStart) {
              dayBtnClass = 'bg-[#2E0249] text-[#FFC72C] font-black rounded-l-xl rounded-r-none shadow-xs';
            } else if (isEnd) {
              dayBtnClass = 'bg-[#2E0249] text-white font-black rounded-r-xl rounded-l-none shadow-xs border-r-2 border-[#FFC72C]';
            } else if (inSelectedRange) {
              dayBtnClass = 'bg-purple-100 text-purple-950 font-bold rounded-none';
            } else if (inHoverRange) {
              dayBtnClass = 'bg-purple-50 text-[#2E0249] font-medium rounded-none';
            }

            return (
              <button
                key={`${item.dateStr}-${idx}`}
                type="button"
                disabled={item.isPast}
                onClick={() => handleDayClick(item.dateStr)}
                onMouseEnter={() => !item.isPast && setHoverDate(item.dateStr)}
                className={`h-8 sm:h-9 text-xs font-semibold flex flex-col items-center justify-center transition-all relative cursor-pointer ${dayBtnClass}`}
                title={
                  item.isPast
                    ? 'Past date unavailable'
                    : isStart
                    ? `Arrival: ${formatDisplayDate(item.dateStr)}`
                    : isEnd
                    ? `Departure: ${formatDisplayDate(item.dateStr)}`
                    : formatDisplayDate(item.dateStr)
                }
              >
                <span>{item.dayNumber}</span>
                {item.isToday && !isStart && !isEnd && (
                  <span className="w-1 h-1 rounded-full bg-amber-500 absolute bottom-1"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Helper Legend */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-neutral-500 border-t border-neutral-200/70">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#2E0249]"></span>
              <span>Selected Date</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-purple-100 border border-purple-300"></span>
              <span>Trip Range</span>
            </span>
          </div>

          <span className="italic">
            {!startDate
              ? 'Click to set Arrival Date'
              : !endDate
              ? 'Now click your Departure Date'
              : 'Dates locked • Click any day to adjust'}
          </span>
        </div>
      </div>

      {/* Quick Length Presets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Duration Presets:</span>
          </label>
          <span className="text-[10px] text-neutral-500">
            {startDate ? `Calculated from ${formatShortDisplay(startDate)}` : 'Calculated from tomorrow'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {[
            { nights: 2, label: '3 Days (Weekend)', badge: '2 Nights' },
            { nights: 4, label: '5 Days (Getaway)', badge: '4 Nights' },
            { nights: 6, label: '7 Days (1 Week)', badge: '6 Nights' },
            { nights: 9, label: '10 Days', badge: '9 Nights' },
            { nights: 13, label: '14 Days (2 Wks)', badge: '13 Nights' },
          ].map((preset) => {
            const isMatch = nightsCount === preset.nights;
            return (
              <button
                key={preset.nights}
                type="button"
                onClick={() => handleApplyPreset(preset.nights)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition-all border cursor-pointer ${
                  isMatch
                    ? 'bg-[#2E0249] text-[#FFC72C] border-[#2E0249] shadow-xs'
                    : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-300'
                }`}
              >
                <div className="font-bold leading-tight">{preset.label}</div>
                <div className={`text-[10px] ${isMatch ? 'text-purple-200' : 'text-neutral-500'}`}>
                  {preset.badge}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
