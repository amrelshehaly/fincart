import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ShipmentStatus,
  WebhookEventType,
  WebhookSource,
} from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { OrdersService } from 'src/orders/orders.service';
import { WebhooksService } from 'src/webhooks/webhooks.service';

@Processor('shopify-sync', {
  concurrency: 2, // Process 2 jobs concurrently (rate limiting)
  limiter: {
    max: 2, // Maximum 2 jobs
    duration: 1000, // per 1 second (Shopify API rate limit simulation)
  },
})
export class ShopifyProcessor extends WorkerHost {
  private readonly logger = new Logger(ShopifyProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
    private readonly webhooksService: WebhooksService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing Shopify sync job ${job.id}`);

    try {
      const { orderData, eventType, idempotencyKey } = job.data;

      const existingWebhookEvent =
        await this.webhooksService.getUniqueIdempotencyKey(
          WebhookSource.MERCHANT,
          idempotencyKey,
        );

      if (existingWebhookEvent) {
        this.logger.log(
          `Webhook event already exists: ${existingWebhookEvent.id}`,
        );
        return;
      }

      const order = await this.ordersService.upsertOrder(orderData);
      console.log('order', order);

      if (eventType === WebhookEventType.ORDER_FULFILLED) {
        const courier = await this.prisma.client.courier.findFirst();

        if (!courier) {
          throw new NotFoundException('Courier not found');
        }

        const existingShipment = await this.prisma.client.shipment.findUnique({
          where: { orderId: order.id },
        });

        if (!existingShipment) {
          await this.prisma.client.$transaction(async (tx) => {
            await tx.shipment.create({
              data: {
                orderId: order.id,
                trackingNumber: uuidv4(),
                merchantId: order.merchantId,
                status: ShipmentStatus.READY,
                shipmentFinancial: { create: { shippingFee: 100 } },
                courierId: courier.id,
              },
            });
          });
        } else {
          this.logger.log(`Shipment already exists for order ${order.id}`);
        }
      }

      await this.prisma.client.webhookEvent.create({
        data: {
          source: WebhookSource.MERCHANT,
          orderId: order.id,
          eventType: eventType,
          idempotencyKey: idempotencyKey,
        },
      });
    } catch (error) {
      this.logger.error(`Shopify sync job ${job.id} failed:`, error);
      throw error;
    }
  }
}
