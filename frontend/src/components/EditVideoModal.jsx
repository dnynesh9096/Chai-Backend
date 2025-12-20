import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import api from '../services/api';

function EditVideoModal({ video, onClose, onUpdateSuccess }) {
    const [title, setTitle] = useState(video?.title || '');
    const [description, setDescription] = useState(video?.description || '');
    const [thumbnail, setThumbnail] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (video) {
            setTitle(video.title);
            setDescription(video.description);
        }
    }, [video]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setThumbnail(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title) {
            setError("Title is required");
            return;
        }

        setUpdating(true);
        setError('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        if (thumbnail) {
            formData.append('thumbnail', thumbnail);
        }

        try {
            await api.patch(`/videos/${video._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onUpdateSuccess();
            onClose();
        } catch (err) {
            console.error("Update failed", err);
            setError(err.response?.data?.message || "Failed to update video");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1e1e1e] rounded-xl w-full max-w-lg border border-gray-800 animate-fade-in relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                >
                    <FaTimes size={20} />
                </button>

                <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Edit Video</h2>

                    {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Thumbnail Update */}
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Update Thumbnail (Optional)</label>
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-14 bg-gray-800 rounded overflow-hidden">
                                    <img src={thumbnail ? URL.createObjectURL(thumbnail) : video.thumbnail} className="w-full h-full object-cover" alt="Preview" />
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#2a2a2a] file:text-white hover:file:bg-[#3a3a3a]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                placeholder="Video Title"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none h-24 resize-none"
                                placeholder="Tell viewers about your video"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-300 hover:text-white font-medium"
                                disabled={updating}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={updating}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50"
                            >
                                {updating ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditVideoModal;
