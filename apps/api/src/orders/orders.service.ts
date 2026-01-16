import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';
import { Order } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

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

  async upsertOrder(orderData: Prisma.OrderCreateInput): Promise<Order> {
    try {
      const orderId = orderData.id || uuidv4();

      const existing = await this.prisma.client.order.findUnique({
        where: { id: orderId },
      });

      if (existing) {
        return await this.prisma.client.order.update({
          where: { id: orderId },
          data: {
            name: orderData.name,
            address: orderData.address,
          },
        });
      }

      return await this.prisma.client.order.create({
        data: {
          ...orderData,
          id: orderId,
        },
        include: {
          shipments: true,
        },
      });
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerErrorException('Failed to upsert order');
    }
  }

  async findManyWithShipments(): Promise<Order[]> {
    try {
      const orders = await this.prisma.client.order.findMany({
        include: {
          shipments: {
            include: {
              shipmentFinancial: true,
              courier: true,
            },
          },
          merchant: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return orders;
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerErrorException('Failed to find orders');
    }
  }

  async updateOrder(
    id: string,
    updateData: { address?: string; name?: string },
  ): Promise<Order> {
    try {
      const order = await this.prisma.client.order.update({
        where: { id },
        data: {
          ...(updateData.address && { address: updateData.address }),
          ...(updateData.name && { name: updateData.name }),
        },
      });
      return order;
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerErrorException('Failed to update order');
    }
  }
}
