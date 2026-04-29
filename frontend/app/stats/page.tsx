'use client';

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon } from 'lucide-react';

interface Stats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byCategory: Record<string, number>;
  count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function StatsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState<number | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [report, setReport] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, [year, month]);

  const loadStats = async () => {
    const data = await api.getStatistics(year, month || undefined);
    setStats(data);
    
    if (month) {
      const reportData = await api.getReport(year, month);
      setReport(reportData.report);
    } else {
      setReport(null);
    }
  };

  const chartData = stats ? Object.entries(stats.byCategory).map(([name, value]) => ({
    name,
    value: Math.round(value),
  })) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-800">통계</h1>
          <p className="text-sm text-gray-500 mt-1">지출 분석 및 리포트</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Period Selector */}
        <div className="flex items-center gap-4 mb-6">
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="px-3 py-2 border rounded-lg"
          >
            {[2023, 2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          <select
            value={month || ''}
            onChange={e => setMonth(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">전체</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{m}월</option>
            ))}
          </select>
        </div>

        {stats && (
          <>
            {/* Summary Cards */}
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
                  <DollarSign size={20} />
                  <span className="text-sm">수지 차액</span>
                </div>
                <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {stats.balance.toLocaleString()}원
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Bar Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="font-semibold mb-4">카테고리별 지출</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) =>
                        `${Number(value ?? 0).toLocaleString()}원`
                      }
                    />
                    <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="font-semibold mb-4">지출 비율</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(((percent ?? 0) as number) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) =>
                        `${Number(value ?? 0).toLocaleString()}원`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Report */}
            {report && month && (
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <PieChartIcon size={20} />
                  AI 리포트
                </h3>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {report}
                </pre>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}