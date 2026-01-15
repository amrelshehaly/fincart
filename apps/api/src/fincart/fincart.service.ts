import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';
import { OrderModel } from 'generated/prisma/models/Order';

@Injectable()
export class FincartService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(orderData: Prisma.OrderCreateInput): Promise<OrderModel> {
    try {
      const order = await this.prisma.order.create({
        data: orderData,
      });
      return order;
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerErrorException('Failed to create order');
    }
  }

  async findOne(id: string): Promise<OrderModel> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id },
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      return order;
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerErrorException('Failed to find order');
    }
  }
}
