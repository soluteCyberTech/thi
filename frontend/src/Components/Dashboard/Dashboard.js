import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { URL } from '../BaseURL';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ErrorMessage } from '../Message';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import { useNavigate } from 'react-router-dom';
import DepartmentModal from './DepartmentModal';
import HODModal from './HODModal';
import DesignationModal from './DesignationModal'; 
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardHeader,
  CardContent,
  Alert,
  Fade,
  CircularProgress,
  IconButton,
  LinearProgress,
  Tabs,
  Tab,
  Badge
} from '@mui/material';

import {
  Visibility,
  VisibilityOff,
  CheckCircleOutline,
  LockReset,
  InfoOutlined,
  Check,
  Person,
  Business,
  Settings,
  DeleteForever,
  Dashboard as DashboardIcon,
  Edit as EditIcon,
  PersonAdd,
  Business as BusinessIcon,
  Add as AddIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  NotificationsOutlined,
  Category as CategoryIcon
} from '@mui/icons-material';

const PageContainer = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#f5f6fa',
  overflow: 'hidden',
  width: '100%',
  position: 'relative'
}));

const MainContent = styled('main')(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(3),
  width: '100%',
  overflowX: 'hidden',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  }
}));



const ContentWrapper = styled('div')({
  overflowX: 'hidden',
  overflowY: 'auto',
  width: '100%',
  height: '100%'
});

const TabsContainer = styled('div')(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(3),
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  '.MuiTabs-root': {
    minHeight: 48,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '.MuiTab-root': {
    minHeight: 48,
    textTransform: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: theme.palette.text.secondary,
    '&.Mui-selected': {
      color: theme.palette.primary.main,
    }
  }
}));

