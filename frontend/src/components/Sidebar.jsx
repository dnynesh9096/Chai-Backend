import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    FaHome, FaHistory, FaThumbsUp, FaUserCheck, FaCog,
    FaChartLine, FaListAlt, FaCommentDots, FaVideo, FaFire
} from 'react-icons/fa';

function Sidebar({ isOpen, user }) {
    // Mobile: drawer overlaid. Desktop: sidebar.
    // We will follow the youtube pattern: 
    // - Desktop: Always visible (width 240px) or Mini (width 72px) based on isOpen.
    // - Mobile: Drawer (absolute/fixed over content)

    // For this specific request, we'll keep the existing "drawer" style behavior for simplicity 
    // but update the internal look to match the "sections" style.

    return (
        <aside
            className={`
                fixed top-16 left-0 h-[calc(100vh-64px)] 
                bg-[#0f0f0f] text-white overflow-y-auto custom-scrollbar z-40
                transition-transform duration-200 ease-in-out
                ${isOpen ? 'translate-x-0 w-60' : '-translate-x-full w-0'}
            `}
        >
            <div className="flex flex-col py-2 px-3">

                {/* Section 1: Main */}
                <div className="border-b border-gray-800 pb-2 mb-2">
                    <NavItem to="/" icon={<FaHome size={20} />} label="Home" />
                    <NavItem to="/shorts" icon={<FaFire size={20} />} label="Shorts" />
                    <NavItem to="/subscriptions" icon={<FaUserCheck size={20} />} label="Subscriptions" />
                </div>

                {/* Section 2: You */}
                <div className="border-b border-gray-800 pb-2 mb-2">
                    <div className="px-3 py-2 flex items-center gap-2 text-base font-semibold">
                        <span>You</span>
                        <span className="text-gray-400 text-xs text-bold">&gt;</span>
                    </div>
                    {user && (
                        <>
                            <NavItem to={`/c/${user.username}`} icon={<FaUserCheck size={20} />} label="Your Channel" />
                            <NavItem to="/dashboard" icon={<FaChartLine size={20} />} label="Dashboard" />
                        </>
                    )}
                    <NavItem to="/history" icon={<FaHistory size={20} />} label="History" />
                    <NavItem to="/playlists" icon={<FaListAlt size={20} />} label="Playlists" />
                    <NavItem to="/liked-videos" icon={<FaThumbsUp size={20} />} label="Liked Videos" />
                </div>

                {/* Section 3: Settings/More */}
                <div className="pb-2">
                    <NavItem to="/settings" icon={<FaCog size={20} />} label="Settings" />
                </div>

                <div className="px-5 py-4 text-xs text-gray-500 font-medium">
                    <p>© 2025 VideoTube LLC</p>
                </div>
            </div>
        </aside>
    );
}

function NavItem({ to, icon, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-5 px-3 py-2 rounded-lg text-sm font-normal transition-colors mb-1
        ${isActive ? 'bg-[#272727] text-white font-medium' : 'text-white hover:bg-[#272727]'}`
            }
        >
            <span className="text-xl min-w-[24px] flex justify-center">{icon}</span>
            <span className="truncate">{label}</span>
        </NavLink>
    );
}

export default Sidebar;
