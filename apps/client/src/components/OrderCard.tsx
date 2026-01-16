import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  TextField,
  Button,
  Alert,
  Grid,
  Divider,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import type { Order } from '../services/api';

interface OrderCardProps {
  order: Order;
  onAddressUpdate: (orderId: string, newAddress: string, originalAddress?: string) => Promise<boolean>;
  conflictAddress?: string;
  onConflictResolve: () => void;
}

const statusColors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  READY: 'primary',
  IN_TRANSIT: 'warning',
  DELIVERED: 'success',
  FAILED: 'error',
};

export function OrderCard({
  order,
  onAddressUpdate,
  conflictAddress,
  onConflictResolve,
}: OrderCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editAddress, setEditAddress] = useState(order.address);
  const [originalAddress, setOriginalAddress] = useState(order.address);
  const [showConflict, setShowConflict] = useState(false);

  useEffect(() => {
    if (conflictAddress && conflictAddress !== editAddress && isEditing) {
      setShowConflict(true);
    }
  }, [conflictAddress, editAddress, isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditAddress(order.address);
    setOriginalAddress(order.address);
  };

  const handleSave = async () => {
    if (editAddress !== originalAddress) {
      const hasConflict = await onAddressUpdate(order.id, editAddress, originalAddress);
      if (!hasConflict) {
        setIsEditing(false);
      } else {
        setShowConflict(true);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditAddress(order.address);
    setIsEditing(false);
    setShowConflict(false);
  };

  const handleConflictResolve = async (choice: 'local' | 'remote') => {
    if (choice === 'local') {
      await onAddressUpdate(order.id, editAddress);
    } else {
      setEditAddress(conflictAddress || order.address);
      await onAddressUpdate(order.id, conflictAddress || order.address);
    }
    setShowConflict(false);
    setIsEditing(false);
    onConflictResolve();
  };

  return (
    <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        {showConflict && conflictAddress && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
               Conflict: Address was updated
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Your version:
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {editAddress}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Server version:
              </Typography>
              <Typography variant="body2">{conflictAddress}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="contained" onClick={() => handleConflictResolve('local')}>
                Keep Mine
              </Button>
              <Button size="small" variant="outlined" onClick={() => handleConflictResolve('remote')}>
                Use Server
              </Button>
            </Box>
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box>
            <Typography variant="h6" component="h3" fontWeight="600">
              {order.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {order.id.slice(0, 8)}...
            </Typography>
          </Box>
          {order.shipments && (
            <Chip
              label={order.shipments.status.replace('_', ' ')}
              color={statusColors[order.shipments.status] || 'default'}
              size="small"
            />
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight="600" gutterBottom>
            Address
          </Typography>
          {isEditing ? (
            <Box>
              <TextField
                fullWidth
                size="small"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                autoFocus
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleSave}
                >
                  Save
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.primary">
                {order.address}
              </Typography>
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{ minWidth: 'auto' }}
              >
                Edit
              </Button>
            </Box>
          )}
        </Box>

        {order.shipments && (
          <>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Tracking
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {order.shipments.trackingNumber.slice(0, 12)}...
                </Typography>
              </Grid>
              {order.shipments.shipmentFinancial && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Fee
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    {order.shipments.shipmentFinancial.shippingFee}{' '}
                    {order.shipments.shipmentFinancial.currency}
                  </Typography>
                </Grid>
              )}
              {order.shipments.courier && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Courier: {order.shipments.courier.name}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </>
        )}
      </CardContent>
    </Card>
  );
}
