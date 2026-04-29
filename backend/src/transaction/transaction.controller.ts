import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { TransactionService, TransactionQuery } from './transaction.service';
import type { CreateTransactionDto,  } from './transaction.service';
import { TransactionType } from './transaction.entity';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async create(@Body() createDto: CreateTransactionDto) {
    return this.transactionService.create(createDto);
  }

  @Get()
  async findAll(
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('day') day?: string,
    @Query('category') category?: string,
    @Query('type') type?: TransactionType,
  ) {
    const query: TransactionQuery = {};
    if (year) query.year = parseInt(year);
    if (month) query.month = parseInt(month);
    if (day) query.day = parseInt(day);
    if (category) query.category = category;
    if (type) query.type = type as TransactionType;
    
    return this.transactionService.findAll(query);
  }

  @Get('statistics')
  async getStatistics(
    @Query('year') year: string,
    @Query('month') month?: string,
  ) {
    return this.transactionService.getStatistics(
      parseInt(year),
      month ? parseInt(month) : undefined,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.transactionService.findOne(parseInt(id));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: Partial<CreateTransactionDto>) {
    return this.transactionService.update(parseInt(id), updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.transactionService.remove(parseInt(id));
  }
}