import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import '../styles/CommentsSection.css';

const CommentsSection = ({ recipeId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch comments on mount or when recipeId changes
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/recipes/${recipeId}`);
        setComments(res.data.comments || []);
      } catch (err) {
        console.error('Failed to fetch comments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [recipeId]);

  // Add a new comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await api.post(`/recipes/${recipeId}/comments`, { text: newComment });
      setComments(res.data);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert('Failed to add comment');
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await api.delete(`/recipes/${recipeId}/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert('Failed to delete comment');
    }
  };

  return (
    <div className="comments-section">
      <h4>Comments</h4>

      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p>No comments yet. Be the first to comment!</p>
      ) : (
        <ul className="comments-list">
          {comments.map((comment) => (
            <li key={comment._id} className="comment-item">
              <strong>{comment.user?.name || 'Unknown'}</strong>:{' '}
              <span>{comment.text}</span>
              {user && comment.user?._id === user._id && (
                <button
                  className="delete-comment-btn"
                  onClick={() => handleDeleteComment(comment._id)}
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {user ? (
        <form onSubmit={handleAddComment} className="add-comment-form">
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button type="submit">Post</button>
        </form>
      ) : (
        <p>Please log in to comment.</p>
      )}
    </div>
  );
};

export default CommentsSection;
