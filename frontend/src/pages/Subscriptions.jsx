import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

function Subscriptions({ user }) {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            // Using the fixed route: /u/:subscriberId returns channels I subscribed to
            api.get(`/subscriptions/u/${user._id}`)
                .then(res => {
                    setChannels(res.data.data || []);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch subscriptions", err);
                    setLoading(false);
                });
        }
    }, [user]);

    if (!user) return <div className="text-center mt-20 text-gray-400">Please log in to view subscriptions.</div>;
    if (loading) return <div className="text-center mt-20 text-white">Loading subscriptions...</div>;

    if (channels.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="text-6xl mb-4">📺</div>
                <h2 className="text-2xl font-bold text-white mb-2">No subscriptions yet</h2>
                <p className="text-gray-400 mb-6">Subscribe to channels to see them here.</p>
                <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition">
                    Browse Channels
                </Link>
            </div>
        );
    }

    // Backend returns: { subscribedChannel: { ... } } inside the array
    return (
        <div className="max-w-[1200px] mx-auto p-4 animate-fade-in">
            <h1 className="text-2xl font-bold text-white mb-6">Subscriptions</h1>
            <div className="space-y-4">
                {channels.map((item) => {
                    const channel = item.subscribedChannel;
                    return (
                        <div key={channel._id} className="glass-card p-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition">
                            <div className="flex items-center gap-4">
                                <Link to={`/c/${channel.username}`}>
                                    <img src={channel.avatar} alt={channel.username} className="w-16 h-16 rounded-full object-cover border-2 border-transparent hover:border-blue-500 transition" />
                                </Link>
                                <div>
                                    <Link to={`/c/${channel.username}`} className="text-lg font-bold text-white hover:text-blue-400 transition">
                                        {channel.fullName}
                                    </Link>
                                    <p className="text-sm text-gray-400">@{channel.username}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Subscribed • {channel.latestVideo ? `Latest: ${channel.latestVideo.title}` : 'No videos recently'}
                                    </p>
                                </div>
                            </div>
                            <button className="bg-[#272727] hover:bg-[#3f3f3f] text-gray-200 px-4 py-2 rounded-full text-sm font-medium transition">
                                View Channel
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Subscriptions;
