// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  School,
  Assignment,
  Timeline,
  Person,
  ExitToApp,
  Dashboard as DashboardIcon,
  EmojiEvents,
  TrendingUp,
  MenuBook,
  AdminPanelSettings,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getExams, getUserResults, getStudentDashboard } from '../api';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '15px',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 40px -12px rgba(0,0,0,0.5)',
  },
}));

const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '15px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
}));

const Dashboard = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const userRole = localStorage.getItem('role');
  const username = localStorage.getItem('username') || 'User';
  const userId = localStorage.getItem('userId');
  const firstName = localStorage.getItem('first_name') || '';
  const lastName = localStorage.getItem('last_name') || '';

  useEffect(() => {
    fetchDashboardData();
  }, []);

// In Dashboard.jsx, update the fetchDashboardData function
const fetchDashboardData = async () => {
  setLoading(true);
  setError('');
  
  try {
    // Fetch all exams
    const examsResponse = await getExams();
    setExams(examsResponse.data || []);
    
    if (userRole === 'student' && userId) {
      try {
        // Fetch student-specific dashboard data
        const dashboardResponse = await getStudentDashboard(userId);
        setDashboardData(dashboardResponse.data);
      } catch (err) {
        console.warn('Student dashboard not available:', err);
        // Don't set error state here, just log it
      }
      
      try {
        // Fetch user results
        const resultsResponse = await getUserResults(userId);
        setResults(resultsResponse.data || []);
      } catch (err) {
        console.warn('Results not available:', err);
        setResults([]); // Set empty results
      }
    }
    
  } catch (err) {
    console.error('Error fetching exams:', err);
    setError('Failed to load exams. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Calculate statistics
  const totalExams = exams.length;
  const completedExams = results.length;
  const averageScore = results.length > 0 
    ? Math.round(results.reduce((acc, curr) => acc + curr.percentage, 0) / results.length) 
    : 0;
  
  const pendingExams = exams.filter(exam => 
    !results.some(result => result.exam_id === exam.id)
  ).length;

  // Prepare chart data
  const performanceData = results.slice(0, 5).map(result => ({
    name: result.exam_title?.substring(0, 10) + '...',
    score: result.percentage
  }));

  const pieData = [
    { name: 'Completed', value: completedExams, color: '#4caf50' },
    { name: 'Pending', value: pendingExams, color: '#ff9800' },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return 'success';
      case 'completed': return 'primary';
      case 'upcoming': return 'warning';
      default: return 'default';
    }
  };

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`;
    }
    return username.charAt(0).toUpperCase();
  };

  const getFullName = () => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return username;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={fetchDashboardData}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, background: '#f5f5f5', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {userRole === 'admin' ? 'Admin Dashboard' : 'Student Dashboard'}
          </Typography>

          {/* Admin Panel Button */}
          {userRole === 'admin' && (
            <Button 
              color="inherit" 
              component={Link} 
              to="/admin"
              startIcon={<AdminPanelSettings />}
              sx={{ mr: 2, textTransform: 'none' }}
            >
              Admin Panel
            </Button>
          )}

          {/* User Menu */}
          <IconButton
            onClick={handleMenuOpen}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#764ba2' }}>
              {getInitials()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              sx: {
                borderRadius: '15px',
                minWidth: 200,
                mt: 1.5,
              }
            }}
          >
            <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
              <ListItemIcon><Person fontSize="small" /></ListItemIcon>
              Profile
            </MenuItem>
            
            {userRole === 'student' && (
              <MenuItem onClick={() => { handleMenuClose(); navigate('/results'); }}>
                <ListItemIcon><EmojiEvents fontSize="small" /></ListItemIcon>
                My Results
              </MenuItem>
            )}
            
            <Divider />
            
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><ExitToApp fontSize="small" /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            borderRadius: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Typography variant="h4" gutterBottom>
            Welcome back, {getFullName()}!
          </Typography>
          <Typography variant="body1">
            {userRole === 'admin' 
              ? `You have ${totalExams} total exams to manage.`
              : `You have ${pendingExams} exam${pendingExams !== 1 ? 's' : ''} waiting for you.`}
          </Typography>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <StatCard>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.8 }} gutterBottom>
                      Total Exams
                    </Typography>
                    <Typography variant="h3">{totalExams}</Typography>
                  </Box>
                  <School sx={{ fontSize: 50, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </StatCard>
          </Grid>

          
              {userRole === 'student' ? (
               <>
              <Grid item xs={12} sm={4}>
                <StatCard>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.8 }} gutterBottom>
                          Completed
                        </Typography>
                        <Typography variant="h3">{completedExams}</Typography>
                      </Box>
                      <EmojiEvents sx={{ fontSize: 50, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </StatCard>
              </Grid>

              <Grid item xs={12} sm={4}>
                <StatCard>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.8 }} gutterBottom>
                          Avg. Score
                        </Typography>
                        <Typography variant="h3">{averageScore}%</Typography>
                      </Box>
                      <TrendingUp sx={{ fontSize: 50, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </StatCard>
              </Grid>
            </>
          ) : (
            <Grid item xs={12} sm={8}>
              <StatCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8 }} gutterBottom>
                        Total Questions
                      </Typography>
                      <Typography variant="h3">
                        {exams.reduce((acc, exam) => acc + (exam.question_count || 0), 0)}
                      </Typography>
                    </Box>
                    <MenuBook sx={{ fontSize: 50, opacity: 0.8 }} /> {/* Changed from BookOpen to MenuBook */}
                  </Box>
                </CardContent>
              </StatCard>
            </Grid>
          )}
        </Grid>

        {/* Charts Section - Only for students with results */}
        {userRole === 'student' && results.length > 0 && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Performance Chart */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, borderRadius: '15px' }}>
                <Typography variant="h6" gutterBottom>
                  Recent Performance
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#667eea" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Progress Pie Chart */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: '15px', height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Exam Progress
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
                  <Box display="flex" alignItems="center">
                    <Box sx={{ width: 12, height: 12, bgcolor: '#4caf50', borderRadius: '50%', mr: 1 }} />
                    <Typography variant="body2">Completed</Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Box sx={{ width: 12, height: 12, bgcolor: '#ff9800', borderRadius: '50%', mr: 1 }} />
                    <Typography variant="body2">Pending</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Available Exams */}
        <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          {userRole === 'admin' ? 'All Exams' : 'Available Exams'}
        </Typography>
        
        {exams.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '15px' }}>
            <Typography variant="body1" color="textSecondary">
              {userRole === 'admin' 
                ? 'No exams created yet. Go to Admin Panel to create exams.'
                : 'No exams available at the moment.'}
            </Typography>
            {userRole === 'admin' && (
              <Button
                variant="contained"
                component={Link}
                to="/admin"
                sx={{ mt: 2, borderRadius: '10px' }}
              >
                Go to Admin Panel
              </Button>
            )}
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {exams.map((exam) => {
              const isCompleted = results.some(r => r.exam_id === exam.id);
              const status = isCompleted ? 'completed' : 'available';
              
              return (
                <Grid item xs={12} md={4} key={exam.id}>
                  <StyledCard>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {exam.title}
                      </Typography>
                      
                      <Box sx={{ mt: 2, mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Duration: {exam.duration} minutes
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Questions: {exam.question_count || 0}
                        </Typography>
                        {exam.description && (
                          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            {exam.description}
                          </Typography>
                        )}
                      </Box>

                      <Chip
                        label={status.charAt(0).toUpperCase() + status.slice(1)}
                        color={getStatusColor(status)}
                        sx={{ mb: 2 }}
                      />

                      {userRole === 'student' && (
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => navigate(`/exam/${exam.id}`)}
                          disabled={status !== 'available' || exam.question_count === 0}
                          sx={{
                            borderRadius: '10px',
                            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                          }}
                        >
                          {status === 'completed' ? 'Already Completed' : 
                           exam.question_count === 0 ? 'No Questions' : 'Start Exam'}
                        </Button>
                      )}

                      {userRole === 'admin' && (
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => navigate(`/admin/questions/${exam.id}`)}
                          sx={{ borderRadius: '10px' }}
                        >
                          Manage Questions
                        </Button>
                      )}
                    </CardContent>
                  </StyledCard>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;