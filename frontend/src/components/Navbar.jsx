import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaUserCircle, FaBars, FaVideo, FaBell, FaSignOutAlt } from 'react-icons/fa';

import UploadVideoModal from './UploadVideoModal';

function Navbar({ toggleSidebar, user, onLogout }) {
    const [query, setQuery] = React.useState('');
    const [showUploadModal, setShowUploadModal] = React.useState(false);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/?query=${query}`);
        }
    };

    return (
        <nav className="fixed top-0 left-0 w-full bg-[#0f0f0f] text-white h-16 flex items-center justify-between px-4 z-50">
            {/* Left: Menu & Logo */}
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="p-2 hover:bg-[#272727] rounded-full text-xl transition-colors">
                    <FaBars />
                </button>
                <Link to="/" className="flex items-center gap-1 relative" title="VideoTube Home">
                    <div className="flex items-center gap-1">
                        <div className="w-8 h-6 bg-red-600 rounded-lg flex items-center justify-center relative">
                            <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[6px] border-l-white border-b-[3px] border-b-transparent ml-0.5"></div>
                        </div>
                        <span className="text-xl font-bold tracking-tighter font-sans">VideoTube</span>
                    </div>
                </Link>
            </div>

            {/* Center: Search */}
            <div className="hidden md:flex flex-1 items-center justify-center max-w-[720px] ml-10">
                <form onSubmit={handleSearch} className="flex w-full items-center">
                    <div className="flex w-full items-center group">
                        <div className="flex w-full items-center bg-[#121212] border border-[#303030] rounded-l-full px-4 py-2 focus-within:border-blue-500 ml-5 shadow-inner">
                            {/* Optional search icon inside input when focused, usually hidden */}
                            <input
                                type="text"
                                placeholder="Search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full bg-transparent outline-none text-white text-base placeholder-gray-500 font-normal"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-[#222222] hover:bg-[#303030] border border-l-0 border-[#303030] rounded-r-full text-white transition-colors flex items-center justify-center"
                        >
                            <FaSearch size={19} className="text-gray-200" />
                        </button>
                    </div>
                </form>
            </div>


            {/* Right: Actions & Profile */}
            < div className="flex items-center gap-2 sm:gap-4" >
                {/* Mobile Search Icon */}
                < button className="md:hidden p-2 hover:bg-[#272727] rounded-full" >
                    <FaSearch size={20} />
                </button >

                {
                    user ? (
                        <>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="hidden sm:flex items-center gap-2 hover:bg-[#272727] px-3 py-2 rounded-full font-medium transition-colors"
                            >
                                <FaVideo size={20} />
                                <span className="text-sm">Create</span>
                            </button>

                            <div className="relative group cursor-pointer ml-2">
                                <img
                                    src={user.avatar}
                                    alt="User"
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                {/* Dropdown with Modern UI */}
                                <div className="absolute right-0 top-12 w-72 bg-[#1e1e1e] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-gray-800 hidden group-hover:block overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                                    {/* Header Section */}
                                    <div className="px-5 py-4 border-b border-gray-700/50 bg-[#252525]">
                                        <div className="flex gap-4 items-center mb-3">
                                            <div className="p-0.5 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full">
                                                <img src={user.avatar} className="w-10 h-10 rounded-full object-cover border-2 border-[#1e1e1e]" alt="Avatar" />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="font-bold text-white text-base leading-tight">{user.fullName}</p>
                                                <p className="text-gray-400 text-xs mt-0.5">@{user.username}</p>
                                            </div>
                                        </div>
                                        <Link
                                            to="/dashboard"
                                            className="text-blue-400 text-sm hover:text-blue-300 transition-colors flex items-center gap-1 font-medium"
                                        >
                                            View your channel
                                        </Link>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="p-2">
                                        <button
                                            onClick={onLogout}
                                            className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-[#333333] rounded-xl transition-all flex items-center gap-3 group/item border border-transparent hover:border-gray-700"
                                        >
                                            <FaSignOutAlt className="text-gray-400 group-hover/item:text-red-500 transition-colors text-lg" />
                                            <span className="font-medium">Sign out</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="flex items-center gap-2 px-4 py-1.5 text-blue-400 border border-gray-700/50 hover:bg-blue-400/20 hover:border-blue-400/20 rounded-full font-medium text-sm transition-all"
                        >
                            <FaUserCircle className="text-xl" />
                            Sign in
                        </Link>
                    )
                }
            </div >

            {showUploadModal && <UploadVideoModal onClose={() => setShowUploadModal(false)} onUploadSuccess={() => { }} />}
        </nav >
    );
}

export default Navbar;
