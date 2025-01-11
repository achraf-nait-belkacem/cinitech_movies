import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, isAdmin } from '../services/authService';
import './Admin.css';

const Admin = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        // Vérifier si l'utilisateur est admin
        if (!isAdmin()) {
            navigate('/');
            return;
        }
        fetchUsers();
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }
            setUsers(data);
        } catch (err) {
            setError(err.message || 'Erreur lors de la récupération des utilisateurs');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }
            setUsers(users.filter(user => user.id !== userId));
        } catch (err) {
            setError(err.message || 'Erreur lors de la suppression de l\'utilisateur');
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }
            setUsers(users.map(user => 
                user.id === userId ? { ...user, role: newRole } : user
            ));
        } catch (err) {
            setError(err.message || 'Erreur lors de la mise à jour du rôle');
        }
    };

    if (loading) {
        return <div className="admin-loading">Chargement...</div>;
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Tableau de bord administrateur</h1>
                <div className="admin-stats">
                    <div className="stat-card">
                        <h3>Total Utilisateurs</h3>
                        <p>{users.length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Administrateurs</h3>
                        <p>{users.filter(user => user.role === 'admin').length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Utilisateurs Standards</h3>
                        <p>{users.filter(user => user.role === 'user').length}</p>
                    </div>
                </div>
            </div>

            {error && <div className="admin-error">{error}</div>}

            <div className="users-table-container">
                <h2>Gestion des Utilisateurs</h2>
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nom d'utilisateur</th>
                            <th>Email</th>
                            <th>Rôle</th>
                            <th>Date de création</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                        className="role-select"
                                    >
                                        <option value="user">Utilisateur</option>
                                        <option value="admin">Administrateur</option>
                                    </select>
                                </td>
                                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="delete-button"
                                        disabled={user.role === 'admin'}
                                    >
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Admin; 