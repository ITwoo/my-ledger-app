'use client';

import { useState, useEffect } from 'react';
import { Transaction, api } from './lib/api';
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import BigCalendar from './components/BigCalendar';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function toYmd(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toYmdFrom(year: number, month: number, day: number) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function isSameYearMonth(ymd: string, year: number, month: number) {
  return ymd.startsWith(`${year}-${pad2(month)}-`);
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<{ totalIncome: number; totalExpense: number; balance: number } | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(() => toYmd(new Date()));
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    amount: '',
    category: '',
    description: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    date: toYmd(new Date()),
  });

  useEffect(() => {
    loadData();
  }, [year, month]);

  useEffect(() => {
    // 월 이동 시 선택 날짜가 해당 월 밖이면 1일로 보정
    setSelectedDate(prev => (isSameYearMonth(prev, year, month) ? prev : toYmdFrom(year, month, 1)));
  }, [year, month]);

  const loadData = async () => {
    const [txns, stat] = await Promise.all([
      api.getTransactions({ year, month }),
      api.getStatistics(year, month),
    ]);
    setTransactions(txns);
    setStats(stat);
  };

  const openCreateForDate = (ymd: string) => {
    setEditingId(null);
    setForm({ amount: '', category: '', description: '', type: 'EXPENSE', date: ymd });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await api.updateTransaction(editingId, { ...form, amount: Number(form.amount) });
    } else {
      await api.createTransaction({ ...form, amount: Number(form.amount) });
    }
    setForm({ amount: '', category: '', description: '', type: 'EXPENSE', date: selectedDate });
    setShowForm(false);
    setEditingId(null);
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (confirm('삭제하시겠습니까?')) {
      await api.deleteTransaction(id);
      loadData();
    }
  };

  const handleEdit = (tx: Transaction) => {
    setForm({
      amount: tx.amount.toString(),
      category: tx.category,
      description: tx.description || '',
      type: tx.type,
      date: tx.date,
    });
    setSelectedDate(tx.date);
    setEditingId(tx.id);
    setShowForm(true);
  };

  const dayBadges = transactions.reduce((acc, tx) => {
    if (!acc[tx.date]) acc[tx.date] = { count: 0, sumExpense: 0, sumIncome: 0 };
    acc[tx.date].count = (acc[tx.date].count ?? 0) + 1;
    if (tx.type === 'EXPENSE') acc[tx.date].sumExpense = (acc[tx.date].sumExpense ?? 0) + Number(tx.amount);
    if (tx.type === 'INCOME') acc[tx.date].sumIncome = (acc[tx.date].sumIncome ?? 0) + Number(tx.amount);
    return acc;
  }, {} as Record<string, { count?: number; sumExpense?: number; sumIncome?: number }>);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-800">가계부</h1>
          <p className="text-sm text-gray-500 mt-1">연간/monthly 지출 관리</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600">선택한 날짜</div>
            <div className="font-semibold text-gray-900">{selectedDate}</div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="px-3 py-2 border rounded-lg bg-white"
            >
              {[2023, 2024, 2025, 2026].map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => openCreateForDate(selectedDate)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={18} />
              선택한 날짜에 추가
            </button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <TrendingUp size={20} />
                <span className="text-sm">총 수입</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.totalIncome.toLocaleString()}원</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <TrendingDown size={20} />
                <span className="text-sm">총 지출</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{stats.totalExpense.toLocaleString()}원</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <PieChart size={20} />
                <span className="text-sm">수지 차액</span>
              </div>
              <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {stats.balance.toLocaleString()}원
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <BigCalendar
            value={{ year, month, selectedDate }}
            onChangeMonth={({ year: y, month: m }) => {
              setYear(y);
              setMonth(m);
            }}
            onSelectDate={(ymd) => {
              setSelectedDate(ymd);
              if (!showForm || !editingId) {
                setForm(f => ({ ...f, date: ymd }));
              }
            }}
            dayBadges={dayBadges}
          />

          <aside className="space-y-6">
            {showForm && (
              <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="font-semibold text-gray-900">
                    {editingId ? '거래 수정' : '거래 추가'}
                  </div>
                  <div className="text-xs text-gray-500">{form.date}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">금액</label>
                    <input
                      type="number"
                      value={form.amount}
                      onChange={e => setForm({ ...form, amount: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">유형</label>
                    <select
                      value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value as 'INCOME' | 'EXPENSE' })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="EXPENSE">지출</option>
                      <option value="INCOME">수입</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">카테고리</label>
                    <input
                      type="text"
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="예: 식비, 교통비"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">날짜</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={e => {
                        setForm({ ...form, date: e.target.value });
                        setSelectedDate(e.target.value);
                      }}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">설명</label>
                    <input
                      type="text"
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="메모 (선택)"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {editingId ? '수정' : '추가'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    닫기
                  </button>
                </div>
              </form>
            )}

            {!showForm && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <div className="font-semibold text-gray-900 mb-2">빠른 추가</div>
                <p className="text-sm text-gray-600 mb-4">
                  달력에서 날짜를 선택한 뒤, 상단의 “선택한 날짜에 추가”를 눌러주세요.
                </p>
                <button
                  type="button"
                  onClick={() => openCreateForDate(selectedDate)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedDate}에 추가
                </button>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50">
                <div className="font-semibold text-gray-900 text-sm">거래 내역</div>
                <div className="text-xs text-gray-500 mt-0.5">월 전체 내역이 표시됩니다</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead className="bg-white sticky top-0">
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 w-24">날짜</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 w-28">카테고리</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 w-36">설명</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 w-28">금액</th>
                      {/* <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 w-20">작업</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          거래 내역이 없습니다
                        </td>
                      </tr>
                    ) : (
                      transactions.map(tx => (
                        <tr key={tx.id} className={`border-b hover:bg-gray-50 ${tx.date === selectedDate ? 'bg-blue-50/50' : ''}`}>
                          <td className="px-4 py-3 text-sm whitespace-nowrap w-24">{tx.date}</td>
                          <td className="px-4 py-3 w-28">
                            <span
                              className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                                tx.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {tx.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 w-48 truncate" title={tx.description || undefined}>
                            {tx.description || '-'}
                          </td>
                          <td className={`px-4 py-3 text-right font-medium whitespace-nowrap w-28 ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type === 'INCOME' ? '+' : '-'}
                            {Number(tx.amount).toLocaleString()}원
                          </td>
                          {/* <td className="px-4 py-3 w-20">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => handleEdit(tx)} className="p-1 hover:bg-gray-100 rounded">
                                <Edit2 size={16} className="text-gray-500" />
                              </button>
                              <button onClick={() => handleDelete(tx.id)} className="p-1 hover:bg-gray-100 rounded">
                                <Trash2 size={16} className="text-red-500" />
                              </button>
                            </div>
                          </td> */}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
