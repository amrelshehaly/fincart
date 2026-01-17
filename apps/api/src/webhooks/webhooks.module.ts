import { Module, forwardRef } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { QueueModule } from 'src/queue/queue.module';
import { CouriersModule } from 'src/couriers/couriers.module';

@Module({
  imports: [forwardRef(() => QueueModule), CouriersModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
