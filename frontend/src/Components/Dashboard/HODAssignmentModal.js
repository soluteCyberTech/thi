import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Avatar,
  Paper,
  Divider,
  ListItemButton,
  Grid,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  Close as CloseIcon,
  Security,
  Person,
  Business,
  Search
} from '@mui/icons-material';
import DataTable from 'react-data-table-component';
import { 
  get_all_hod_assignments,
  assign_hod_access,
  get_available_access,
  get_hod_assignments
} from '../BaseURL';

function HODAssignmentModal({ open, onClose }) {
  const [HODs, setHODs] = useState([]);
  const [allAccess, setAllAccess] = useState([]);
  const [selectedHOD, setSelectedHOD] = useState(null);
  const [selectedAccess, setSelectedAccess] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchHODs = async () => {
    try {
      const response = await axios.get(get_all_hod_assignments);
      setHODs(response.data);
    } catch (error) {
      Swal.fire('Error', 'Failed to fetch HODs', 'error');
    }
  };

  const fetchAllAccess = async () => {
    try {
      const response = await axios.get(get_available_access('HOD'));
      setAllAccess(response.data);
    } catch (error) {
      console.error('Error fetching access:', error);
    }
  };

  const fetchHODAccess = async (hodId) => {
    try {

        const response = await axios.get(get_hod_assignments,{
            params: { hodId: hodId }
        });

        if (response.data.access_ids) {
            setSelectedAccess(response.data.access_ids);
        } else {
            setSelectedAccess([]);
        }
    } catch (error) {
        console.error('Error fetching HOD access:', error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchHODs();
      fetchAllAccess();
    }
  }, [open]);

  useEffect(() => {
    if (selectedHOD) {
   
        fetchHODAccess(selectedHOD.id);
    } else {
        setSelectedAccess([]);
    }
  }, [selectedHOD]);

  const handleSaveAccess = async () => {
    try {
       
        onClose();

       
        const result = await Swal.fire({
            title: 'Confirm Access Assignment',
            text: 'Are you sure you want to update access permissions?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2e7d32',
            cancelButtonColor: '#757575',
            confirmButtonText: 'Yes, Update Access',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            setLoading(true);
            
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            
            const response = await axios.post(assign_hod_access, {
                hod_id: selectedHOD.id,
                access_ids: selectedAccess,
                granted_by: userInfo?.name || 'System'
            });

            if (response.data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Access assignments updated successfully',
                    timer: 1500,
                    showConfirmButton: false
                });
                setSelectedHOD(null);
                await fetchHODs();
            }
        } else {
           
            onClose(false);
        }
    } catch (error) {
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'Failed to update access assignments'
        });
       
        onClose(false);
    } finally {
        setLoading(false);
    }
  };

  const columns = [
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
      cell: row => (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          py: 1 
        }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {row.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.email}
            </Typography>
          </Box>
        </Box>
      ),
      grow: 1
    },
    {
      name: 'Department',
      selector: row => row.department_name,
      sortable: true,
      cell: row => (
        <Box sx={{ 
          py: 1,
          px: 2,
          bgcolor: 'background.default',
          borderRadius: 1,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Business fontSize="small" color="primary" />
          <Typography variant="body2">
            {row.department_name}
          </Typography>
        </Box>
      ),
      grow: 1
    },
    {
      name: 'Actions',
      cell: row => (
        <Button
          variant="contained"
          size="small"
          onClick={() => setSelectedHOD(row)}
          startIcon={<Security />}
          sx={{
            bgcolor: '#2e7d32', 
            color: 'white', 
            border: 'none',
            '&:hover': {
              bgcolor: '#1b5e20', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            },
            textTransform: 'none',
            px: 2,
            py: 0.8,
            borderRadius: '8px',
            fontWeight: 500,
            minWidth: '135px',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            whiteSpace: 'nowrap'
          }}
        >
          Manage Access
        </Button>
      ),
      width: '180px',
      right: true
    }
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Security sx={{ fontSize: 28 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" component="div">
            Access Management
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Assign and manage HOD access permissions
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {selectedHOD ? (
          <Box>
            <Box 
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                bgcolor: 'background.paper',
                p: 3
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => setSelectedHOD(null)}
                  startIcon={<Person />}
                  size="small"
                >
                  Back to HOD List
                </Button>
              </Box>

              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                bgcolor: 'background.default',
                p: 2,
                borderRadius: 2
              }}>
                <Avatar sx={{ 
                  width: 64, 
                  height: 64, 
                  bgcolor: 'primary.main', 
                  fontSize: '1.8rem',
                  boxShadow: 1
                }}>
                  {selectedHOD.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedHOD.name}
                  </Typography>
                  <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Business fontSize="small" />
                    {selectedHOD.department_name}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Available Access Permissions
              </Typography>
              
              <Grid container spacing={2}>
                {allAccess.map((access) => (
                  <Grid item xs={12} sm={6} key={access.id}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2,
                        borderRadius: 2,
                        cursor: 'pointer',
                        bgcolor: selectedAccess.includes(access.id) 
                          ? 'primary.lighter' 
                          : 'background.paper',
                        border: 1,
                        borderColor: selectedAccess.includes(access.id)
                          ? 'primary.main'
                          : 'divider',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          transform: 'translateY(-1px)',
                          boxShadow: 1
                        }
                      }}
                      onClick={() => {
                        const id = access.id;
                        setSelectedAccess(prev => 
                          prev.includes(id) ? 
                            prev.filter(x => x !== id) : 
                            [...prev, id]
                        );
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Checkbox 
                          checked={selectedAccess.includes(access.id)}
                          sx={{ 
                            '&.Mui-checked': {
                              color: 'primary.main'
                            }
                          }}
                        />
                        <Box>
                          <Typography variant="subtitle2">
                            {access.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {access.description || 'No description available'}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box sx={{ 
              p: 3, 
              borderTop: 1, 
              borderColor: 'divider',
              bgcolor: 'background.paper'
            }}>
              <Button
                variant="contained"
                onClick={handleSaveAccess}
                disabled={loading}
                fullWidth
                size="large"
                sx={{ 
                  py: 1.2,
                  boxShadow: 2,
                  '&:hover': { boxShadow: 4 }
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    <span>Saving Changes...</span>
                  </Box>
                ) : (
                  'Save Access Assignments'
                )}
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search HODs by name or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  )
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                    '&:hover': {
                      '& > fieldset': {
                        borderColor: 'primary.main'
                      }
                    }
                  }
                }}
              />
            </Box>

            <Box sx={{ 
              width: '100%',
              overflowX: 'auto'
            }}>
              <DataTable
                columns={columns}
                data={HODs.filter(hod =>
                  hod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  hod.department_name.toLowerCase().includes(searchQuery.toLowerCase())
                )}
                pagination
                highlightOnHover
                responsive
                striped
                customStyles={{
                  table: {
                    style: {
                      minWidth: '600px', 
                    }
                  },
                  headRow: {
                    style: {
                      backgroundColor: '#f5f5f5',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#333',
                      minHeight: '50px'
                    }
                  },
                  rows: {
                    style: {
                      fontSize: '0.875rem',
                      minHeight: '60px',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        cursor: 'pointer'
                      }
                    }
                  },
                  cells: {
                    style: {
                      paddingLeft: '16px',
                      paddingRight: '16px',
                    }
                  }
                }}
              />
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default HODAssignmentModal;