import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
    // Determine initial sidebar state based on screen size (desktop = open, mobile = closed)
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const role = localStorage.getItem('role');

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex bg-gray-50 h-screen overflow-hidden font-sans">
            {/* Sidebar Navigation */}
            <Sidebar isOpen={isSidebarOpen} role={role} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

                {/* Page Content */}
                <main className="flex-1 overflow-auto bg-gray-50/50 p-4 sm:p-6 lg:p-8">
                    {/* The specific page content (Dashboard, Calendar, etc.) will render here */}
                    <div className="max-w-7xl mx-auto h-full w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
