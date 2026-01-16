/**
 * Helper script to get merchant and courier IDs for testing
 * Run this after seeding the database to get IDs you can use in your tests
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getTestIds() {
  console.log('\n📋 Getting test IDs from database...\n');
  
  try {
    const merchants = await prisma.merchant.findMany();
    const couriers = await prisma.courier.findMany();
    
    if (merchants.length === 0) {
      console.log('❌ No merchants found. Run "npm run seed" first!');
      return;
    }
    
    console.log('🏪 Merchants:');
    merchants.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.name}`);
      console.log(`      ID: ${m.id}`);
    });
    
    console.log('\n🚚 Couriers:');
    couriers.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.name}`);
      console.log(`      ID: ${c.id}`);
    });
    
    console.log('\n💡 Copy one of these merchant IDs to use in your tests!');
    console.log(`   Example: "${merchants[0].id}"\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getTestIds();
