import React from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import CommentsSection from '../components/CommentsSection';

const Recipe = ({ recipe, onDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;

    try {
      await api.delete(`/recipes/${recipe._id}`);
      alert('Recipe deleted successfully!');
      if (onDelete) onDelete(recipe._id);
      navigate('/recipes'); // optional
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete recipe');
    }
  };

  return (
    <div className="recipe-card">
      <h3>{recipe.title}</h3>
      {/* other recipe content here */}
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};

export default Recipe;
