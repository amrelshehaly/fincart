import { Controller, Get, Param } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { Merchant } from '@prisma/client';

@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Get(':id')
  getMerchant(@Param('id') id: string): Promise<Merchant> {
    return this.merchantsService.findUnique(id);
  }

  @Get()
  getAllMerchants(): Promise<Merchant[]> {
    return this.merchantsService.findMany();
  }
}
