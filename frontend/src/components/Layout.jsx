import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function Layout({ user, onLogout }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="bg-black min-h-screen text-white">
            <Navbar toggleSidebar={toggleSidebar} user={user} onLogout={onLogout} />
            <Sidebar isOpen={sidebarOpen} user={user} />

            <main
                className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-0'}`}
            >
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default Layout;
