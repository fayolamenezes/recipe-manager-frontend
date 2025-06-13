import React, { useState } from 'react';
import axios from 'axios';

const RecipeChatbot = () => {
  const [step, setStep] = useState(0);
  const [ingredients, setIngredients] = useState('');
  const [category, setCategory] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFind = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/chatbot/find-matching', {
        ingredients: ingredients
          .toLowerCase()
          .split(',')
          .map(i => i.trim()),
        category,
      });
      setMatches(res.data);
      setStep(3);
    } catch (err) {
      alert('❌ Error finding recipes.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-4 shadow-lg rounded-xl mt-6 space-y-4">
      {step === 0 && (
        <>
          <p>👋 Hi! What ingredients do you have? (comma-separated)</p>
          <input
            className="border p-2 w-full"
            value={ingredients}
            onChange={e => setIngredients(e.target.value)}
            placeholder="e.g. eggs, milk, sugar"
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => setStep(1)}>
            Next
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <p>🍽️ What kind of recipe are you looking for?</p>
          <select
            className="border p-2 w-full"
            onChange={e => setCategory(e.target.value)}
            value={category}
          >
            <option value="">Select Category</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snacks">Snacks</option>
            <option value="dessert">Dessert</option>
          </select>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded mt-2"
            disabled={!category || loading}
            onClick={handleFind}
          >
            {loading ? 'Searching...' : 'Find Recipes'}
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <h3 className="text-lg font-semibold">🔍 Top Matching Recipes:</h3>
          {matches.length > 0 ? (
            <ul className="list-disc pl-4">
              {matches.map((r, i) => (
                <li key={r._id}>
                  <strong>{r.title}</strong> – {r.matchScore} matching ingredients
                </li>
              ))}
            </ul>
          ) : (
            <p>No good matches found. Try different ingredients or category.</p>
          )}
          <button
            className="bg-gray-600 text-white px-4 py-2 rounded mt-2"
            onClick={() => {
              setStep(0);
              setIngredients('');
              setCategory('');
              setMatches([]);
            }}
          >
            Start Over
          </button>
        </>
      )}
    </div>
  );
};

export default RecipeChatbot;
