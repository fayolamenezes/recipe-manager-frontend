import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import {
  fetchUsers,
  banUser,
  unbanUser,
  fetchAdminRecipes,
  deleteRecipe,
  fetchStats,
  deleteCommentByAdmin,
} from '../api/adminApi';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Always call hooks at the top level
  useEffect(() => {
    if (!user || !user.isAdmin) return;

    const loadData = async () => {
      try {
        const [userRes, recipeRes, statsRes] = await Promise.all([
          fetchUsers(),
          fetchAdminRecipes(),
          fetchStats(),
        ]);
        setUsers(userRes.data);
        setRecipes(recipeRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error('❌ Error loading admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Early redirects AFTER all hooks
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.isAdmin) {
    return <Navigate to="/" />;
  }

  if (loading) return <p>Loading admin dashboard...</p>;

  const handleBan = async (id) => {
    await banUser(id);
    setUsers(users.map(u => u._id === id ? { ...u, banned: true } : u));
  };

  const handleUnban = async (id) => {
    await unbanUser(id);
    setUsers(users.map(u => u._id === id ? { ...u, banned: false } : u));
  };

  const handleDeleteRecipe = async (id) => {
    await deleteRecipe(id);
    setRecipes(recipes.filter(r => r._id !== id));
  };

  const handleDeleteComment = async (recipeId, commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteCommentByAdmin(commentId); // Only pass commentId
      setRecipes(prev =>
        prev.map(r =>
          r._id === recipeId
            ? { ...r, comments: r.comments.filter(c => c._id !== commentId) }
            : r
        )
      );
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment');
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <section>
        <h2>Stats</h2>
        <p>Total Users: {stats.userCount}</p>
        <p>Total Recipes: {stats.recipeCount}</p>
        <h3>Top 5 Most Saved Recipes</h3>
        <ul>
          {stats.mostSavedRecipes?.map(r => (
            <li key={r._id}>{r.title} ({r.savedCount} saves)</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>User Management</h2>
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.banned ? 'Banned' : 'Active'}</td>
                <td>
                  {u.banned
                    ? <button onClick={() => handleUnban(u._id)}>Unban</button>
                    : <button onClick={() => handleBan(u._id)}>Ban</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Recipe Moderation</h2>
          <ul>
            {recipes.map(r => (
              <li key={r._id} style={{ marginBottom: '1rem' }}>
                <strong>{r.title}</strong> by {r.createdBy?.name || 'Unknown'}
                <button onClick={() => handleDeleteRecipe(r._id)}>Delete Recipe</button>

                {/* Show Comments */}
                {r.comments?.length > 0 ? (
                  <ul>
                    {r.comments.map(c => (
                      <li key={c._id}>
                        <em>{c.user?.name || 'Anonymous'}:</em> {c.text}
                        <button onClick={() => handleDeleteComment(r._id, c._id)} style={{ marginLeft: '10px' }}>
                          Delete Comment
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ marginLeft: '1rem' }}>No comments</p>
                )}
              </li>
            ))}
          </ul>
      </section>
    </div>
  );
};

export default AdminDashboard;
