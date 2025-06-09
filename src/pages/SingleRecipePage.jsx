import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { deleteRating } from '../api/api';
import CommentsSection from '../components/CommentsSection';
import '../styles/SingleRecipePage.css';
import Rating from '../components/Rating'; // Assumes this renders star-based UI and takes onRate prop
import { useAuth } from '../context/AuthContext';

const SingleRecipePage = () => {
  const { recipeId } = useParams();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState('');
  
  const [avgRating, setAvgRating] = useState('Not rated yet');
  const [userRating, setUserRating] = useState(0);
  const [userRatingId, setUserRatingId] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await api.get(`/recipes/${recipeId}`);
        setRecipe(res.data);

        setAvgRating(
          res.data.averageRating !== undefined && res.data.averageRating !== null
            ? res.data.averageRating.toFixed(1)
            : 'Not rated yet'
        );

        const userRatingObj = res.data.ratings?.find(
          (r) => r.user.toString() === user?._id.toString()
        );
        setUserRating(userRatingObj?.value || 0);
        setUserRatingId(userRatingObj?._id || null);

      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load recipe');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId, user]);

  const handleRating = async (value) => {
    if (!user) {
      setRatingMessage('You must be logged in to rate this recipe.');
      return;
    }

    setSubmittingRating(true);
    try {
      const res = await api.post(`/recipes/${recipeId}/rate`, { value });
      setRatingMessage(res.data.message);

      // Refresh recipe data and rating info
      const updatedRecipe = await api.get(`/recipes/${recipeId}`);
      setRecipe(updatedRecipe.data);

      setAvgRating(
        updatedRecipe.data.averageRating !== undefined && updatedRecipe.data.averageRating !== null
          ? updatedRecipe.data.averageRating.toFixed(1)
          : 'Not rated yet'
      );

      const updatedUserRatingObj = updatedRecipe.data.ratings?.find(
        (r) => r.user.toString() === user._id.toString()
      );
      setUserRating(updatedUserRatingObj?.value || 0);
      setUserRatingId(updatedUserRatingObj?._id || null);

    } catch (err) {
      setRatingMessage(err.response?.data?.message || 'Failed to rate recipe');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleDeleteRating = async () => {
    if (!userRatingId) {
      setRatingMessage('No rating to delete.');
      return;
    }

    setSubmittingRating(true);
    try {
      const res = await deleteRating(recipeId, userRatingId);
      setRatingMessage(res.message);

      // Refresh recipe data and rating info
      const updatedRecipe = await api.get(`/recipes/${recipeId}`);
      setRecipe(updatedRecipe.data);

      setAvgRating(
        updatedRecipe.data.averageRating !== undefined && updatedRecipe.data.averageRating !== null
          ? updatedRecipe.data.averageRating.toFixed(1)
          : 'Not rated yet'
      );

      // Since user deleted rating, reset user rating state
      setUserRating(0);
      setUserRatingId(null);

    } catch (err) {
      setRatingMessage(err.response?.data?.message || 'Failed to delete rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="single-recipe">
      <h2>{recipe.title}</h2>
      <p><strong>Author:</strong> {recipe.author?.name}</p>
      <p><strong>Tag:</strong> {recipe.tag}</p>
      {recipe.image && (
        <img
          src={`http://localhost:5000${recipe.image}`}
          alt={recipe.title}
          className="recipe-image"
        />
      )}
      <p><strong>Ingredients:</strong> {recipe.ingredients.join(', ')}</p>
      <p><strong>Instructions:</strong> {recipe.instructions}</p>

      {/* Rating Section */}
      <div className="rating-section">
        <h4>Average Rating: {avgRating}</h4>
        <Rating
          currentRating={userRating}
          onRate={handleRating}
          disabled={submittingRating}
        />
        {userRatingId && (
          <button
            onClick={handleDeleteRating}
            disabled={submittingRating}
            style={{ marginTop: '10px', backgroundColor: 'red', color: 'white', border: 'none', padding: '6px 12px', cursor: 'pointer' }}
          >
            Delete Your Rating
          </button>
        )}
        {ratingMessage && <p className="rating-msg">{ratingMessage}</p>}
      </div>

      {/* Comments Section */}
      <CommentsSection recipeId={recipe._id} />
    </div>
  );
};

export default SingleRecipePage;
