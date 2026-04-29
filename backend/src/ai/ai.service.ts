// ai.service.ts
import { Injectable } from '@nestjs/common';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import type { Transaction } from '../transaction/transaction.entity';
import { TransactionType } from '../transaction/transaction.entity';

export interface ParsedTransaction {
  amount: number;
  category: string;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  date?: string;
}

export interface AnalysisResult {
  summary: string;
  suggestions: string[];
  category: string;
  trend: 'up' | 'down' | 'stable';
}

@Injectable()
export class AiService {
  private readonly model: ChatGoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GOOGLE_API_KEY가 설정되지 않았습니다. backend/.env 파일에 GOOGLE_API_KEY=your_key 를 추가한 뒤 서버를 재시작하세요.',
      );
    }

    this.model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-flash',
      temperature: 0,
      apiKey,
    });
  }

  async parseTransaction(input: string): Promise<ParsedTransaction> {
    const parser = new JsonOutputParser<ParsedTransaction>();
    const prompt = PromptTemplate.fromTemplate(`
      당신은 한국어 가계부 문장 파서입니다.
      사용자 문장에서 거래 1건을 추출하세요.

      규칙:
      - 응답은 반드시 JSON 객체 하나만 반환합니다.
      - 코드블록(\`\`\`)이나 설명 문장, 주석을 절대 포함하지 마세요.
      - amount는 숫자(number)만 반환합니다.
      - type은 반드시 "INCOME" 또는 "EXPENSE" 중 하나입니다.
      - date는 가능한 경우 "YYYY-MM-DD" 형식 문자열로 반환합니다.
      - 날짜를 알 수 없으면 date 필드는 생략 가능합니다.

      출력 스키마(반드시 준수):
      {{ "amount": number, "category": string, "description": string, "type": "INCOME" | "EXPENSE", "date"?: "YYYY-MM-DD" }}

      사용자 입력:
      {input}
    `);

    const chain = prompt.pipe(this.model).pipe(parser);
    const result = await chain.invoke({ input });
    return result as ParsedTransaction;
  }

  async analyzeSpending(transactions: Transaction[], year: number, month: number): Promise<AnalysisResult> {
    const parser = new JsonOutputParser<AnalysisResult>();
    const prompt = PromptTemplate.fromTemplate(`
      당신은 가계부 데이터 분석가입니다.
      주어진 기간의 거래 데이터를 분석해 결과를 JSON으로 반환하세요.

      규칙:
      - 응답은 반드시 JSON 객체 하나만 반환합니다.
      - 코드블록(\`\`\`)이나 설명 문장, 주석을 절대 포함하지 마세요.
      - summary는 1~2문장 한국어 요약입니다.
      - suggestions는 실행 가능한 절약/관리 제안 2~4개입니다.
      - category는 가장 주목할 카테고리 1개입니다.
      - trend는 "up" | "down" | "stable" 중 하나입니다.

      출력 스키마(반드시 준수):
      {{ "summary": string, "suggestions": string[], "category": string, "trend": "up" | "down" | "stable" }}

      분석 기간: {year}년 {month}월
      거래 데이터(JSON 문자열):
      {transactions}
    `);

    const chain = prompt.pipe(this.model).pipe(parser);
    return await chain.invoke({ 
      transactions: JSON.stringify(transactions),
      year: year.toString(),
      month: month.toString(),
    });
  }

  async generateReport(transactions: Transaction[], year: number, month?: number): Promise<string> {
    const period = month ? `${year}년 ${month}월` : `${year}년`;
    
    const totalIncome = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalExpense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const byCategory = transactions.reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = 0;
      acc[t.category] += Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a)[0] || [];

    return `
📊 ${period} 가계부 리포트

💰 총 수입: ${totalIncome.toLocaleString()}원
💸 총 지출: ${totalExpense.toLocaleString()}원
📈 수지 차액: ${(totalIncome - totalExpense).toLocaleString()}원

🏆 최고 지출 카테고리: ${topCategory[0] || ""} (${topCategory[1]?.toLocaleString() || 0 }원)

${Object.entries(byCategory)
  .sort(([, a], [, b]) => b - a)
  .map(([cat, amount]) => `• ${cat}: ${amount.toLocaleString()}원`)
  .join('\n')}
    `.trim();
  }
}