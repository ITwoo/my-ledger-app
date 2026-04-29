export interface Transaction {
  id: number;
  amount: number;
  category: string;
  description: string | null;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byCategory: Record<string, number>;
  count: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = {
  // 거래 내역 CRUD
  createTransaction: async (data: {
    amount: number;
    category: string;
    description?: string;
    type: 'INCOME' | 'EXPENSE';
    date: string;
  }) => {
    const res = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  getTransactions: async (params?: {
    year?: number;
    month?: number;
    day?: number;
    category?: string;
    type?: 'INCOME' | 'EXPENSE';
  }) => {
    const query = new URLSearchParams();
    if (params?.year) query.set('year', params.year.toString());
    if (params?.month) query.set('month', params.month.toString());
    if (params?.day) query.set('day', params.day.toString());
    if (params?.category) query.set('category', params.category);
    if (params?.type) query.set('type', params.type);
    
    const res = await fetch(`${API_URL}/transactions?${query}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  updateTransaction: async (id: number, data: Partial<{
    amount: number;
    category: string;
    description: string;
    type: 'INCOME' | 'EXPENSE';
    date: string;
  }>) => {
    const res = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  deleteTransaction: async (id: number) => {
    const res = await fetch(`${API_URL}/transactions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  // 통계
  getStatistics: async (year: number, month?: number) => {
    const query = `year=${year}${month ? `&month=${month}` : ''}`;
    const res = await fetch(`${API_URL}/transactions/statistics?${query}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  // AI
  parseAndSave: async (input: string) => {
    const res = await fetch(`${API_URL}/ai/parse-and-save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  getAnalysis: async (year: number, month: number) => {
    const res = await fetch(`${API_URL}/ai/analyze?year=${year}&month=${month}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  getReport: async (year: number, month?: number) => {
    const query = `year=${year}${month ? `&month=${month}` : ''}`;
    const res = await fetch(`${API_URL}/ai/report?${query}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};