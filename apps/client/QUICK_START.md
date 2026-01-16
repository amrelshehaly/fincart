# Frontend Dashboard - Quick Start

## ✅ What's Built

1. **Live Logistics Feed Dashboard** - Real-time order and shipment tracking
2. **Conflict Resolution** - Handles address edits when background updates arrive
3. **Auto-refresh** - Polls API every 5 seconds for updates
4. **Material-UI v5** - Professional, modern UI

## 🚀 Running the Frontend

```bash
cd apps/client
npm run dev
```

The app will run on `http://localhost:5173`

## 🧪 Testing the Dashboard

### Step 1: Create an Order (via Shopify Webhook)
```bash
POST http://localhost:3000/api/webhooks/shopify
Headers:
  Content-Type: application/json
  X-Idempotency-Key: test-order-001
Body:
{
  "name": "Order #12345",
  "address": "123 Tahrir Square, Cairo, Egypt",
  "merchantId": "98c7a589-cf48-4fbc-ae29-0e998679b8fd"
}
```

### Step 2: View in Dashboard
- Open `http://localhost:5173`
- You should see the order appear with shipment details

### Step 3: Test Conflict Resolution
1. Click "Edit" on an order's address
2. Start typing a new address
3. While editing, send another webhook with a different address
4. Try to save - you'll see the conflict resolution dialog

### Step 4: Update Shipment Status (via Courier Webhook)
```bash
POST http://localhost:3000/api/webhooks/courier
Headers:
  Content-Type: application/json
  X-Idempotency-Key: courier-update-001
Body:
{
  "orderId": "YOUR_ORDER_ID",
  "status": "delivered",
  "shippingFee": 150
}
```

## 📋 Features

- ✅ Real-time updates (5-second polling)
- ✅ Conflict resolution UI
- ✅ Material-UI components
- ✅ Responsive design
- ✅ Order cards with shipment details
- ✅ Status badges (READY, IN_TRANSIT, DELIVERED, FAILED)

## 🎨 UI Components

- **OrderCard**: Displays order with shipment info, editable address
- **Conflict Dialog**: Shows when address conflicts occur
- **Status Chips**: Color-coded shipment status
- **Auto-refresh**: Updates every 5 seconds
