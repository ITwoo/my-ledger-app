import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { AiService, ParsedTransaction, AnalysisResult } from './ai.service';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionType } from '../transaction/transaction.entity';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly transactionService: TransactionService,
  ) {}

  @Post('parse')
  async parseTransaction(@Body('input') input: string): Promise<ParsedTransaction> {
    return this.aiService.parseTransaction(input);
  }

  @Post('parse-and-save')
  async parseAndSave(@Body('input') input: string) {
    const parsed = await this.aiService.parseTransaction(input);
    const today = new Date().toISOString().split('T')[0];
    
    return this.transactionService.create({
      amount: parsed.amount,
      category: parsed.category,
      description: parsed.description,
      type: parsed.type as TransactionType,
      date: parsed.date || today,
    });
  }

  @Get('analyze')
  async analyzeSpending(
    @Query('year') year: string,
    @Query('month') month: string,
  ): Promise<AnalysisResult> {
    const transactions = await this.transactionService.findAll({
      year: parseInt(year),
      month: parseInt(month),
    });
    return this.aiService.analyzeSpending(transactions, parseInt(year), parseInt(month));
  }

  @Get('report')
  async generateReport(
    @Query('year') year: string,
    @Query('month') month?: string,
  ): Promise<{ report: string }> {
    const transactions = await this.transactionService.findAll({
      year: parseInt(year),
      month: month ? parseInt(month) : undefined,
    });
    const report = await this.aiService.generateReport(
      transactions,
      parseInt(year),
      month ? parseInt(month) : undefined,
    );
    return { report };
  }
}