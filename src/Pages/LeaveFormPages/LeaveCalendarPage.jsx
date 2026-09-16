import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    parseISO,
    eachDayOfInterval,
    isWithinInterval
} from 'date-fns';
import { API_BASE_URL } from '../../config';

function LeaveCalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [leaves, setLeaves] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedLeaveType, setSelectedLeaveType] = useState('');

    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    useEffect(() => {
        if (!token) {
            navigate('/');
            return;
        }
        fetchCalendarData();
    }, [token, navigate]);

    const fetchCalendarData = async () => {
        try {
            setLoading(true);
            const [calendarRes, typesRes, holidaysRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/calendar`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/leave-type`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/holidays`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const leavesData = calendarRes.data;
            setLeaves(leavesData);
            setLeaveTypes(typesRes.data);
            setHolidays(holidaysRes.data);

            // Extract unique departments for filter dropdown
            const uniqueDepts = Array.from(new Set(
                leavesData
                    .filter(l => l.user && l.user.department)
                    .map(l => l.user.department)
            ));
            setDepartments(uniqueDepts.sort());

        } catch (error) {
            console.error("Error fetching calendar data:", error);
            alert("Failed to load calendar data.");
        } finally {
            setLoading(false);
        }
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    // Apply filtering
    const filteredLeaves = useMemo(() => {
        return leaves.filter(leave => {
            const matchDept = selectedDepartment ? leave.user?.department === selectedDepartment : true;
            const matchType = selectedLeaveType ? leave.leave_type_id.toString() === selectedLeaveType.toString() : true;
            return matchDept && matchType;
        });
    }, [leaves, selectedDepartment, selectedLeaveType]);

    // Helper to render days of the week header
    const renderDaysHeader = () => {
        const days = [];
        const startDate = startOfWeek(currentDate);
        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i} className="text-center font-semibold text-sm text-gray-500 py-2">
                    {format(addDays(startDate, i), 'EEE')}
                </div>
            );
        }
        return <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">{days}</div>;
    };

    // Helper to render the actual calendar grid
    const renderCells = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, 'd');
                const cloneDay = day;

                // Find leaves that fall on this specific day
                const dayLeaves = filteredLeaves.filter(leave => {
                    const lStart = parseISO(leave.fromDate);
                    const lEnd = parseISO(leave.toDate);
                    // Reset time components to safely compare dates
                    lStart.setHours(0, 0, 0, 0);
                    lEnd.setHours(0, 0, 0, 0);
                    const currentClone = new Date(cloneDay);
                    currentClone.setHours(0, 0, 0, 0);

                    return currentClone >= lStart && currentClone <= lEnd;
                });

                // Find holidays that fall on this specific day
                const dayHolidays = holidays.filter(holiday => {
                    const hDate = parseISO(holiday.date);
                    hDate.setHours(0, 0, 0, 0);
                    const currentClone = new Date(cloneDay);
                    currentClone.setHours(0, 0, 0, 0);
                    return currentClone.getTime() === hDate.getTime();
                });


                days.push(
                    <div
                        key={day}
                        className={`min-h-[100px] border-b border-r border-gray-100 p-2 relative transition-colors
                            ${!isSameMonth(day, monthStart) ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-900'}
                            ${isSameDay(day, new Date()) ? 'bg-indigo-50' : ''}
                        `}
                    >
                        <div className="flex justify-end">
                            <span className={`text-sm font-medium ${isSameDay(day, new Date()) ? 'bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                                {formattedDate}
                            </span>
                        </div>
                        <div className="mt-1 flex flex-col space-y-1">
                            
                            {dayHolidays.map((holiday, idx) => (
                                <div
                                    key={`hol-${holiday.id}-${idx}`}
                                    className="px-2 py-1 text-xs rounded-md shadow-sm border border-l-4 truncate cursor-pointer hover:opacity-80 transition-opacity"
                                    style={{
                                        backgroundColor: '#fefce8',
                                        borderColor: '#fef08a',
                                        borderLeftColor: '#eab308' // Yellow accent for holidays
                                    }}
                                    title={`${holiday.title}\n${holiday.description || ''}`}
                                >
                                    <span className="font-semibold text-yellow-800">Holiday: {holiday.title}</span>
                                </div>
                            ))}
                            {dayLeaves.map((leave, idx) => (
                                <div
                                    key={`${leave.id}-${idx}`}
                                    className="px-2 py-1 text-xs rounded-md shadow-sm border border-l-4 truncate cursor-pointer hover:opacity-80 transition-opacity"
                                    style={{
                                        backgroundColor: '#f8fafc',
                                        borderColor: '#cbd5e1',
                                        borderLeftColor: '#6366f1' // Indigo accent
                                    }}
                                    title={`${leave.user?.name} - ${leave.leaveType?.name}\n${leave.subject}`}
                                >
                                    <span className="font-semibold">{leave.user?.name}</span>
                                    <span className="text-gray-500 ml-1 block truncate">{leave.leaveType?.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7" key={day}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="border-l border-t border-gray-100">{rows}</div>;
    };

    return (
        <div className="w-full">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 text-left">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Company Leave Calendar</h1>
                        <p className="text-gray-500 mt-1">View all approved time off across the organization.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 items-center">
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <label className="text-sm font-medium text-gray-700">Department:</label>
                        <select
                            className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                        >
                            <option value="">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <label className="text-sm font-medium text-gray-700">Leave Type:</label>
                        <select
                            className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
                            value={selectedLeaveType}
                            onChange={(e) => setSelectedLeaveType(e.target.value)}
                        >
                            <option value="">All Leave Types</option>
                            {leaveTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1"></div> {/* Spacer */}
                    <div className="text-sm text-gray-500 font-medium">
                        Showing {filteredLeaves.length} approved record(s)
                    </div>
                </div>

                {/* Calendar Rendering */}
                {loading ? (
                    <div className="bg-white p-12 rounded-xl shadow-lg border border-gray-200 text-center flex flex-col items-center justify-center">
                        <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-500 font-medium">Loading calendar events...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        {/* Calendar Header Control */}
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
                            <h2 className="text-xl font-bold text-gray-900">
                                {format(currentDate, 'MMMM yyyy')}
                            </h2>
                            <div className="flex space-x-2">
                                <button onClick={prevMonth} className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 transition-colors" title="Previous Month">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button onClick={goToToday} className="px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                    Today
                                </button>
                                <button onClick={nextMonth} className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 transition-colors" title="Next Month">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Calendar Body */}
                        <div className="overflow-x-auto">
                            <div className="min-w-[800px]">
                                {renderDaysHeader()}
                                {renderCells()}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LeaveCalendarPage;
