import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const LeaveApplicationForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        userId: '',
        fromDate: '',
        toDate: '',
        subject: '',
        description: '',
        leave_type_id: '',
    });
    const [users, setUsers] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [balances, setBalances] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [calculatedDays, setCalculatedDays] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUserName, setSelectedUserName] = useState('');
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (role === 'admin') {
            const fetchUsers = async () => {
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/auth/users`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUsers(response.data);
                } catch (error) {
                    console.error('Error fetching users:', error);
                }
            };
            fetchUsers();
        }

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        const fetchLeaveTypes = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/leave-type`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLeaveTypes(response.data);
            } catch (error) {
                console.error('Error fetching leave types:', error);
            }
        };

        const fetchBalances = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/leave-balance`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBalances(response.data);
            } catch (error) {
                console.error('Error fetching balances:', error);
            }
        };

        const fetchHolidays = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/holidays`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHolidays(response.data);
            } catch (error) {
                console.error('Error fetching holidays', error);
            }
        };

        fetchLeaveTypes();
        fetchHolidays();
        if (role !== 'admin') {
            fetchBalances();
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [role, token]);

    const calculateDays = (startStr, endStr) => {
        if (!startStr || !endStr) return 0;
        let start = new Date(startStr);
        let end = new Date(endStr);
        if (end < start) return 0;

        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        let count = 0;
        let currentDate = new Date(start);

        const holidayDates = new Set(
            holidays.map(h => {
                const d = new Date(h.date);
                d.setHours(0, 0, 0, 0);
                return d.getTime();
            })
        );

        while (currentDate <= end) {
            const dayOfWeek = currentDate.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isHoliday = holidayDates.has(currentDate.getTime());

            if (!isWeekend && !isHoliday) {
                count++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return count;
    };

    useEffect(() => {
        setCalculatedDays(calculateDays(formData.fromDate, formData.toDate));
    }, [formData.fromDate, formData.toDate, holidays]);

    const filteredUsers = users.filter(user => {
        if (!searchQuery.trim()) return true;

        // Split search query by comma or space, and remove empty terms
        const terms = searchQuery.toLowerCase().split(/[\s,]+/).filter(term => term.length > 0);

        // All terms must match at least one of the fields for the user to be included
        return terms.every(term => {
            return (
                user.name.toLowerCase().includes(term) ||
                (user.place && user.place.toLowerCase().includes(term)) ||
                (user.department && user.department.toLowerCase().includes(term)) ||
                (user.yearsOfExperience !== null && user.yearsOfExperience !== undefined && user.yearsOfExperience.toString().includes(term))
            );
        });
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Optional Frontend Validation for requested days vs remaining
        if (role !== 'admin' && formData.leave_type_id) {
            const start = new Date(formData.fromDate);
            const end = new Date(formData.toDate);
            if (end < start) {
                return alert("To Date must be after From Date");
            }
            const requestedDays = calculatedDays;
            const balance = balances.find(b => b.leave_type_id.toString() === formData.leave_type_id.toString());

            if (balance && requestedDays > balance.remaining) {
                return alert(`Insufficient balance! You requested ${requestedDays} days but only have ${balance.remaining} remaining for this leave type.`);
            }
        }

        try {
            const endpoint = role === 'admin'
                ? `${API_BASE_URL}/api/leave/admin/create`
                : `${API_BASE_URL}/api/leave/create`;

            const response = await axios.post(endpoint, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                alert('Leave Application Submitted Successfully');
                setFormData({ userId: '', fromDate: '', toDate: '', subject: '', description: '', leave_type_id: '' });
                setSelectedUserName('');
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error("Error creating leave:", error);
            if (error.response && error.response.data && error.response.data.message) {
                alert(`Error: ${error.response.data.message}`);
            } else {
                alert('Failed to submit leave application');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {role === 'admin' && (
                <div className="relative" ref={dropdownRef}>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Select Employee:</label>
                    <div
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm bg-white cursor-pointer flex justify-between items-center"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <span className={selectedUserName ? "text-gray-900" : "text-gray-500"}>
                            {selectedUserName || "Choose an employee..."}
                        </span>
                        <svg className={`h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>

                    {isDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-blue-400 rounded-md shadow-lg overflow-hidden">
                            <div className="p-2 border-b border-blue-400">
                                <input
                                    type="text"
                                    className="w-full px-2 py-1 text-sm outline-none placeholder-gray-400"
                                    placeholder="Search by name, city, position, or experience..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <div
                                            key={user.id}
                                            className="grid grid-cols-4 gap-2 px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, userId: user.id }));
                                                setSelectedUserName(user.name);
                                                setIsDropdownOpen(false);
                                                setSearchQuery('');
                                            }}
                                        >
                                            <div className="font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{user.name}</div>
                                            <div className="text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{user.place}</div>
                                            <div className="text-blue-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">{user.department}</div>
                                            <div className="text-gray-400 text-right">{user.yearsOfExperience}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-sm text-gray-500 text-center">No employees found.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">From</label>
                    <input type="date" name="fromDate" value={formData.fromDate} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">To</label>
                    <input type="date" name="toDate" value={formData.toDate} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" />
                </div>
            </div>

            {formData.fromDate && formData.toDate && calculatedDays > 0 && (
                <div className="bg-indigo-50 p-3 rounded-md text-sm text-indigo-800 flex items-center shadow-sm">
                    <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <strong>Duration: </strong> <span className="ml-1 flex-1">{calculatedDays} day(s)</span>
                    <span className="text-xs text-indigo-500 ml-4">(Weekends and Holidays excluded)</span>
                </div>
            )}

            <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Leave Type</label>
                <div className="relative">
                    <select name="leave_type_id" value={formData.leave_type_id} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm bg-white appearance-none">
                        <option value="" disabled>Select a leave type</option>
                        {leaveTypes.map(type => {
                            const bal = balances.find(b => b.leave_type_id === type.id);
                            const remainingText = role !== 'admin' && bal ? `(Remaining: ${bal.remaining} days)` : `(Max: ${type.max_days_per_year})`;
                            return (
                                <option key={type.id} value={type.id}>
                                    {type.name} {remainingText}
                                </option>
                            );
                        })}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                </div>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Subject</label>
                <input type="text" name="subject" value={formData.subject} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" placeholder="e.g. Sick Leave" />
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Description</label>
                <textarea name="description" rows="4" value={formData.description} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" placeholder="Reason for leave..."></textarea>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 shadow-md transition-all transform hover:-translate-y-0.5">Submit Request</button>
        </form>
    );
};

export default LeaveApplicationForm;
