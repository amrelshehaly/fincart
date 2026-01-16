import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('shopify-sync') private shopifyQueue: Queue,
    @InjectQueue('courier-sync') private courierQueue: Queue,
  ) {}

  async addShopifyJob(data: any) {
    return this.shopifyQueue.add('sync-order', data, {
      removeOnComplete: 100,
      removeOnFail: 50,
    });
  }

  async addCourierJob(data: any) {
    return this.courierQueue.add('sync-status', data, {
      removeOnComplete: 100,
      removeOnFail: 50,
    });
  }
}
