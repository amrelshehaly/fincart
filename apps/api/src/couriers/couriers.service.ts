import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Courier } from '@prisma/client';

@Injectable()
export class CouriersService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(): Promise<Courier[]> {
    try {
      const couriers = await this.prisma.client.courier.findMany();
      return couriers;
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerErrorException('Failed to find couriers');
    }
  }

  async findUnique(id: string): Promise<Courier> {
    try {
      const courier = await this.prisma.client.courier.findUnique({
        where: { id },
      });
      if (!courier) {
        throw new NotFoundException('Courier not found');
      }
      return courier;
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerErrorException('Failed to find courier');
    }
  }
}
