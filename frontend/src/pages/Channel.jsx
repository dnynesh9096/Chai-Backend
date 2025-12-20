import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { FaUserPlus, FaUserCheck, FaEdit, FaVideo, FaTwitter, FaList, FaSearch, FaCamera } from 'react-icons/fa';

function Channel({ user: currentUser, setUser }) { // user prop might come from Layout or be null
    const { username } = useParams();
    const [channel, setChannel] = useState(null);
    const [videos, setVideos] = useState([]);
    const [tweets, setTweets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('videos');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscribersCount, setSubscribersCount] = useState(0);

    const handleFileChange = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append(type === 'avatar' ? 'avatar' : 'coverImage', file);

        try {
            const endpoint = type === 'avatar' ? '/users/avatar' : '/users/cover-image';
            const res = await api.patch(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Update local state to reflect change immediately
            setChannel(prev => ({
                ...prev,
                [type === 'avatar' ? 'avatar' : 'coverImage']: res.data.data[type === 'avatar' ? 'avatar' : 'coverImage']
            }));

            // Update global user state if the current user is modifying their own channel
            if (currentUser && currentUser._id === res.data.data._id && setUser) {
                setUser(prev => ({
                    ...prev,
                    [type === 'avatar' ? 'avatar' : 'coverImage']: res.data.data[type === 'avatar' ? 'avatar' : 'coverImage']
                }));
            }

        } catch (error) {
            console.error(`Failed to update ${type}`, error);
            alert(`Failed to update ${type}`);
        }
    };

    useEffect(() => {
        const fetchChannelProfile = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/users/c/${username}`);
                setChannel(res.data.data);
                setSubscribersCount(res.data.data.subscribersCount);
                setIsSubscribed(res.data.data.isSubscriberd);

                // Fetch videos for this channel
                const videosRes = await api.get(`/videos?userId=${res.data.data._id}`);
                setVideos(videosRes.data.data.docs || []);

                // Fetch tweets for this channel
                const tweetsRes = await api.get(`/tweets/user/${res.data.data._id}`);
                setTweets(tweetsRes.data.data || []);

            } catch (err) {
                console.error("Failed to fetch channel data", err);
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchChannelProfile();
        }
    }, [username]);

    const handleSubscribe = async () => {
        if (!channel) return;
        try {
            await api.post(`/subscriptions/c/${channel._id}`);
            setIsSubscribed(!isSubscribed);
            setSubscribersCount(prev => isSubscribed ? prev - 1 : prev + 1);
        } catch (error) {
            console.error("Subscription failed", error);
        }
    };

    if (loading) {
        return <div className="text-white text-center mt-20">Loading channel...</div>;
    }

    if (!channel) {
        return <div className="text-white text-center mt-20">Channel not found</div>;
    }

    const isOwner = currentUser?.username === channel.username;

    return (
        <div className='bg-[#0f0f0f] text-white min-h-screen pb-10'>
            {/* Cover Image */}
            <div className="h-40 md:h-64 bg-gray-800 relative group">
                {channel.coverImage ? (
                    <img src={channel.coverImage} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-900 to-gray-900"></div>
                )}
                {isOwner && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <FaCamera className="text-white text-3xl drop-shadow-lg" />
                        <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'coverImage')} />
                    </label>
                )}
            </div>

            {/* Channel Info */}
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 -mt-12 relative z-10 mb-8">
                    {/* Avatar */}
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#0f0f0f] bg-gray-700 overflow-hidden shrink-0 relative group">
                        <img src={channel.avatar} alt={channel.username} className="w-full h-full object-cover" />
                        {isOwner && (
                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <FaCamera className="text-white text-3xl drop-shadow-lg" />
                                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'avatar')} />
                            </label>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 text-center md:text-left mt-2 md:mt-14">
                        <h1 className="text-3xl font-bold mb-1">{channel.fullName}</h1>
                        <p className="text-gray-400 mb-3">@{channel.username} • {subscribersCount} subscribers • {channel.channelsSubscribedTocount} subscribed</p>

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-center md:justify-start">
                            {isOwner ? (
                                <Link to="/settings" className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2">
                                    <FaEdit /> Edit Channel
                                </Link>
                            ) : (
                                <button
                                    onClick={handleSubscribe}
                                    className={`px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${isSubscribed
                                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        : 'bg-white text-black hover:bg-gray-200'
                                        }`}
                                >
                                    {isSubscribed ? <><FaUserCheck /> Subscribed</> : <><FaUserPlus /> Subscribe</>}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-800 mb-6 sticky top-0 bg-[#0f0f0f] z-20 pt-2">
                    <div className="flex gap-8 overflow-x-auto no-scrollbar">
                        <TabButton active={activeTab === 'videos'} onClick={() => setActiveTab('videos')} icon={<FaVideo />}>Videos</TabButton>
                        <TabButton active={activeTab === 'tweets'} onClick={() => setActiveTab('tweets')} icon={<FaTwitter />}>Tweets</TabButton>
                        <TabButton active={activeTab === 'playlists'} onClick={() => setActiveTab('playlists')} icon={<FaList />}>Playlists</TabButton>
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                    {activeTab === 'videos' && (
                        <>
                            {videos.length === 0 ? (
                                <EmptyState message="No videos uploaded yet" />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {videos.map(video => (
                                        <Link to={`/video/${video._id}`} key={video._id} className="group cursor-pointer">
                                            <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                                                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                                                <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">{formatDuration(video.duration)}</span>
                                            </div>
                                            <h3 className="font-semibold line-clamp-2 group-hover:text-blue-400 transition-colors">{video.title}</h3>
                                            <div className="text-gray-400 text-sm mt-1">
                                                {video.views} views • {formatTimeAgo(video.createdAt)}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'tweets' && (
                        <div className="max-w-2xl mx-auto space-y-4">
                            {tweets.length === 0 ? (
                                <EmptyState message="No tweets yet" />
                            ) : (
                                tweets.map(tweet => (
                                    <div key={tweet._id} className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
                                        <div className="flex gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden shrink-0">
                                                <img src={channel.avatar} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-white">{channel.fullName}</span>
                                                    <span className="text-gray-500 text-sm">@{channel.username} • {formatTimeAgo(tweet.createdAt)}</span>
                                                </div>
                                                <p className="text-gray-200">{tweet.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                    {activeTab === 'playlists' && (
                        <EmptyState message="Playlists coming soon!" />
                    )}
                </div>
            </div>
        </div>
    );
}

function TabButton({ children, active, onClick, icon }) {
    return (
        <button
            onClick={onClick}
            className={`pb-3 px-2 font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${active ? 'text-white border-white' : 'text-gray-400 border-transparent hover:text-white'
                }`}
        >
            {icon} {children}
        </button>
    );
}

function EmptyState({ message }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <FaSearch className="text-4xl mb-3 opacity-50" />
            <p>{message}</p>
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
    const seconds = Math.floor((now - date) / 1000); // Corrected variable name from headers to seconds

    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
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

export default Channel;
