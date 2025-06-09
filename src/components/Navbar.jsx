import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="logo">RecipeManager</Link>
      </div>
      <div className="nav-right">
        {user ? (
          <>
            <span className="welcome">Hello, {user.name}</span>
            <Link to="/recipes">Recipes</Link>
            <Link to="/recipes/create">Create Recipe</Link>
            <Link to="/planner">Planner</Link>
            <Link to="/grocery">Grocery List</Link>
            <Link to="/top-recipes">Top Recipes of the Week</Link>
            <Link to="/private-library">My Private Library</Link>
            <button onClick={logout} className="logout-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
