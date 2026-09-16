import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

function ManageDepartmentsPage() {
    const [departments, setDepartments] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/departments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDepartments(res.data);
        } catch (error) {
            console.error('Failed to fetch departments:', error);
            showMessage('Failed to load departments', true);
        }
    };

    const showMessage = (msg, error = false) => {
        setMessage(msg);
        setIsError(error);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`${API_BASE_URL}/api/departments/${editingId}`, { name, description }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showMessage('Department updated successfully');
            } else {
                await axios.post(`${API_BASE_URL}/api/departments`, { name, description }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showMessage('Department created successfully');
            }
            setName('');
            setDescription('');
            setEditingId(null);
            fetchDepartments();
        } catch (error) {
            showMessage(error.response?.data?.message || 'Failed to save department', true);
        }
    };

    const handleEdit = (dept) => {
        setEditingId(dept.id);
        setName(dept.name);
        setDescription(dept.description || '');
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this department?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/departments/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showMessage('Department deleted successfully');
            fetchDepartments();
        } catch (error) {
            showMessage('Failed to delete department', true);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setName('');
        setDescription('');
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Manage Departments</h1>

            {message && (
                <div className={`mb-6 p-4 rounded-md ${isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message}
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
                <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Department' : 'Create New Department'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g. Engineering"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Optional description"
                            rows="3"
                        ></textarea>
                    </div>
                    <div className="flex space-x-3">
                        <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
                            {editingId ? 'Update Department' : 'Create Department'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={handleCancelEdit} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {departments.map((dept) => (
                            <tr key={dept.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{dept.name}</td>
                                <td className="px-6 py-4 text-gray-500">{dept.description || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEdit(dept)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                    <button onClick={() => handleDelete(dept.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {departments.length === 0 && (
                            <tr>
                                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">No departments found. Create one above.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ManageDepartmentsPage;
