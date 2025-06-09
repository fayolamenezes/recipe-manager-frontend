import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const rateRecipe = async (recipeId, value) => {
  const res = await api.post(`/recipes/${recipeId}/rate`, { value });
  return res.data;
};

export const deleteRating = async (recipeId, ratingId) => {
  const res = await api.delete(`/recipes/${recipeId}/rate/${ratingId}`);
  return res.data;
};

export const getTopRecipesOfDay = async () => {
  const res = await api.get('/recipes/top/day');
  return res.data;
};

export const fetchPlanner = async () => {
  const res = await api.get('/planner');
  return res.data;
};

export const savePlanner = async (plannerData) => {
  const res = await api.post('/planner', plannerData); // ✅ Send as-is
  return res.data;
};

export const exportPlannerPDF = () => {
  return api.get('/planner/export-pdf', {
    responseType: 'blob',
  });
};

export const fetchUserSavedRecipesOnly = async () => {
  const response = await api.get('/users/saved/only');
  return response.data;
};

export const fetchUserPrivateRecipes = async () => {
  const res = await api.get('/recipes/private');
  return res.data;
};

export const searchSavedRecipes = async (query) => {
  const res = await api.get(`/users/saved/search?query=${encodeURIComponent(query)}`);
  return res.data;
};

export default api;
