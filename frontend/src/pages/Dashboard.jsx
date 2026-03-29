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
  Fade,
  Grow,
  Slide,
  useTheme,
  alpha,
  Stack,
  LinearProgress,
  Tooltip,
  Badge,
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
  Analytics,
  Speed,
  Stars,
  Schedule,
  CheckCircle,
  PlayArrow,
  ArrowForward,
  TrendingDown,
  TrendingFlat,
  MoreVert,
  CalendarToday,
  AccessTime,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid,  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { getExams, getUserResults, getStudentDashboard } from '../api';

// Styled Components with Professional Design
const GlassCard = styled(Card)(({ theme }) => ({
  borderRadius: '8px',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
  },
}));

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: '8px',
  background: theme.palette.background.paper,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec489a)',
  },
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.12)',
  },
}));

const StatCard = styled(Paper)(({ theme }) => ({
  borderRadius: '8px',
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
  color: 'white',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    right: '-20%',
    width: '200px',
    height: '200px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  padding: '10px 24px',
  textTransform: 'none',
  fontWeight: 600,
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  color: '#fff',
  
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));



const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
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

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const examsResponse = await getExams();
      setExams(examsResponse.data || []);
      
      if (userRole === 'student' && userId) {
        try {
          const dashboardResponse = await getStudentDashboard(userId);
          setDashboardData(dashboardResponse.data);
        } catch (err) {
          console.warn('Student dashboard not available:', err);
        }
        
        try {
          const resultsResponse = await getUserResults(userId);
          setResults(resultsResponse.data || []);
        } catch (err) {
          console.warn('Results not available:', err);
          setResults([]);
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

  const attemptedExamIds = new Set(
    results.map((result) => Number(result.exam_id))
  );

  const baseStudentExams =
    dashboardData?.exams && dashboardData.exams.length > 0
      ? dashboardData.exams
      : exams;

  const studentExams = baseStudentExams.map((exam) => ({
    ...exam,
    is_taken: exam.is_taken ?? attemptedExamIds.has(Number(exam.id)),
  }));

  const examsList = userRole === 'student' ? studentExams : exams;
  const totalExams = examsList.length;
  const completedExams =
    userRole === 'student'
      ? studentExams.filter((exam) => exam.is_taken).length
      : 0;
  const averageScore = dashboardData?.stats?.average_score || 0;
  const pendingExams = Math.max(totalExams - completedExams, 0);
  const completionRate = totalExams > 0 ? (completedExams / totalExams) * 100 : 0;

  // Prepare chart data
  const performanceData = results.slice(0, 5).map(result => ({
    name: result.exam_title?.substring(0, 10) + '...',
    score: result.percentage,
    fullTitle: result.exam_title,
  }));

  const pieData = [
    { name: 'Completed', value: completedExams, color: '#2c7e51c1', icon: CheckCircle },
    { name: 'Pending', value: pendingExams, color: '#f59e0b', icon: Schedule },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return '#10b926';
      case 'completed': return '#096e3f';
      case 'upcoming': return '#f59e0b';
      default: return '#94a3b8';
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

  useEffect(() => {
    if (localStorage.getItem("refreshDashboard")) {
      fetchDashboardData();
      localStorage.removeItem("refreshDashboard");
    }
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, background: '#f8fafc', minHeight: '100vh' }}>
        <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>
        <Button variant="contained" onClick={fetchDashboardData}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      minHeight: '100vh',
    }}>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: 'none',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              edge="start" 
              color="inherit" 
              sx={{ 
                color: '#6366f1',
                '&:hover': { backgroundColor: alpha('#6366f1', 0.1) },
              }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              ExamPortal
            </Typography>

            <Chip
              label={userRole === 'admin' ? 'Administrator' : 'Student'}
              size="small"
              sx={{
                background: userRole === 'admin' ? alpha('#ef4444', 0.1) : alpha('#10b981', 0.1),
                color: userRole === 'admin' ? '#ef4444' : '#10b981',
                fontWeight: 600,
                borderRadius: '8px',
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {userRole === 'admin' && (
              <Button 
                component={Link} 
                to="/admin"
                startIcon={<AdminPanelSettings />}
                sx={{ 
                  textTransform: 'none', 
                  fontWeight: 600,
                  borderRadius: '8px',
                  color: '#6366f1',
                  '&:hover': { background: alpha('#6366f1', 0.1) },
                }}
              >
                Admin Panel
              </Button>
            )}

            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{ 
                ml: 1,
                border: '2px solid transparent',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                padding: '2px',
                '&:hover': { transform: 'scale(1.05)' },
                transition: 'transform 0.2s',
              }}
            >
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'white', color: '#6366f1' }}>
                {getInitials()}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  borderRadius: '8px',
                  minWidth: 220,
                  mt: 1.5,
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {getFullName()}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {userRole === 'admin' ? 'Administrator' : 'Student Account'}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                <ListItemIcon><Person fontSize="small" sx={{ color: '#6366f1' }} /></ListItemIcon>
                Profile Settings
              </MenuItem>
              
              {userRole === 'student' && (
                <MenuItem onClick={() => { handleMenuClose(); navigate('/results'); }}>
                  <ListItemIcon><EmojiEvents fontSize="small" sx={{ color: '#6366f1' }} /></ListItemIcon>
                  My Results
                </MenuItem>
              )}
              
              <Divider />
              
              <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
                <ListItemIcon><ExitToApp fontSize="small" sx={{ color: '#ef4444' }} /></ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                backgroundClip: 'text',
                color: 'transparent',
                mb: 1,
              }}
            >
              Welcome back, {getFullName()}!
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {userRole === 'admin' 
                ? `You're managing ${totalExams} exam${totalExams !== 1 ? 's' : ''}. Keep up the great work!`
                : `Ready to continue your learning journey? You have ${pendingExams} exam${pendingExams !== 1 ? 's' : ''} waiting for you.`}
            </Typography>
          </Box>
        </Fade>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Grow in timeout={600}>
              <StatCard elevation={0}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Total Exams
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800 }}>
                      {totalExams}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 56, height: 56 }}>
                    <School sx={{ fontSize: 32 }} />
                  </Avatar>
                </Box>
              </StatCard>
            </Grow>
          </Grid>

          {userRole === 'student' ? (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <Grow in timeout={700}>
                  <StatCard elevation={0}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          Completed
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 800 }}>
                          {completedExams}
                        </Typography>
                        
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 56, height: 56 }}>
                        <EmojiEvents sx={{ fontSize: 32 }} />
                      </Avatar>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={completionRate} 
                      sx={{ 
                        mt: 2, 
                        borderRadius: '4px', 
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        '& .MuiLinearProgress-bar': { bgcolor: 'white' }
                      }} 
                    />
                  </StatCard>
                </Grow>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Grow in timeout={800}>
                  <StatCard elevation={0}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          Average Score
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 800 }}>
                          {averageScore}%
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {averageScore >= 70 ? 'Excellent!' : averageScore >= 50 ? 'Good progress' : 'Keep practicing'}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 56, height: 56 }}>
                        <TrendingUp sx={{ fontSize: 32 }} />
                      </Avatar>
                    </Box>
                  </StatCard>
                </Grow>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Grow in timeout={900}>
                  <StatCard elevation={0}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          Pending
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 800 }}>
                          {pendingExams}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          Ready to start
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 56, height: 56 }}>
                        <Schedule sx={{ fontSize: 32 }} />
                      </Avatar>
                    </Box>
                  </StatCard>
                </Grow>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <Grow in timeout={700}>
                  <StatCard elevation={0}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          Total Questions
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 800 }}>
                          {exams.reduce((acc, exam) => acc + (exam.question_count || 0), 0)}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 56, height: 56 }}>
                        <MenuBook sx={{ fontSize: 32 }} />
                      </Avatar>
                    </Box>
                  </StatCard>
                </Grow>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Grow in timeout={800}>
                  <StatCard elevation={0}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          Active Students
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 800 }}>
                          {dashboardData?.activeStudents || 0}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 56, height: 56 }}>
                        <Person sx={{ fontSize: 32 }} />
                      </Avatar>
                    </Box>
                  </StatCard>
                </Grow>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Grow in timeout={900}>
                  <StatCard elevation={0}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          Avg. Completion
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 800 }}>
                          {dashboardData?.avgCompletion || 0}%
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 56, height: 56 }}>
                        <Analytics sx={{ fontSize: 32 }} />
                      </Avatar>
                    </Box>
                  </StatCard>
                </Grow>
              </Grid>
            </>
          )}
        </Grid>

        {/* Charts Section - Only for students with results */}
        {userRole === 'student' && results.length > 0 && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Slide in direction="up" timeout={600}>
                <ModernCard>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Performance Trend
                      </Typography>
                      <Chip 
                        icon={<BarChartIcon />} 
                        label="Last 5 Exams" 
                        size="small" 
                        sx={{ borderRadius: '8px' }}
                      />
                    </Box>
                    <ResponsiveContainer width="100%" height={240}>
                      <AreaChart data={performanceData}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis domain={[0, 100]} stroke="#94a3b8" />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '8px', 
                            border: 'none', 
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#6366f1" 
                          strokeWidth={3}
                          fill="url(#colorScore)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </ModernCard>
              </Slide>
            </Grid>

            <Grid item xs={12} md={4}>
              <Slide in direction="up" timeout={700}>
                <ModernCard>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                      Exam Progress
                    </Typography>
                    <ResponsiveContainer width="100%" height={240}>
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
                      {pieData.map((item, idx) => (
                        <Box key={idx} display="flex" alignItems="center" gap={1}>
                          <Box sx={{ width: 10, height: 10, bgcolor: item.color, borderRadius: '50%' }} />
                          <Typography variant="body2" color="textSecondary">
                            {item.name} ({item.value})
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </ModernCard>
              </Slide>
            </Grid>
          </Grid>
        )}

        {/* Available Exams Section */}
        <Box sx={{ mt: 4, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {userRole === 'admin' ? 'Exam Catalog' : 'Available Assessments'}
            </Typography>
            <Chip 
              label={`${examsList.length} ${examsList.length === 1 ? 'Exam' : 'Exams'}`} 
              sx={{ borderRadius: '8px', fontWeight: 600 }}
            />
          </Box>
        </Box>
        
        {examsList.length === 0 ? (
          <GlassCard>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <School sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No exams available
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                {userRole === 'admin' 
                  ? 'Create your first exam to get started.'
                  : 'Check back later for new assessments.'}
              </Typography>
              {userRole === 'admin' && (
                <GradientButton component={Link} to="/admin">
                  Create Exam
                </GradientButton>
              )}
            </CardContent>
          </GlassCard>
        ) : (
          <Grid container spacing={3}>
            {examsList.map((exam, index) => {
              const status = exam.is_taken ? 'completed' : 'available';
              
              return (
                <Grid item xs={12} md={6} lg={4} key={exam.id}>
                  <Grow in timeout={800 + index * 100}>
                    <ModernCard>
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                              {exam.title}
                            </Typography>
                            {exam.description && (
                              <Typography variant="body2" color="textSecondary">
                                {exam.description}
                              </Typography>
                            )}
                          </Box>
                          <Chip
                            label={status === 'completed' ? 'Completed' : 'Available'}
                            size="small"
                            sx={{
                              bgcolor: status === 'completed' ? alpha('#10b981', 0.1) : alpha('#6366f1', 0.1),
                              color: status === 'completed' ? '#10b981' : '#6366f1',
                              fontWeight: 600,
                              borderRadius: '8px',
                            }}
                          />
                        </Box>

                        <Box sx={{ my: 2 }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <AccessTime sx={{ fontSize: 16, color: '#94a3b8' }} />
                              <Typography variant="body2" color="textSecondary">
                                {exam.duration} min
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Assignment sx={{ fontSize: 16, color: '#94a3b8' }} />
                              <Typography variant="body2" color="textSecondary">
                                {exam.question_count || 0} questions
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>

                        {exam.is_taken ? (
                          <GradientButton
                            disabled
                            fullWidth
                            sx={{
                              background: '#e2e8f0',
                              color: '#94a3b8',
                            }}
                          >
                            <CheckCircle sx={{ mr: 1, fontSize: 18 }} />
                            Completed
                          </GradientButton>
                        ) : (
                          <GradientButton
                            fullWidth
                            onClick={() => navigate(`/exam/${exam.id}`)}
                            endIcon={<PlayArrow />}
                          >
                            Start Exam
                          </GradientButton>
                        )}

                        {userRole === 'admin' && (
                          <OutlineButton
                            fullWidth
                            onClick={() => navigate(`/admin/questions/${exam.id}`)}
                            sx={{ mt: 1.5 }}
                          >
                            Manage Questions
                          </OutlineButton>
                        )}
                      </CardContent>
                    </ModernCard>
                  </Grow>
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