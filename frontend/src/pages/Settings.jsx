import React, { useState } from 'react';
import api from '../services/api';
import { FaUserEdit, FaLock, FaCamera, FaSave } from 'react-icons/fa';

function Settings({ user, setUser }) {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile State
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar);
    const [coverPreview, setCoverPreview] = useState(user?.coverImage);

    // Password State
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleProfileChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'avatar') {
                setAvatarFile(file);
                setAvatarPreview(URL.createObjectURL(file));
            } else {
                setCoverFile(file);
                setCoverPreview(URL.createObjectURL(file));
            }
        }
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // 1. Update text details
            const res = await api.patch('/users/update-account', formData);
            let updatedUser = res.data.data;

            // 2. Update Avatar if selected
            if (avatarFile) {
                const avatarFormData = new FormData();
                avatarFormData.append('avatar', avatarFile);
                const avatarRes = await api.patch('/users/avatar', avatarFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                updatedUser = { ...updatedUser, avatar: avatarRes.data.data.avatar };
            }

            // 3. Update Cover if selected
            if (coverFile) {
                const coverFormData = new FormData();
                coverFormData.append('coverImage', coverFile);
                const coverRes = await api.patch('/users/cover-image', coverFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                updatedUser = { ...updatedUser, coverImage: coverRes.data.data.coverImage };
            }

            setUser(updatedUser);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return setMessage({ type: 'error', text: 'New passwords do not match' });
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await api.post('/users/change-password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 text-white min-h-screen">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <FaUserEdit /> Settings
            </h1>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-700 mb-8">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`pb-4 px-4 font-medium transition-colors relative ${activeTab === 'profile' ? 'text-blue-500' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Edit Profile
                    {activeTab === 'profile' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`pb-4 px-4 font-medium transition-colors relative ${activeTab === 'security' ? 'text-blue-500' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Change Password
                    {activeTab === 'security' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>}
                </button>
            </div>

            {/* Status Message */}
            {message.text && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <form onSubmit={updateProfile} className="space-y-8 animate-fadeIn">
                    {/* Images Section */}
                    <div className="relative mb-12">
                        {/* Cover Image */}
                        <div className="h-40 md:h-52 bg-gray-800 rounded-xl overflow-hidden relative group">
                            {coverPreview && (
                                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                            )}
                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <FaCamera className="text-3xl text-white" />
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
                            </label>
                        </div>

                        {/* Avatar */}
                        <div className="absolute -bottom-10 left-8">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#0f0f0f] bg-gray-700 overflow-hidden relative group">
                                <img src={avatarPreview || user?.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                                    <FaCamera className="text-2xl text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Text Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                        <div>
                            <label className="block text-gray-400 text-sm font-medium mb-2">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleProfileChange}
                                className="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-medium mb-2">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleProfileChange}
                                className="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : <><FaSave /> Save Changes</>}
                        </button>
                    </div>
                </form>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <form onSubmit={changePassword} className="max-w-xl mx-auto space-y-6 pt-4 animate-fadeIn">
                    <div className="flex flex-col gap-1 items-center mb-6 text-gray-400">
                        <FaLock className="text-5xl mb-2 text-gray-600" />
                        <p>Ensure your account is using a long, random password to stay secure.</p>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2">Old Password</label>
                        <input
                            type="password"
                            value={passwordData.oldPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                            className="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2">New Password</label>
                        <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2">Confirm New Password</label>
                        <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default Settings;
