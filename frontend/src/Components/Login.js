import React, { useState, useEffect } from 'react'
import axios from 'axios';
import logo from '../images/Flexpos.jpg'
import Stack from '@mui/material/Stack';
import Swal from 'sweetalert2';
import { successMessage,loadingErrorMessage } from './Message';
import { useNavigate } from 'react-router-dom';
import { URL } from './BaseURL';

import {
 
    TextField,
    Button,
    Alert,
    Fade,
    CircularProgress,
  } from '@mui/material';

  import { 
    Visibility, 
    VisibilityOff, 
    CheckCircleOutline
  } from '@mui/icons-material';
function Login() {

    
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const navigate =useNavigate()
    const [showPassword, setShowPassword] = useState(false);
    const [companylogo, setcompanylogo] = useState('')
    const [companyname, setcompanyName] = useState('')
    const [company, setcompany] = useState('')
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
      });

    const [username, setUsername] = useState();
    const [usernameError, setusernameError] = useState(false);

    const [password, setPassword] = useState();
    const [passwordError, setpasswordError] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

  useEffect(()=>{
      
      axios.get(URL)
      .then(res=>setcompany(res.data))
       .catch(err=>console.log(err))
  
  },[])
  
  useEffect(()=>{
  
      if(company){
  
        setcompanyName(company[0].name)
        setcompanylogo(company[0].logo)
      }
      
  
  },[company])


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
    
        try {
          const response = await axios.post(URL+'login', {
            username: formData.username,
            password: formData.password
          });
    
          if (response.data.success) {
            setSuccess(true);
            
            // Store user data in localStorage
            const userData = {
              name: response.data.user.name,
              email: response.data.user.email, 
              department: response.data.user.department,
              role: response.data.user.role,
              staff_id: response.data.user.staff_id,
              is_staff: response.data.user.is_staff ,
              trans_code: response.data.user.id ,
            };
            
            localStorage.setItem('userInfo', JSON.stringify(userData));
            
           // if (rememberMe) {
             // localStorage.setItem('rememberedUsername', formData.username);
           // }
    
            setTimeout(() => {
              navigate('/dashboard');
            }, 1000);
          }
        } catch (error) {
          setError(error.response?.data?.message || 'Invalid username or password');
          setLoading(false);
        }
      };

    

    const usernameErrorhandel=()=>{
        if(!formData.username){
            setusernameError(true)
            return
        }

        setusernameError(false)
         
    }

    const passwordErrorhandel=()=>{

        if(!formData.password){
            setpasswordError(true)
            return
        }

        setpasswordError(false)

    }


    return (

        <div className="container main_pane">
            <div className="row w-100">
                {/* Left Side */}
                <div className="col-md-6 d-flex flex-column justify-content-center align-items-center left_side p-4 text-center mt-4">
                    <div className="mb-4 mt-4">
                        <img src={companylogo} alt="Logo" className="img-fluid mb-2 p-3 border rounded shadow-sm" />
                    </div>
                    {<h6 className="com_name mb-3">{companyname}</h6>}
                    <p className="text-muted">Manage Well To Grow</p>
                </div>

                {/* Right Side Login */}
                <div className="col-md-5 login_page p-4 border rounded shadow-sm mb-4">
                    <div className="my_log">
                        <img src={logo} alt="Logo" className="img-fluid mb-2" />
                        
                        <h3>Welcome!</h3>
                    </div>

                    <div className="smal_info mb-3">Enter your Username And Password to access your account</div>

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
                  Login successful! Redirecting...
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
                   
                    <form onSubmit={handleSubmit}>
                        {/* Username Field */}
                        <TextField
                            label="Username"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            className="text-field"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                            error={usernameError}
                            onBlur={usernameErrorhandel}
                        />

                        {/* Password Field */}
                        <TextField
                            label="Password"
                            variant="outlined"
                            type={showPassword ? 'text' : 'password'}
                            className="text-field"
                            fullWidth
                            margin="normal"
                            error={passwordError}
                            onBlur={passwordErrorhandel}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            InputProps={{
                                endAdornment: (
                                    <Button onClick={togglePasswordVisibility} sx={{ minWidth: 'auto', padding: 0 }}>
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </Button>
                                ),
                            }}
                        />

                        {/* Submit Button */}
                        <Button variant="contained" color="primary" fullWidth className="mt-3 login_bu" type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <CircularProgress size={24} color="inherit" style={{ marginRight: '8px' }} />
                                    Logging in...
                                </>
                            ) : (
                                'Log In'
                            )}
                        </Button>

                       
                        <div className="text-center mt-3">
                            <a href="#" className="text-success-">Forgot password?</a>
                        </div>

                        <div className="text-center mt-2 own">Powered by Solute Cyber Technology</div>
                    </form>
                </div>
            </div>
        </div>

    )
}

export default Login