function Dashboard(props) {
  const [activeTab, setActiveTab] = useState(0);
  const [userInfo, setUserInfo] = useState();
  const [ComanpyDetailsInfo, setComanpyDetailsInfo] = useState();
  const [departments, setDepartments] = useState([]);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPasswordchange, SetshowPasswordchange] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [passwordError, setpasswordError] = useState(false);
  const [confirmPasswordError, setconfirmPasswordError] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    letter: false,
    number: false,
    special: false
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showHODModal, setShowHODModal] = useState(false);
  const [showDesignationModal, setShowDesignationModal] = useState(false);

  useEffect(() => {
    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      setUserInfo(JSON.parse(savedUserInfo));
    }
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${URL}/departments`);
        setDepartments(response.data);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    };

    if (activeTab === 1) {
      fetchDepartments();
    }
  }, [activeTab]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const togglePasswordVisibility1 = () => {
    setShowPassword1(!showPassword1);
  };

  useEffect(() => {
    if (userInfo) {
      if (userInfo.is_staff == 0) {
        handalShowPasswordChange();
      }
    }
  }, [userInfo]);

  const handalShowPasswordChange = () => {
    SetshowPasswordchange(true);
  };

  const handalclosePasswordChange = () => {
    SetshowPasswordchange(false);
  };

  const navigate = useNavigate();

  const validatePassword = (password) => {
    setPasswordStrength({
      length: password.length >= 8,
      letter: /[A-Za-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*#?&]/.test(password)
    });
    return password.length >= 8 && /[A-Za-z]/.test(password) && 
           /\d/.test(password) && /[@$!%*#?&]/.test(password);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });
    const isValid = validatePassword(newPassword);
    setpasswordError(!isValid);
    if (!isValid) {
      setError('Please meet all password requirements');
    } else {
      setError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPass = e.target.value;
    setFormData({ ...formData, confirmPassword: confirmPass });
    setconfirmPasswordError(confirmPass !== formData.password);
    if (confirmPass !== formData.password) {
      setError('Passwords do not match');
    } else {
      setError('');
    }
  };

  const changePasswordFirstTime = async (e) => {
    e.preventDefault();

    if (passwordError || confirmPasswordError) {
      ErrorMessage('Error', 'Minimum 8 characters at least 1 Number and 1 Special Character');
    } else {
      setLoading(true);
      const trans_code = userInfo.trans_code;

      try {
        const response = await axios.post(URL + 'changepassword', {
          password: formData.password, trans_code
        });

        if (response.data.success) {
          setSuccess(true);

          setTimeout(() => {
            navigate('/');
          }, 3000);
        }
      } catch (error) {
        setError(error.response?.data?.message);
        setLoading(false);
      }
    }
  };

  const calculatePasswordStrength = () => {
    const { length, letter, number, special } = passwordStrength;
    const criteria = [length, letter, number, special];
    const strengthPercentage = (criteria.filter(Boolean).length / 4) * 100;
    
    if (strengthPercentage === 100) return { value: 100, color: 'success' };
    if (strengthPercentage >= 75) return { value: 75, color: 'info' };
    if (strengthPercentage >= 50) return { value: 50, color: 'warning' };
    return { value: 25, color: 'error' };
  };

  const handleEditDepartment = (dept) => {
    setSelectedDepartment(dept);
    setShowDepartmentModal(true);
  };

  const handleDeleteDepartment = async (deptId) => {
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
      try {
        await axios.delete(`${URL}/departments/${deptId}`);
        setDepartments(departments.filter(dept => dept.id !== deptId));
        Swal.fire('Deleted!', 'Department has been deleted.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete department.', 'error');
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };



  const handleDepartmentClick = () => {
    setShowDepartmentModal(true);
  };

  const handleModalClose = (reopen = true) => {
    setShowDepartmentModal(!reopen);
  };

  const handleHODClick = () => {
    setShowHODModal(true);
  };

  const handleHODModalClose = (reopen = true) => {
    setShowHODModal(!reopen);
  };

  const handleDesignationClick = () => {
    setShowDesignationModal(true);
  };

  const handleDesignationModalClose = (reopen = true) => {
    setShowDesignationModal(!reopen);
  };

  return (
    <PageContainer>
      <MainContent>
  

        <TabsContainer>
          <Tabs 
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              borderBottom: 1,
              borderColor: 'divider'
            }}
          >
            <Tab 
              icon={<Person />} 
              iconPosition="start"
              label="My Profile" 
              sx={{ 
                minHeight: 48,
                alignItems: 'center'
              }}
            />
            <Tab 
              icon={<Settings />}
              iconPosition="start" 
              label="Quick Setup"
              sx={{ 
                minHeight: 48,
                alignItems: 'center'
              }}
            />
          </Tabs>
        </TabsContainer>

        <ContentWrapper>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              backgroundColor: 'white',
              maxWidth: '100%',
              '& > *': {
                maxWidth: '100%',
                overflowX: 'hidden'
              }
            }}
          >
           
            {activeTab === 0 && (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                
                  <Grid item xs={12}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 3, 
                        borderRadius: 2,
                        background: 'linear-gradient(to right, #fff, #f8fafc)'
                      }}
                    >
                      <Grid container spacing={3} alignItems="flex-start">
                        <Grid item xs={12} sm="auto">
                          <Box sx={{ position: 'relative' }}>
                            <Avatar 
                              alt="User Avatar" 
                              src={userInfo?.avatar || '/default-avatar.png'}
                              sx={{ 
                                width: { xs: 80, sm: 100 }, 
                                height: { xs: 80, sm: 100 },
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                              }}
                            />
                            <IconButton
                              size="small"
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                backgroundColor: 'primary.main',
                                '&:hover': { backgroundColor: 'primary.dark' },
                              }}
                            >
                              <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(e) => {}}
                              />
                              <EditIcon sx={{ color: 'white', fontSize: '1rem' }} />
                            </IconButton>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm>
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            height: '100%',
                            justifyContent: 'space-between'
                          }}>
                            <Box>
                              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {userInfo?.name || 'Jack Adams'}
                              </Typography>
                              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                {userInfo?.role || 'Product Designer'}
                              </Typography>
                            </Box>
                            <Stack 
                              direction={{ xs: 'column', sm: 'row' }} 
                              spacing={2}
                              sx={{ mt: { xs: 2, sm: 0 } }}
                            >
                              <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={() => {}}
                                sx={{ textTransform: 'none' }}
                              >
                                Edit Profile
                              </Button>
                              <Button
                                variant="outlined"
                                startIcon={<LockReset />}
                                onClick={handalShowPasswordChange}
                                sx={{ textTransform: 'none' }}
                              >
                                Change Password
                              </Button>
                            </Stack>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

               
                  <Grid container item spacing={3}>
                 
                    <Grid item xs={12} md={6}>
                      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                          Personal Information
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="First Name"
                              size="small"
                              value={userInfo?.firstName || 'Jack'}
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Last Name"
                              size="small"
                              value={userInfo?.lastName || 'Adams'}
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Email"
                              size="small"
                              value={userInfo?.email || 'jackadams@gmail.com'}
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Phone"
                              size="small"
                              value={userInfo?.phone || '(213) 555-1234'}
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>

                
                    <Grid item xs={12} md={6}>
                      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                          Company Information
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Company Name"
                              size="small"
                              value={ComanpyDetailsInfo?.name || 'Tech Solutions Inc'}
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Department"
                              size="small"
                              value={userInfo?.department || 'Product Design'}
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Position"
                              size="small"
                              value={userInfo?.position || 'Senior Designer'}
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {activeTab === 1 && (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {[
                    {
                      title: 'Departments/Units',
                      description: 'Manage departments and organizational units',
                      icon: <BusinessIcon />,
                      color: '#1e88e5',
                      onClick: handleDepartmentClick
                    },
                    {
                      title: 'HOD Management',
                      description: 'Assign and manage heads of departments',
                      icon: <PersonAdd />,
                      color: '#43a047',
                      onClick: handleHODClick
                    },
                    {
                      title: 'Designations',
                      description: 'Set up job titles and positions',
                      icon: <CategoryIcon />,
                      color: '#fb8c00',
                      onClick: handleDesignationClick
                    }
                  ].map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          cursor: 'pointer',
                          height: '100%',
                          borderRadius: 2,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                          }
                        }}
                        onClick={item.onClick}
                      >
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              backgroundColor: `${item.color}15`,
                              color: item.color
                            }}
                          >
                            {item.icon}
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                              {item.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.description}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Paper>
        </ContentWrapper>
      </MainContent>

      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={showPasswordchange}
        onHide={handalclosePasswordChange}
        keyboard={false}
        backdrop="static"
      >
        <Modal.Header className='text-white bg-success'>
          <Modal.Title>
            <Box display="flex" alignItems="center" gap={1}>
              <LockReset />
              <Typography variant="h5">Change Your Password</Typography>
            </Box>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body sx={{ p: 2.5 }}>
          {success && (
            <Fade in>
              <Alert
                icon={<CheckCircleOutline />}
                severity="success"
                sx={{ mb: 3 }}
              >
                Password changed successfully! Redirecting to login...
              </Alert>
            </Fade>
          )}

          {error && (
            <Fade in>
              <Alert
                severity="error"
                sx={{ mb: 3 }}
              >
                {error}
              </Alert>
            </Fade>
          )}

          <form onSubmit={changePasswordFirstTime}>
            <Box mb={3}>
              <TextField
                label="New Password"
                variant="outlined"
                fullWidth
                size="small"
                value={formData.password}
                onChange={handlePasswordChange}
                required
                error={passwordError}
                type={showPassword ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
              {formData.password && (
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                      Password Strength:
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={calculatePasswordStrength().value}
                      color={calculatePasswordStrength().color}
                      sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                    {[
                      { key: 'length', text: 'At least 8 characters' },
                      { key: 'letter', text: 'Contains a letter' },
                      { key: 'number', text: 'Contains a number' },
                      { key: 'special', text: 'Contains a special character' }
                    ].map((req) => (
                      <ListItem key={req.key} dense sx={{ py: 0 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <Check 
                            fontSize="small" 
                            color={passwordStrength[req.key] ? 'success' : 'disabled'} 
                          />
                        </ListItemIcon>
                        <ListItemText 
                          primary={req.text} 
                          primaryTypographyProps={{
                            variant: 'caption',
                            color: passwordStrength[req.key] ? 'text.primary' : 'text.secondary'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>

            <Box mb={3}>
              <TextField
                label="Confirm Password"
                variant="outlined"
                fullWidth
                size="small"
                value={formData.confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
                error={confirmPasswordError}
                type={showPassword1 ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={togglePasswordVisibility1}
                      edge="end"
                      size="small"
                    >
                      {showPassword1 ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
            </Box>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              type="submit"
              disabled={loading || passwordError || confirmPasswordError}
              size="medium"
              sx={{
                py: 1,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              {loading ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={20} color="inherit" />
                  <span>Processing...</span>
                </Box>
              ) : (
                'Change Password'
              )}
            </Button>
          </form>
        </Modal.Body>
      </Modal>

      <DepartmentModal
        open={showDepartmentModal}
        onClose={handleModalClose}
      />

      <HODModal
        open={showHODModal}
        onClose={handleHODModalClose}
      />

      <DesignationModal // Add the modal component
        open={showDesignationModal}
        onClose={handleDesignationModalClose}
      />
    </PageContainer>
  );
}

export default Dashboard;