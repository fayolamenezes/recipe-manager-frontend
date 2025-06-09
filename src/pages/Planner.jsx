import React, { useEffect, useState } from 'react';
import {
  fetchPlanner,
  savePlanner,
  exportPlannerPDF,
  fetchUserSavedRecipesOnly,
  fetchUserPrivateRecipes,  // <-- add this import
} from '../api/api';
import '../styles/Planner.css';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const meals = ['breakfast', 'lunch', 'dinner', 'snacks', 'dessert'];

export default function Planner() {
  const [planner, setPlanner] = useState({});
  const [savedRecipes, setSavedRecipes] = useState([]);

  const getPlannerAndRecipes = async () => {
    try {
      let plannerData;
      try {
        plannerData = await fetchPlanner();
      } catch (err) {
        if (err.response?.status === 404) {
          plannerData = null;
        } else {
          throw err;
        }
      }
      setPlanner(plannerData?.week || {});

      // Fetch private recipes and saved public recipes concurrently
      const [privateRecipes, savedRecipesData] = await Promise.all([
        fetchUserPrivateRecipes(),
        fetchUserSavedRecipesOnly(),
      ]);

      const combinedRecipes = [...privateRecipes, ...savedRecipesData];
      setSavedRecipes(combinedRecipes);
    } catch (err) {
      // Handle error silently or show message if you want
    }
  };

  useEffect(() => {
    getPlannerAndRecipes();
  }, []);

  const handleChange = (day, meal, recipeId) => {
    setPlanner(prev => ({
      ...prev,
      [day]: {
        ...(prev[day] || {}),
        [meal]: recipeId || null,
      },
    }));
  };

  const handleSave = async () => {
    try {
      const transformedWeek = {};
      for (const day of days) {
        transformedWeek[day] = {};
        for (const meal of meals) {
          const value = planner[day]?.[meal];
          transformedWeek[day][meal] =
            value && typeof value === 'object'
              ? value._id
              : value || null;
        }
      }
      await savePlanner({ week: transformedWeek });
      alert('✅ Planner saved!');
      await getPlannerAndRecipes();
    } catch {
      // Handle error silently or show message if you want
    }
  };

  const handleExport = async () => {
    try {
      const res = await exportPlannerPDF();
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'weekly-planner.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      // Handle error silently or show message if you want
    }
  };

  const isRecipeMissing = (recipeId) => {
    return recipeId && !savedRecipes.some(r => r._id === recipeId);
  };

  if (!planner) return <p>Loading planner...</p>;

  return (
    <div className="planner-page">
      <h2>Weekly Meal Planner</h2>
      <table className="planner-table">
        <thead>
          <tr>
            <th>Day</th>
            {meals.map(meal => (
              <th key={meal}>{meal}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map(day => (
            <tr key={day}>
              <td style={{ textTransform: 'capitalize' }}>{day}</td>
              {meals.map(meal => {
                const value = planner[day]?.[meal];
                const recipeId = typeof value === 'object' ? value?._id : value;
                const isMissing = isRecipeMissing(recipeId);

                return (
                  <td key={meal}>
                    <select
                      value={recipeId || ''}
                      onChange={e => handleChange(day, meal, e.target.value)}
                    >
                      <option value="">-- Select recipe --</option>
                      {savedRecipes.map(recipe => (
                        <option key={recipe._id} value={recipe._id}>
                          {recipe.title}
                        </option>
                      ))}
                      {isMissing && (
                        <option value={recipeId}>
                          (Removed from library)
                        </option>
                      )}
                    </select>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {Object.values(planner).some(day =>
        Object.values(day || {}).some(meal => {
          const id = typeof meal === 'object' ? meal?._id : meal;
          return isRecipeMissing(id);
        })
      ) && (
        <p className="planner-warning" style={{ color: 'red', marginTop: '1rem' }}>
          ⚠️ Some meals are using recipes that are no longer in your library.
        </p>
      )}

      <div className="planner-buttons">
        <button type="button" onClick={handleSave}>Save Planner</button>
        <button type="button" onClick={handleExport}>Export PDF</button>
      </div>
    </div>
  );
}
