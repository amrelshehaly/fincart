const API_BASE = '/api';

export interface Order {
  id: string;
  name: string;
  address: string;
  merchantId: string;
  createdAt: string;
  updatedAt: string;
  shipments?: Shipment;
  merchant?: {
    id: string;
    name: string;
  };
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  status: 'READY' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  shipmentFinancial?: {
    shippingFee: number;
    currency: string;
  };
  courier?: {
    id: string;
    name: string;
  };
}

export const api = {
  async getOrdersWithShipments(): Promise<Order[]> {
    const response = await fetch(`${API_BASE}/orders/with-shipments`);
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    return response.json();
  },

  async updateOrderAddress(orderId: string, address: string): Promise<Order> {
    const response = await fetch(`${API_BASE}/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address }),
    });
    if (!response.ok) {
      throw new Error('Failed to update order');
    }
    return response.json();
  },
};
