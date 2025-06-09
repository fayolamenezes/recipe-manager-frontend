import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../styles/CreateRecipe.css';

const TAG_OPTIONS = ['breakfast', 'lunch', 'dinner', 'snacks', 'dessert'];

const CreateRecipe = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [tag, setTag] = useState(TAG_OPTIONS[0]);
  const [image, setImage] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !ingredients || !instructions) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!TAG_OPTIONS.includes(tag)) {
      setError('Please select a valid tag.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('title', title);
      formData.append('ingredients', ingredients);
      formData.append('instructions', instructions);
      formData.append('tag', tag);
      if (image) {
        formData.append('image', image);
      }

      await api.post('/recipes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setLoading(false);
      navigate('/recipes');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to create recipe');
    }
  };

  return (
    <div className="create-recipe-container">
      <h2>Create New Recipe</h2>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label htmlFor="title">Title: *</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label htmlFor="ingredients">Ingredients (comma separated): *</label>
        <input
          id="ingredients"
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          required
        />

        <label htmlFor="instructions">Instructions: *</label>
        <textarea
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          required
          rows={5}
        />

        <label htmlFor="tag">Tag: *</label>
        <select
          id="tag"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          required
        >
          {TAG_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </option>
          ))}
        </select>

        <label htmlFor="image">Image (optional):</label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Posting...' : 'Post Recipe'}
        </button>
      </form>
    </div>
  );
};

export default CreateRecipe;
