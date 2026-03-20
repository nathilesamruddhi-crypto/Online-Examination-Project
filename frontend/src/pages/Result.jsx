// frontend/src/pages/Result.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CheckCircle,
  Cancel,
  EmojiEvents,
  Replay,
  Home,
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '20px',
  textAlign: 'center',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
}));

const ResultCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '15px',
  textAlign: 'center',
  height: '100%',
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    score, 
    total, 
    percentage, 
    correct, 
    wrong,
    status,
    passing_marks,
  } = location.state || { 
    score: 0, 
    total: 0, 
    percentage: 0, 
    correct: 0, 
    wrong: 0 
  };

  if (status === "FAIL") {
  return { text: 'F', color: '#f44336', message: 'Failed' };
}
if (percentage >= 90) return { text: 'A+', color: '#4caf50', message: 'Excellent!' };
if (percentage >= 80) return { text: 'A', color: '#4caf50', message: 'Great Job!' };
if (percentage >= 70) return { text: 'B+', color: '#8bc34a', message: 'Good Work!' };
if (percentage >= 60) return { text: 'B', color: '#ff9800', message: 'Satisfactory' };
return { text: 'C', color: '#ff9800', message: 'Needs Improvement' };

  const grade = getGrade();

  const chartData = {
    labels: ['Correct', 'Incorrect'],
    datasets: [
      {
        data: [correct, wrong],
        backgroundColor: ['#4caf50', '#f44336'],
        borderColor: ['#4caf50', '#f44336'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    maintainAspectRatio: true,
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <StyledPaper elevation={3}>
          <EmojiEvents sx={{ fontSize: 80, color: grade.color, mb: 2 }} />
          
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Exam Completed!
          </Typography>
          
          <Typography variant="h5" sx={{ color: grade.color, mb: 2 }}>
            {grade.message}
          </Typography>

          <Typography variant="h1" sx={{ color: grade.color, fontWeight: 700, mb: 2 }}>
            {percentage}%
          </Typography>
          <Typography
            variant="h4"
            sx={{
              color: status === "PASS" ? "#4caf50" : "#f44336",
              fontWeight: "bold",
              mb: 2
            }}
          >
            {status === "PASS" ? "🎉 PASS" : "❌ FAIL"}
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <ResultCard>
                <CardContent>
                  <CheckCircle sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                  <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 700 }}>
                    {correct}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Correct Answers
                  </Typography>
                </CardContent>
              </ResultCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <ResultCard>
                <CardContent>
                  <Cancel sx={{ fontSize: 40, color: '#f44336', mb: 1 }} />
                  <Typography variant="h4" sx={{ color: '#f44336', fontWeight: 700 }}>
                    {wrong}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Incorrect Answers
                  </Typography>
                </CardContent>
              </ResultCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <ResultCard>
                <CardContent>
                  <EmojiEvents sx={{ fontSize: 40, color: grade.color, mb: 1 }} />
                  <Typography variant="h4" sx={{ color: grade.color, fontWeight: 700 }}>
                    {score}/{total}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Score
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Passing Marks: {passing_marks}%
                  </Typography>
                </CardContent>
              </ResultCard>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Box sx={{ width: '300px', height: '300px' }}>
              <Pie data={chartData} options={chartOptions} />
            </Box>
          </Box>

          <Typography variant="h3" sx={{ mb: 2, color: grade.color }}>
            Grade: {grade.text}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<Replay />}
              onClick={() => navigate('/dashboard')}
              sx={{
                borderRadius: '10px',
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': {
                  borderColor: '#764ba2',
                  backgroundColor: 'rgba(102, 126, 234, 0.04)',
                },
              }}
            >
              Try Another Exam
            </Button>
            
            <Button
              variant="contained"
              startIcon={<Home />}
              onClick={() => navigate('/dashboard')}
              sx={{
                borderRadius: '10px',
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              }}
            >
              Go to Dashboard
            </Button>
          </Box>
        </StyledPaper>
      </Container>
    </Box>
  );
};

export default Result;