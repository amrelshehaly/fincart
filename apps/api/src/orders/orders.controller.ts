import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('statuses/:merchantId')
  getOrderStatuses(@Param('merchantId') merchantId: string): Promise<Order[]> {
    return this.ordersService.getOrderStatuses(merchantId);
  }

  @Get('one/:id')
  getOrder(@Param('id') id: string): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @Post('create')
  createOrder(@Body() orderData: any): Promise<Order> {
    return this.ordersService.createOrder(orderData);
  }

  @Get('all')
  getAllOrders(): Promise<Order[]> {
    return this.ordersService.findMany();
  }

  @Get('with-shipments')
  getOrdersWithShipments(): Promise<Order[]> {
    return this.ordersService.findManyWithShipments();
  }

  @Patch(':id')
  updateOrder(
    @Param('id') id: string,
    @Body() updateData: { address?: string; name?: string },
  ): Promise<Order> {
    return this.ordersService.updateOrder(id, updateData);
  }
}
