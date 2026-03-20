// frontend/src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Slide,
  Fade,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { register } from '../api';

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
}));

const AnimatedBox = styled(Box)({
  animation: 'float 3s ease-in-out infinite',
  '@keyframes float': {
    '0%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-10px)' },
    '100%': { transform: 'translateY(0px)' },
  },
});

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
  border: 0,
  borderRadius: 15,
  boxShadow: '0 3px 5px 2px rgba(102, 126, 234, .3)',
  color: 'white',
  height: 48,
  padding: '0 30px',
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'scale(1.02)',
    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
  },
}));

const steps = ['Account Details', 'Personal Information', 'Review'];

const Register = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'student',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateStep = () => {
    const newErrors = {};

    if (activeStep === 0) {
      if (!formData.username) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }

      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (activeStep === 1) {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      }
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required';
      }
      if (!formData.gender) {
        newErrors.gender = 'Gender is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    setError('');

    try {
      // Prepare data for API
      const userData = {
        username: formData.username,
        password: formData.password,
        role: formData.role,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      };

      const response = await register(userData);
      
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Fade in timeout={500}>
            <Box>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: '#667eea' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '15px',
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: '#667eea' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '15px',
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  startAdornment: <LockIcon sx={{ mr: 1, color: '#667eea' }} />,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '15px',
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                InputProps={{
                  startAdornment: <LockIcon sx={{ mr: 1, color: '#667eea' }} />,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '15px',
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role"
                  value={formData.role}
                  label="Role"
                  onChange={handleChange}
                  sx={{
                    borderRadius: '15px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                    },
                  }}
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="teacher">Teacher</MenuItem>
                  <MenuItem value="admin">Administrator</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Fade>
        );

      case 1:
        return (
          <Fade in timeout={500}>
            <Box>
              <TextField
                margin="normal"
                required
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '15px',
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '15px',
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="phone"
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '15px',
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="address"
                label="Address"
                name="address"
                multiline
                rows={2}
                value={formData.address}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '15px',
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="dateOfBirth"
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '15px',
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />

              <FormControl fullWidth margin="normal" error={!!errors.gender}>
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  label="Gender"
                  onChange={handleChange}
                  sx={{
                    borderRadius: '15px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                    },
                  }}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
              </FormControl>
            </Box>
          </Fade>
        );

      case 2:
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: '#667eea' }}>
                Review Your Information
              </Typography>
              
              <Paper sx={{ p: 3, mb: 2, borderRadius: '15px', bgcolor: '#f8f9fa' }}>
                <Typography variant="subtitle2" color="textSecondary">Username</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{formData.username}</Typography>
                
                <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{formData.email}</Typography>
                
                <Typography variant="subtitle2" color="textSecondary">Role</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{formData.role}</Typography>
                
                <Typography variant="subtitle2" color="textSecondary">Full Name</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {formData.firstName} {formData.lastName}
                </Typography>
                
                <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{formData.phone}</Typography>
                
                <Typography variant="subtitle2" color="textSecondary">Address</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{formData.address || 'Not provided'}</Typography>
                
                <Typography variant="subtitle2" color="textSecondary">Date of Birth</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{formData.dateOfBirth}</Typography>
                
                <Typography variant="subtitle2" color="textSecondary">Gender</Typography>
                <Typography variant="body1">{formData.gender}</Typography>
              </Paper>
            </Box>
          </Fade>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        py: 4,
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%)',
            animation: 'rotate 20s linear infinite',
          },
          '@keyframes rotate': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
          },
        }}
      />

      <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={1000}>
          <StyledPaper elevation={6}>
            <AnimatedBox>
              <SchoolIcon sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
            </AnimatedBox>

            {success ? (
              <Fade in timeout={500}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircleIcon sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    Registration Successful!
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Your account has been created successfully. Redirecting to login...
                  </Typography>
                  <CircularProgress size={30} sx={{ color: '#667eea' }} />
                </Box>
              </Fade>
            ) : (
              <>
                <Typography component="h1" variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#333' }}>
                  Create Account
                </Typography>

                <Typography variant="body2" sx={{ mb: 3, color: '#666', textAlign: 'center' }}>
                  Join our online examination platform
                </Typography>

                <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {error && (
                  <Slide direction="up" in mountOnEnter unmountOnExit>
                    <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: '10px' }}>
                      {error}
                    </Alert>
                  </Slide>
                )}

                <Box component="form" noValidate sx={{ width: '100%' }}>
                  {getStepContent(activeStep)}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button
                      onClick={handleBack}
                      disabled={activeStep === 0}
                      startIcon={<ArrowBackIcon />}
                      sx={{
                        borderRadius: '15px',
                        color: '#667eea',
                      }}
                    >
                      Back
                    </Button>

                    {activeStep === steps.length - 1 ? (
                      <GradientButton
                        onClick={handleSubmit}
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Register'}
                      </GradientButton>
                    ) : (
                      <GradientButton onClick={handleNext}>
                        Next
                      </GradientButton>
                    )}
                  </Box>

                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Already have an account?{' '}
                      <Button
                        component={Link}
                        to="/"
                        sx={{
                          color: '#667eea',
                          textTransform: 'none',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        Sign in here
                      </Button>
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
          </StyledPaper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Register;