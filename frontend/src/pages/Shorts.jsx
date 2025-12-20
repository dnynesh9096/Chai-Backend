import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { FaThumbsUp, FaRegThumbsUp, FaComment, FaShare, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import CommentSection from '../components/CommentSection';

function Shorts() {
    const [shorts, setShorts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeVideoId, setActiveVideoId] = useState(null);
    const [isMuted, setIsMuted] = useState(true);

    // Interaction States
    const [showComments, setShowComments] = useState(false);
    const [commentsVideoId, setCommentsVideoId] = useState(null);

    const observer = useRef(null);

    useEffect(() => {
        const fetchShorts = async () => {
            try {
                const response = await api.get('/videos?isShorts=true');
                setShorts(response.data.data.docs);
                if (response.data.data.docs.length > 0) {
                    setActiveVideoId(response.data.data.docs[0]._id);
                }
            } catch (error) {
                console.error("Failed to load shorts", error);
            } finally {
                setLoading(false);
            }
        };

        fetchShorts();
    }, []);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.7
        };

        observer.current = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const videoId = entry.target.dataset.id;
                    setActiveVideoId(videoId);
                    const videoElement = entry.target.querySelector('video');
                    if (videoElement) {
                        videoElement.play().catch(e => console.log("Autoplay blocked", e));
                    }
                } else {
                    const videoElement = entry.target.querySelector('video');
                    if (videoElement) {
                        videoElement.pause();
                        videoElement.currentTime = 0;
                    }
                }
            });
        }, options);

        const videoCards = document.querySelectorAll('.video-card');
        videoCards.forEach(card => observer.current.observe(card));

        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, [shorts]);

    const toggleMute = () => {
        setIsMuted(prev => !prev);
    };

    const handleLike = async (video) => {
        try {
            const updatedShorts = shorts.map(s => {
                if (s._id === video._id) {
                    return {
                        ...s,
                        isLiked: !s.isLiked,
                        likesCount: s.isLiked ? s.likesCount - 1 : s.likesCount + 1
                    };
                }
                return s;
            });
            setShorts(updatedShorts);
            await api.post(`/likes/toggle/v/${video._id}`);
        } catch (error) {
            console.error("Like failed", error);
        }
    };

    const handleShare = (video) => {
        const url = `${window.location.origin}/video/${video._id}`;
        navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
    };

    const handleSubscribe = async (video) => {
        try {
            const updatedShorts = shorts.map(s => {
                if (s.owner._id === video.owner._id) {
                    return {
                        ...s,
                        isSubscribed: !s.isSubscribed
                    };
                }
                return s;
            });
            setShorts(updatedShorts);
            await api.post(`/subscriptions/c/${video.owner._id}`);
        } catch (error) {
            console.error("Subscription failed", error);
        }
    };

    if (loading) return <div className="text-white text-center mt-20">Loading Shorts...</div>;

    return (
        <div className="h-[calc(100vh-64px)] overflow-y-scroll snap-y snap-mandatory bg-black relative">
            {shorts.length === 0 ? (
                <div className="text-white text-center mt-20">No shorts found. Upload a video under 60s!</div>
            ) : (
                shorts.map((video) => (
                    <div
                        key={video._id}
                        data-id={video._id}
                        className="video-card h-full w-full flex justify-center snap-start relative"
                    >
                        {/* Video Container */}
                        <div className="relative h-full w-full md:w-[400px] bg-black">
                            <video
                                src={video.videoFile}
                                className="w-full h-full object-cover cursor-pointer"
                                loop
                                muted={isMuted}
                                playsInline
                                onClick={toggleMute}
                            />

                            {/* Mute Toggle (Top Right) */}
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                                className="absolute top-4 right-4 bg-black/40 p-2 rounded-full text-white hover:bg-black/60 transition backdrop-blur-sm z-10"
                            >
                                {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
                            </button>

                            {/* Right Sidebar Actions */}
                            <div className="absolute bottom-4 right-2 flex flex-col gap-6 items-center text-white z-20 pb-4">
                                {/* Like */}
                                <button
                                    onClick={() => handleLike(video)}
                                    className="flex flex-col items-center gap-1 group"
                                >
                                    <div className={`p-3 rounded-full transition transform group-active:scale-90 ${video.isLiked ? 'bg-blue-600 text-white' : 'bg-black/40 backdrop-blur-sm'}`}>
                                        <FaThumbsUp size={26} className={video.isLiked ? 'fill-current' : ''} />
                                    </div>
                                    <span className="text-xs font-semibold drop-shadow-md">{video.likesCount}</span>
                                </button>

                                {/* Comment */}
                                <button
                                    onClick={() => {
                                        setCommentsVideoId(video._id);
                                        setShowComments(true);
                                    }}
                                    className="flex flex-col items-center gap-1 group"
                                >
                                    <div className="p-3 bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/60 transition">
                                        <FaComment size={26} />
                                    </div>
                                    <span className="text-xs font-semibold drop-shadow-md">Comment</span>
                                </button>

                                {/* Share */}
                                <button
                                    onClick={() => handleShare(video)}
                                    className="flex flex-col items-center gap-1 group"
                                >
                                    <div className="p-3 bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/60 transition">
                                        <FaShare size={26} />
                                    </div>
                                    <span className="text-xs font-semibold drop-shadow-md">Share</span>
                                </button>

                                {/* Owner Avatar (Small, floating) */}
                                <div className="mt-2 w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-800">
                                    <img src={video.owner?.avatar} className="w-full h-full object-cover" />
                                </div>
                            </div>

                            {/* Bottom Info Overlay */}
                            <div className="absolute bottom-0 left-0 w-[calc(100%-60px)] p-4 text-white z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent pt-20">
                                {/* User Info Row */}
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="font-bold text-base drop-shadow-lg cursor-pointer hover:underline">
                                        @{video.owner?.username || "User"}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSubscribe(video);
                                        }}
                                        className={`text-xs font-bold px-4 py-1.5 rounded-full transition ${video.isSubscribed
                                                ? 'bg-gray-700 text-white hover:bg-gray-600'
                                                : 'bg-red-600 text-white hover:bg-red-700'
                                            }`}
                                    >
                                        {video.isSubscribed ? "Subscribed" : "Subscribe"}
                                    </button>
                                </div>

                                {/* Caption/Title */}
                                <p className="text-sm font-medium drop-shadow-lg line-clamp-2 pr-4 mb-2">
                                    {video.title} <span className="text-gray-300 font-normal ml-2 list-none">
                                        {video.description && video.description.slice(0, 30)}...
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                ))
            )}

            {/* Comments Drawer */}
            {showComments && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowComments(false)}
                    ></div>
                    <div className="relative w-full max-w-md h-full bg-[#0f0f0f] border-l border-gray-800 shadow-2xl animate-in slide-in-from-right duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#0f0f0f] z-10">
                            <h3 className="font-bold text-white">Comments</h3>
                            <button onClick={() => setShowComments(false)} className="p-2 hover:bg-gray-800 rounded-full text-white">✕</button>
                        </div>
                        <div className="h-full overflow-y-auto pb-20 pt-2">
                            {commentsVideoId && <CommentSection videoId={commentsVideoId} />}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Shorts;
