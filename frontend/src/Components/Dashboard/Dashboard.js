import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { URL } from '../BaseURL';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ErrorMessage } from '../Message';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import { useNavigate } from 'react-router-dom';
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
  Tab
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
  PersonAdd
} from '@mui/icons-material';

const PageContainer = styled('div')({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#f5f6fa'
});

const ScrollableContent = styled('div')({
  flexGrow: 1,
  overflowY: 'auto',
  padding: '24px'
});

function Dashboard(props) {
  const [userInfo, setUserInfo] = useState();
  const [ComanpyDetailsInfo, setComanpyDetailsInfo] = useState();

  useEffect(() => {
    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      setUserInfo(JSON.parse(savedUserInfo));
    }
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);

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

  const [showPasswordchange, SetshowPasswordchange] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const [passwordError, setpasswordError] = useState(false);
  const [confirmPasswordError, setconfirmPasswordError] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    letter: false,
    number: false,
    special: false
  });

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

  const handalShowPasswordChange = () => {
    SetshowPasswordchange(true);
  };

  const handalclosePasswordChange = () => {
    SetshowPasswordchange(false);
  };

  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
    // mui
    const { length, letter, number, special } = passwordStrength;
    const criteria = [length, letter, number, special];
    const strengthPercentage = (criteria.filter(Boolean).length / 4) * 100;
    
    if (strengthPercentage === 100) return { value: 100, color: 'success' };
    if (strengthPercentage >= 75) return { value: 75, color: 'info' };
    if (strengthPercentage >= 50) return { value: 50, color: 'warning' };
    return { value: 25, color: 'error' };
  };

  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <PageContainer>
      <ScrollableContent>
        <Paper 
          elevation={0}
          sx={{ 
            display: 'flex',
            height: '100%',
            overflow: 'hidden',
            borderRadius: 2
          }}
        >
          {/*Tabs */}
          <Box sx={{ 
            width: 250,
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: 'white',
          }}>
            <Tabs
              orientation="vertical"
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  minHeight: '56px',
                  textTransform: 'none',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  px: 3,
                  fontSize: '0.875rem',
                  color: 'text.secondary'
                },
                '& .Mui-selected': {
                  color: 'primary.main',
                  bgcolor: 'action.selected'
                }
              }}
            >
              <Tab
                icon={<Person />}
                iconPosition="start"
                label="My Profile"
                sx={{ width: '100%' }}
              />
              <Tab
                icon={<Settings />}
                iconPosition="start"
                label="Settings"
                sx={{ width: '100%' }}
              />
              <Tab
                icon={<DeleteForever />}
                iconPosition="start"
                label="Delete Account"
                sx={{
                  width: '100%',
                  color: 'error.main',
                  '&.Mui-selected': {
                    color: 'error.main',
                    bgcolor: 'error.lighter'
                  }
                }}
              />
            </Tabs>
          </Box>

          {/* Conten*/}
          <Box sx={{ 
            flex: 1,
            overflowY: 'auto',
            bgcolor: '#f8fafc',
            p: 3
          }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3,
                height: '100%',
                borderRadius: 2,
                bgcolor: 'white'
              }}
            >
              {activeTab === 0 && (
                <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
                  <Grid container spacing={3}>
                    {/* Profile  */}
                    <Grid item xs={12}>
                      <Paper sx={{ p: 3, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                          <Box sx={{ position: 'relative' }}>
                            <Avatar 
                              alt="User Avatar" 
                              src={userInfo?.avatar || '/default-avatar.png'}
                              sx={{ width: 100, height: 100 }}
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
                                onChange={(e) => {
                                  // Handle image upload
                                }}
                              />
                              <EditIcon sx={{ color: 'white', fontSize: '1rem' }} />
                            </IconButton>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, mb: 1 }}>
                              {userInfo?.name || 'Jack Adams'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {userInfo?.role || 'Product Designer'}
                            </Typography>
                            <Stack direction="row" spacing={2}>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() => {/* Handle edit profile */}}
                              >
                                Edit Profile
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<LockReset />}
                                onClick={handalShowPasswordChange}
                              >
                                Change Password
                              </Button>
                            </Stack>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Personal Information */}
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3 }}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          Personal Information
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="First Name"
                              size="small"
                              value={userInfo?.firstName || 'Jack'}
                              InputProps={{
                                readOnly: true,
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Last Name"
                              size="small"
                              value={userInfo?.lastName || 'Adams'}
                              InputProps={{
                                readOnly: true,
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Email"
                              size="small"
                              value={userInfo?.email || 'jackadams@gmail.com'}
                              InputProps={{
                                readOnly: true,
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Phone"
                              size="small"
                              value={userInfo?.phone || '(213) 555-1234'}
                              InputProps={{
                                readOnly: true,
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>


                  </Grid>
                </Box>
              )}
              
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 500 }}>
                    Account Settings
                  </Typography>
              
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" color="error" gutterBottom sx={{ fontSize: '1rem', fontWeight: 500 }}>
                    Delete Account
                  </Typography>
                  <Alert severity="warning" sx={{ mb: 2, fontSize: '0.875rem' }}>
                    Warning: This action cannot be undone. All your data will be permanently deleted.
                  </Alert>
             
                </Box>
              )}
            </Paper>
          </Box>
        </Paper>
      </ScrollableContent>
      
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
    </PageContainer>
  );
}

export default Dashboard;