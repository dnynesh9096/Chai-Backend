import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FaPlay, FaPlus, FaTrash } from 'react-icons/fa';

function Playlists({ user }) {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [showCreate, setShowCreate] = useState(false);

    useEffect(() => {
        if (user) {
            fetchPlaylists();
        }
    }, [user]);

    const fetchPlaylists = async () => {
        try {
            const res = await api.get(`/playlist/user/${user._id}`);
            setPlaylists(res.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch playlists", error);
            setLoading(false);
        }
    };

    const handleCreatePlaylist = async (e) => {
        e.preventDefault();
        if (!newPlaylistName.trim()) return;

        try {
            await api.post('/playlist', { name: newPlaylistName, description: 'Created via web' });
            setNewPlaylistName('');
            setShowCreate(false);
            fetchPlaylists();
        } catch (error) {
            console.error("Failed to create playlist", error);
        }
    };

    const handleDeletePlaylist = async (id) => {
        if (!window.confirm("Delete this playlist?")) return;
        try {
            await api.delete(`/playlist/${id}`);
            setPlaylists(playlists.filter(p => p._id !== id));
        } catch (error) {
            console.error("Failed to delete playlist", error);
        }
    };

    if (!user) return <div className="text-center mt-20 text-gray-400">Please log in to manage playlists.</div>;

    return (
        <div className="max-w-[1600px] mx-auto p-4 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="text-purple-500">☰</span> My Playlists
                </h1>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                >
                    <FaPlus /> Create New
                </button>
            </div>

            {showCreate && (
                <div className="glass-card p-6 rounded-xl mb-8 animate-fade-in max-w-md mx-auto">
                    <h3 className="text-lg font-bold text-white mb-4">Create Playlist</h3>
                    <form onSubmit={handleCreatePlaylist} className="flex gap-4">
                        <input
                            type="text"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            placeholder="Playlist Name"
                            className="flex-1 bg-[#121212] border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                        />
                        <button type="submit" className="bg-purple-600 text-white px-6 rounded-lg font-bold">Save</button>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="text-center text-white">Loading playlists...</div>
            ) : playlists.length === 0 ? (
                <div className="text-center text-gray-400 py-10">
                    No playlists found. Create one to organize your videos!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {playlists.map((playlist) => (
                        <div key={playlist._id} className="glass-card rounded-xl overflow-hidden group hover:bg-white/5 transition relative">
                            <div className="aspect-video bg-[#222] flex items-center justify-center relative">
                                <span className="text-4xl text-gray-600">☰</span>
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                    <button className="text-white bg-purple-600 p-3 rounded-full hover:scale-110 transition">
                                        <FaPlay />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-white line-clamp-1">{playlist.name}</h3>
                                        <p className="text-xs text-gray-400 mt-1">{playlist.description}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeletePlaylist(playlist._id)}
                                        className="text-gray-500 hover:text-red-500 p-1"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-3 font-medium">
                                    Updated {new Date(playlist.updatedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Playlists;
