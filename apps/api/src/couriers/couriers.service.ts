import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  Courier,
  ShipmentStatus,
  WebhookEventType,
  WebhookSource,
} from '@prisma/client';
import { WebhooksService } from 'src/webhooks/webhooks.service';

@Injectable()
export class CouriersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly webhooksService: WebhooksService,
  ) {}

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

  async updateShipmentStatus(
    statusData: { status: string; shippingFee?: number },
    orderId: string,
    idempotencyKey: string,
  ): Promise<void> {
    const existingWebhookEvent =
      await this.webhooksService.getUniqueIdempotencyKey(
        WebhookSource.COURIER,
        idempotencyKey,
      );

    if (existingWebhookEvent) {
      return;
    }

    const shipment = await this.prisma.client.shipment.findUnique({
      where: { orderId },
      include: { shipmentFinancial: true },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment not found for order ${orderId}`);
    }

    const statusMap: Record<string, ShipmentStatus> = {
      ready: ShipmentStatus.READY,
      in_transit: ShipmentStatus.IN_TRANSIT,
      delivered: ShipmentStatus.DELIVERED,
      failed: ShipmentStatus.FAILED,
    };
    const newStatus = statusMap[statusData.status.toLowerCase()];

    await this.prisma.client.$transaction(async (tx) => {
      await tx.shipment.update({
        where: { id: shipment.id },
        data: {
          status: newStatus,
          ...(statusData.shippingFee && {
            shipmentFinancial: {
              update: { shippingFee: statusData.shippingFee },
            },
          }),
        },
      });
    });

    await this.prisma.client.webhookEvent.create({
      data: {
        source: WebhookSource.COURIER,
        orderId: orderId,
        eventType: WebhookEventType.ORDER_UPDATED,
        idempotencyKey: idempotencyKey,
      },
    });
  }
}
