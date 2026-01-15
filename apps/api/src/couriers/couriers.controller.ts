import { Controller, Get, Param } from '@nestjs/common';
import { CouriersService } from './couriers.service';
import { Courier } from '@prisma/client';

@Controller('couriers')
export class CouriersController {
  constructor(private readonly couriersService: CouriersService) {}

  @Get()
  getCouriers(): Promise<Courier[]> {
    return this.couriersService.findMany();
  }

  @Get(':id')
  getCourier(@Param('id') id: string): Promise<Courier> {
    return this.couriersService.findUnique(id);
  }
}
