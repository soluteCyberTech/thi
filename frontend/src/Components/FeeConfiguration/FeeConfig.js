import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Grid,
  CircularProgress
} from '@mui/material';
import {
  Save,
  AccountBalance,
  CurrencyExchange,
  Refresh,
  Info
} from '@mui/icons-material';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import Swal from 'sweetalert2';
import { get_fee_items, save_fees, get_assembly_info } from '../BaseURL';

const FeeConfig = () => {
  const theme = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assemblyInfo, setAssemblyInfo] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleFeeChange = (id, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newFee = parseFloat(value) || 0;
        return {
          ...item,
          fee: newFee
        };
      }
      return item;
    }));
  };

  // Load assembly info 
  useEffect(() => {
    loadAssemblyInfo();
  }, []);

  const loadAssemblyInfo = async () => {
    try {
      const response = await axios.get(get_assembly_info);
      if (response.data.success) {
        setAssemblyInfo(response.data.assembly);
        await loadItems(response.data.assembly.mmda);
      }
    } catch (error) {
      console.error('Error loading assembly info:', error);
      setError('Failed to load assembly information');
    }
  };

  const loadItems = async (mmda) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(get_fee_items(mmda));
      if (response.data.success) {
      
        const itemsWithFees = response.data.items.map(item => ({
          ...item,
          fee: 0
        }));
        setItems(itemsWithFees);
      }
    } catch (error) {
      console.error('Load error:', error);
      setError(error.response?.data?.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      name: 'Category',
      selector: row => row.mainName,
      sortable: true,
      width: '200px',
      cell: row => (
        <Box>
          <Typography sx={{
            fontWeight: row.isMain ? 600 : 400,
            color: row.isMain ? theme.palette.primary.main : 'inherit',
          }}>
            {row.mainName}
          </Typography>
          {row.isMain && (
            <Chip
              size="small"
              label="Main"
              color="primary"
              variant="outlined"
              sx={{ mt: 0.5 }}
            />
          )}
        </Box>
      )
    },
    {
      name: 'Item Name',
      selector: row => row.itemName,
      sortable: true,
      grow: 2,
      cell: row => (
        <Typography sx={{ py: 1 }}>
          {row.itemName}
          {row.code && (
            <Typography
              component="span"
              variant="caption"
              sx={{ ml: 1, color: theme.palette.text.secondary }}
            >
              ({row.code})
            </Typography>
          )}
        </Typography>
      )
    },
    {
      name: 'Upper Limit',
      selector: row => row.upperLimit,
      sortable: true,
      right: true,
      width: '180px',
      cell: row => (
        <Chip
          label={`GH₵ ${row.upperLimit?.toFixed(2) || '0.00'}`}
          color="warning"
          variant="outlined"
          size="small"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 600,
            '& .MuiChip-label': {
              color: theme.palette.warning.dark
            }
          }}
        />
      )
    },
    {
      name: 'Your Fee',
      sortable: true,
      right: true,
      width: '200px',
      cell: row => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            type="number"
            size="small"
            value={row.fee || ''}
            onChange={(e) => handleFeeChange(row.id, e.target.value)}
            error={row.fee > row.upperLimit}
            helperText={row.fee > row.upperLimit ? 'Exceeds limit' : ''}
            sx={{
              width: '120px',
              '& input': {
                textAlign: 'right',
                fontFamily: 'monospace'
              }
            }}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}></Typography>
            }}
            inputProps={{
              min: 0,
              max: row.upperLimit,
              step: 0.01
            }}
          />
          {row.fee > 0 && (
            <Tooltip title={`GH₵${row.fee.toFixed(2)} of GH₵${row.upperLimit.toFixed(2)}`}>
              <Chip
                size="small"
                label={`${((row.fee / row.upperLimit) * 100).toFixed(0)}%`}
                color={row.fee > row.upperLimit ? 'error' : 'success'}
                variant="outlined"
              />
            </Tooltip>
          )}
        </Box>
      )
    }
  ];

  return (
    <Container maxWidth="xl">
      <Card elevation={3} sx={{ mt: 3, mb: 3 }}>
        <CardContent>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            mb: 4
          }}>
            <Typography variant="h5" sx={{
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <CurrencyExchange />
              {assemblyInfo?.name} License Fee Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure your license fees in Ghana Cedis (GH₵) for your{' '}
              <Chip
                label={assemblyInfo?.mmda}
                color="primary"
                size="small"
                sx={{
                  fontWeight: 500,
                  bgcolor: 'primary.lighter',
                  color: 'primary.white',
                  '& .MuiChip-label': { px: 1 }
                }}
              />{' '}
              Assembly
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Paper elevation={0} sx={{
            borderRadius: 2,
            overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`
          }}>
            <DataTable
              columns={columns}
              data={items}
              pagination
              progressPending={loading}
              progressComponent={
                <Box sx={{ p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              }
              dense={isMobile}
              highlightOnHover
              paginationPerPage={15}
              paginationRowsPerPageOptions={[15, 30, 50, 100]}
            />
          </Paper>
        </CardContent>
      </Card>
    </Container>
  );
};

export default FeeConfig;