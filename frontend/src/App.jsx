import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VideoDetail from './pages/VideoDetail';
import Dashboard from './pages/Dashboard';
import LikedVideos from './pages/LikedVideos';
import Subscriptions from './pages/Subscriptions';
import Tweets from './pages/Tweets';
import Playlists from './pages/Playlists';
import Settings from './pages/Settings';
import History from './pages/History';
import Shorts from './pages/Shorts';
import Channel from './pages/Channel';
import api from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await api.get('/users/current-user');
        if (response.data && response.data.data) {
          setUser(response.data.data);
        }
      } catch (error) {
        console.log("Not logged in");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/users/logout');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login setUser={setUser} />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<Layout user={user} onLogout={handleLogout} />}>
        <Route index element={<Home />} />
        <Route path="/shorts" element={<Shorts />} />
        <Route path="/c/:username" element={<Channel user={user} setUser={setUser} />} />
        <Route path="/video/:videoId" element={<VideoDetail user={user} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/liked-videos" element={<LikedVideos />} />
        <Route path="/subscriptions" element={<Subscriptions user={user} />} />
        <Route path="/tweets" element={<Tweets user={user} />} />
        <Route path="/playlists" element={<Playlists user={user} />} />
        <Route path="/history" element={<History user={user} />} />
        <Route path="/settings" element={<Settings user={user} setUser={setUser} />} />
        {/* Add more protected routes here later */}
      </Route>
    </Routes>
  );
}

export default App;
