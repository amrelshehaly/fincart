import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
} from '@nestjs/common';
import { WebhookEventType } from '@prisma/client';
import { QueueService } from 'src/queue/queue.service';
import { CouriersService } from 'src/couriers/couriers.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly queueService: QueueService,
    private readonly couriersService: CouriersService,
  ) {}
  @Post('shopify')
  webhookShopify(
    @Body() body: any,
    @Headers() headers: Record<string, string>,
  ) {
    const idempotencyKey = headers['x-idempotency-key'];

    if (!body.name) {
      throw new BadRequestException('name is required');
    }
    if (!body.address) {
      throw new BadRequestException('address is required');
    }
    if (!body.merchantId) {
      throw new BadRequestException('merchantId is required');
    }

    if (!idempotencyKey) {
      throw new BadRequestException('idempotencyKey is required');
    }

    return this.queueService.addShopifyJob({
      orderData: {
        name: body.name,
        address: body.address || body.shipping_address?.address1,
        merchantId: body.merchantId,
      },
      eventType: WebhookEventType.ORDER_FULFILLED,
      idempotencyKey: idempotencyKey,
    });
  }

  @Post('courier')
  async webhookCourier(
    @Body() body: any,
    @Headers() headers: Record<string, string>,
  ) {
    const idempotencyKey = headers['x-idempotency-key'];

    if (!body.orderId) {
      throw new BadRequestException('orderId is required');
    }
    if (!body.status) {
      throw new BadRequestException('status is required');
    }

    if (!idempotencyKey) {
      throw new BadRequestException('idempotencyKey is required');
    }

    await this.couriersService.updateShipmentStatus(
      {
        status: body.status,
        shippingFee: body.shippingFee,
      },
      body.orderId,
      idempotencyKey,
    );

    return { success: true };
  }
}
