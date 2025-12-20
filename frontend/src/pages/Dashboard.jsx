import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FaEye, FaHeart, FaVideo, FaUsers, FaTrash, FaEdit, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import UploadVideoModal from '../components/UploadVideoModal';
import EditVideoModal from '../components/EditVideoModal';

function Dashboard() {
    const [stats, setStats] = useState({
        subscribers: 0,
        totalVideos: 0,
        totalViews: 0,
        totalLikes: 0
    });
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, videosRes] = await Promise.all([
                api.get('/dashboard/stats'),
                api.get('/dashboard/videos')
            ]);
            setStats(statsRes.data.data);
            setVideos(videosRes.data.data);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const togglePublishStatus = async (videoId) => {
        try {
            await api.patch(`/videos/toggle/publish/${videoId}`);
            setVideos(videos.map(v =>
                v._id === videoId ? { ...v, isPublished: !v.isPublished } : v
            ));
        } catch (error) {
            console.error("Failed to toggle publish status", error);
        }
    };

    const handleDelete = async (videoId) => {
        if (!window.confirm("Are you sure you want to delete this video?")) return;
        try {
            await api.delete(`/videos/${videoId}`);
            setVideos(videos.filter(v => v._id !== videoId));
        } catch (error) {
            console.error("Failed to delete video", error);
        }
    };

    if (loading) return <div className="p-8 text-center text-white">Loading dashboard...</div>;

    return (
        <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-2">Channel Dashboard</h1>
            <p className="text-gray-400 mb-8">Detailed view of your channel performance and content</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatsCard icon={<FaEye />} label="Total Views" value={stats.totalViews} color="blue" />
                <StatsCard icon={<FaUsers />} label="Subscribers" value={stats.subscribers} color="purple" />
                <StatsCard icon={<FaHeart />} label="Total Likes" value={stats.totalLikes} color="red" />
                <StatsCard icon={<FaVideo />} label="Total Videos" value={stats.totalVideos} color="green" />
            </div>

            {/* Videos Table */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Your Videos</h2>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
                    >
                        Upload New
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#1a1a1a] text-gray-400 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4">Video</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date Uploaded</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 text-gray-300">
                            {videos.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                                        No videos uploaded yet.
                                    </td>
                                </tr>
                            ) : (
                                videos.map((video) => (
                                    <tr key={video._id} className="hover:bg-white/5 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-24 h-14 bg-gray-800 rounded-lg overflow-hidden shrink-0">
                                                    <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="max-w-xs">
                                                    <Link to={`/video/${video._id}`} className="text-white font-medium hover:text-blue-400 line-clamp-1">
                                                        {video.title}
                                                    </Link>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{video.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => togglePublishStatus(video._id)}
                                                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${video.isPublished
                                                    ? 'border-green-500/30 bg-green-500/10 text-green-400'
                                                    : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                                                    }`}
                                            >
                                                {video.isPublished ? (
                                                    <><FaToggleOn className="text-lg" /> Published</>
                                                ) : (
                                                    <><FaToggleOff className="text-lg" /> Private</>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {new Date(video.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => setEditingVideo(video)}
                                                    className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(video._id)}
                                                    className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-full transition"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {
                showUploadModal && (
                    <UploadVideoModal
                        onClose={() => setShowUploadModal(false)}
                        onUploadSuccess={fetchDashboardData}
                    />
                )
            }
            {
                editingVideo && (
                    <EditVideoModal
                        video={editingVideo}
                        onClose={() => setEditingVideo(null)}
                        onUpdateSuccess={fetchDashboardData}
                    />
                )
            }
        </div >
    );
}

function StatsCard({ icon, label, value, color }) {
    const colors = {
        blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        red: 'bg-red-500/10 text-red-500 border-red-500/20',
        green: 'bg-green-500/10 text-green-500 border-green-500/20',
    };

    return (
        <div className={`glass-card p-6 rounded-xl border hover:border-white/10 transition-colors`}>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl mb-4 ${colors[color]}`}>
                {icon}
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
            <p className="text-gray-400 text-sm">{label}</p>
        </div>
    );
}

export default Dashboard;
