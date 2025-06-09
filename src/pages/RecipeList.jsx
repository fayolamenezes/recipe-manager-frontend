import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import '../styles/RecipeList.css';
import { Link } from 'react-router-dom';

const RecipeList = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tagFilter, setTagFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false); // For button disables on like/save/delete

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        let res;
        if (searchQuery.trim()) {
          res = await api.get('/recipes/search', {
            params: { query: searchQuery.trim() },
          });
        } else {
          res = await api.get('/recipes', {
            params: { tag: tagFilter, sort: sortBy },
          });
        }
        setRecipes(res.data);
      } catch (err) {
        console.error('Failed to fetch recipes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [tagFilter, sortBy, searchQuery]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    try {
      setActionLoading(true);
      await api.delete(`/recipes/${id}`);
      setRecipes((prev) => prev.filter((r) => r._id !== id));
      alert('Recipe deleted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete recipe');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLike = async (recipeId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to like recipes.');
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.post(
        `/recipes/${recipeId}/like`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRecipes((prev) =>
        prev.map((r) =>
          r._id === recipeId
            ? { ...r, likesCount: res.data.likesCount, likes: res.data.likes }
            : r
        )
      );
    } catch (err) {
      console.error('Failed to toggle like:', err);
      alert(err.response?.data?.message || 'Failed to toggle like');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSave = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to save recipes.');
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/users/saved/${id}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Recipe saved to your library!');
    } catch (err) {
      const errorMessage = err.response?.data?.message;

      if (errorMessage === 'Recipe already saved') {
        alert('You have already saved this recipe.');
      } else {
        alert(errorMessage || 'Failed to save recipe');
      }

      console.error('Save failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const isLikedByUser = (recipe) => {
    if (!user || !recipe.likes) return false;
    return recipe.likes.some((id) => id.toString() === user._id.toString());
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // useEffect will refetch based on searchQuery state
  };

  return (
    <div className="container">
      <h2>Explore Recipes</h2>

      <form className="search-bar" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          Search
        </button>
      </form>

      <div className="controls">
        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          disabled={loading}
        >
          <option value="">All Tags</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snacks">Snacks</option>
          <option value="dessert">Dessert</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          disabled={loading}
        >
          <option value="newest">Newest</option>
          <option value="mostLiked">Most Liked</option>
          <option value="mostRated">Most Rated</option>
          <option value="mostCommented">Most Commented</option>
          <option value="mostSaved">Most Saved</option>
        </select>
      </div>

      {loading ? (
        <p>Loading recipes...</p>
      ) : recipes.length === 0 ? (
        <p>No recipes found.</p>
      ) : (
        <div className="recipe-list">
          {recipes.map((recipe) => (
            <div className="recipe-card" key={recipe._id}>
              <Link to={`/recipes/${recipe._id}`}>
                <h3 className="recipe-title-link">{recipe.title}</h3>
              </Link>
              <p>
                <strong>By:</strong> {recipe.author?.name || 'Unknown'}
              </p>
              <p>
                <strong>Tag:</strong> {recipe.tag}
              </p>
              {recipe.image && (
                <img
                  src={
                    recipe.image.startsWith('http')
                      ? recipe.image
                      : `http://localhost:5000${recipe.image}`
                  }
                  alt={recipe.title}
                  className="recipe-image"
                />
              )}

              <p>
                <strong>Likes:</strong> {recipe.likesCount || 0}
              </p>

              <p>
                <strong>Rating:</strong>{' '}
                {recipe.averageRating !== undefined && recipe.averageRating !== null
                  ? recipe.averageRating.toFixed(1)
                  : 'No ratings'}
              </p>

              {user && (
                <>
                  <button
                    className="like-btn"
                    onClick={() => handleLike(recipe._id)}
                    disabled={actionLoading}
                    title={isLikedByUser(recipe) ? 'Unlike' : 'Like'}
                  >
                    {isLikedByUser(recipe) ? '❤️ Unlike' : '🤍 Like'}
                  </button>

                  <button
                    className="save-btn"
                    onClick={() => handleSave(recipe._id)}
                    disabled={actionLoading}
                  >
                    Save
                  </button>
                </>
              )}

              {user && recipe.author?._id === user._id && (
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(recipe._id)}
                  disabled={actionLoading}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeList;
