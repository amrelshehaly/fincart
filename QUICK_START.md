# Quick Start Guide

Super quick guide to get everything running.

## 1. Install & Start Services

```bash
# Install dependencies
npm install

# Start PostgreSQL and Redis
docker-compose up -d

# Setup database
cd apps/api
npx prisma migrate dev
npm run seed
npm run get-ids
cd ../..
```

## 2. Start the App

```bash
# From the root directory
npm run dev
```

This starts:
- Backend: http://localhost:3000
- Frontend: http://localhost:5173

## 3. Test It

### Create an Order

Copy a merchant ID from the previous step, then:

```bash
curl -X POST http://localhost:3000/api/webhooks/shopify \
  -H "Content-Type: application/json" \
  -H "x-idempotency-key: test-1" \
  -d '{
    "name": "Test Order #1",
    "address": "123 Test St, Cairo",
    "merchantId": "PASTE_MERCHANT_ID_HERE"
  }'
```

### View Orders

Open http://localhost:5173 in your browser.

### Run Chaos Test

```bash
cd apps/api
npm run test:chaos
```

## Troubleshooting

**Can't connect to database?**
```bash
docker-compose up -d
```

**Need merchant IDs?**
```bash
cd apps/api
npm run get-ids
```

**Frontend not loading?**
- Check both backend and frontend are running
- Make sure you ran `npm run dev` from the root directory

That's it! Check the main README.md for more details.
