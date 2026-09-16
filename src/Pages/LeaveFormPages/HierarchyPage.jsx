import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

function HierarchyPage() {
    const [hierarchies, setHierarchies] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        employeeId: '',
        managerId: '',
        hrId: '',
        departmentId: ''
    });

    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    useEffect(() => {
        if (!token || role !== 'admin') {
            navigate('/');
            return;
        }
        fetchData();
    }, [token, role, navigate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [hierRes, usersRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/hierarchy`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/auth/users`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setHierarchies(hierRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error("Error fetching hierarchy data:", error);
            alert("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/hierarchy`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Hierarchy saved successfully!");
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error("Error saving hierarchy:", error);
            alert("Failed to save hierarchy.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this specific hierarchy rule?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/hierarchy/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (error) {
            console.error("Error deleting hierarchy:", error);
            alert("Failed to delete hierarchy.");
        }
    };

    return (
        <div className="w-full">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Manage Approval Hierarchies</h1>
                    <div className="space-x-4 flex">
                        <button
                            onClick={() => {
                                setFormData({ employeeId: '', managerId: '', hrId: '', departmentId: '' });
                                setShowModal(true);
                            }}
                            className="bg-indigo-600 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            Assign Reporting Line
                        </button>
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    {loading ? (
                        <div className="p-6 text-center text-gray-500">Loading configurations...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Manager</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned HR</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {hierarchies.map((h) => (
                                        <tr key={h.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">{h.Employee?.name || 'Unknown'}</div>
                                                <div className="text-sm text-gray-500">{h.Employee?.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-indigo-700">{h.Manager?.name || 'Unknown'}</div>
                                                <div className="text-sm text-gray-500">{h.Manager?.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-pink-700">{h.Hr?.name || 'Unknown'}</div>
                                                <div className="text-sm text-gray-500">{h.Hr?.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button onClick={() => handleDelete(h.id)} className="text-red-600 hover:text-red-900 ml-4">Remove</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {hierarchies.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-500 text-sm">
                                                No hierarchies defined. Please assign reporting lines so users can apply for leaves.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold mb-4">Set Approval Routing</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Employee</label>
                                <select name="employeeId" value={formData.employeeId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border">
                                    <option value="" disabled>Select Employee</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reporting Manager</label>
                                <select name="managerId" value={formData.managerId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border">
                                    <option value="" disabled>Select Manager</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">HR Representative</label>
                                <select name="hrId" value={formData.hrId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border">
                                    <option value="" disabled>Select HR</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                                </select>
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save Setting</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HierarchyPage;
