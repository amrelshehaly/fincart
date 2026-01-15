import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Merchant } from '@prisma/client';

@Injectable()
export class MerchantsService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(id: string): Promise<Merchant> {
    try {
      const merchant = await this.prisma.client.merchant.findUnique({
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

  async findMany(): Promise<Merchant[]> {
    try {
      const merchants = await this.prisma.client.merchant.findMany();
      return merchants;
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerErrorException('Failed to find merchants');
    }
  }
}
