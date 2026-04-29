import { ChevronLeft, ChevronRight } from 'lucide-react';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function toYmd(year: number, month: number, day: number) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function daysInMonth(year: number, month: number) {
  // month: 1-12
  return new Date(year, month, 0).getDate();
}

function startWeekday(year: number, month: number) {
  // 0(Sun) ... 6(Sat)
  return new Date(year, month - 1, 1).getDay();
}

export type BigCalendarValue = {
  year: number;
  month: number; // 1-12
  selectedDate: string; // YYYY-MM-DD
};

export default function BigCalendar({
  value,
  onChangeMonth,
  onSelectDate,
  dayBadges,
}: {
  value: BigCalendarValue;
  onChangeMonth: (next: { year: number; month: number }) => void;
  onSelectDate: (ymd: string) => void;
  dayBadges?: Record<string, { count?: number; sumExpense?: number; sumIncome?: number }>;
}) {
  const { year, month, selectedDate } = value;
  const dim = daysInMonth(year, month);
  const start = startWeekday(year, month);

  const cells: Array<{ ymd: string; day: number } | null> = [];
  for (let i = 0; i < start; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push({ ymd: toYmd(year, month, d), day: d });
  while (cells.length % 7 !== 0) cells.push(null);
  while (cells.length < 42) cells.push(null); // 6주 고정

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  const goPrev = () => {
    const nextMonth = month === 1 ? 12 : month - 1;
    const nextYear = month === 1 ? year - 1 : year;
    onChangeMonth({ year: nextYear, month: nextMonth });
  };
  const goNext = () => {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    onChangeMonth({ year: nextYear, month: nextMonth });
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="p-2 rounded-lg hover:bg-gray-100"
            aria-label="이전 달"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-lg font-semibold text-gray-900">
            {year}년 {month}월
          </div>
          <button
            type="button"
            onClick={goNext}
            className="p-2 rounded-lg hover:bg-gray-100"
            aria-label="다음 달"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="text-xs text-gray-500 hidden sm:block">날짜를 클릭해서 바로 추가하세요</div>
      </div>

      <div className="grid grid-cols-7 bg-gray-50 border-b">
        {weekdays.map((w, idx) => (
          <div
            key={w}
            className={`py-3 text-center text-xs font-semibold ${
              idx === 0 ? 'text-red-600' : idx === 6 ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          if (!cell) {
            return <div key={`empty-${i}`} className="h-24 sm:h-28 border-b border-r last:border-r-0" />;
          }

          const isSelected = cell.ymd === selectedDate;
          const badge = dayBadges?.[cell.ymd];
          const isWeekend = i % 7 === 0 || i % 7 === 6;

          return (
            <button
              key={cell.ymd}
              type="button"
              onClick={() => onSelectDate(cell.ymd)}
              className={[
                'h-24 sm:h-28 border-b border-r last:border-r-0 p-2 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 flex flex-col items-start',
                isSelected ? 'bg-blue-50' : '',
              ].join(' ')}
            >
              <div className="flex items-start justify-start gap-2 self-start">
                <div className={`text-sm font-semibold ${isWeekend ? 'text-gray-700' : 'text-gray-900'}`}>
                  {cell.day}
                </div>
                {badge?.count ? (
                  <div className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-gray-900 text-white">
                    {badge.count}
                  </div>
                ) : null}
              </div>

              {(badge?.sumExpense || badge?.sumIncome) && (
                <div className="mt-2 space-y-1">
                  {badge.sumExpense ? (
                    <div className="text-xs text-red-600 font-medium truncate">
                      -{badge.sumExpense.toLocaleString()}원
                    </div>
                  ) : null}
                  {badge.sumIncome ? (
                    <div className="text-xs text-green-700 font-medium truncate">
                      +{badge.sumIncome.toLocaleString()}원
                    </div>
                  ) : null}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
