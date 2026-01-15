import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { Prisma } from 'generated/prisma/client';
import { MerchantModel } from 'generated/prisma/models/Merchant';

@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Post('create')
  @UsePipes(new ValidationPipe())
  createMerchant(
    @Body() body: Prisma.MerchantCreateInput,
  ): Promise<MerchantModel> {
    return this.merchantsService.create(body);
  }

  @Get(':id')
  getMerchant(@Param('id') id: string): Promise<MerchantModel> {
    return this.merchantsService.findOne(id);
  }

  @Put(':id')
  updateMerchant(
    @Param('id') id: string,
    @Body() body: Prisma.MerchantUpdateInput,
  ): Promise<MerchantModel> {
    return this.merchantsService.updateOne(id, body);
  }

  @Delete(':id')
  deleteMerchant(@Param('id') id: string): Promise<void> {
    return this.merchantsService.deleteOne(id);
  }

  @Get()
  getMerchants(): Promise<MerchantModel[]> {
    return this.merchantsService.findMany();
  }
}
