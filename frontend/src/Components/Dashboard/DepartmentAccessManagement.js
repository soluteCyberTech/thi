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
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Button,
  TextField
} from '@mui/material';
import {
  Security,
  LockOpen,
  AccountCircle,
  Badge
} from '@mui/icons-material';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, Outlet } from 'react-router-dom';
import {
  get_department_staff,
  get_available_department_access,
  get_user_assigned_access,
  update_user_access,
  check_user_access
} from '../BaseURL';


const DepartmentAccessManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const [availableAccess, setAvailableAccess] = useState([]);
  const [selectedAccess, setSelectedAccess] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);


  useEffect(() => {

    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {

      const parsedInfo = JSON.parse(savedUserInfo);
      console.log('User Info:', parsedInfo);
      setUserInfo(parsedInfo);

    } else {
      navigate('/login');
    }
  }, []);


  const fetchDepartmentUsers = async () => {
    try {
        if (!userInfo?.department) {
            console.error('No department found in user info');
            return;
        }

        const response = await axios.get(get_department_staff(userInfo.department));

        if (response.data.success) {
            setUsers(response.data.staff);
        } else {
            setUsers([]);
            Swal.fire('Error', 'No staff found', 'info');
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        Swal.fire('Error', 'Failed to fetch department users', 'error');
    }
};

  useEffect(() => {
    if (userInfo?.department) {
        fetchDepartmentUsers();
    }
  }, [userInfo]);


  const columns = [
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
      grow: 1
    },
    {
      name: 'Designation',
      selector: row => row.designation_name,
      sortable: true,
      cell: row => (
        <Chip
          label={row.designation_name}
          size="small"
          icon={<Badge fontSize="small" />}
          variant="outlined"
        />
      )
    },
    {
      name: 'Email',
      selector: row => row.email,
      sortable: true,
      grow: 1
    },
    {
      name: 'Current Access',
      selector: row => row.access_count,
      center: true,
      cell: row => (
        <Chip
          label={row.access_count || 0}
          size="small"
          color="primary"
          variant="outlined"
        />
      )
    },
    {
      name: 'Actions',
      cell: row => (
        <Tooltip title="Manage Access">
          <IconButton
            size="small"
            onClick={() => handleAccessClick(row)}
            color="primary"
          >
            <LockOpen fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
      width: '100px',
      right: true
    }
  ];

  const handleAccessClick = async (user) => {
    try {
        // First get available access from HOD's assignments
        const availableResponse = await axios.get(
            get_available_department_access(userInfo?.staff_id)
        );

        // Get the default/core HOD access
        const defaultHODAccess = [
            {
                id: 1,
                name: 'Department User Management',
                path: '/department-users',
                icon: 'people',
                section: 'HOD',
                is_core: 1
            },
            {
                id: 2,
                name: 'User Access Control',
                path: '/user-access',
                icon: 'security',
                section: 'HOD',
                is_core: 1
            }
        ];

        // Get user's current access
        const userAccessResponse = await axios.get(check_user_access(user.id));

        if (availableResponse.data.success && userAccessResponse.data.success) {
            // Set selected user
            setSelectedUser(user);

            // Set user's current access
            setSelectedAccess(userAccessResponse.data.access || []);

            // Combine available access based on HOD role
            let combinedAccess = [];
            if (userInfo?.role === 'Head of Department') {
                // Add default access for HODs
                combinedAccess = [
                    ...defaultHODAccess,
                    ...(availableResponse.data.access || [])
                ];
            } else {
                combinedAccess = availableResponse.data.access || [];
            }

            setAvailableAccess(combinedAccess);
            setAccessDialogOpen(true);

            // console.log('Combined Access:', combinedAccess);
            // console.log('User Current Access:', userAccessResponse.data.access);
            // console.log('User Info Role:', userInfo?.role);
        }
    } catch (error) {
        console.error('Error fetching access:', error);
        Swal.fire({
            icon: 'error',
            title: 'Access Error',
            text: 'Failed to fetch user access information',
            footer: error.response?.data?.message || error.message
        });
    }
};

  const handleSaveAccess = async () => {
    try {
        // Temporarily close the dialog
        setAccessDialogOpen(false);

        const accessIds = selectedAccess.map(access => access.id);

        const confirmResult = await Swal.fire({
            title: 'Update Access?',
            html: `
                <div style="text-align: left">
                    <p><strong>User:</strong> ${selectedUser.name}</p>
                    <p><strong>Selected Access:</strong> ${selectedAccess.length}</p>
                    <p><strong>Access Items:</strong></p>
                    <ul style="margin-top: 8px;">
                        ${selectedAccess.map(access => `
                            <li>${access.name}</li>
                        `).join('')}
                    </ul>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Update Access'
        });

        if (!confirmResult.isConfirmed) {
            // Reopen dialog if user cancels
            setAccessDialogOpen(true);
            return;
        }

        const response = await axios.put(
            update_user_access(selectedUser.id),
            {
                accessIds,
                hodId: userInfo?.staff_id
            }
        );

        if (response.data.success) {
            await Swal.fire({
                icon: 'success',
                title: 'Access Updated',
                text: 'User access has been updated successfully',
                timer: 1500
            });
            fetchDepartmentUsers();
        }
    } catch (error) {
        console.error('Error saving access:', error);
        await Swal.fire('Error', error.response?.data?.message || 'Failed to update user access', 'error');
        // Reopen dialog on error
        setAccessDialogOpen(true);
    }
};

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.designation_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="xl">
      <Card elevation={3} sx={{ mt: 3, mb: 3 }}>
        <CardContent>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4
          }}>
            <Box>
              <Typography variant="h5" sx={{
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Security />
                Department Access Management
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Manage access permissions for department users
              </Typography>
            </Box>
          </Box>

          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Paper elevation={0} sx={{
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <DataTable
              columns={columns}
              data={filteredUsers}
              pagination
              highlightOnHover
              pointerOnHover
              responsive
              progressPending={!users.length}
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 25, 50]}
              noDataComponent={
                <Box sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No department users found
                  </Typography>
                </Box>
              }
            />
          </Paper>
        </CardContent>
      </Card>

      <Dialog
        open={accessDialogOpen}
        onClose={() => setAccessDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountCircle />
            <Box>
              <Typography variant="h6">{selectedUser?.name}</Typography>
              <Typography variant="caption">
                {selectedUser?.designation_name}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {availableAccess.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              No access available to assign
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {availableAccess.map((access) => (
                <FormControlLabel
                  key={access.id}
                  control={
                    <Checkbox
                      checked={selectedAccess.some(a => a.id === access.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAccess([...selectedAccess, access]);
                        } else {
                          setSelectedAccess(selectedAccess.filter(a => a.id !== access.id));
                        }
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">{access.name}</Typography>
                      {access.section && (
                        <Typography variant="caption" color="text.secondary">
                          Section: {access.section}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAccessDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveAccess}
            startIcon={<Security />}
            disabled={availableAccess.length === 0}
          >
            Save Access
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DepartmentAccessManagement;