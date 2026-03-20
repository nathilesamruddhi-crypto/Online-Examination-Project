// frontend/src/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🌐 Making ${config.method.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(error.response?.data || { error: 'Network error' });
  }
);

// ============= AUTH ENDPOINTS =============
export const register = (userData) => API.post('/users/register', userData);
export const login = (credentials) => API.post('/users/login', credentials);
export const getProfile = (userId) => API.get(`/users/profile/${userId}`);
export const updateProfile = (userId, userData) => API.put(`/users/profile/${userId}`, userData);
export const getAllUsers = () => API.get('/users/users');
export const deleteUser = (userId) => API.delete(`/users/users/${userId}`);

// ============= EXAM ENDPOINTS =============
export const getExams = () => API.get('/exams/');
export const getExam = (examId) => API.get(`/exams/${examId}`);
export const createExam = (examData) => API.post('/exams/', examData);
export const updateExam = (examId, examData) => API.put(`/exams/${examId}`, examData);
export const deleteExam = (examId) => API.delete(`/exams/${examId}`);
export const startAIMonitor = () => API.get('/exams/start-ai-monitor');
// ============= QUESTION ENDPOINTS =============
export const getExamQuestions = (examId) => API.get(`/exams/${examId}/questions`);
export const getQuestion = (questionId) => API.get(`/exams/questions/${questionId}`);
export const addQuestion = (questionData) => API.post('/exams/questions', questionData);
export const updateQuestion = (questionId, questionData) => API.put(`/exams/questions/${questionId}`, questionData);
export const deleteQuestion = (questionId) => API.delete(`/exams/questions/${questionId}`);
export const bulkAddQuestions = (questions) => API.post('/exams/questions/bulk', questions);

// ============= RESULT ENDPOINTS =============
export const submitExam = (data) => API.post('/results/submit', data);
export const getUserResults = (userId) => API.get(`/results/user/${userId}`);
export const getExamResults = (examId) => API.get(`/results/exam/${examId}`);
export const getResultDetail = (resultId) => API.get(`/results/${resultId}`);

// ============= DASHBOARD ENDPOINTS =============
export const getAdminDashboard = () => API.get('/dashboard/admin');
export const getStudentDashboard = (userId) => API.get(`/dashboard/student/${userId}`);

// ============= ACTIVITY ENDPOINTS =============
export const getUserActivities = (userId) => API.get(`/activities/user/${userId}`);
export const logActivity = (activityData) => API.post('/activities', activityData);



export default API;