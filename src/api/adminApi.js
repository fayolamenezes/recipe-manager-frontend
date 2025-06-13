import axios from 'axios';

const API = axios.create({ baseURL: '/api/admin' });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Users
export const fetchUsers = () => API.get('/users');
export const banUser = (id) => API.put(`/users/${id}/ban`);
export const unbanUser = (id) => API.put(`/users/${id}/unban`);

// Recipes
export const fetchAdminRecipes = () => API.get('/recipes');
export const deleteRecipe = (id) => API.delete(`/recipes/${id}`);

// Stats
export const fetchStats = () => API.get('/stats');

// Comments
export const deleteCommentByAdmin = (commentId) =>
  API.delete(`/comments/${commentId}`); // ✅ Fixed: uses interceptor
