import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MerchantsModule } from './merchants/merchants.module';
import { CouriersModule } from './couriers/couriers.module';
import { FincartModule } from './fincart/fincart.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, MerchantsModule, CouriersModule, FincartModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
