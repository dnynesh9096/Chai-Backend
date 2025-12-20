import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

function Home() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const query = searchParams.get('query');

    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            try {
                const endpoint = query ? `/videos?query=${query}` : '/videos';
                const res = await api.get(endpoint);
                setVideos(res.data.data.docs || []);
            } catch (err) {
                console.error("Failed to fetch videos", err);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, [query]);

    if (loading) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="flex flex-col gap-4">

            {videos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                    <div className="text-6xl mb-4">📹</div>
                    <h2 className="text-2xl font-bold text-white mb-2">No videos yet</h2>
                    <p className="text-gray-400">Be the first to upload a video!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                    {videos.map(video => (
                        <Link to={`/video/${video._id}`} key={video._id} className="group cursor-pointer flex flex-col gap-3">
                            {/* Thumbnail */}
                            <div className="relative aspect-video rounded-xl overflow-hidden">
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                                <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                                    {formatDuration(video.duration)}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="flex gap-3 items-start">
                                <div className="flex-shrink-0 mt-0.5">
                                    <img
                                        src={video.owner?.avatar}
                                        alt={video.owner?.username}
                                        className="w-9 h-9 rounded-full object-cover bg-gray-700"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <h3
                                        className="text-white font-semibold text-base line-clamp-2 leading-tight"
                                        title={video.title}
                                    >
                                        {video.title}
                                    </h3>
                                    <div className="text-gray-400 text-sm mt-1">
                                        <p className="hover:text-white transition-colors">{video.owner?.fullName || video.owner?.username}</p>
                                        <p>
                                            {video.views} views • {formatTimeAgo(video.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

function formatDuration(seconds) {
    if (!seconds) return "00:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const headers = Math.floor((now - date) / 1000);

    if (headers < 60) return `${headers} seconds ago`;
    const minutes = Math.floor(headers / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} months ago`;
    const years = Math.floor(months / 12);
    return `${years} years ago`;
}

export default Home;
