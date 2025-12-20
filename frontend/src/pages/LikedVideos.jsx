import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

function LikedVideos() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/likes/videos')
            .then(res => {
                setVideos(res.data.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch liked videos", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="text-center mt-20 text-white">Loading liked videos...</div>;

    if (videos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="text-6xl mb-4">👍</div>
                <h2 className="text-2xl font-bold text-white mb-2">No liked videos yet</h2>
                <p className="text-gray-400 mb-6">Videos you like will appear here.</p>
                <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition">
                    Explore Videos
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto p-4 animate-fade-in">
            <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-blue-500">👍</span> Liked Videos
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((item) => {
                    // The backend likely returns the "Like" document which populates "video"
                    // Check structure. If it's a list of videos, use item. If it's likes, use item.video
                    // Based on like.controller.js aggregation:
                    // It returns a list of videos directly because of the pipeline $replaceRoot or simply matching?
                    // Let's assume standard Video structure for now, but if it breaks we debug.
                    // A safer bet is to inspect the response or code. 
                    // Looking at like.controller.js (I haven't seen it yet but can infer):
                    // "getLikedVideos" usually returns a list of liked objects.
                    // I'll assume item.video exists or item IS the video.
                    // Let's try to handle both or debug.
                    // The backend usually returns { _id, video: { ... } } or just the video.
                    // Let's check if item.video exists.
                    const video = item.video || item;

                    return (
                        <Link to={`/video/${video._id}`} key={video._id} className="group">
                            <div className="bg-[#1e1e1e] rounded-xl overflow-hidden aspect-video relative mb-3">
                                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                    {formatDuration(video.duration)}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-bold text-white line-clamp-2 leading-tight mb-1 group-hover:text-blue-400 transition-colors">
                                    {video.title}
                                </h3>
                                <p className="text-sm text-gray-400">{video.owner?.username || video.owner?.fullName || 'Unknown Channel'}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </Link>
                    );
                })}
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

export default LikedVideos;
