import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

function AdminLeaveForm() {
    const [userId, setUserId] = useState('');
    const [users, setUsers] = useState([]);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [leaveTypeId, setLeaveTypeId] = useState('');
    const [leaveTypes, setLeaveTypes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_BASE_URL}/api/auth/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        const fetchLeaveTypes = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_BASE_URL}/api/leave-type`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLeaveTypes(response.data);
            } catch (error) {
                console.error('Error fetching leave types:', error);
            }
        };
        fetchUsers();
        fetchLeaveTypes();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/api/leave/admin/create`,
                {
                    userId,
                    fromDate,
                    toDate,
                    subject,
                    description,
                    leave_type_id: leaveTypeId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                alert('Leave applied successfully for user!');
                navigate('/dashboard'); // Or wherever appropriate
            }
        } catch (error) {
            console.error('Error applying leave via admin', error);
            alert('Failed to apply leave. Ensure you are an Admin and the User ID is correct.');
        }
    };

    return (
        <div className="w-full">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6 mt-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 border-b pb-2">Admin: Apply Leave for User</h2>
                    <p className="mt-2 text-sm text-gray-600">Enter the target user's ID and leave details to submit an application on their behalf.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="userId" className="block text-sm font-medium text-gray-700">Target User</label>
                        <select
                            id="userId"
                            required
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
                        >
                            <option value="" disabled>Select a user...</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.department}) - ID: {user.id}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700">From Date</label>
                            <input
                                type="date"
                                id="fromDate"
                                required
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label htmlFor="toDate" className="block text-sm font-medium text-gray-700">To Date</label>
                            <input
                                type="date"
                                id="toDate"
                                required
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="leaveTypeId" className="block text-sm font-medium text-gray-700">Leave Type</label>
                        <select
                            id="leaveTypeId"
                            required
                            value={leaveTypeId}
                            onChange={(e) => setLeaveTypeId(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
                        >
                            <option value="" disabled>Select a leave type...</option>
                            {leaveTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                    {type.name} (Max: {type.max_days_per_year} days)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                        <input
                            type="text"
                            id="subject"
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            placeholder="Reason for leave"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            id="description"
                            required
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            placeholder="Detailed description..."
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Apply Leave
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AdminLeaveForm;
