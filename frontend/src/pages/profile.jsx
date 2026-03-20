// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Grid,
  Button,
  TextField,
  Divider,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  ExitToApp as ExitToAppIcon,
  EmojiEvents,
  Timeline,
  CalendarToday,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { getUserResults } from '../api';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '20px',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  margin: '0 auto 20px',
  border: '4px solid #667eea',
  boxShadow: '0 8px 32px 0 rgba(102, 126, 234, 0.37)',
  fontSize: '3rem',
  backgroundColor: '#764ba2',
}));

const InfoCard = styled(Card)(({ theme }) => ({
  borderRadius: '15px',
  marginBottom: theme.spacing(2),
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 40px -12px rgba(0,0,0,0.5)',
  },
}));

const Profile = () => {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [results, setResults] = useState([]);
  
  const [userData, setUserData] = useState({
    id: localStorage.getItem('userId') || '',
    username: localStorage.getItem('username') || '',
    email: localStorage.getItem('email') || 'user@example.com',
    firstName: localStorage.getItem('firstName') || 'John',
    lastName: localStorage.getItem('lastName') || 'Doe',
    phone: localStorage.getItem('phone') || '+1234567890',
    role: localStorage.getItem('role') || 'student',
    joinedDate: localStorage.getItem('joinedDate') || new Date().toISOString().split('T')[0],
  });

  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    fetchUserResults();
  }, []);

  const fetchUserResults = async () => {
    try {
      const response = await getUserResults(userData.id);
      setResults(response.data || []);
    } catch (err) {
      console.error('Error fetching results:', err);
    }
  };

  const handleChange = (e) => {
    setUserData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Save to localStorage
      Object.keys(userData).forEach(key => {
        localStorage.setItem(key, userData[key]);
      });
      
      setSuccess('Profile updated successfully!');
      setEditMode(false);
      setOriginalData(userData);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setUserData(originalData);
    setEditMode(false);
    setError('');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const getInitials = () => {
    return `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`;
  };

  const getFullName = () => {
    return `${userData.firstName} ${userData.lastName}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateStats = () => {
    if (results.length === 0) {
      return { total: 0, average: 0, best: 0, recent: [] };
    }
    
    const total = results.length;
    const average = Math.round(results.reduce((acc, curr) => acc + curr.percentage, 0) / total);
    const best = Math.max(...results.map(r => r.percentage));
    const recent = results.slice(0, 3);
    
    return { total, average, best, recent };
  };

  const stats = calculateStats();

  if (loading && !userData.username) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <AppBar position="static" sx={{ background: 'transparent', boxShadow: 'none' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My Profile
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <ExitToAppIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <StyledPaper elevation={3}>
          <ProfileAvatar>
            {getInitials()}
          </ProfileAvatar>

          <Typography variant="h4" align="center" gutterBottom>
            {getFullName()}
          </Typography>

          <Chip
            label={userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
            color="primary"
            icon={<BadgeIcon />}
            sx={{ display: 'block', width: 'fit-content', mx: 'auto', mb: 3, px: 2 }}
          />

          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>
              {success}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
              {error}
            </Alert>
          )}

          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            variant="fullWidth"
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Personal Info" icon={<PersonIcon />} />
            <Tab label="Statistics" icon={<Timeline />} />
          </Tabs>

          {tabValue === 0 && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <InfoCard>
                    <CardContent>
                      <Box display="flex" alignItems="center">
                        <PersonIcon sx={{ color: '#667eea', mr: 2 }} />
                        <Box flex={1}>
                          <Typography variant="body2" color="textSecondary">
                            Username
                          </Typography>
                          {editMode ? (
                            <TextField
                              name="username"
                              value={userData.username}
                              onChange={handleChange}
                              size="small"
                              fullWidth
                              variant="outlined"
                              sx={{ mt: 1 }}
                            />
                          ) : (
                            <Typography variant="body1">{userData.username}</Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </InfoCard>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <InfoCard>
                    <CardContent>
                      <Box display="flex" alignItems="center">
                        <EmailIcon sx={{ color: '#667eea', mr: 2 }} />
                        <Box flex={1}>
                          <Typography variant="body2" color="textSecondary">
                            Email
                          </Typography>
                          {editMode ? (
                            <TextField
                              name="email"
                              value={userData.email}
                              onChange={handleChange}
                              size="small"
                              fullWidth
                              variant="outlined"
                              sx={{ mt: 1 }}
                            />
                          ) : (
                            <Typography variant="body1">{userData.email}</Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </InfoCard>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <InfoCard>
                    <CardContent>
                      <Box display="flex" alignItems="center">
                        <PersonIcon sx={{ color: '#667eea', mr: 2 }} />
                        <Box flex={1}>
                          <Typography variant="body2" color="textSecondary">
                            First Name
                          </Typography>
                          {editMode ? (
                            <TextField
                              name="firstName"
                              value={userData.firstName}
                              onChange={handleChange}
                              size="small"
                              fullWidth
                              variant="outlined"
                              sx={{ mt: 1 }}
                            />
                          ) : (
                            <Typography variant="body1">{userData.firstName}</Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </InfoCard>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <InfoCard>
                    <CardContent>
                      <Box display="flex" alignItems="center">
                        <PersonIcon sx={{ color: '#667eea', mr: 2 }} />
                        <Box flex={1}>
                          <Typography variant="body2" color="textSecondary">
                            Last Name
                          </Typography>
                          {editMode ? (
                            <TextField
                              name="lastName"
                              value={userData.lastName}
                              onChange={handleChange}
                              size="small"
                              fullWidth
                              variant="outlined"
                              sx={{ mt: 1 }}
                            />
                          ) : (
                            <Typography variant="body1">{userData.lastName}</Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </InfoCard>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <InfoCard>
                    <CardContent>
                      <Box display="flex" alignItems="center">
                        <PhoneIcon sx={{ color: '#667eea', mr: 2 }} />
                        <Box flex={1}>
                          <Typography variant="body2" color="textSecondary">
                            Phone
                          </Typography>
                          {editMode ? (
                            <TextField
                              name="phone"
                              value={userData.phone}
                              onChange={handleChange}
                              size="small"
                              fullWidth
                              variant="outlined"
                              sx={{ mt: 1 }}
                            />
                          ) : (
                            <Typography variant="body1">{userData.phone}</Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </InfoCard>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <InfoCard>
                    <CardContent>
                      <Box display="flex" alignItems="center">
                        <CalendarToday sx={{ color: '#667eea', mr: 2 }} />
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Member Since
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(userData.joinedDate)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </InfoCard>
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                {editMode ? (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={loading}
                      sx={{
                        borderRadius: '10px',
                        background: 'linear-gradient(45deg, #4caf50 30%, #45a049 90%)',
                      }}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={loading}
                      sx={{
                        borderRadius: '10px',
                        borderColor: '#f44336',
                        color: '#f44336',
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(true)}
                    sx={{
                      borderRadius: '10px',
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    }}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              {/* Statistics Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <InfoCard>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="#667eea">
                        {stats.total}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Exams Taken
                      </Typography>
                    </CardContent>
                  </InfoCard>
                </Grid>
                
                <Grid item xs={4}>
                  <InfoCard>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="#4caf50">
                        {stats.average}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Average Score
                      </Typography>
                    </CardContent>
                  </InfoCard>
                </Grid>
                
                <Grid item xs={4}>
                  <InfoCard>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="#ff9800">
                        {stats.best}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Best Score
                      </Typography>
                    </CardContent>
                  </InfoCard>
                </Grid>
              </Grid>

              {/* Recent Results */}
              <Typography variant="h6" gutterBottom>
                Recent Exam Results
              </Typography>
              
              {stats.recent.length > 0 ? (
                <List>
                  {stats.recent.map((result, index) => (
                    <InfoCard key={index}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle1">
                              {result.exam_title}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {formatDate(result.completed_at)}
                            </Typography>
                          </Box>
                          <Chip
                            label={`${result.percentage}%`}
                            color={result.percentage >= 70 ? 'success' : result.percentage >= 50 ? 'warning' : 'error'}
                            sx={{ fontWeight: 'bold' }}
                          />
                        </Box>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            Score: {result.score}/{result.total}
                          </Typography>
                        </Box>
                      </CardContent>
                    </InfoCard>
                  ))}
                </List>
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center', borderRadius: '15px' }}>
                  <EmojiEvents sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                  <Typography color="textSecondary">
                    No exam results yet. Start taking exams to see your progress!
                  </Typography>
                </Paper>
              )}
            </Box>
          )}
        </StyledPaper>
      </Container>
    </Box>
  );
};

export default Profile;