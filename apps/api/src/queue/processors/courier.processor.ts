import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ShipmentStatus,
  WebhookEventType,
  WebhookSource,
} from '@prisma/client';
import { WebhooksService } from 'src/webhooks/webhooks.service';

@Processor('courier-sync', {
  concurrency: 5, // Process 5 jobs concurrently
  limiter: {
    max: 5, // Maximum 5 jobs
    duration: 1000, // per 1 second
  },
})
export class CourierProcessor extends WorkerHost {
  private readonly logger = new Logger(CourierProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly webhooksService: WebhooksService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing Courier sync job ${job.id}`);

    try {
      const { statusData, orderId, idempotencyKey } = job.data;

      const existingWebhookEvent =
        await this.webhooksService.getUniqueIdempotencyKey(
          WebhookSource.COURIER,
          idempotencyKey,
        );

      if (existingWebhookEvent) {
        this.logger.log(
          `Webhook event already exists: ${existingWebhookEvent.id}`,
        );
        return;
      }

      const shipment = await this.prisma.client.shipment.findUnique({
        where: { orderId },
        include: { shipmentFinancial: true },
      });

      if (!shipment) {
        throw new NotFoundException(`Shipment not found for order ${orderId}`);
      }

      const newStatus = this.mapStatusToEnum(statusData.status);

      await this.prisma.client.$transaction(async (tx) => {
        await tx.shipment.update({
          where: { id: shipment.id },
          data: {
            status: newStatus,
            ...(statusData.shippingFee && {
              shipmentFinancial: {
                update: {
                  shippingFee: statusData.shippingFee,
                },
              },
            }),
          },
        });
      });

      await this.prisma.client.webhookEvent.create({
        data: {
          source: WebhookSource.COURIER,
          orderId: orderId,
          eventType: this.mapStatusToEventType(),
          idempotencyKey: idempotencyKey,
        },
      });

      this.logger.log(`Courier sync job ${job.id} completed`);
      return { success: true, jobId: job.id };
    } catch (error) {
      this.logger.error(`Courier sync job ${job.id} failed:`, error);
      throw error;
    }
  }

  private mapStatusToEnum(status: string): ShipmentStatus {
    const statusMap: Record<string, ShipmentStatus> = {
      ready: ShipmentStatus.READY,
      in_transit: ShipmentStatus.IN_TRANSIT,
      delivered: ShipmentStatus.DELIVERED,
      failed: ShipmentStatus.FAILED,
    };

    return statusMap[status.toLowerCase()] || ShipmentStatus.READY;
  }

  private mapStatusToEventType(): WebhookEventType {
    return WebhookEventType.ORDER_UPDATED;
  }
}
