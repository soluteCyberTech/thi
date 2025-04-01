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
} from '@mui/material';

import { 
  Visibility, 
  VisibilityOff, 
  CheckCircleOutline
} from '@mui/icons-material';


const PageContainer = styled('div')({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#f5f6fa',
  marginBottom:'60px'
});


const ScrollableContent = styled('div')({
  flexGrow: 1,
  overflowY: 'auto',
  padding: '24px'
});
function Dashboard(props) {
 
  const [userInfo ,setUserInfo]=useState()
  const [ComanpyDetailsInfo ,setComanpyDetailsInfo]=useState()

  

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


  useEffect(()=>{

    if(userInfo){

      if(userInfo.is_staff==0){
        handalShowPasswordChange()
      }

    }

  },[userInfo])

   
  const [showPasswordchange ,SetshowPasswordchange] =useState(false)

   
  const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
          password: '',
          confirmPassword: ''
         });


    const [passwordError ,setpasswordError]=useState(false)

    const [confirmPasswordError ,setconfirmPasswordError]=useState(false)


    const passwordErrorhandel=()=>{
      if(!(formData.password.match('^(?=.*[A-Za-z])(?=.*\\d)(?=.*[$@$!%*#?&])[A-Za-z\\d$@$!%*#?&]{8,}$'))){
        setpasswordError(true)
        return
      }
      setpasswordError(false)
    }


    const confirmPasswordErrorHandel=()=>{
      if((formData.confirmPassword) !=formData.password){
        setconfirmPasswordError(true)
        return
      }
      setconfirmPasswordError(false)
    }

    const handalShowPasswordChange = () => {
        SetshowPasswordchange(true)
    }

    const handalclosePasswordChange = () => {

        SetshowPasswordchange(false)
    }

   
    const navigate =useNavigate()
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const changePasswordFirstTime= async(e)=>{
      e.preventDefault();
      
     if(passwordError || confirmPasswordError){

      ErrorMessage('Error' ,'Minimum 8 characters at least 1 Number and 1 Special Character')

     } else {

      setLoading(true);
      const trans_code=userInfo.trans_code
       try {
                const response = await axios.post(URL+'changepassword', {
                  password: formData.password, trans_code
                });
          
                if (response.data.success) {
                   setSuccess(true);
                  
                  setTimeout(() => {
                    navigate('/');
                  }, 3000);
                }
              } catch (error) {
                 setError(error.response?.data?.message );
                setLoading(false);
              }
     }
  }

      

  return (
    <PageContainer>

    <Box Box sx={{ 
        p: 3, 
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        backgroundColor: '#fff'
      }}>
        <Typography variant="h5" fontWeight="500">
          System Home
        </Typography>
      </Box>

      
      <ScrollableContent>

      </ScrollableContent>


   

      <Modal 
      
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      show={showPasswordchange} onHide={handalclosePasswordChange}  keyboard={false}  backdrop="static">
        <Modal.Header className='text-white bg-success' >
          <Modal.Title><h4>Please Change Your Password</h4></Modal.Title>
        </Modal.Header>
        <Modal.Body>

            <Stack sx={{ width: '100%' }} spacing={2}>
            <Alert severity="warning">Minimum 8 characters at least  1 Number and 1 Special Character</Alert>
          </Stack>
         
          {success ? (
              <Fade in>
                <Alert 
                  icon={<CheckCircleOutline fontSize="inherit" />}
                  severity="success" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      fontSize: 24
                    }
                  }}
                >
                  Password Change successful! Redirecting... , .Please Re-Login
                </Alert>
              </Fade>
            ) : error && (
              <Fade in>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      fontSize: 24
                    }
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}
               
                <form onSubmit={changePasswordFirstTime}>
                  
                  <TextField
                        label="New Password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        size="small"
                        className="text-field mb-3 mt-4"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        error={passwordError}
                        onBlur={passwordErrorhandel}
                        type={showPassword ? 'text' : 'password'}
                        

                         InputProps={{
                          endAdornment: (
                              <Button onClick={togglePasswordVisibility} sx={{ minWidth: 'auto', padding: 0 }}>
                                  <Visibility />
                              </Button>
                          ),
                      }}
                    />


                    <TextField
                        label="confirm New Password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        size="small"
                        className="text-field"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        error={confirmPasswordError}
                        onBlur={confirmPasswordErrorHandel}
                        type={showPassword1 ? 'text' : 'password'}

                        InputProps={{
                          endAdornment: (
                              <Button onClick={togglePasswordVisibility1} sx={{ minWidth: 'auto', padding: 0 }}>
                                  <Visibility />
                              </Button>
                          ),
                      }}
                    />

                
                  {/* Submit Button */}
                        <Button variant="contained" color="primary" fullWidth className="mt-3 login_bu" type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <CircularProgress size={24} color="inherit" style={{ marginRight: '8px' }} />
                                    Changing  Password .....
                                </>
                            ) : (
                                'Change Password'
                            )}
                        </Button>
                </form>
            
            
          
        </Modal.Body>
      </Modal>


    </PageContainer>
  )
}

export default Dashboard