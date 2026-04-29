import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { Transaction, TransactionType } from './transaction.entity';

export interface CreateTransactionDto {
  amount: number;
  category: string;
  description?: string;
  type: TransactionType;
  date: string;
}

export interface TransactionQuery {
  year?: number;
  month?: number;
  day?: number;
  category?: string;
  type?: TransactionType;
}

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async create(createDto: CreateTransactionDto): Promise<Transaction> {
    const transaction = this.transactionRepository.create(createDto);
    return await this.transactionRepository.save(transaction);
  }

  async findAll(query: TransactionQuery): Promise<Transaction[]> {
    const where: any = {};

    if (query.year && query.month) {
      const startDate = `${query.year}-${String(query.month).padStart(2, '0')}-01`;
      const endMonth = query.month === 12 ? 1 : query.month + 1;
      const endYear = query.month === 12 ? query.year + 1 : query.year;
      const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
      
      where.date = Between(startDate, endDate);
    } else if (query.year) {
      where.date = Between(`${query.year}-01-01`, `${query.year}-12-31`);
    }

    if (query.category) {
      where.category = Like(`%${query.category}%`);
    }

    if (query.type) {
      where.type = query.type;
    }

    return await this.transactionRepository.find({
      where,
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Transaction | null> {
    return await this.transactionRepository.findOne({ where: { id } });
  }

  async update(id: number, updateDto: Partial<CreateTransactionDto>): Promise<Transaction | null> {
    await this.transactionRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.transactionRepository.delete(id);
  }

  async getStatistics(year: number, month?: number) {
    const startDate = month 
      ? `${year}-${String(month).padStart(2, '0')}-01`
      : `${year}-01-01`;
    const endMonth = month === 12 ? 1 : (month || 12) + 1;
    const endYear = month === 12 ? year + 1 : year;
    const endDate = month
      ? `${endYear}-${String(endMonth).padStart(2, '0')}-01`
      : `${year + 1}-01-01`;

    const transactions = await this.transactionRepository.find({
      where: { date: Between(startDate, endDate) },
    });

    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const byCategory = transactions.reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = 0;
      acc[t.category] += Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      byCategory,
      count: transactions.length,
    };
  }
}