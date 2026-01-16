import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { WebhookSource, WebhookEvent } from '@prisma/client';

@Injectable()
export class WebhooksService {
  constructor(private readonly prisma: PrismaService) {}

  async getUniqueIdempotencyKey(
    source: WebhookSource,
    idempotencyKey: string,
  ): Promise<WebhookEvent | null> {
    if (!idempotencyKey) {
      return null;
    }

    try {
      const webhookEvent = await this.prisma.client.webhookEvent.findUnique({
        where: {
          source_idempotencyKey: {
            source,
            idempotencyKey,
          },
        },
      });
      return webhookEvent;
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to get unique idempotency key',
      );
    }
  }
}
