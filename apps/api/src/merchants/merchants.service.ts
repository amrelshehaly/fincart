import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';
import { MerchantModel } from 'generated/prisma/models/Merchant';

@Injectable()
export class MerchantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    merchantData: Prisma.MerchantCreateInput,
  ): Promise<MerchantModel> {
    try {
      const merchant = await this.prisma.merchant.create({
        data: merchantData,
      });
      return merchant;
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerErrorException('Failed to create merchant');
    }
  }

  async findOne(id: string): Promise<MerchantModel> {
    try {
      const merchant = await this.prisma.merchant.findUnique({
        where: { id },
      });
      if (!merchant) {
        throw new NotFoundException('Merchant not found');
      }
      return merchant;
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerErrorException('Failed to find merchant');
    }
  }

  async findMany(): Promise<MerchantModel[]> {
    try {
      const merchants = await this.prisma.merchant.findMany();
      return merchants;
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerErrorException('Failed to find merchants');
    }
  }

  async updateOne(
    id: string,
    merchantData: Prisma.MerchantUpdateInput,
  ): Promise<MerchantModel> {
    try {
      const merchant = await this.prisma.merchant.update({
        where: { id },
        data: merchantData,
      });
      return merchant;
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerErrorException('Failed to update merchant');
    }
  }

  async deleteOne(id: string): Promise<void> {
    try {
      await this.prisma.merchant.delete({
        where: { id },
      });
    } catch (error: unknown) {
      console.error(error);

      throw new InternalServerErrorException('Failed to delete merchant');
    }
  }
}
