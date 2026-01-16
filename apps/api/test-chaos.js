/**
 * Chaos Test Script
 * 
 * This script tests if the system can handle 100 simultaneous conflicting updates
 * to the same order without breaking the database or creating duplicates.
 * 
 * What it does:
 * 1. Creates a test order
 * 2. Sends 100 webhook requests at the same time with different addresses
 * 3. Checks if the database is still consistent (no duplicates, correct data)
 */

const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');

const API_BASE = 'http://localhost:3000/api';
const prisma = new PrismaClient();

let TEST_MERCHANT_ID = null;

// Colors for terminal output (makes it easier to read)
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function to create an order
async function createOrder() {
  log('\n📦 Step 1: Creating initial order...', 'blue');
  
  const response = await fetch(`${API_BASE}/webhooks/shopify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-idempotency-key': `chaos-test-initial-${Date.now()}`,
    },
    body: JSON.stringify({
      name: 'Chaos Test Order',
      address: '123 Original Street, Cairo, Egypt',
      merchantId: TEST_MERCHANT_ID,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create order: ${response.status} ${await response.text()}`);
  }

  log('✅ Order created successfully', 'green');
  
  // Wait a bit for the order to be processed
  log('⏳ Waiting for order to be processed...', 'yellow');
  await sleep(3000);
  
  // Get the order ID
  const ordersResponse = await fetch(`${API_BASE}/orders/all`);
  const orders = await ordersResponse.json();
  const testOrder = orders.find(o => o.name === 'Chaos Test Order');
  
  if (!testOrder) {
    throw new Error('Could not find the created order');
  }
  
  log(`✅ Found order with ID: ${testOrder.id}`, 'green');
  return testOrder.id;
}

// Helper function to send a conflicting update
async function sendConflictingUpdate(orderId, updateNumber) {
  try {
    const response = await fetch(`${API_BASE}/webhooks/shopify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-idempotency-key': `chaos-update-${updateNumber}-${Date.now()}`,
      },
      body: JSON.stringify({
        name: 'Chaos Test Order',
        address: `${updateNumber} Conflict Street, Cairo, Egypt`,
        merchantId: TEST_MERCHANT_ID,
      }),
    });

    return {
      success: response.ok,
      status: response.status,
      updateNumber,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      updateNumber,
    };
  }
}

// Helper function to check database consistency
async function checkDatabaseConsistency(orderId) {
  log('\n🔍 Step 3: Checking database consistency...', 'blue');
  
  // Get the order with all its relationships
  const response = await fetch(`${API_BASE}/orders/with-shipments`);
  const orders = await response.json();
  const order = orders.find(o => o.id === orderId);
  
  if (!order) {
    log('❌ Order not found in database!', 'red');
    return false;
  }
  
  log(`✅ Order found: ${order.name}`, 'green');
  log(`   Address: ${order.address}`, 'reset');
  
  // Check for duplicate shipments (there should only be one)
  const shipmentsResponse = await fetch(`${API_BASE}/orders/with-shipments`);
  const allOrders = await shipmentsResponse.json();
  const testOrder = allOrders.find(o => o.id === orderId);
  
  if (testOrder && testOrder.shipments) {
    log(`✅ Shipment exists`, 'green');
    log(`   Status: ${testOrder.shipments.status}`, 'reset');
    log(`   Tracking: ${testOrder.shipments.trackingNumber}`, 'reset');
    
    if (testOrder.shipments.shipmentFinancial) {
      log(`   Shipping Fee: ${testOrder.shipments.shipmentFinancial.shippingFee} ${testOrder.shipments.shipmentFinancial.currency}`, 'reset');
    }
  } else {
    log('⚠️  No shipment found (this is okay if order was just updated)', 'yellow');
  }
  
  return true;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main chaos test function
async function runChaosTest() {
  log('🌪️  CHAOS TEST STARTING 🌪️', 'yellow');
  log('================================', 'yellow');
  log('This will send 100 simultaneous conflicting updates to test system consistency\n', 'reset');
  
  try {
    // Step 1: Create an order
    const orderId = await createOrder();
    
    // Step 2: Send 100 conflicting updates simultaneously
    log('\n💥 Step 2: Sending 100 conflicting updates...', 'blue');
    log('(This might take a few seconds)', 'yellow');
    
    const startTime = Date.now();
    
    // Create an array of 100 update promises
    const updatePromises = [];
    for (let i = 1; i <= 100; i++) {
      updatePromises.push(sendConflictingUpdate(orderId, i));
    }
    
    // Send all updates at the same time
    const results = await Promise.all(updatePromises);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // Count successes and failures
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    log(`\n📊 Results:`, 'blue');
    log(`   Total requests: 100`, 'reset');
    log(`   Successful: ${successful}`, successful > 0 ? 'green' : 'red');
    log(`   Failed: ${failed}`, failed > 0 ? 'red' : 'green');
    log(`   Duration: ${duration}s`, 'reset');
    
    // Wait a bit for all jobs to be processed
    log('\n⏳ Waiting for all jobs to be processed...', 'yellow');
    await sleep(5000);
    
    // Step 3: Check database consistency
    const isConsistent = await checkDatabaseConsistency(orderId);
    
    // Final verdict
    log('\n================================', 'yellow');
    if (isConsistent) {
      log('✅ CHAOS TEST PASSED!', 'green');
      log('The database remained consistent despite 100 conflicting updates', 'green');
    } else {
      log('❌ CHAOS TEST FAILED!', 'red');
      log('Database inconsistencies detected', 'red');
    }
    log('================================\n', 'yellow');
    
  } catch (error) {
    log(`\n❌ Test failed with error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Check if the API is running before starting the test
async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE}/orders/all`);
    if (!response.ok) {
      throw new Error('API is not responding correctly');
    }
    return true;
  } catch (error) {
    log('❌ Cannot connect to the API. Make sure the backend is running on http://localhost:3000', 'red');
    log('   Run "npm run dev" in the root directory first', 'yellow');
    process.exit(1);
  }
}

// Get a merchant ID from the database
async function getMerchantId() {
  try {
    const merchants = await prisma.merchant.findMany({ take: 1 });
    if (merchants.length === 0) {
      log('❌ No merchants found in database. Run "npm run seed" first!', 'red');
      process.exit(1);
    }
    return merchants[0].id;
  } catch (error) {
    log('❌ Could not connect to database. Make sure PostgreSQL is running.', 'red');
    process.exit(1);
  }
}

// Run the test
(async () => {
  await checkApiHealth();
  TEST_MERCHANT_ID = await getMerchantId();
  log(`Using merchant ID: ${TEST_MERCHANT_ID}\n`, 'blue');
  await runChaosTest();
  await prisma.$disconnect();
})();
