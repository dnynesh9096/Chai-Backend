import React, { useEffect, useState } from 'react';
import api from '../services/api';

function Tweets({ user }) {
    const [tweets, setTweets] = useState([]);
    const [newTweet, setNewTweet] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingTweetId, setEditingTweetId] = useState(null);
    const [editContent, setEditContent] = useState('');

    useEffect(() => {
        if (user) {
            fetchTweets();
        }
    }, [user]);

    const fetchTweets = async () => {
        try {
            const res = await api.get(`/tweets/user/${user._id}`);
            setTweets(res.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch tweets", error);
            setLoading(false);
        }
    };

    const handleCreateTweet = async (e) => {
        e.preventDefault();
        if (!newTweet.trim()) return;

        try {
            await api.post('/tweets', { content: newTweet });
            setNewTweet('');
            fetchTweets(); // Refresh list
        } catch (error) {
            console.error("Failed to create tweet", error);
        }
    };

    const handleDeleteTweet = async (tweetId) => {
        if (!window.confirm("Delete this tweet?")) return;
        try {
            await api.delete(`/tweets/${tweetId}`);
            setTweets(tweets.filter(t => t._id !== tweetId));
        } catch (error) {
            console.error("Failed to delete tweet", error);
        }
    };

    const startEditing = (tweet) => {
        setEditingTweetId(tweet._id);
        setEditContent(tweet.content);
    };

    const cancelEditing = () => {
        setEditingTweetId(null);
        setEditContent('');
    };

    const handleUpdateTweet = async (tweetId) => {
        if (!editContent.trim()) return;
        try {
            await api.patch(`/tweets/${tweetId}`, { content: editContent });
            setTweets(tweets.map(t => t._id === tweetId ? { ...t, content: editContent } : t));
            cancelEditing();
        } catch (error) {
            console.error("Failed to update tweet", error);
        }
    };

    if (!user) return <div className="text-center mt-20 text-gray-400">Please log in to view community posts.</div>;

    return (
        <div className="max-w-[800px] mx-auto p-4 animate-fade-in">
            <h1 className="text-2xl font-bold text-white mb-6">Community Posts</h1>

            {/* Create Tweet */}
            <div className="glass-card p-6 rounded-xl mb-8">
                <form onSubmit={handleCreateTweet}>
                    <textarea
                        value={newTweet}
                        onChange={(e) => setNewTweet(e.target.value)}
                        placeholder="What's on your mind?"
                        className="w-full bg-[#121212] border border-gray-700 rounded-lg p-4 text-white focus:border-blue-500 outline-none resize-none h-24 mb-4 transition"
                    />
                    <div className="flex justify-end">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition">
                            Post
                        </button>
                    </div>
                </form>
            </div>

            {/* Tweets List */}
            {loading ? (
                <div className="text-center text-white">Loading tweets...</div>
            ) : tweets.length === 0 ? (
                <div className="text-center text-gray-400">No tweets yet.</div>
            ) : (
                <div className="space-y-4">
                    {tweets.map((tweet) => (
                        <div key={tweet._id} className="glass-card p-6 rounded-xl hover:bg-white/5 transition relative group">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                                    <div>
                                        <h3 className="font-bold text-white">{user.fullName}</h3>
                                        <span className="text-xs text-gray-500">{new Date(tweet.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                    <button
                                        onClick={() => startEditing(tweet)}
                                        className="text-gray-500 hover:text-white p-2"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTweet(tweet._id)}
                                        className="text-gray-500 hover:text-red-500 p-2"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            {editingTweetId === tweet._id ? (
                                <div className="mt-2">
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none resize-none h-24 mb-2"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={cancelEditing} className="text-gray-400 hover:text-white px-3 py-1 text-sm">Cancel</button>
                                        <button onClick={() => handleUpdateTweet(tweet._id)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-lg text-sm">Save</button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-200 whitespace-pre-wrap">{tweet.content}</p>
                            )}
                            <div className="mt-4 flex items-center gap-4 text-gray-400 text-sm">
                                <button className="hover:text-blue-400 transition flex items-center gap-1">
                                    👍 Like
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Tweets;
