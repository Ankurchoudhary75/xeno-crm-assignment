import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    // Clear existing data
    await prisma.communication.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.segment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.customer.deleteMany();

    const names = ['Alice Smith', 'Bob Jones', 'Charlie Brown', 'Diana Prince', 'Eve Adams', 'Frank Castle', 'Grace Hopper', 'Hank Pym', 'Ivy Pepper', 'Jack Reacher'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'New York', 'Seattle', 'Boston', 'New York', 'Denver'];
    const customersData = names.map((name, i) => ({
      name,
      email: `${name.split(' ')[0].toLowerCase()}@example.com`,
      phone: `+1555000000${i}`,
      city: cities[i],
    }));

    // Create customers
    const createdCustomers = [];
    for (const data of customersData) {
      const customer = await prisma.customer.create({ data });
      createdCustomers.push(customer);
    }

    // Create some orders for a coffee chain
    const ordersData = [];
    for (const customer of createdCustomers) {
      const numOrders = Math.floor(Math.random() * 5) + 1; // 1 to 5 orders
      for (let i = 0; i < numOrders; i++) {
        // Random date in the last 60 days
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 60));
        
        ordersData.push({
          customerId: customer.id,
          amount: parseFloat((Math.random() * 150 + 20).toFixed(2)), // $20 to $170 per order
          createdAt: date,
        });
      }
    }

    for (const order of ordersData) {
      await prisma.order.create({ data: order });
    }

    return NextResponse.json({ message: 'Database seeded successfully', customers: createdCustomers.length, orders: ordersData.length });
  } catch (error) {
    console.error('Failed to seed database:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
