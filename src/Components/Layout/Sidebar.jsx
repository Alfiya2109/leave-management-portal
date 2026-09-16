import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, role }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { name: 'My Balances', path: '/leave-balance', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
        { name: 'Company Calendar', path: '/calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    ];

    const adminItems = [
        { name: 'Manage Hierarchy', path: '/manage-hierarchy', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { name: 'Manage Departments', path: '/manage-departments', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
        { name: 'Manage Leave Types', path: '/manage-leave-types', icon: 'M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z' },
        { name: 'Manage Holidays', path: '/manage-holidays', icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z' },
    ];

    return (
        <div className={`bg-gray-900 text-white transition-all duration-300 ease-in-out shrink-0 ${isOpen ? 'w-64 absolute md:relative' : 'w-0 overflow-hidden md:w-20 md:overflow-visible'} h-full min-h-screen top-0 left-0 shadow-xl z-20 flex flex-col`}>
            {/* Logo Area */}
            <div className="h-16 flex items-center justify-center border-b border-gray-800 shrink-0">
                {isOpen ? (
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                        LeaveManager
                    </span>
                ) : (
                    <span className="text-xl font-bold text-indigo-400">LM</span>
                )}
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-700">
                <nav className="space-y-1 px-2">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.name}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center ${isOpen ? 'px-4' : 'justify-center'} py-3 rounded-lg transition-colors group relative ${isActive
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`}
                                title={!isOpen ? item.name : ''}
                            >
                                <svg className={`w-6 h-6 shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                </svg>
                                {isOpen && <span className="ml-3 font-medium tracking-wide truncate">{item.name}</span>}
                            </button>
                        );
                    })}

                    {role === 'admin' && (
                        <>
                            {isOpen && <div className="mt-8 mb-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin Controls</div>}
                            {!isOpen && <div className="mt-8 mb-4 border-t border-gray-800 mx-4"></div>}

                            {adminItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <button
                                        key={item.name}
                                        onClick={() => navigate(item.path)}
                                        className={`w-full flex items-center ${isOpen ? 'px-4' : 'justify-center'} py-3 rounded-lg transition-colors group relative ${isActive
                                            ? 'bg-purple-600 text-white'
                                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                            }`}
                                        title={!isOpen ? item.name : ''}
                                    >
                                        <svg className={`w-6 h-6 shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                        </svg>
                                        {isOpen && <span className="ml-3 font-medium tracking-wide truncate">{item.name}</span>}
                                    </button>
                                );
                            })}
                        </>
                    )}
                </nav>
            </div>

            {/* User Profile Badge (Bottom) */}
            {isOpen && (
                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                {role === 'admin' ? 'A' : 'U'}
                            </div>
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">Active Session</p>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">{role}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
