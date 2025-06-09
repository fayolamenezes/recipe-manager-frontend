import React, { useState, useEffect } from 'react';

const Rating = ({ currentRating = 0, onRate, disabled = false }) => {
  const [rating, setRating] = useState(currentRating);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);

  // Update internal rating state if currentRating prop changes
  useEffect(() => {
    setRating(currentRating);
  }, [currentRating]);

  const handleRate = async (value) => {
    if (loading || disabled) return;
    setLoading(true);
    try {
      await onRate(value); // Let parent handle API and updates
      setRating(value);
    } catch (err) {
      alert('Failed to rate recipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rating-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => handleRate(star)}
          onMouseEnter={() => !disabled && setHover(star)}
          onMouseLeave={() => !disabled && setHover(0)}
          style={{
            cursor: (loading || disabled) ? 'not-allowed' : 'pointer',
            color: (hover || rating) >= star ? '#ffc107' : '#e4e5e9',
            fontSize: '1.5rem',
            userSelect: 'none',
          }}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              handleRate(star);
            }
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default Rating;
