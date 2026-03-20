// frontend/src/pages/Login.jsx
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import { login } from '../api';

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
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

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(formData);
      
      if (response.data.error) {
        setError(response.data.error);
        setLoading(false);
      } else {
        // Store user data
        localStorage.setItem('userId', response.data.user_id);
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('role', response.data.role);
        
        console.log('Login response:', response.data); // Debug log
        console.log('Stored role:', response.data.role); // Debug log
        
        // Redirect based on role
        if (response.data.role === 'admin') {
          console.log('Redirecting to admin page'); // Debug log
          navigate('/admin');
        } else {
          console.log('Redirecting to dashboard'); // Debug log
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
      setLoading(false);
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

      <Container component="main" maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={1000}>
          <StyledPaper elevation={6}>
            <AnimatedBox>
              <SchoolIcon sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
            </AnimatedBox>

            <Typography component="h1" variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#333' }}>
              Welcome Back
            </Typography>

            <Typography variant="body2" sx={{ mb: 3, color: '#666', textAlign: 'center' }}>
              Sign in to continue to your examination portal
            </Typography>

            {error && (
              <Slide direction="up" in mountOnEnter unmountOnExit>
                <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: '10px' }}>
                  {error}
                </Alert>
              </Slide>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={formData.username}
                onChange={handleChange}
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
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <LockIcon sx={{ mr: 1, color: '#667eea' }} />,
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

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: '15px',
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Don't have an account?{' '}
                  <Button
                    component={Link}
                    to="/register"
                    sx={{
                      color: '#667eea',
                      textTransform: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Register here
                  </Button>
                </Typography>
              </Box>
            </Box>
          </StyledPaper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;