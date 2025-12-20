import React, { useState } from 'react';
import { FaTimes, FaCloudUploadAlt } from 'react-icons/fa';
import api from '../services/api';

function UploadVideoModal({ onClose, onUploadSuccess }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [subtitle, setSubtitle] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e, setFile) => {
        const file = e.target.files[0];
        if (file) setFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!videoFile || !thumbnail || !title) {
            setError("Please fill in all fields (Title, Video, Thumbnail)");
            return;
        }

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('videoFile', videoFile);
        formData.append('thumbnail', thumbnail);
        if (subtitle) formData.append('subtitle', subtitle);

        try {
            await api.post('/videos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onUploadSuccess();
            onClose();
        } catch (err) {
            console.error("Upload failed", err);
            setError(err.response?.data?.message || "Failed to upload video");
        } finally {
            setUploading(false);
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
                    <h2 className="text-2xl font-bold text-white mb-6">Upload Video</h2>

                    {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Video File Input */}
                        <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-blue-500 transition-colors group cursor-pointer relative">
                            <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => handleFileChange(e, setVideoFile)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center">
                                <FaCloudUploadAlt className="text-4xl text-gray-500 group-hover:text-blue-500 transition-colors mb-2" />
                                <p className="text-sm text-gray-400">
                                    {videoFile ? videoFile.name : "Drag & drop video here or click to browse"}
                                </p>
                            </div>
                        </div>

                        {/* Thumbnail Input */}
                        <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:border-blue-500 transition-colors group cursor-pointer relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, setThumbnail)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <p className="text-sm text-gray-400">
                                {thumbnail ? `Thumbnail: ${thumbnail.name}` : "Upload Thumbnail"}
                            </p>
                        </div>

                        {/* Subtitle Input */}
                        <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:border-blue-500 transition-colors group cursor-pointer relative">
                            <input
                                type="file"
                                accept=".vtt,.srt"
                                onChange={(e) => handleFileChange(e, setSubtitle)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <p className="text-sm text-gray-400">
                                {subtitle ? `Subtitle: ${subtitle.name}` : "Upload Subtitle/Captions (.vtt)"}
                            </p>
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
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={uploading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2"
                            >
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default UploadVideoModal;
