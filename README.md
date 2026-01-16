# Fincart - Order Sync System

A logistics platform that syncs orders between Shopify and courier partners. Built for handling high-volume order processing with conflict resolution.

> **Quick Start:** See [QUICK_START.md](QUICK_START.md) for a faster setup guide.  
> **Test Examples:** See [TEST_PAYLOADS.md](TEST_PAYLOADS.md) for ready-to-use curl commands.

## What This Does

- Receives webhooks from Shopify when orders are created
- Receives status updates from courier partners
- Handles conflicts when multiple systems update the same order
- Shows a real-time dashboard of all orders

## Tech Stack

**Backend:**
- NestJS (Node.js framework)
- PostgreSQL (database)
- Redis + BullMQ (job queue for handling webhooks)
- Prisma (ORM)

**Frontend:**
- React + TypeScript
- Material-UI v5
- Vite

## Getting Started

### Prerequisites

You need these installed:
- Node.js (v18 or higher)
- Docker (for PostgreSQL and Redis)
- npm

### Installation

1. Clone the repo and install dependencies:
```bash
npm install
```

2. Start PostgreSQL and Redis using Docker:
```bash
docker-compose up -d
```

3. Set up the database:
```bash
cd apps/api
npx prisma migrate dev
npx prisma db seed
npm run get-ids
```

This will create the tables, add some test merchants and couriers, and show you their IDs.

4. Start everything:
```bash
npm run dev
```

This starts:
- Backend API on http://localhost:3000
- Frontend on http://localhost:5173

## How to Test

### 1. Create an Order (Shopify Webhook)

Send a POST request to create an order:

```bash
curl -X POST http://localhost:3000/api/webhooks/shopify \
  -H "Content-Type: application/json" \
  -H "x-idempotency-key: order-123" \
  -d '{
    "name": "Order #1001",
    "address": "123 Main Street, Cairo, Egypt",
    "merchantId": "YOUR_MERCHANT_ID_HERE"
  }'
```

**Note:** Replace `YOUR_MERCHANT_ID_HERE` with an actual merchant ID from the seed data. Run `npm run get-ids` in the `apps/api` folder to see all available IDs.

### 2. Update Shipment Status (Courier Webhook)

After creating an order, update its shipment status:

```bash
curl -X POST http://localhost:3000/api/webhooks/courier \
  -H "Content-Type: application/json" \
  -H "x-idempotency-key: status-456" \
  -d '{
    "orderId": "YOUR_ORDER_ID_HERE",
    "status": "IN_TRANSIT",
    "shippingFee": 50
  }'
```

### 3. Test Conflict Resolution

1. Open the dashboard at http://localhost:5173
2. Click "Edit" on an order's address
3. While editing, send a webhook to update the same order's address
4. Click "Save" - you should see a conflict dialog
5. Choose which version to keep

### 4. Run the Chaos Test

This sends 100 simultaneous updates to test if the system stays consistent:

```bash
cd apps/api
npm run test:chaos
```

The test will:
- Create an order
- Send 100 conflicting updates at the same time
- Check if the database stayed consistent (no duplicate shipments, correct final state)

## Project Structure

```
fincart/
├── apps/
│   ├── api/              
│   │   ├── src/
│   │   │   ├── webhooks/    
│   │   │   ├── queue/       
│   │   │   ├── orders/      
│   │   │   └── prisma/      
│   │   └── prisma/
│   │       ├── schema.prisma  
│   │       └── seed.ts        
│   └── client/           
│       └── src/
│           ├── App.tsx          
│           ├── components/      
│           └── services/      
├── docker-compose.yml    
└── README.md            
```

## How It Works

### Webhook Flow

```
Shopify Webhook → Controller → BullMQ Queue → Processor → Database
                                    ↓
                              Rate Limiting
                              Idempotency Check
                              Atomic Transaction
```

1. Webhook arrives at the controller
2. Controller adds a job to the queue (doesn't process immediately)
3. BullMQ processes jobs one by one, respecting rate limits
4. Processor checks if we already processed this webhook (idempotency)
5. If new, it updates the database in a transaction

### Conflict Resolution

When you edit an order address:
1. Frontend captures the original address when you click "Edit"
2. When you click "Save", it checks if the server's address changed
3. If changed, shows a dialog with both versions
4. You choose which one to keep


## API Endpoints

### Webhooks
- `POST /api/webhooks/shopify` - Receive Shopify order webhooks
- `POST /api/webhooks/courier` - Receive courier status updates

### Orders
- `GET /api/orders/with-shipments` - Get all orders with shipment details
- `PATCH /api/orders/:id` - Update an order (used by frontend)

## Files Overview

- `README.md` - This file, full documentation
- `QUICK_START.md` - Fast setup guide
- `TEST_PAYLOADS.md` - Example curl commands for testing
- `apps/api/test-chaos.js` - Chaos test script
- `apps/api/get-test-ids.js` - Helper to get merchant/courier IDs
- `docker-compose.yml` - PostgreSQL and Redis setup

