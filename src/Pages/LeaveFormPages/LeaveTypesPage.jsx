import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LeaveTypeForm from '../../Components/LeaveTypeForm';
import { API_BASE_URL } from '../../config';

function LeaveTypesPage() {
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentInitialData, setCurrentInitialData] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    useEffect(() => {
        if (!token || role !== 'admin') {
            navigate('/');
            return;
        }
        fetchLeaveTypes();
    }, [token, role, navigate]);

    const fetchLeaveTypes = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/leave-type`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeaveTypes(response.data);
        } catch (error) {
            console.error("Error fetching leave types:", error);
        }
    };

    const handleCreateClick = () => {
        setIsEditing(false);
        setCurrentInitialData(null);
        setCurrentId(null);
        setShowFormModal(true);
    };

    const handleEditClick = (leaveType) => {
        setIsEditing(true);
        setCurrentInitialData(leaveType);
        setCurrentId(leaveType.id);
        setShowFormModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this leave type?")) return;

        try {
            await axios.delete(`${API_BASE_URL}/api/leave-type/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Leave type deleted successfully.");
            fetchLeaveTypes();
        } catch (error) {
            console.error("Error deleting leave type:", error);
            alert("Failed to delete leave type.");
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (isEditing) {
                await axios.put(`${API_BASE_URL}/api/leave-type/${currentId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Leave type updated successfully!");
            } else {
                await axios.post(`${API_BASE_URL}/api/leave-type/create`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Leave type created successfully!");
            }
            setShowFormModal(false);
            fetchLeaveTypes();
        } catch (error) {
            console.error("Error saving leave type:", error);
            alert("Failed to save leave type.");
        }
    };

    return (
        <div className="w-full">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Manage Leave Types</h1>
                    <div className="space-x-4">
                        <button
                            onClick={handleCreateClick}
                            className="bg-indigo-600 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none"
                        >
                            Add Leave Type
                        </button>
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Days/Year</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requires Document</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {leaveTypes.map((leaveType) => (
                                <tr key={leaveType.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{leaveType.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leaveType.max_days_per_year}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {leaveType.requires_document ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Yes</span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">No</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEditClick(leaveType)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                        <button onClick={() => handleDelete(leaveType.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {leaveTypes.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No leave types defined yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Form */}
            {showFormModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowFormModal(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                                    {isEditing ? 'Edit Leave Type' : 'Create Leave Type'}
                                </h3>
                                <LeaveTypeForm
                                    initialData={currentInitialData}
                                    onSubmit={handleFormSubmit}
                                    onCancel={() => setShowFormModal(false)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LeaveTypesPage;
