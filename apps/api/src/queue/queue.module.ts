import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from './queue.service';
import { ShopifyProcessor } from './processors/shopify.processor';
import { CourierProcessor } from './processors/courier.processor';
import { OrdersModule } from 'src/orders/orders.module';
import { WebhooksModule } from 'src/webhooks/webhooks.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    BullModule.registerQueue(
      {
        name: 'shopify-sync',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      },
      {
        name: 'courier-sync',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      },
    ),
    OrdersModule,
    forwardRef(() => WebhooksModule),
  ],
  providers: [QueueService, ShopifyProcessor, CourierProcessor],
  exports: [QueueService, BullModule],
})
export class QueueModule {}
