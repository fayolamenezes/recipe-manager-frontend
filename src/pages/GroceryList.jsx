import React, { useState, useEffect } from 'react';
import api from '../api/api';
import '../styles/GroceryList.css';

function GroceryList() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '' });
  const [error, setError] = useState(null);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState([]);
  const [bulkIngredients, setBulkIngredients] = useState([]);

  const fetchGroceryList = async () => {
    try {
      const res = await api.get('/grocerylist');
      setItems(res.data.items || []);
    } catch (err) {
      setError('Failed to load grocery list');
    }
  };

  const fetchSavedRecipes = async () => {
    try {
      const res = await api.get('/users/grocery');
      setSavedRecipes(res.data || []);
    } catch (err) {
      setError('Failed to fetch saved recipes');
    }
  };

  useEffect(() => {
    fetchGroceryList();
    fetchSavedRecipes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim()) return;
    try {
      const updatedItems = [...items, { ...newItem, bought: false }];
      const res = await api.post('/grocerylist', { items: updatedItems });
      setItems(res.data.items || []);
      setNewItem({ name: '', quantity: '' });
    } catch {
      setError('Failed to add item');
    }
  };

  const toggleStatus = async (itemId) => {
    try {
      const res = await api.patch(`/grocerylist/${itemId}/toggle`);
      setItems(res.data.items);
    } catch {
      setError('Failed to toggle item status');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const res = await api.delete(`/grocerylist/${itemId}`);
      setItems(res.data.items);
    } catch {
      setError('Failed to delete item');
    }
  };

  const handleExportPDF = async () => {
    try {
      const res = await api.get('/grocerylist/export-pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'grocery-list.pdf');
      document.body.appendChild(link);
      link.click();
    } catch {
      setError('Failed to export PDF');
    }
  };

  const toggleRecipeSelection = (id) => {
    setSelectedRecipeIds((prev) =>
      prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id]
    );
  };

  const handleGenerateBulkIngredients = async () => {
    try {
      const res = await api.post('/users/grocery-list', {
        recipeIds: selectedRecipeIds,
      });
      setBulkIngredients(res.data.ingredients || []);
    } catch {
      setError('Failed to generate bulk grocery list');
    }
  };

  const handleAddBulkToList = async () => {
    const newItems = bulkIngredients.map((ing) => ({
      name: ing,
      quantity: '',
      bought: false,
    }));
    try {
      const updatedItems = [...items, ...newItems];
      const res = await api.post('/grocerylist', { items: updatedItems });
      setItems(res.data.items || []);
      setBulkIngredients([]);
      setSelectedRecipeIds([]);
    } catch {
      setError('Failed to add ingredients to grocery list');
    }
  };

  return (
    <div className="grocery-container">
      <h2>My Grocery List</h2>

      {error && <p className="error">{error}</p>}

      <div className="add-item-form">
        <input
          type="text"
          name="name"
          placeholder="Item name"
          value={newItem.name}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="quantity"
          placeholder="Quantity (optional)"
          value={newItem.quantity}
          onChange={handleInputChange}
        />
        <button onClick={handleAddItem}>Add</button>
      </div>

      <ul className="grocery-list">
        {items.map((item, index) => (
          <li key={item._id || index} className={item.bought ? 'bought' : 'pending'}>
            <span onClick={() => toggleStatus(item._id)}>
              {item.bought ? '✅' : '⬜'} {item.name} {item.quantity && `- ${item.quantity}`}
            </span>
            <button onClick={() => handleDeleteItem(item._id)} className="delete-btn">❌</button>
          </li>
        ))}
      </ul>

      <button onClick={handleExportPDF}>Export as PDF</button>

      <hr />

      <h3>Generate List from Saved Recipes</h3>
      <ul className="recipe-list">
        {savedRecipes.map((recipe) => (
          <li key={recipe._id}>
            <label>
              <input
                type="checkbox"
                checked={selectedRecipeIds.includes(recipe._id)}
                onChange={() => toggleRecipeSelection(recipe._id)}
              />
              {recipe.title}
            </label>
          </li>
        ))}
      </ul>
      <button onClick={handleGenerateBulkIngredients} disabled={selectedRecipeIds.length === 0}>
        Generate Ingredients
      </button>

      {bulkIngredients.length > 0 && (
        <>
          <h4>Ingredients from Selected Recipes:</h4>
          <ul className="bulk-ingredients">
            {bulkIngredients.map((ing, idx) => (
              <li key={idx}>{ing}</li>
            ))}
          </ul>
          <button onClick={handleAddBulkToList}>Add to Grocery List</button>
        </>
      )}
    </div>
  );
}

export default GroceryList;
