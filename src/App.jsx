import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Recipe from './components/Recipe'; // optional for single recipe view

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

import { useAuth } from './context/AuthContext';

// Protected Route component
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Navbar />
      <main style={{ minHeight: '80vh', padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recipes/:recipeId" element={<SingleRecipePage />} />
          <Route path="/top-recipes" element={<TopRecipesOfDay />} />
          <Route path="/private-library" element={<PrivateLibrary />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/grocery" element={<GroceryList />} />

          {/* Public Recipe List Page */}
          <Route path="/recipes" element={<RecipeList />} />

          {/* Protected Create Recipe Page */}
          <Route
            path="/recipes/create"
            element={
              <PrivateRoute>
                <CreateRecipe />
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
