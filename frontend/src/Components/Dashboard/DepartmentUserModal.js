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
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  DeleteForever,
  PersonAdd
} from '@mui/icons-material';
import DataTable from 'react-data-table-component';
import { 
  reg_department_user, 
  update_department_user, 
  delete_department_user,
  reg_designation 
} from '../BaseURL';
import { useNavigate, Outlet } from 'react-router-dom';

function DepartmentUserModal({ open, onClose, departmentId }) {
  const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
  const [users, setUsers] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation_id: ''
  });

  
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


  const fetchUsers = async () => {
    try {
      const response = await axios.get(reg_department_user, {
        params: {
          created_by: userInfo?.department 
        }
      });
      
   
      if (response.data.success && response.data.users) {
        setUsers(response.data.users);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      Swal.fire('Error', 'Failed to fetch department users', 'error');
      setUsers([]);
    }
  };

  const fetchDesignations = async () => {
    try {
      const response = await axios.get(reg_designation);
      setDesignations(response.data);

    } catch (error) {

      console.error('Error fetching designations:', error);
      Swal.fire('Error', 'Failed to fetch designations', 'error');
    }
  };

  useEffect(() => {
    if (open) {
      fetchUsers();
      fetchDesignations();
    }
  }, [open, departmentId]);

  useEffect(() => {
    if (selectedUser) {
      setFormData(selectedUser);
    } else {
      setFormData({ name: '', email: '', phone: '', designation_id: '' });
    }
  }, [selectedUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      onClose();
     
      const confirmResult = await Swal.fire({
        title: selectedUser ? 'Update User?' : 'Create New User?',
        html: `
          <div style="text-align: left">
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Phone:</strong> ${formData.phone}</p>
            <p><strong>Designation:</strong> ${designations.find(d => d.id === formData.designation_id)?.title || 'Not Selected'}</p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: selectedUser ? 'Yes, Update' : 'Yes, Create',
        cancelButtonText: 'Cancel'
      });

     
      if (!confirmResult.isConfirmed) {
        onClose(false);
        return;
      }

     
      
      const loadingDialog = Swal.fire({
        title: selectedUser ? 'Updating...' : 'Creating...',
        text: 'Please wait',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const userData = {
        ...formData,
        department_id: userInfo?.department,
        created_by: userInfo?.trans_code,
      };

      if (selectedUser) {
        const response = await axios.put(
          update_department_user(selectedUser.id), 
          userData
        );
        if (response.data.success) {
          await Swal.fire({
            title: 'Success',
            text: 'User updated successfully',
            icon: 'success',
            timer: 2000,
            timerProgressBar: true
          });
        }
      } else {
        const response = await axios.post(reg_department_user, userData);

        if (response.data.success) {
          await Swal.fire({
            title: 'User Created Successfully',
            html: `
              <div style="text-align: left">
                <p>User account has been created successfully.</p>
                <div style="margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 4px;">
                  <p style="margin: 0; font-weight: bold; color: #1976d2;">Login Credentials:</p>
                  <p style="margin: 5px 0;"><strong>Username:</strong> ${response.data.credentials.username}</p>
                  <p style="margin: 5px 0;"><strong>Initial Password:</strong> ${response.data.credentials.initialPassword}</p>
                </div>
                <p style="color: #f44336; margin-top: 10px;">
                  <strong>Note:</strong> Please ensure to change password upon first login
                </p>
              </div>
            `,
            icon: 'success',
            confirmButtonColor: '#1976d2'
          });
        }
      }

      await fetchUsers();
      setSelectedUser(null);
      setFormData({ name: '', email: '', phone: '', designation_id: '' });
      onClose(false);

    } catch (error) {
      console.error('Submission error:', error);
      await Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to save user',
        icon: 'error'
      });
      onClose(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      onClose();
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "This action cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete!'
      });

      if (result.isConfirmed) {
        const response = await axios.delete(delete_department_user(id));
        if (response.data.success) {
          await Swal.fire({
            title: 'Deleted',
            text: 'User has been removed',
            icon: 'success'
          });
          await fetchUsers();
        }
      }
      onClose(false);
    } catch (error) {
      console.error('Delete error:', error);
      await Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to delete user',
        icon: 'error'
      });
      onClose(false);
    }
  };

  const columns = [
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
      grow: 1,
      cell: row => (
        <Typography sx={{ py: 1 }}>
          {row.name}
        </Typography>
      )
    },
    {
      name: 'Designation',
      selector: row => row.designation_name,
      sortable: true,
      grow: 1,
      cell: row => (
        <Typography sx={{ py: 1 }}>
          {row.designation_name || 'Not Assigned'}
        </Typography>
      )
    },
    {
      name: 'Email',
      selector: row => row.email,
      sortable: true,
      grow: 1,
      cell: row => (
        <Typography 
          sx={{ 
            py: 1,
            color: 'text.secondary',
            fontFamily: 'monospace'
          }}
        >
          {row.email}
        </Typography>
      )
    },
    {
      name: 'Phone',
      selector: row => row.phone,
      sortable: true,
      width: '150px',
      cell: row => (
        <Typography 
          sx={{ 
            py: 1,
            color: 'text.secondary',
            fontFamily: 'monospace'
          }}
        >
          {row.phone}
        </Typography>
      )
    },
    {
      name: 'Actions',
      cell: row => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => setSelectedUser(row)}
            sx={{ color: 'primary.main' }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(row.id)}
            sx={{ color: 'error.main' }}
          >
            <DeleteForever fontSize="small" />
          </IconButton>
        </Box>
      ),
      width: '100px',
      right: true
    }
  ];

  const filteredData = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.designation_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          display: 'flex', 
          justifyContent: 'space-between' 
        }}
      >
        <Typography>Department User Management</Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
          <Box sx={{ display: 'grid', gap: 2, mb: 2, mt: 3 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              size="small"
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              size="small"
            />
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              size="small"
            />
            <FormControl size="small" required>
              <InputLabel>Designation</InputLabel>
              <Select
                value={formData.designation_id}
                label="Designation"
                onChange={(e) => setFormData({ ...formData, designation_id: e.target.value })}
              >
                {designations.map(desig => (
                  <MenuItem key={desig.id} value={desig.id}>
                    {desig.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {selectedUser && (
              <Button 
                variant="outlined"
                onClick={() => setSelectedUser(null)}
                startIcon={<PersonAdd />}
                sx={{ flex: 1 }}
              >
                Add New User
              </Button>
            )}
            <Button 
              type="submit" 
              variant="contained"
              sx={{ flex: selectedUser ? 1 : '100%' }}
            >
              {selectedUser ? 'Update User' : 'Add User'}
            </Button>
          </Box>
        </Box>

        <TextField
          fullWidth
          size="small"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
        />

        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          highlightOnHover
          pointerOnHover
          responsive
          striped
          progressPending={!users.length}
          persistTableHead
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 20, 30, 50]}
          noDataComponent={
            <Box sx={{ py: 4 }}>
              <Typography color="text.secondary">
                No department users found
              </Typography>
            </Box>
          }
        />
      </DialogContent>
    </Dialog>
  );
}

export default DepartmentUserModal;