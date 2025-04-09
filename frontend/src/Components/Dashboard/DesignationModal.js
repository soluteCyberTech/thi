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
import { reg_designation, update_designation, delete_designation } from '../BaseURL';

function DesignationModal({ open, onClose }) {
  const [designations, setDesignations] = useState([]);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDesignations = async () => {
    try {
      const response = await axios.get(reg_designation);
      setDesignations(response.data);
    } catch (error) {
      Swal.fire('Error', 'Failed to fetch designations', 'error');
    }
  };

  useEffect(() => {
    if (open) {
      fetchDesignations();
    }
  }, [open]);

  useEffect(() => {
    if (selectedDesignation) {
      setFormData(selectedDesignation);
    } else {
      setFormData({ title: '', description: '' });
    }
  }, [selectedDesignation]);

  const showNotification = async (options) => {
    onClose();
    await Swal.fire(options);
    if (!options.error) {
      await fetchDesignations();
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

      if (selectedDesignation) {
        const response = await axios.put(update_designation(selectedDesignation.id), formData);
        if (response.data.success) {
          await showNotification({
            title: 'Success',
            text: 'Designation updated successfully',
            icon: 'success'
          });
        }
      } else {
        const response = await axios.post(reg_designation, formData);
        if (response.data.success) {
          await showNotification({
            title: 'Success',
            text: 'Designation created successfully',
            icon: 'success'
          });
        }
      }
      setSelectedDesignation(null);
      setFormData({ title: '', description: '' });
    } catch (error) {
      await showNotification({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to save designation',
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
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete!'
      });

      if (result.isConfirmed) {
        const response = await axios.delete(delete_designation(id));
        if (response.data.success) {
          await showNotification({
            title: 'Success',
            text: 'Designation deleted successfully',
            icon: 'success'
          });
        }
      }
      onClose(false);
    } catch (error) {
      await showNotification({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to delete designation',
        icon: 'error',
        error: true
      });
    }
  };

  const handleCreateNew = () => {
    setSelectedDesignation(null);
    setFormData({ title: '', description: '' });
  };

  const columns = [
    {
      name: 'Title',
      selector: row => row.title,
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
            onClick={() => setSelectedDesignation(row)}
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

  const filteredData = designations.filter(designation =>
    designation.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
        <Typography>Designation Management</Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
          <Box sx={{ display: 'grid', gap: 2, mb: 2, mt: 3 }}>
            <TextField
              label="Designation Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            {selectedDesignation && (
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
              sx={{ flex: selectedDesignation ? 1 : '100%' }}
            >
              {selectedDesignation ? 'Update Designation' : 'Add Designation'}
            </Button>
          </Box>
        </Box>

        <TextField
          fullWidth
          size="small"
          placeholder="Search designation..."
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

export default DesignationModal;