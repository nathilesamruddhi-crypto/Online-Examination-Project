// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Grid,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tab,
  Tabs,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ExitToApp,
  Add,
  Edit,
  Delete,
  Quiz,
  Assignment,
  Dashboard as DashboardIcon,
  AutoAwesome,
} from '@mui/icons-material';
import { 
  addQuestion, 
  getExamQuestions,  // Changed from getQuestions to getExamQuestions
  createExam, 
  getExams,
  deleteQuestion,
  updateQuestion,
  deleteExam,
  generateAIQuestions,
} from '../api';  // Make sure these match the exports in your api.js

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '15px',
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 40px -12px rgba(0,0,0,0.5)',
  },
}));

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [openExamDialog, setOpenExamDialog] = useState(false);
  const [openQuestionDialog, setOpenQuestionDialog] = useState(false);
  const [openAIDialog, setOpenAIDialog] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Form states
  const [examForm, setExamForm] = useState({
    title: '',
    duration: 60,
    description: '',
  });

  const [questionForm, setQuestionForm] = useState({
    exam_id: '',
    question_text: '',  // Make sure this matches your API field name
    option_a: '',       // Make sure this matches your API field name
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: '', // Make sure this matches your API field name
    marks: 1,
  });

  const [aiForm, setAiForm] = useState({
    subject: '',
    difficulty: 'medium',
    count: 5,
    context: '',
  });

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExam) {
      fetchQuestions(selectedExam.id);
    }
  }, [selectedExam]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await getExams();
      setExams(response.data || []);
      if (response.data.length > 0 && !selectedExam) {
        setSelectedExam(response.data[0]);
      }
    } catch (error) {
      setError('Failed to fetch exams');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (examId) => {
    try {
      setLoading(true);
      const response = await getExamQuestions(examId);  // Using correct function name
      setQuestions(response.data || []);
    } catch (error) {
      setError('Failed to fetch questions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleCreateExam = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await createExam(examForm);
      setSuccess('Exam created successfully!');
      setOpenExamDialog(false);
      fetchExams();
      setExamForm({ title: '', duration: 60, description: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to create exam');
      console.error(error);
    }
    setLoading(false);
  };

  const handleAddQuestion = async () => {
    if (!questionForm.exam_id) {
      setError('Please select an exam');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await addQuestion(questionForm);
      setSuccess('Question added successfully!');
      setOpenQuestionDialog(false);
      fetchQuestions(questionForm.exam_id);
      setQuestionForm({
        exam_id: questionForm.exam_id,
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: '',
        marks: 1,
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to add question');
      console.error(error);
    }
    setLoading(false);
  };

  const handleGenerateAI = async () => {
    if (!selectedExam) {
      setError('Select an exam first');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await generateAIQuestions({
        ...aiForm,
        exam_id: selectedExam.id,
      });
      setSuccess('AI-generated questions added!');
      setOpenAIDialog(false);
      await fetchQuestions(selectedExam.id);
      setAiForm({ subject: '', difficulty: 'medium', count: 5, context: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.error || 'AI generation failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion(questionId);
        setSuccess('Question deleted successfully!');
        fetchQuestions(selectedExam.id);
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Failed to delete question');
        console.error(error);
      }
    }
  };

  const handleDeleteExam = async (examId) => {
    if (window.confirm('Are you sure you want to delete this exam? All questions will also be deleted.')) {
      try {
        await deleteExam(examId);
        setSuccess('Exam deleted successfully!');
        fetchExams();
        if (selectedExam?.id === examId) {
          setSelectedExam(null);
          setQuestions([]);
        }
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Failed to delete exam');
        console.error(error);
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading && exams.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, background: '#f5f5f5', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<ExitToApp />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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

        <Paper sx={{ borderRadius: '15px', overflow: 'hidden' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              bgcolor: '#f8f9fa',
              '& .MuiTab-root': { py: 2 },
              '& .Mui-selected': { color: '#667eea !important' },
              '& .MuiTabs-indicator': { bgcolor: '#667eea' },
            }}
          >
            <Tab icon={<Assignment />} label="Exams" />
            <Tab icon={<Quiz />} label="Questions" />
          </Tabs>

          {/* Exams Tab */}
          {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Manage Exams</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenExamDialog(true)}
                  sx={{
                    borderRadius: '10px',
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  }}
                >
                  Create New Exam
                </Button>
              </Box>

              <Grid container spacing={3}>
                {exams.map((exam) => (
                  <Grid item xs={12} md={4} key={exam.id}>
                    <StyledCard>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {exam.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Duration: {exam.duration} minutes
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Questions: {exam.question_count || 0}
                        </Typography>
                        {exam.description && (
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            {exam.description}
                          </Typography>
                        )}
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setSelectedExam(exam);
                              setTabValue(1);
                            }}
                            sx={{ borderRadius: '20px' }}
                          >
                            View Questions
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleDeleteExam(exam.id)}
                            sx={{ borderRadius: '20px' }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Questions Tab */}
          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Manage Questions
                  </Typography>
                  <FormControl sx={{ minWidth: 200, mr: 2 }}>
                    <InputLabel>Select Exam</InputLabel>
                    <Select
                      value={selectedExam?.id || ''}
                      onChange={(e) => {
                        const exam = exams.find(ex => ex.id === e.target.value);
                        setSelectedExam(exam);
                      }}
                      label="Select Exam"
                      sx={{ borderRadius: '10px' }}
                    >
                      {exams.map((exam) => (
                        <MenuItem key={exam.id} value={exam.id}>
                          {exam.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<AutoAwesome />}
                    onClick={() => setOpenAIDialog(true)}
                    disabled={!selectedExam}
                    sx={{ borderRadius: '10px' }}
                  >
                    Generate with AI
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => {
                      setQuestionForm({ ...questionForm, exam_id: selectedExam?.id });
                      setOpenQuestionDialog(true);
                    }}
                    disabled={!selectedExam}
                    sx={{
                      borderRadius: '10px',
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    }}
                  >
                    Add Question
                  </Button>
                </Box>
              </Box>

              {selectedExam && (
                <TableContainer component={Paper} sx={{ borderRadius: '15px' }}>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Question</TableCell>
                        <TableCell>Options</TableCell>
                        <TableCell>Answer</TableCell>
                        <TableCell>Marks</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {questions.map((q, index) => (
                        <TableRow key={q.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{q.question_text}</TableCell>
                          <TableCell>
                            <Box>
                              <Chip size="small" label={`A: ${q.option_a}`} sx={{ m: 0.5 }} />
                              <Chip size="small" label={`B: ${q.option_b}`} sx={{ m: 0.5 }} />
                              <Chip size="small" label={`C: ${q.option_c}`} sx={{ m: 0.5 }} />
                              <Chip size="small" label={`D: ${q.option_d}`} sx={{ m: 0.5 }} />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={`Option ${q.correct_answer}`} 
                              color="success" 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>{q.marks}</TableCell>
                          <TableCell>
                            <IconButton size="small" color="primary">
                              <Edit />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteQuestion(q.id)}
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </Paper>
      </Container>

      {/* Create Exam Dialog */}
      <Dialog 
        open={openExamDialog} 
        onClose={() => setOpenExamDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle>Create New Exam</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Exam Title"
            type="text"
            fullWidth
            variant="outlined"
            value={examForm.title}
            onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
            sx={{ mb: 2, borderRadius: '10px' }}
          />
          <TextField
            margin="dense"
            label="Duration (minutes)"
            type="number"
            fullWidth
            variant="outlined"
            value={examForm.duration}
            onChange={(e) => setExamForm({ ...examForm, duration: parseInt(e.target.value) })}
            sx={{ mb: 2, borderRadius: '10px' }}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={examForm.description}
            onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
            sx={{ borderRadius: '10px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExamDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateExam} 
            variant="contained"
            disabled={loading || !examForm.title}
            sx={{
              borderRadius: '10px',
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog 
        open={openQuestionDialog} 
        onClose={() => setOpenQuestionDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle>Add New Question</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Select Exam</InputLabel>
            <Select
              value={questionForm.exam_id}
              onChange={(e) => setQuestionForm({ ...questionForm, exam_id: e.target.value })}
              label="Select Exam"
              sx={{ borderRadius: '10px' }}
            >
              {exams.map((exam) => (
                <MenuItem key={exam.id} value={exam.id}>
                  {exam.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Question"
            type="text"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={questionForm.question_text}
            onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
            sx={{ mb: 2, borderRadius: '10px' }}
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Option A"
                fullWidth
                variant="outlined"
                value={questionForm.option_a}
                onChange={(e) => setQuestionForm({ ...questionForm, option_a: e.target.value })}
                sx={{ borderRadius: '10px' }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Option B"
                fullWidth
                variant="outlined"
                value={questionForm.option_b}
                onChange={(e) => setQuestionForm({ ...questionForm, option_b: e.target.value })}
                sx={{ borderRadius: '10px' }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Option C"
                fullWidth
                variant="outlined"
                value={questionForm.option_c}
                onChange={(e) => setQuestionForm({ ...questionForm, option_c: e.target.value })}
                sx={{ borderRadius: '10px' }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Option D"
                fullWidth
                variant="outlined"
                value={questionForm.option_d}
                onChange={(e) => setQuestionForm({ ...questionForm, option_d: e.target.value })}
                sx={{ borderRadius: '10px' }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Correct Answer</InputLabel>
                <Select
                  value={questionForm.correct_answer}
                  onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                  label="Correct Answer"
                  sx={{ borderRadius: '10px' }}
                >
                  <MenuItem value="A">Option A</MenuItem>
                  <MenuItem value="B">Option B</MenuItem>
                  <MenuItem value="C">Option C</MenuItem>
                  <MenuItem value="D">Option D</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Marks"
                type="number"
                fullWidth
                variant="outlined"
                value={questionForm.marks}
                onChange={(e) => setQuestionForm({ ...questionForm, marks: parseInt(e.target.value) })}
                sx={{ borderRadius: '10px' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQuestionDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddQuestion} 
            variant="contained"
            disabled={loading || !questionForm.question_text || !questionForm.correct_answer}
            sx={{
              borderRadius: '10px',
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            }}
          >
            Add Question
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Generate Dialog */}
      <Dialog
        open={openAIDialog}
        onClose={() => setOpenAIDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle>Generate Questions with AI</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Subject / Topic"
            fullWidth
            variant="outlined"
            value={aiForm.subject}
            onChange={(e) => setAiForm({ ...aiForm, subject: e.target.value })}
            sx={{ mb: 2, borderRadius: '10px' }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={aiForm.difficulty}
              label="Difficulty"
              onChange={(e) => setAiForm({ ...aiForm, difficulty: e.target.value })}
              sx={{ borderRadius: '10px' }}
            >
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Number of Questions"
            type="number"
            fullWidth
            variant="outlined"
            value={aiForm.count}
            onChange={(e) => setAiForm({ ...aiForm, count: parseInt(e.target.value) || 1 })}
            sx={{ mb: 2, borderRadius: '10px' }}
            inputProps={{ min: 1, max: 20 }}
          />
          <TextField
            margin="dense"
            label="Extra Context (optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={aiForm.context}
            onChange={(e) => setAiForm({ ...aiForm, context: e.target.value })}
            sx={{ borderRadius: '10px' }}
            placeholder="e.g., focus on OS scheduling; include one calculation"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAIDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleGenerateAI} 
            variant="contained"
            disabled={loading || !aiForm.subject || !selectedExam}
            sx={{
              borderRadius: '10px',
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            }}
          >
            {loading ? <CircularProgress size={22} /> : 'Generate & Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
