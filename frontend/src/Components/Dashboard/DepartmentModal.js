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
  Typography
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  DeleteForever
} from '@mui/icons-material';
import DataTable from 'react-data-table-component';
import { reg_department, update_department, delete_department } from '../BaseURL';

function DepartmentModal({ open, onClose }) {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

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
      fetchDepartments();
    }
  }, [open]);

  useEffect(() => {
    if (selectedDepartment) {
      setFormData(selectedDepartment);
    } else {
      setFormData({ name: '', description: '' });
    }
  }, [selectedDepartment]);

  const showNotification = async (options) => {
    onClose(); // Close dialog before showing notification
    await Swal.fire(options);
    if (!options.error) {
      await fetchDepartments();
    }
    onClose(false); // Reopen dialog after notification
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      onClose(); // Close dialog before processing
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

      if (selectedDepartment) {
        const response = await axios.put(update_department(selectedDepartment.id), formData);
        if (response.data.success) {
          await showNotification({
            title: 'Success',
            text: 'Department updated successfully',
            icon: 'success'
          });
        }
      } else {
        const response = await axios.post(reg_department, formData);
        if (response.data.success) {
          await showNotification({
            title: 'Success',
            text: 'Department created successfully',
            icon: 'success'
          });
        }
      }
      setSelectedDepartment(null);
      setFormData({ name: '', description: '' });
    } catch (error) {
      await showNotification({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to save department',
        icon: 'error',
        error: true
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      onClose(); // Close dialog before confirmation
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
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

        const response = await axios.delete(delete_department(id));
        if (response.data.success) {
          await Swal.fire({
            title: 'Deleted!',
            text: 'Department has been deleted.',
            icon: 'success'
          });
          await fetchDepartments();
        }
      }
      onClose(false); // Reopen dialog after operations
    } catch (error) {
      await Swal.fire({
        title: 'Error',
        text: 'Failed to delete department',
        icon: 'error'
      });
      onClose(false); // Reopen dialog even if there's an error
    }
  };

  const handleCreateNew = () => {
    setSelectedDepartment(null);
    setFormData({ name: '', description: '' });
  };

  const columns = [
    {
      name: 'Department Name',
      selector: row => row.name,
      sortable: true,
      grow: 1
    },
    {
      name: 'Description',
      selector: row => row.description,
      sortable: true,
      wrap: true,
      grow: 2
    },
    {
      name: 'Actions',
      cell: row => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => setSelectedDepartment(row)}
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

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f5f5f5',
        fontWeight: 'bold'
      }
    },
    rows: {
      style: {
        minHeight: '60px',
      }
    }
  };

  const filteredData = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
        <Typography>Department/Unit Management</Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
          <Box sx={{ display: 'grid', gap: 2, mb: 2, mt: 3 }}>
            <TextField
              label="Department Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              size="small"
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              size="small"
              multiline
              rows={2}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {selectedDepartment && (
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
              sx={{ flex: selectedDepartment ? 1 : '100%' }}
            >
              {selectedDepartment ? 'Update' : 'Add Department'}
            </Button>
          </Box>
        </Box>

        <TextField
          fullWidth
          size="small"
          placeholder="Search department name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
        />

        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          customStyles={customStyles}
          highlightOnHover
          pointerOnHover
          responsive
          striped
        />
      </DialogContent>
    </Dialog>
  );
}

export default DepartmentModal;