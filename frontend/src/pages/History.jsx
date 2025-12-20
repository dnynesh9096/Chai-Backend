import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaTrash, FaSearch, FaPause, FaCog } from 'react-icons/fa';

function History({ user }) {
    const [videos, setVideos] = useState([]);
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredVideos(videos);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = videos.filter(v =>
                v.title.toLowerCase().includes(query) ||
                v.description?.toLowerCase().includes(query) ||
                v.owner?.fullName?.toLowerCase().includes(query)
            );
            setFilteredVideos(filtered);
        }
    }, [searchQuery, videos]);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/users/history');
            // Backend returns user[0].watchHistory array directly or mapped
            const historyData = res.data.data || [];
            // Reverse to show most recent first if backend doesn't sort
            setVideos(historyData.reverse());
            setFilteredVideos(historyData);
        } catch (err) {
            console.error("Failed to fetch history", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClearHistory = async () => {
        if (!window.confirm("Are you sure you want to clear your entire watch history?")) return;

        try {
            await api.delete('/users/history');
            setVideos([]);
            setFilteredVideos([]);
        } catch (error) {
            console.error("Failed to clear history", error);
            alert("Failed to clear history");
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[50vh] text-white">
            <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#0f0f0f] text-white">

            {/* Main Content - Video List */}
            <div className="flex-1 px-4 py-6 lg:px-8 max-w-5xl">
                <h1 className="text-2xl font-bold mb-6">Watch history</h1>

                <div className="mb-8">
                    <h2 className="text-lg font-bold mb-4">Today</h2>
                    <div className="flex flex-col gap-4">
                        {filteredVideos.length === 0 ? (
                            <p className="text-gray-400">No videos found.</p>
                        ) : (
                            filteredVideos.map(video => (
                                <div key={video._id} className="flex flex-col sm:flex-row gap-4 group cursor-pointer">
                                    <Link to={`/video/${video._id}`} className="relative w-full sm:w-[240px] h-auto aspect-video rounded-xl overflow-hidden shrink-0">
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute bottom-1 right-1 bg-black/80 text-xs px-1 rounded text-white font-medium">
                                            {formatDuration(video.duration)}
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-red-600"></div>
                                    </Link>

                                    <div className="flex-1 flex flex-col justify-start relative">
                                        <div className="flex justify-between items-start">
                                            <Link to={`/video/${video._id}`}>
                                                <h3 className="font-semibold text-base sm:text-lg line-clamp-2 leading-tight mb-1" title={video.title}>
                                                    {video.title}
                                                </h3>
                                            </Link>
                                            <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-[#272727] rounded-full transition text-white">
                                                <span className="text-lg">⋮</span>
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                            <Link to={`/c/${video.owner?.username}`} className="hover:text-white transition-colors">
                                                {video.owner?.fullName || "Unknown"}
                                            </Link>
                                            <span>•</span>
                                            <span>{video.views} views</span>
                                        </div>

                                        <p className="text-xs text-gray-400 line-clamp-2 sm:line-clamp-1 max-w-2xl">
                                            {video.description}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Controls */}
            <div className="w-full lg:w-[360px] bg-[#0f0f0f] border-l border-gray-800/0 lg:fixed lg:right-0 lg:h-full lg:overflow-y-auto px-6 py-6 lg:pt-24 z-0">
                <div className="relative mb-8">
                    <FaSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search watch history"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-b border-gray-600 focus:border-white outline-none pl-8 pb-2 text-white placeholder-gray-500 transition-colors"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={handleClearHistory}
                        className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-[#272727] transition-colors text-left group"
                    >
                        <FaTrash className="text-gray-400 group-hover:text-white" size={20} />
                        <span className="text-gray-300 group-hover:text-white font-medium">Clear all watch history</span>
                    </button>

                    <button className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-[#272727] transition-colors text-left group">
                        <FaPause className="text-gray-400 group-hover:text-white" size={20} />
                        <span className="text-gray-300 group-hover:text-white font-medium">Pause watch history</span>
                    </button>

                    <button className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-[#272727] transition-colors text-left group">
                        <FaCog className="text-gray-400 group-hover:text-white" size={20} />
                        <span className="text-gray-300 group-hover:text-white font-medium">Manage all history</span>
                    </button>

                    <div className="mt-8 flex flex-col gap-4 px-4">
                        <a href="#" className="text-gray-400 hover:text-white text-sm">Comments</a>
                        <a href="#" className="text-gray-400 hover:text-white text-sm">Posts</a>
                        <a href="#" className="text-gray-400 hover:text-white text-sm">Live chat</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

function formatDuration(seconds) {
    if (!seconds) return "00:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
}

export default History;
