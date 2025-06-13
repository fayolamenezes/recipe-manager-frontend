import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminDashboard from './pages/AdminDashboard';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RecipeList from './pages/RecipeList';
import CreateRecipe from './pages/CreateRecipe';
import SingleRecipePage from './pages/SingleRecipePage';
import TopRecipesOfDay from './pages/TopRecipesOfDay';
import PrivateLibrary from './pages/PrivateLibrary';
import Planner from './pages/Planner';
import GroceryList from './pages/GroceryList';
import RecipeChatbotPage from './pages/RecipeChatbotPage';

import { useAuth } from './context/AuthContext';

// Protected Route component
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

// Admin-only Route component
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user && user.isAdmin ? children : <Navigate to="/recipes" replace />;
};

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Navbar />
      <main style={{ minHeight: '80vh', padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Public routes with redirect if logged in */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to={user.isAdmin ? '/admin' : '/recipes'} replace />
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/register"
            element={
              user ? (
                <Navigate to={user.isAdmin ? '/admin' : '/recipes'} replace />
              ) : (
                <Register />
              )
            }
          />

          {/* Public pages */}
          <Route path="/recipes/:recipeId" element={<SingleRecipePage />} />
          <Route path="/top-recipes" element={<TopRecipesOfDay />} />
          <Route path="/private-library" element={<PrivateLibrary />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/grocery" element={<GroceryList />} />
          <Route path="/recipes" element={<RecipeList />} />
          <Route path="/chatbot" element={<RecipeChatbotPage />} />

          {/* Protected Routes */}
          <Route
            path="/recipes/create"
            element={
              <PrivateRoute>
                <CreateRecipe />
              </PrivateRoute>
            }
          />

          {/* Admin Route */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
