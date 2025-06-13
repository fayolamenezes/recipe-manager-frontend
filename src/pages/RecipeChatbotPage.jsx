import React from 'react';
import RecipeChatbot from '../components/RecipeChatbot';

const RecipeChatbotPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Your Recipe Assistant</h1>
      <RecipeChatbot />
    </div>
  );
};

export default RecipeChatbotPage;
