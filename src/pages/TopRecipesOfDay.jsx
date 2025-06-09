import React, { useEffect, useState } from 'react';
import { getTopRecipesOfDay, deleteRating as apiDeleteRating, rateRecipe } from '../api/api';
import Rating from '../components/Rating';
import { useAuth } from '../context/AuthContext';
import '../styles/TopRecipesOfDay.css';

const TopRecipesOfDay = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratingMsg, setRatingMsg] = useState('');

  useEffect(() => {
    const fetchTopRecipes = async () => {
      try {
        const data = await getTopRecipesOfDay();
        setRecipes(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch top recipes');
      } finally {
        setLoading(false);
      }
    };

    fetchTopRecipes();
  }, []);

  const handleRate = async (recipeId, value) => {
    if (!user) {
      setRatingMsg('You must be logged in to rate recipes.');
      return;
    }
    try {
      await rateRecipe(recipeId, value);
      // Update local state to reflect new rating
      const updatedRecipes = await getTopRecipesOfDay();
      setRecipes(updatedRecipes);
      setRatingMsg('Rating submitted');
    } catch (err) {
      setRatingMsg(err.response?.data?.message || 'Failed to rate recipe');
    }
  };

  const handleDeleteRating = async (recipeId, ratingId) => {
    if (!user) {
      setRatingMsg('You must be logged in to delete ratings.');
      return;
    }
    try {
      await apiDeleteRating(recipeId, ratingId);
      const updatedRecipes = await getTopRecipesOfDay();
      setRecipes(updatedRecipes);
      setRatingMsg('Rating deleted');
    } catch (err) {
      setRatingMsg(err.response?.data?.message || 'Failed to delete rating');
    }
  };

  if (loading) return <p>Loading top recipes...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <h2>Top 3 Recipes of the Day</h2>
      {ratingMsg && <p>{ratingMsg}</p>}
      {recipes.length === 0 && <p>No recipes found today.</p>}
      {recipes.map(recipe => {
        // Find user's rating on this recipe if any
        const userRatingObj = recipe.ratings?.find(r => r.user.toString() === user?._id.toString());
        const userRating = userRatingObj ? userRatingObj.value : 0;
        const userRatingId = userRatingObj ? userRatingObj._id : null;

        // Calculate average rating
        let avgRating = 'Not rated yet';
        if (recipe.ratings && recipe.ratings.length > 0) {
          const total = recipe.ratings.reduce((sum, r) => sum + r.value, 0);
          avgRating = (total / recipe.ratings.length).toFixed(1);
        }

        return (
          <div key={recipe._id} style={{ border: '1px solid #ccc', margin: '1rem', padding: '1rem' }}>
            <h3>{recipe.title}</h3>
            <p><strong>Author:</strong> {recipe.author?.name}</p>
            <p><strong>Tag:</strong> {recipe.tag}</p>
            {recipe.image && <img src={`http://localhost:5000${recipe.image}`} alt={recipe.title} width={200} />}
            <p><strong>Ingredients:</strong> {recipe.ingredients.join(', ')}</p>
            <p><strong>Instructions:</strong> {recipe.instructions}</p>
            <p><strong>Average Rating:</strong> {avgRating}</p>

            <Rating currentRating={userRating} onRate={(val) => handleRate(recipe._id, val)} />

            {userRatingId && (
              <button onClick={() => handleDeleteRating(recipe._id, userRatingId)}>Delete Your Rating</button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TopRecipesOfDay;
