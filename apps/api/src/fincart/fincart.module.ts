import { Module } from '@nestjs/common';
import { FincartController } from './fincart.controller';
import { FincartService } from './fincart.service';

@Module({
  controllers: [FincartController],
  providers: [FincartService],
})
export class FincartModule {}
