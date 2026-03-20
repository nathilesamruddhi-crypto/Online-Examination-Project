// frontend/src/pages/ExamPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Grid,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Timer,
  NavigateBefore,
  NavigateNext,
  CheckCircle,
} from '@mui/icons-material';
import { getExamQuestions, submitExam } from '../api';
import { startAIMonitor } from "../api";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '20px',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
}));

const QuestionNumber = styled(Button)(({ theme, active, answered }) => ({
  minWidth: '40px',
  height: '40px',
  borderRadius: '10px',
  margin: '5px',
  backgroundColor: active ? '#667eea' : answered ? '#4caf50' : '#f5f5f5',
  color: active || answered ? 'white' : '#333',
  '&:hover': {
    backgroundColor: active ? '#667eea' : answered ? '#4caf50' : '#e0e0e0',
  },
}));

const ExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitDialog, setSubmitDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [warning, setWarning] = useState('');
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examData, setExamData] = useState(null);
  
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchExamData();
  }, []);

  useEffect(() => {
    if (examData && examData.duration) {
      setTimeLeft(examData.duration * 60); // Convert minutes to seconds
    }
  }, [examData]);
  useEffect(() => {

  const startMonitoring = async () => {
    try {
      await startAIMonitor();
      console.log("AI Monitoring Started");
    } catch (error) {
      console.error("AI monitoring failed", error);
    }
  };

  startMonitoring();

}, []);

