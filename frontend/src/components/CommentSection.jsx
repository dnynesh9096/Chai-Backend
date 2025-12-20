import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FaThumbsUp, FaTrash } from 'react-icons/fa';

function CommentSection({ videoId, user }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchComments = async () => {
        try {
            const response = await api.get(`/comments/${videoId}`);
            setComments(response.data.data.docs || response.data.data); // Handle pagination structure or array
        } catch (error) {
            console.error("Failed to load comments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [videoId]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const response = await api.post(`/comments/${videoId}`, { content: newComment });
            setComments([response.data.data, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error("Failed to add comment", error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await api.delete(`/comments/c/${commentId}`);
            setComments(comments.filter(c => c._id !== commentId));
        } catch (error) {
            console.error("Failed to delete comment", error);
        }
    };

    const handleLike = async (commentId) => {
        if (!user) return alert("Please login to like comments");

        // Optimistic update
        setComments(comments.map(c => {
            if (c._id === commentId) {
                return {
                    ...c,
                    isLiked: !c.isLiked,
                    likesCount: c.isLiked ? (c.likesCount || 0) - 1 : (c.likesCount || 0) + 1
                };
            }
            return c;
        }));

        try {
            await api.post(`/likes/toggle/c/${commentId}`);
        } catch (error) {
            console.error("Failed to like comment", error);
            // Revert changes could happen here if needed, but keeping simple for now
        }
    };

    if (loading) return <div className="text-gray-400 mt-4">Loading comments...</div>;

    return (
        <div className="mt-6">
            <h3 className="text-xl font-bold text-white mb-4">{comments.length} Comments</h3>

            {user && (
                <form onSubmit={handleAddComment} className="flex gap-4 mb-6">
                    <img src={user.avatar} alt="User" className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full bg-transparent border-b border-gray-700 focus:border-white text-white outline-none py-1 transition"
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                type="submit"
                                disabled={!newComment.trim()}
                                className="bg-[#3ea6ff] text-black px-4 py-1.5 rounded-full font-semibold hover:bg-[#65b8ff] disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Comment
                            </button>
                        </div>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {comments.map((comment) => (
                    <div key={comment._id} className="flex gap-4">
                        <img
                            src={comment.owner?.avatar || "https://via.placeholder.com/40"}
                            alt={comment.owner?.username}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-semibold text-sm">@{comment.owner?.username}</span>
                                <span className="text-gray-400 text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-300 text-sm">{comment.content}</p>

                            <div className="flex items-center gap-4 mt-2">
                                <button
                                    onClick={() => handleLike(comment._id)}
                                    className={`flex items-center gap-1 text-xs transition ${comment.isLiked ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <FaThumbsUp /> {comment.likesCount || 0}
                                </button>
                                {user && user._id === comment.owner?._id && (
                                    <button
                                        onClick={() => handleDeleteComment(comment._id)}
                                        className="text-gray-400 hover:text-red-500 text-xs"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CommentSection;
