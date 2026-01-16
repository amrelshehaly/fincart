import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Seed Merchants
  console.log('🏪 Creating merchants...');
  const merchants = await Promise.all([
    prisma.merchant.create({
      data: { name: 'TechStore Egypt' },
    }),
    prisma.merchant.create({
      data: { name: 'Fashion Hub' },
    }),
    prisma.merchant.create({
      data: { name: 'Electronics Plus' },
    }),
    prisma.merchant.create({
      data: { name: 'Home & Garden Co' },
    }),
    prisma.merchant.create({
      data: { name: 'Sports World' },
    }),
    prisma.merchant.create({
      data: { name: 'Beauty Essentials' },
    }),
    prisma.merchant.create({
      data: { name: 'Books & More' },
    }),
    prisma.merchant.create({
      data: { name: 'Grocery Express' },
    }),
  ]);

  console.log(`✅ Created ${merchants.length} merchants`);

  // Seed Couriers
  console.log('🚚 Creating couriers...');
  const couriers = await Promise.all([
    prisma.courier.create({
      data: { name: 'Aramex' },
    }),
    prisma.courier.create({
      data: { name: 'DHL Express' },
    }),
    prisma.courier.create({
      data: { name: 'FedEx' },
    }),
    prisma.courier.create({
      data: { name: 'UPS' },
    }),
    prisma.courier.create({
      data: { name: 'Local Express' },
    }),
    prisma.courier.create({
      data: { name: 'FastShip' },
    }),
  ]);

  console.log(`✅ Created ${couriers.length} couriers`);

  console.log('✨ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Merchants: ${merchants.length}`);
  console.log(`   - Couriers: ${couriers.length}`);
  console.log('\n💡 You can now use these IDs in your webhook tests:');
  console.log(`   Merchant IDs: ${merchants.map((m) => m.id).join(', ')}`);
  console.log(`   Courier IDs: ${couriers.map((c) => c.id).join(', ')}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
