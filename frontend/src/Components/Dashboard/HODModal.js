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
  DeleteForever
} from '@mui/icons-material';
import DataTable from 'react-data-table-component';
import { reg_hod, update_hod, delete_hod, reg_department } from '../BaseURL';

function HODModal({ open, onClose }) {
  const [hods, setHODs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedHOD, setSelectedHOD] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department_id: ''
  });

  const fetchHODs = async () => {
    try {
      const response = await axios.get(reg_hod);
      setHODs(response.data);
    } catch (error) {
      Swal.fire('Error', 'Failed to fetch HODs', 'error');
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(reg_department);
      setDepartments(response.data);
    } catch (error) {
      Swal.fire('Error', 'Failed to fetch departments', 'error');
    }
  };

  useEffect(() => {
    if (open) {
      fetchHODs();
      fetchDepartments();
    }
  }, [open]);

  useEffect(() => {
    if (selectedHOD) {
        console.log(selectedHOD)
      
      setFormData(selectedHOD);
    } else {
      setFormData({ name: '', email: '', phone: '', department_id: '' });
    }
  }, [selectedHOD]);

  const showNotification = async (options) => {
    onClose(); 
    let result;
    if (options.error) {
      result = await Swal.fire({
        title: options.title,
        text: options.text,
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    } else {
      result = await Swal.fire({
        title: options.title,
        text: options.text,
        icon: 'success',
        confirmButtonColor: '#3085d6'
      });
    }
    if (!options.error) {
      await fetchHODs();
    }
    onClose(false); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      onClose();
      Swal.fire({
        title: 'Processing...',
        text: 'Please wait',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      if (selectedHOD) {
        const response = await axios.put(update_hod(selectedHOD.id), formData);
        if (response.data.success) {
          await showNotification({
            title: 'Success',
            text: 'HOD updated successfully',
            icon: 'success'
          });
        }
      } else {
        const response = await axios.post(reg_hod, formData);
        if (response.data.success) {
          await Swal.fire({
            title: 'HOD Created Successfully',
            html: `
              <div>
                <p>HOD account has been created.</p>
                <p style="margin-top: 10px; font-weight: bold;">Default Login Credentials:</p>
                <p>Username: ${formData.email}</p>
                <p>Password: ${formData.email}</p>
              </div>
            `,
            icon: 'success',
            confirmButtonColor: '#3085d6'
          });
          await fetchHODs();
        }
      }
      setSelectedHOD(null);
      setFormData({ name: '', email: '', phone: '', department_id: '' });
    } catch (error) {
      await showNotification({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to save HOD',
        icon: 'error',
        error: true
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      onClose(); 
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "This will delete both HOD and staff account. This action cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete!',
        cancelButtonText: 'No, cancel'
      });

      if (result.isConfirmed) {
        Swal.fire({
          title: 'Processing...',
          text: 'Please wait while we delete the accounts',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const response = await axios.delete(delete_hod(id));
        if (response.data.success) {
          await Swal.fire({
            title: 'Deleted Successfully',
            text: 'The HOD and associated staff account have been removed.',
            icon: 'success'
          });
          await fetchHODs();
        }
      }
      onClose(false); 
    } catch (error) {
      await Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to delete HOD',
        icon: 'error'
      });
      onClose(false); 
    }
  };

  const handleCreateNew = () => {
    setSelectedHOD(null);
    setFormData({ name: '', email: '', phone: '', department_id: '' });
  };

  const columns = [
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
      grow: 1
    },
    {
      name: 'Department',
      selector: row => row.department_name,
      sortable: true,
      grow: 1
    },
    {
      name: 'Email',
      selector: row => row.email,
      sortable: true,
      grow: 1
    },
    {
      name: 'Phone',
      selector: row => row.phone,
      sortable: true,
      grow: 1
    },
    {
      name: 'Actions',
      cell: row => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => setSelectedHOD(row)}
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
      right: true,
    }
  ];

  const filteredData = hods.filter(hod =>
    hod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hod.department_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
        <Typography>HOD Management</Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
          <Box sx={{ display: 'grid', gap: 2, mb: 2, mt: 3 }}>
            <TextField
              label="HOD Name"
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
              <InputLabel>Department</InputLabel>
              <Select
                value={formData.department_id}
                label="Department"
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              >
                {departments.map(dept => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {selectedHOD && (
              <Button 
                variant="outlined"
                onClick={handleCreateNew}
                sx={{ flex: 1 }}
              >
                Create New
              </Button>
            )}
            <Button 
              type="submit" 
              variant="contained"
              sx={{ flex: selectedHOD ? 1 : '100%' }}
            >
              {selectedHOD ? 'Update HOD' : 'Add HOD'}
            </Button>
          </Box>
        </Box>

        <TextField
          fullWidth
          size="small"
          placeholder="Search HOD or department..."
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
        />
      </DialogContent>
    </Dialog>
  );
}

export default HODModal;