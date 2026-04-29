'use client';

import { useState } from 'react';
import { api } from '../lib/api';
import { Sparkles, Send, Loader2 } from 'lucide-react';

interface ParsedTransaction {
  amount: number;
  category: string;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  date?: string;
}

export default function AiPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParsedTransaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleParse = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);

    try {
      const res = await fetch('http://localhost:3001/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      
      if (!res.ok) throw new Error('解析에 실패했습니다');
      
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError('AI 처리에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    
    setLoading(true);
    try {
      await api.parseAndSave(input);
      setSaved(true);
    } catch (err) {
      setError('저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-800">AI 입력</h1>
          <p className="text-sm text-gray-500 mt-1">자연어로 거래를 입력하세요</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-purple-500" size={24} />
            <span className="font-semibold">AI 거래 입력</span>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            예: "오늘 점심으로 피자 15000원 먹었다", "월급 200만원 받았다"
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleParse()}
              placeholder="거래 내용을 입력하세요..."
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleParse}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              분석
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-3">분석 결과</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">유형:</span>
                  <span className={`ml-2 font-medium ${result.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {result.type === 'INCOME' ? '수입' : '지출'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">금액:</span>
                  <span className="ml-2 font-medium">{result.amount.toLocaleString()}원</span>
                </div>
                <div>
                  <span className="text-gray-500">카테고리:</span>
                  <span className="ml-2 font-medium">{result.category}</span>
                </div>
                <div>
                  <span className="text-gray-500">날짜:</span>
                  <span className="ml-2 font-medium">{result.date || new Date().toISOString().split('T')[0]}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">설명:</span>
                  <span className="ml-2 font-medium">{result.description}</span>
                </div>
              </div>

              {!saved && (
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="mt-4 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  가계부에 저장
                </button>
              )}

              {saved && (
                <div className="mt-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm text-center">
                  ✓ 저장되었습니다
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold mb-4">사용 예시</h2>
          <div className="space-y-3 text-sm">
            {[
              '오늘 점심으로 김치찌개 8000원 먹었다',
              '월급 250만원 받았다',
              '택시 타고 4500원 지출',
              '장보기 위해 마트에서 52000원 결제',
              '알바비 10만원 받음',
            ].map((example, i) => (
              <button
                key={i}
                onClick={() => setInput(example)}
                className="block w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}