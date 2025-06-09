import React, { useState, useEffect } from 'react';
import api, { searchSavedRecipes } from '../api/api'; // Axios instance + search API
import '../styles/PrivateLibrary.css';

const tags = ['breakfast', 'lunch', 'dinner', 'snacks', 'dessert'];

function PrivateLibrary() {
  const [privateRecipes, setPrivateRecipes] = useState([]);
  const [savedPublicRecipes, setSavedPublicRecipes] = useState([]);
  const [form, setForm] = useState({
    title: '',
    ingredients: '',
    instructions: '',
    tag: tags[0],
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/recipes/library');
      setPrivateRecipes(res.data.privateRecipes || []);
      setSavedPublicRecipes(res.data.savedPublicRecipes || []);
    } catch (err) {
      setError('Failed to fetch your recipe library');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm((prev) => ({ ...prev, image: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('ingredients', form.ingredients);
    formData.append('instructions', form.instructions);
    formData.append('tag', form.tag);
    if (form.image) formData.append('image', form.image);

    try {
      setLoading(true);
      await api.post('/recipes/private', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm({
        title: '',
        ingredients: '',
        instructions: '',
        tag: tags[0],
        image: null,
      });
      fetchRecipes();
    } catch (err) {
      setError('Failed to add private recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    try {
      setLoading(true);
      await api.delete(`/recipes/private/${id}`);
      fetchRecipes();
    } catch (err) {
      setError('Failed to delete recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveRecipe = async (recipeId) => {
    if (!window.confirm('Remove this recipe from your library?')) return;
    try {
      setLoading(true);
      await api.delete(`/users/saved/${recipeId}`);
      fetchRecipes();
    } catch (err) {
      setError('Failed to remove saved recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    try {
      if (value.trim() === '') {
        fetchRecipes(); // reset to original if search is cleared
      } else {
        const results = await searchSavedRecipes(value);
        setSavedPublicRecipes(results);
      }
    } catch (err) {
      setError('Search failed');
    }
  };

  const renderRecipeCard = (recipe, isPrivate = true) => (
    <li key={recipe._id} className="recipe-card">
      <h4>{recipe.title}</h4>
      {recipe.image && (
        <img
          src={recipe.image.startsWith('http') ? recipe.image : `http://localhost:5000${recipe.image}`}
          alt={recipe.title}
          style={{ width: '150px' }}
        />
      )}
      <p><strong>Tag:</strong> {recipe.tag}</p>
      <p><strong>Ingredients:</strong> {recipe.ingredients}</p>
      <p><strong>Instructions:</strong> {recipe.instructions}</p>
      {isPrivate ? (
        <button
          onClick={() => handleDelete(recipe._id)}
          disabled={loading}
          style={{ backgroundColor: 'red', color: 'white', cursor: 'pointer' }}
        >
          Delete
        </button>
      ) : (
        <button
          onClick={() => handleUnsaveRecipe(recipe._id)}
          disabled={loading}
          style={{ backgroundColor: 'orange', color: 'white', cursor: 'pointer' }}
        >
          Unsave
        </button>
      )}
    </li>
  );

  return (
    <div className="private-library-container">
      <h2>My Private Recipe Library</h2>

      <form onSubmit={handleSubmit} encType="multipart/form-data" className="recipe-form">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="ingredients"
          placeholder="Ingredients"
          value={form.ingredients}
          onChange={handleChange}
          required
        />
        <textarea
          name="instructions"
          placeholder="Instructions"
          value={form.instructions}
          onChange={handleChange}
          required
        />
        <select name="tag" value={form.tag} onChange={handleChange} required>
          {tags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input type="file" name="image" accept="image/*" onChange={handleChange} />
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Add Private Recipe'}
        </button>
      </form>

      <hr />

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading recipes...</p>}

      <div className="recipe-section">
        <h3>Your Private Recipes</h3>
        {privateRecipes.length === 0 ? (
          <p>No private recipes yet.</p>
        ) : (
          <ul>{privateRecipes.map((r) => renderRecipeCard(r, true))}</ul>
        )}
      </div>

      <div className="recipe-section">
        <h3>Saved Public Recipes</h3>

        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search saved recipes..."
          className="search-bar"
        />

        {savedPublicRecipes.length === 0 ? (
          <p>No public recipes saved.</p>
        ) : (
          <ul>{savedPublicRecipes.map((r) => renderRecipeCard(r, false))}</ul>
        )}
      </div>
    </div>
  );
}

export default PrivateLibrary;