useEffect(() => {

  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      console.log("Camera access granted");
    })
    .catch((err) => {
      alert("Camera access required for exam monitoring");
    });

}, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const fetchExamData = async () => {
    try {
      setLoading(true);
      
      // Fetch questions
      const questionsResponse = await getExamQuestions(examId);
      setQuestions(questionsResponse.data || []);
      
      // Initialize answers
      const initialAnswers = {};
      questionsResponse.data.forEach(q => {
        initialAnswers[q.id] = '';
      });
      setAnswers(initialAnswers);
      
      // You might want to fetch exam details here if you have an endpoint
      // const examResponse = await getExam(examId);
      // setExamData(examResponse.data);
      
      // For now, set a default duration of 60 minutes
      setExamData({ duration: 60 });
      
    } catch (error) {
      console.error('Failed to fetch exam data', error);
      setWarning('Failed to load exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value,
    });
  };

  const handleSubmit = async () => {
    if (examSubmitted || submitting) return;
    
    setSubmitting(true);
    setSubmitDialog(false);

    try {
      // Filter out empty answers
      const filteredAnswers = {};
      Object.keys(answers).forEach(key => {
        if (answers[key] && answers[key].trim() !== '') {
          filteredAnswers[key] = answers[key];
        }
      });

      const submitData = {
        user_id: parseInt(userId),
        exam_id: parseInt(examId),
        answers: filteredAnswers,
        time_taken: examData?.duration * 60 - timeLeft // Calculate time taken
      };
      
      const response = await submitExam(submitData);
      
      // Navigate to results page
      navigate('/result', { 
        state: { 
          score: response.data.score,
          total: response.data.total_questions,
          percentage: response.data.percentage,
          correct: response.data.correct_answers,
          wrong: response.data.wrong_answers,
          status: response.data.status,
          passing_marks: response.data.passing_marks
        } 
      });
      
    } catch (error) {
      console.error('Failed to submit exam', error);
      setWarning('Failed to submit exam. Please try again.');
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    setWarning('Time is up! Submitting your exam...');
    setTimeout(handleSubmit, 2000);
  };

  const getAnsweredCount = () => {
    return Object.values(answers).filter(answer => answer && answer.trim() !== '').length;
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper sx={{ p: 4, borderRadius: '20px', textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6">Loading exam questions...</Typography>
        </Paper>
      </Box>
    );
  }

  if (!questions.length) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper sx={{ p: 4, borderRadius: '20px', textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom color="error">
            No questions found
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            This exam doesn't have any questions yet.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard')}
            sx={{
              borderRadius: '10px',
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            }}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            color: 'white',
          }}
        >
          <Box>
            <Typography variant="h5" gutterBottom>
              Online Examination
            </Typography>
            <Typography variant="subtitle2">
              Question {currentQuestion + 1} of {questions.length}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Chip
              icon={<CheckCircle />}
              label={`${getAnsweredCount()}/${questions.length} Answered`}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '& .MuiChip-icon': { color: 'white' },
              }}
            />
            <Box display="flex" alignItems="center">
              <Timer sx={{ mr: 1 }} />
              <Typography variant="h6">{formatTime(timeLeft)}</Typography>
            </Box>
          </Box>
        </Box>

        {warning && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: '10px' }}>
            {warning}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Main Question Area */}
          <Grid item xs={12} md={8}>
            <StyledPaper>
              <Box sx={{ mb: 3 }}>
                <Chip
                  label={`Question ${currentQuestion + 1}`}
                  color="primary"
                  sx={{ mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  {questions[currentQuestion]?.question_text}
                </Typography>
              </Box>

              <RadioGroup
                value={answers[questions[currentQuestion]?.id] || ''}
                onChange={(e) =>
                  handleAnswerChange(questions[currentQuestion]?.id, e.target.value)
                }
              >
                {['a', 'b', 'c', 'd'].map((option) => {
                  const optionValue = questions[currentQuestion]?.[`option_${option}`];
                  const optionLabel = option.toUpperCase();
                  return optionValue ? (
                    <FormControlLabel
                      key={option}
                      value={optionValue}
                      control={<Radio />}
                      label={`${optionLabel}: ${optionValue}`}
                      sx={{
                        mb: 1,
                        p: 1,
                        borderRadius: '10px',
                        '&:hover': { backgroundColor: '#f5f5f5' },
                      }}
                    />
                  ) : null;
                })}
              </RadioGroup>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
                  startIcon={<NavigateBefore />}
                  disabled={currentQuestion === 0}
                  onClick={handlePrevQuestion}
                  sx={{
                    borderRadius: '10px',
                    borderColor: '#667eea',
                    color: '#667eea',
                  }}
                >
                  Previous
                </Button>
                
                {currentQuestion === questions.length - 1 ? (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => setSubmitDialog(true)}
                    disabled={examSubmitted || submitting}
                    sx={{
                      borderRadius: '10px',
                      background: 'linear-gradient(45deg, #4caf50 30%, #45a049 90%)',
                    }}
                  >
                    Submit Exam
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    endIcon={<NavigateNext />}
                    onClick={handleNextQuestion}
                    sx={{
                      borderRadius: '10px',
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </StyledPaper>
          </Grid>

          {/* Question Navigator */}
          <Grid item xs={12} md={4}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom>
                Question Navigator
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
                {questions.map((q, index) => (
                  <QuestionNumber
                    key={q.id}
                    active={currentQuestion === index}
                    answered={!!answers[q.id] && answers[q.id].trim() !== ''}
                    onClick={() => setCurrentQuestion(index)}
                  >
                    {index + 1}
                  </QuestionNumber>
                ))}
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    backgroundColor: '#4caf50',
                    borderRadius: '5px',
                    mr: 1,
                  }}
                />
                <Typography variant="body2">Answered</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    backgroundColor: '#f5f5f5',
                    borderRadius: '5px',
                    mr: 1,
                  }}
                />
                <Typography variant="body2">Not Answered</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    backgroundColor: '#667eea',
                    borderRadius: '5px',
                    mr: 1,
                  }}
                />
                <Typography variant="body2">Current Question</Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                color="success"
                sx={{ mt: 2 }}
                onClick={() => setSubmitDialog(true)}
                disabled={examSubmitted || submitting}
              >
                Submit Exam
              </Button>
            </StyledPaper>
          </Grid>
        </Grid>
      </Container>

      {/* Submit Confirmation Dialog */}
      <Dialog 
        open={submitDialog} 
        onClose={() => setSubmitDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            padding: 2,
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          Submit Exam
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
            Are you sure you want to submit your exam?
          </Typography>
          <Box sx={{ 
            backgroundColor: '#f5f5f5', 
            p: 2, 
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
              {getAnsweredCount()}/{questions.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Questions Answered
            </Typography>
          </Box>
          {getAnsweredCount() < questions.length && (
            <Alert severity="warning" sx={{ mt: 2, borderRadius: '10px' }}>
              You have {questions.length - getAnsweredCount()} unanswered questions
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
          <Button 
            onClick={() => setSubmitDialog(false)}
            variant="outlined"
            sx={{
              borderRadius: '10px',
              borderColor: '#667eea',
              color: '#667eea',
              minWidth: '100px',
            }}
          >
            Review
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="success"
            disabled={submitting}
            sx={{
              borderRadius: '10px',
              background: 'linear-gradient(45deg, #4caf50 30%, #45a049 90%)',
              minWidth: '100px',
            }}
          >
            {submitting ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Auto-submit dialog */}
      <Dialog 
        open={warning === 'Time is up! Submitting your exam...'} 
        PaperProps={{
          sx: {
            borderRadius: '20px',
            padding: 2,
          }
        }}
      >
        <DialogContent sx={{ textAlign: 'center' }}>
          <Timer sx={{ fontSize: 60, color: '#f44336', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Time's Up!
          </Typography>
          <Typography variant="body1">
            Your exam is being automatically submitted...
          </Typography>
          <LinearProgress sx={{ mt: 3, borderRadius: '5px' }} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ExamPage;