import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaCloudUploadAlt, FaUserPlus } from 'react-icons/fa';

function Register() {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
    });
    const [avatar, setAvatar] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (type === 'avatar') setAvatar(file);
        if (type === 'coverImage') setCoverImage(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const data = new FormData();
        data.append('fullName', formData.fullName);
        data.append('username', formData.username);
        data.append('email', formData.email);
        data.append('password', formData.password);
        if (avatar) data.append('avatar', avatar);
        if (coverImage) data.append('coverImage', coverImage);

        try {
            await api.post('/users/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0f0f0f]">
            {/* Background Accents */}
            <div className="absolute top-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]" />

            <div className="glass-card p-10 rounded-2xl w-full max-w-2xl relative z-10 animate-fade-in">
                <div className="flex justify-center mb-8">
                    <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
                        <FaUserPlus className="text-2xl text-white" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-white mb-2 text-center">Create Account</h2>
                <p className="text-gray-400 text-center mb-8 text-sm">Join the community and start creating</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl mb-6 text-center text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                                placeholder="Full Name"
                                required
                            />
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                                placeholder="Username"
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                                placeholder="Email Address"
                                required
                            />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                                placeholder="Password"
                                required
                            />
                        </div>

                        <div className="space-y-4">
                            {/* Avatar Upload */}
                            <div className="relative border-2 border-dashed border-[#333] hover:border-blue-500 rounded-xl p-4 h-[140px] flex flex-col items-center justify-center text-center transition-all group cursor-pointer bg-[#1a1a1a]">
                                <input type="file" onChange={(e) => handleFileChange(e, 'avatar')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" required />
                                <div className="p-3 bg-blue-500/10 rounded-full mb-2 group-hover:bg-blue-500/20 transition-colors">
                                    <FaCloudUploadAlt className="text-xl text-blue-400 group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                                    {avatar ? avatar.name : 'Upload Avatar *'}
                                </span>
                                <span className="text-xs text-gray-500 mt-1">Click to browse</span>
                            </div>

                            {/* Cover Image Upload */}
                            <div className="relative border-2 border-dashed border-[#333] hover:border-purple-500 rounded-xl p-4 h-[140px] flex flex-col items-center justify-center text-center transition-all group cursor-pointer bg-[#1a1a1a]">
                                <input type="file" onChange={(e) => handleFileChange(e, 'coverImage')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                <div className="p-3 bg-purple-500/10 rounded-full mb-2 group-hover:bg-purple-500/20 transition-colors">
                                    <FaCloudUploadAlt className="text-xl text-purple-400 group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                                    {coverImage ? coverImage.name : 'Upload Cover Image'}
                                </span>
                                <span className="text-xs text-gray-500 mt-1">Optional</span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300 transform active:scale-[0.99] mt-6 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Creating Account...</span>
                            </div>
                        ) : 'Create Account'}
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-400 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors">
                        Log in here
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
