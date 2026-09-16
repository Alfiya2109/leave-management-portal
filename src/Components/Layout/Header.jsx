import React from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationPanel from '../NotificationPanel';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <header className="bg-white shadow-sm h-16 shrink-0 flex items-center justify-between px-4 lg:px-8 z-10 relative">
            <div className="flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="p-2 mr-4 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
                >
                    <span className="sr-only">Open sidebar</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarOpen ? "M4 6h16M4 12h16M4 18h7" : "M4 6h16M4 12h16M4 18h16"} />
                    </svg>
                </button>
                {/* Mobile text logo backup in case sidebar is hidden entirely on mobile later */}
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 md:hidden">
                    LeaveManager
                </span>
            </div>

            <div className="flex items-center space-x-6">
                <NotificationPanel />

                <div className="flex items-center space-x-3 bg-gray-50/50 p-1.5 pr-4 border border-gray-100 rounded-full shadow-sm hover:shadow transition-shadow">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {localStorage.getItem('role') === 'admin' ? 'A' : 'U'}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"
                    >
                        Sign Out
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
