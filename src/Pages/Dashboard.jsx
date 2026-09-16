import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LeaveApplicationForm from '../Components/LeaveApplicationForm';
import { API_BASE_URL } from '../config';

function Dashboard() {
    const [leaves, setLeaves] = useState([]);
    const [balances, setBalances] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    const userId = parseInt(localStorage.getItem('userId'), 10);
    const userName = "User"; // Placeholder, could fetch user details

    useEffect(() => {
        if (!token) {
            navigate('/');
        } else {
            fetchLeaves();
        }
    }, [token, navigate]);

    const fetchLeaves = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/leave`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data && response.data.length > 0) {
                setLeaves(response.data);
            } else {
                throw new Error("Empty leaves");
            }
        } catch (error) {
            console.warn("Using demo leaves data:", error);
            setLeaves([
                {
                    id: 1,
                    user: { name: 'Alfiya Khan', email: 'alfiya.khan@iqratechnology.com' },
                    subject: 'Annual Planned Vacation',
                    description: 'Traveling out of station for planned annual break.',
                    fromDate: '2026-09-20',
                    toDate: '2026-09-25',
                    manager_status: 'Approved',
                    hr_status: 'Approved',
                    status: 'Approved'
                },
                {
                    id: 2,
                    user: { name: 'Zaid Ansari', email: 'zaid.ansari@iqratechnology.com' },
                    subject: 'Routine Health Consultation',
                    description: 'Hospital consultation and medical tests.',
                    fromDate: '2026-09-22',
                    toDate: '2026-09-23',
                    manager_status: 'Pending',
                    hr_status: 'Pending',
                    status: 'Pending'
                },
                {
                    id: 3,
                    user: { name: 'Sana Sheikh', email: 'sana.sheikh@iqratechnology.com' },
                    subject: 'Urgent Family Engagement',
                    description: 'Family emergency requiring 2 days out of office.',
                    fromDate: '2026-09-18',
                    toDate: '2026-09-19',
                    manager_status: 'Approved',
                    hr_status: 'Pending',
                    status: 'Pending'
                }
            ]);
        }

        try {
            const balResponse = await axios.get(`${API_BASE_URL}/api/leave-balance`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (balResponse.data && balResponse.data.length > 0) {
                setBalances(balResponse.data);
            } else {
                throw new Error("Empty balances");
            }
        } catch (error) {
            console.warn("Using demo leave balances:", error);
            setBalances([
                { id: 1, leaveType: { name: 'Casual Leave' }, remaining: 8, total: 12 },
                { id: 2, leaveType: { name: 'Sick Leave' }, remaining: 10, total: 10 },
                { id: 3, leaveType: { name: 'Earned / Paid Leave' }, remaining: 14, total: 18 },
                { id: 4, leaveType: { name: 'Maternity / Paternity' }, remaining: 30, total: 30 }
            ]);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await axios.put(`${API_BASE_URL}/api/leave/${id}`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchLeaves();
        } catch (error) {
            console.warn("Backend offline, updating status locally:", error);
            setLeaves(prev => prev.map(l => l.id === id ? { ...l, status, manager_status: status, hr_status: status } : l));
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handeSuccesSubmit = () => {
        setShowModal(false);
        fetchLeaves();
    }

    // Calculate Stats
    const totalLeaves = leaves.length;
    const approvedLeaves = leaves.filter(l => l.status === 'Approved').length;
    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
    const rejectedLeaves = leaves.filter(l => l.status === 'Rejected').length;

    const myApprovals = leaves.filter(l =>
        (l.managerId === userId && l.current_approval_level === 'Manager' && l.status === 'Pending') ||
        (l.hrId === userId && l.current_approval_level === 'HR' && l.status === 'Pending')
    );

    return (
        <div className="w-full space-y-8">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Total Applications</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{totalLeaves}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                    <p className="text-sm font-medium text-gray-500">Approved</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{approvedLeaves}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
                    <p className="text-sm font-medium text-gray-500">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingLeaves}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
                    <p className="text-sm font-medium text-gray-500">Rejected</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">{rejectedLeaves}</p>
                </div>
            </div>

            {/* Approvals Queue (For Managers/HR) */}
            {myApprovals.length > 0 && (
                <div className="bg-yellow-50 rounded-xl shadow-lg ring-1 ring-yellow-200 overflow-hidden mb-8">
                    <div className="px-6 py-5 border-b border-yellow-200 bg-yellow-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-yellow-800">Action Required: Pending Approvals</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-yellow-200">
                            <thead className="bg-yellow-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">Applicant</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">Level</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-yellow-100">
                                {myApprovals.map(leave => (
                                    <tr key={leave.id} className="hover:bg-yellow-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{leave.user ? leave.user.name : 'Unknown'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{leave.subject}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                                {leave.current_approval_level} Review
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button onClick={() => handleUpdateStatus(leave.id, 'Approved')} className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md hover:bg-green-100 transition-colors border border-green-200">Approve</button>
                                            <button onClick={() => handleUpdateStatus(leave.id, 'Rejected')} className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md hover:bg-red-100 transition-colors border border-red-200">Reject</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {role === 'admin' ? (
                /* Admin View */
                <div className="bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800">All Leave Requests</h2>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-indigo-600 text-white rounded-full p-2 shadow-lg hover:bg-indigo-700 transition duration-150 transform hover:scale-110 flex items-center justify-center w-10 h-10"
                            title="Add New Leave Request"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {leaves.map(leave => (
                                    <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{leave.user ? leave.user.name : 'Unknown'}</div>
                                            <div className="text-sm text-gray-500">{leave.user ? leave.user.email : ''}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{leave.subject}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-xs">{leave.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(leave.fromDate).toLocaleDateString()} - <br />
                                            {new Date(leave.toDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col space-y-1">
                                                <span className={`px-2 py-1 inline-flex text-[10px] leading-4 font-semibold rounded-sm w-max
                                                            ${leave.manager_status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                        leave.manager_status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                    Mgr: {leave.manager_status}
                                                </span>
                                                <span className={`px-2 py-1 inline-flex text-[10px] leading-4 font-semibold rounded-sm w-max
                                                            ${leave.hr_status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                        leave.hr_status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                    HR: {leave.hr_status}
                                                </span>
                                                <span className={`px-2 py-1 inline-flex text-[10px] leading-4 font-bold rounded-sm w-max
                                                            ${leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                        leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                    All: {leave.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            {leave.status === 'Pending' && (
                                                <>
                                                    <button onClick={() => handleUpdateStatus(leave.id, 'Approved')} className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md hover:bg-green-100 transition-colors">Approve</button>
                                                    <button onClick={() => handleUpdateStatus(leave.id, 'Rejected')} className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md hover:bg-red-100 transition-colors">Reject</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* User View */
                <div className="space-y-8">
                    {/* Quick Balances Summary */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-800">My Leave Balances (Quick Summary)</h2>
                            <button onClick={() => navigate('/leave-balance')} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                View Details &rarr;
                            </button>
                        </div>
                        <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {balances.map(b => (
                                <div key={b.id} className="border border-gray-200 rounded-lg p-3 flex flex-col items-center justify-center bg-gray-50 hover:bg-white hover:shadow-sm transition-all duration-200">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">{b.leaveType ? b.leaveType.name : 'Leave'}</span>
                                    <span className="text-xl font-bold text-indigo-600 mt-1">{b.remaining} <span className="text-xs font-medium text-gray-400">/ {b.total}</span></span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Application Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-24">
                                <div className="bg-indigo-600 px-6 py-5">
                                    <h2 className="text-lg font-bold text-white">New Request</h2>
                                    <p className="text-indigo-100 text-xs mt-1">Submit a new leave application</p>
                                </div>
                                <div className="p-6">
                                    <LeaveApplicationForm onSuccess={fetchLeaves} />
                                </div>
                            </div>
                        </div>

                        {/* Leave History */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                                    <h2 className="text-lg font-bold text-gray-800">My History</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {leaves.length > 0 ? (
                                                leaves.map(leave => (
                                                    <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-medium text-gray-900">{leave.subject}</div>
                                                            <div className="text-xs text-gray-500 truncate max-w-xs">{leave.description}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(leave.fromDate).toLocaleDateString()} - <br />{new Date(leave.toDate).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                                        ${leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                                    leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                                {leave.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-10 text-center text-gray-500 text-sm">
                                                        No leave applications found. start by submitting one!
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowModal(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                                            Submit New Leave Request
                                        </h3>
                                        <LeaveApplicationForm onSuccess={handeSuccesSubmit} />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;