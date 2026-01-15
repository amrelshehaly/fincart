import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';
import { Order } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(orderData: Prisma.OrderCreateInput): Promise<Order> {
    try {
      const order = await this.prisma.client.order.create({
        data: orderData,
      });
      return order;
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerErrorException('Failed to create order');
    }
  }

  async getOrderStatuses(merchantId: string): Promise<Order[]> {
    try {
      const orders = await this.prisma.client.order.findMany({
        where: {
          merchantId: merchantId,
        },
        include: {
          shipments: true,
        },
      });
      return orders;
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerErrorException('Failed to find orders');
    }
  }

  async findOne(id: string): Promise<Order> {
    try {
      const order = await this.prisma.client.order.findUnique({
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

  async findMany(): Promise<Order[]> {
    try {
      const orders = await this.prisma.client.order.findMany();
      return orders;
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerErrorException('Failed to find orders');
    }
  }
}
