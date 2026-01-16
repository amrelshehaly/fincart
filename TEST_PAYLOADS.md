# Test Payloads

Quick reference for testing the webhooks manually.

## Get Merchant IDs

First, get a merchant ID:

```bash
cd apps/api
npm run get-ids
```

Copy one of the merchant IDs shown.

## 1. Create Order (Shopify Webhook)

```bash
curl -X POST http://localhost:3000/api/webhooks/shopify \
  -H "Content-Type: application/json" \
  -H "x-idempotency-key: order-001" \
  -d '{
    "name": "Order #1001",
    "address": "123 Main Street, Cairo, Egypt",
    "merchantId": "YOUR_MERCHANT_ID"
  }'
```

## 2. Update Same Order (Test Idempotency)

Send the same request again - it should be ignored:

```bash
curl -X POST http://localhost:3000/api/webhooks/shopify \
  -H "Content-Type: application/json" \
  -H "x-idempotency-key: order-001" \
  -d '{
    "name": "Order #1001",
    "address": "123 Main Street, Cairo, Egypt",
    "merchantId": "YOUR_MERCHANT_ID"
  }'
```

## 3. Update Shipment Status

First, get the order ID from the frontend or database, then:

```bash
curl -X POST http://localhost:3000/api/webhooks/courier \
  -H "Content-Type: application/json" \
  -H "x-idempotency-key: status-001" \
  -d '{
    "orderId": "YOUR_ORDER_ID",
    "status": "IN_TRANSIT",
    "shippingFee": 50
  }'
```

## 4. Update to Delivered

```bash
curl -X POST http://localhost:3000/api/webhooks/courier \
  -H "Content-Type: application/json" \
  -H "x-idempotency-key: status-002" \
  -d '{
    "orderId": "YOUR_ORDER_ID",
    "status": "DELIVERED",
    "shippingFee": 50
  }'
```

## 5. Test Conflict Resolution

1. Open the frontend: http://localhost:5173
2. Click "Edit" on an order
3. While editing, run this to update the address:

```bash
curl -X POST http://localhost:3000/api/webhooks/shopify \
  -H "Content-Type: application/json" \
  -H "x-idempotency-key: conflict-test-$(date +%s)" \
  -d '{
    "name": "Order #1001",
    "address": "999 Conflict Street, Cairo, Egypt",
    "merchantId": "YOUR_MERCHANT_ID"
  }'
```

4. Now click "Save" in the frontend - you should see a conflict dialog!

## Valid Statuses

- `READY` - Shipment is ready to be picked up
- `IN_TRANSIT` - Package is on its way
- `DELIVERED` - Package delivered successfully
- `FAILED` - Delivery failed

## Tips

- Always use a unique `x-idempotency-key` for new events
- Use the same key to test idempotency (duplicate prevention)
- Check the frontend to see updates in real-time
- Check the terminal logs to see what's happening in the queue
