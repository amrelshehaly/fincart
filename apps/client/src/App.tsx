import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Alert,
  Button,
  Paper,
  Chip,
  Skeleton,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { api, type Order } from './services/api';
import { OrderCard } from './components/OrderCard';

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<Record<string, string>>({});

  const fetchOrders = async () => {
    try {
      const data = await api.getOrdersWithShipments();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError('Failed to load orders. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddressUpdate = async (
    orderId: string,
    newAddress: string,
    originalAddress?: string,
  ): Promise<boolean> => {
    try {
      const latest = await api.getOrdersWithShipments();
      const latestOrder = latest.find((o) => o.id === orderId);
      const currentOrder = orders.find((o) => o.id === orderId);

      const compareAddress = originalAddress || currentOrder?.address;
      if (latestOrder && compareAddress && latestOrder.address !== compareAddress) {
        setConflicts({ [orderId]: latestOrder.address });
        return true; 
      }

      await api.updateOrderAddress(orderId, newAddress);
      await fetchOrders();
      setConflicts({});
      return false; 
    } catch {
      setError('Failed to update address');
      return false;
    }
  };

  const handleConflictResolve = () => {
    setConflicts({});
  };

  const SkeletonCard = () => (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={40} sx={{ mb: 2, borderRadius: 1 }} />
      <Skeleton variant="text" width="80%" height={20} />
      <Skeleton variant="text" width="60%" height={20} />
    </Paper>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Paper elevation={1} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            High Volume logistics Platform
          </Typography>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" component="h2" fontWeight="600">
              Active Orders
            </Typography>
            <Chip label={orders.length} color="primary" size="small" />
          </Box>
          <Button variant="contained" startIcon={<Refresh />} onClick={fetchOrders} disabled={loading}>
            Refresh
          </Button>
        </Box>

        {loading && orders.length === 0 ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} lg={4} key={index}>
                <SkeletonCard />
              </Grid>
            ))}
          </Grid>
        ) : orders.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No orders found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Create an order via the Shopify webhook endpoint
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {orders.map((order) => (
              <Grid item xs={12} sm={6} lg={4} key={order.id}>
                <OrderCard
                  order={order}
                  onAddressUpdate={handleAddressUpdate}
                  conflictAddress={conflicts[order.id]}
                  onConflictResolve={handleConflictResolve}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default App;
