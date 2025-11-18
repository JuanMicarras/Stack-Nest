import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    const totalAmountNumber = dto.items.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0,
    );
    const itemsCount = dto.items.reduce((acc, item) => acc + item.quantity, 0);

    const orderId = uuidv4();

    const order = this.orderRepo.create({
      orderId,
      customerId: dto.customerId,
      totalAmount: totalAmountNumber.toFixed(2),
      itemsCount,
    });

    const items = dto.items.map((item) =>
      this.orderItemRepo.create({
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price.toFixed(2),
      }),
    );

    order.items = items;

    const saved = await this.orderRepo.save(order);

    return {
      orderId: saved.orderId,
      totalAmount: Number(saved.totalAmount),
      itemsCount: saved.itemsCount,
      processedAt: saved.createdAt.toISOString(),
    };
  }
}
