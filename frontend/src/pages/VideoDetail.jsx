import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaThumbsUp, FaRegThumbsUp, FaThumbsDown, FaRegThumbsDown, FaTrash, FaDownload, FaShare, FaBookmark, FaRegBookmark, FaEllipsisH } from 'react-icons/fa';
import CommentSection from '../components/CommentSection';

function VideoDetail({ user }) {
    const { videoId } = useParams();
    const navigate = useNavigate();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscribersCount, setSubscribersCount] = useState(0);
    const [recommendations, setRecommendations] = useState([]);
    const [isDisliked, setIsDisliked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const response = await api.get(`/videos/${videoId}`);
                const videoData = response.data.data;
                setVideo(videoData);
                setIsLiked(videoData.isLiked);
                setLikesCount(videoData.likesCount);
                setIsSubscribed(videoData.isSubscribed);
                setSubscribersCount(videoData.owner?.subscribersCount || 0);
                setIsDisliked(videoData.isDisliked);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load video");
            } finally {
                setLoading(false);
            }
        };
        fetchVideo();

        // Fetch recommendations (random videos for now)
        api.get('/videos')
            .then(res => setRecommendations(res.data.data.docs || []))
            .catch(err => console.error("Failed to load recommendations", err));
    }, [videoId]);

    const handleLike = async () => {
        if (!user) return alert("Please login to like");

        // Optimistic UI Update
        const wasLiked = isLiked;
        const wasDisliked = isDisliked;

        setIsLiked(!wasLiked);
        setLikesCount((prev) => !wasLiked ? prev + 1 : prev - 1);

        // If it was disliked, remove the dislike status (Mutual Exclusivity)
        if (wasDisliked) {
            setIsDisliked(false);
        }

        try {
            await api.post(`/likes/toggle/v/${videoId}`);
        } catch (error) {
            // Revert on error
            setIsLiked(wasLiked);
            setLikesCount((prev) => wasLiked ? prev + 1 : prev - 1);
            if (wasDisliked) setIsDisliked(true);
            console.error("Failed to toggle like", error);
        }
    };

    const handleDislike = async () => {
        if (!user) return alert("Please login to dislike");

        // Optimistic UI Update
        const wasLiked = isLiked;
        const wasDisliked = isDisliked;

        setIsDisliked(!wasDisliked);

        // If it was liked, remove the like status (Mutual Exclusivity)
        if (wasLiked) {
            setIsLiked(false);
            setLikesCount((prev) => prev - 1);
        }

        try {
            await api.post(`/likes/toggle/d/v/${videoId}`);
        } catch (error) {
            // Revert on error
            setIsDisliked(wasDisliked);
            if (wasLiked) {
                setIsLiked(true);
                setLikesCount((prev) => prev + 1);
            }
            console.error("Failed to toggle dislike", error);
        }
    };

    const handleSubscribe = async () => {
        if (!user) return alert("Please login to subscribe");
        if (user._id === video.owner?._id) return alert("You cannot subscribe to your own channel");

        setIsSubscribed((prev) => !prev);
        setSubscribersCount((prev) => isSubscribed ? prev - 1 : prev + 1);

        try {
            await api.post(`/subscriptions/c/${video.owner?._id}`);
        } catch (error) {
            setIsSubscribed((prev) => !prev); // Revert
            setSubscribersCount((prev) => isSubscribed ? prev + 1 : prev - 1);
            console.error("Failed to toggle subscribe", error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this video?")) return;
        try {
            await api.delete(`/videos/${videoId}`);
            navigate('/');
        } catch (error) {
            console.error("Failed to delete video", error);
            alert("Failed to delete video");
        }
    };

    const handleDownload = () => {
        if (!video?.videoFile) return;

        let downloadUrl = video.videoFile;
        // Attempt to force download for Cloudinary URLs
        if (downloadUrl.includes("cloudinary.com") && downloadUrl.includes("/upload/")) {
            downloadUrl = downloadUrl.replace("/upload/", "/upload/fl_attachment/");
        }

        window.open(downloadUrl, "_blank");
    };

    if (loading) return <div className="text-white text-center mt-10">Loading video...</div>;
    if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;
    if (!video) return <div className="text-white text-center mt-10">Video not found</div>;

    return (
        <div className="flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto p-4 lg:p-0">
            {/* Main Content */}
            <div className="flex-1">
                <div className="relative pt-[56.25%] bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800">
                    <video
                        src={video.videoFile}
                        poster={video.thumbnail}
                        controls
                        autoPlay
                        className="absolute top-0 left-0 w-full h-full"
                    >
                        {video.subtitle && (
                            <track
                                kind="subtitles"
                                src={video.subtitle}
                                srcLang="en"
                                label="English"
                                default
                            />
                        )}
                    </video>
                </div>

                <h1 className="text-xl font-bold text-white mt-4 mb-2">{video.title}</h1>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-800">

                    {/* Channel Info & Subscribe */}
                    <div className="flex items-center gap-4 min-w-fit">
                        <Link to={`/c/${video.owner?._id}`} className="shrink-0">
                            <img src={video.owner?.avatar} alt={video.owner?.username} className="w-10 h-10 rounded-full object-cover" />
                        </Link>
                        <div className="flex flex-col">
                            <h3 className="font-semibold text-white text-base leading-tight">{video.owner?.fullName}</h3>
                            <p className="text-xs text-gray-400">{subscribersCount} subscribers</p>
                        </div>
                        <button
                            onClick={handleSubscribe}
                            className={`ml-2 px-4 py-2 rounded-full text-sm font-semibold transition ${isSubscribed
                                ? "bg-[#272727] text-white hover:bg-[#3f3f3f]"
                                : "bg-white text-black hover:bg-gray-200"
                                }`}
                        >
                            {isSubscribed ? "Subscribed" : "Subscribe"}
                        </button>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">

                        {/* Like & Dislike Group */}
                        <div className="flex items-center bg-[#272727] rounded-full overflow-hidden shrink-0">
                            <button
                                onClick={handleLike}
                                className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 hover:bg-[#3f3f3f] transition text-white border-r border-[#3f3f3f]"
                            >
                                {isLiked ? <FaThumbsUp /> : <FaRegThumbsUp />}
                                <span className="text-xs md:text-sm font-semibold">{likesCount}</span>
                            </button>
                            <button
                                onClick={handleDislike}
                                className="px-3 py-1.5 md:px-4 md:py-2 hover:bg-[#3f3f3f] transition text-white flex items-center"
                                title="Dislike"
                            >
                                {isDisliked ? <FaThumbsDown /> : <FaRegThumbsDown />}
                            </button>
                        </div>

                        {/* Share */}
                        <button
                            className="flex items-center gap-1.5 bg-[#272727] hover:bg-[#3f3f3f] px-3 py-1.5 md:px-4 md:py-2 rounded-full transition text-white shrink-0"
                            title="Share"
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert("Link copied to clipboard!");
                            }}
                        >
                            <FaShare /> <span className="text-xs md:text-sm font-semibold">Share</span>
                        </button>

                        {/* Download */}
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-1.5 bg-[#272727] hover:bg-[#3f3f3f] px-3 py-1.5 md:px-4 md:py-2 rounded-full transition text-white shrink-0"
                        >
                            <FaDownload /> <span className="text-xs md:text-sm font-semibold">Download</span>
                        </button>

                        {/* Save */}
                        <button
                            onClick={() => {
                                setIsSaved(!isSaved);
                                if (!isSaved) alert("Saved to playlist!");
                            }}
                            className="flex items-center gap-1.5 bg-[#272727] hover:bg-[#3f3f3f] px-3 py-1.5 md:px-4 md:py-2 rounded-full transition text-white shrink-0"
                            title="Save"
                        >
                            {isSaved ? <FaBookmark /> : <FaRegBookmark />} <span className="text-xs md:text-sm font-semibold">Save</span>
                        </button>


                        {/* Owner Delete Button */}
                        {user && video.owner && user._id === video.owner._id && (
                            <button
                                onClick={handleDelete}
                                className="bg-[#272727] hover:bg-red-900/50 text-gray-200 hover:text-red-500 p-2 md:p-2.5 rounded-full transition shrink-0"
                                title="Delete Video"
                            >
                                <FaTrash />
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-4 bg-[#1e1e1e] p-4 rounded-xl text-sm whitespace-pre-wrap text-gray-300">
                    <p className="font-semibold text-white mb-2">{video.views} views • {new Date(video.createdAt).toDateString()}</p>
                    {video.description}
                </div>

                <CommentSection videoId={videoId} user={user} />
            </div>

            {/* Sidebar (Recommendations) */}
            <div className="lg:w-[400px]">
                <h3 className="text-xl font-bold mb-4 text-white">Up Next</h3>
                <div className="flex flex-col gap-3">
                    {recommendations
                        .filter(v => v._id !== video._id)
                        .map(recVideo => (
                            <Link to={`/video/${recVideo._id}`} key={recVideo._id} className="flex gap-2 cursor-pointer hover:bg-[#1e1e1e] p-2 rounded-lg transition">
                                <div className="w-40 h-24 bg-gray-800 rounded-lg overflow-hidden shrink-0 relative">
                                    <img src={recVideo.thumbnail} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-white line-clamp-2 text-sm leading-tight mb-1">{recVideo.title}</h4>
                                    <p className="text-gray-400 text-xs">{recVideo.owner?.fullName || recVideo.owner?.username}</p>
                                    <p className="text-gray-400 text-xs mt-0.5">
                                        {recVideo.views} views • {new Date(recVideo.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </Link>
                        ))}
                </div>
            </div>
        </div>
    );
}

export default VideoDetail;
