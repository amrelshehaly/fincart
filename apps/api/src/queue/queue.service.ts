import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('shopify-sync') private shopifyQueue: Queue) {}

  async addShopifyJob(data: any) {
    return this.shopifyQueue.add('sync-order', data, {
      removeOnComplete: 100,
      removeOnFail: 50,
    });
  }
}
