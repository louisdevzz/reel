import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightFromLine } from "lucide-react";
import { StreamPlayer } from "../../components/StreamPlayer";
import { ChatSection } from "../../components/ChatSection";
import { streamKeyService } from "../../lib/streamService";
import { apiService, User } from "../../lib/apiService";
import { useUser } from "../../contexts/userContext";
import type { StreamKey } from "../../lib/apiService";
import { TipModal } from "../../components/TipModal";

export const Route = createFileRoute('/live/$username')({
    component: LiveDetailsPage,
})

function LiveDetailsPage() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [streamKey, setStreamKey] = useState<string | null>(null);
    const [streamKeyData, setStreamKeyData] = useState<StreamKey | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<any | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isCheckingFollow, setIsCheckingFollow] = useState(false);
    const [isTipModalOpen, setIsTipModalOpen] = useState(false);
    const { username } = Route.useParams();
    const { currentUser } = useUser();

    // Update document title when user data is loaded
    useEffect(() => {
        if (user) {
            document.title = `${user.username} - Reel`;
        } else if (username) {
            document.title = `${username} - Reel`;
        }
        
        // Reset title when component unmounts
        return () => {
            document.title = "Reel – A Decentralized SocialFi Platform for Video and Livestreaming";
        };
    }, [user, username]);

    // Check if current user is following the streamer
    useEffect(() => {
        const checkFollowStatus = async () => {
            if (!currentUser || !user) {
                setIsFollowing(false);
                return;
            }

            // Don't check if user is trying to follow themselves
            if (currentUser.id === user.id) {
                setIsFollowing(false);
                return;
            }

            setIsCheckingFollow(true);
            try {
                const following = await apiService.isFollowing(currentUser.id, user.id);
                setIsFollowing(following);
            } catch (error) {
                console.error('Error checking follow status:', error);
                setIsFollowing(false);
            } finally {
                setIsCheckingFollow(false);
            }
        };

        checkFollowStatus();
    }, [currentUser, user]);

    // Handle follow/unfollow action
    const handleFollowAction = async () => {
        if (!currentUser || !user || currentUser.id === user.id) return;

        try {
            if (isFollowing) {
                await apiService.unfollowUser(currentUser.id, user.id);
                setIsFollowing(false);
            } else {
                await apiService.followUser(currentUser.id, user.id);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error('Error handling follow action:', error);
        }
    };

    useEffect(() => {
        const fetchStreamKey = async () => {
            try {
                setIsLoading(true);
                const key = await streamKeyService.getStreamKeyByUsername(username);
                if (key?.key) {
                    setStreamKey(key.key);
                    // Convert createdAt/lastUsed to strings for apiService type compatibility
                    setStreamKeyData({
                        ...key,
                        createdAt: key.createdAt instanceof Date ? key.createdAt.toISOString() : key.createdAt,
                        lastUsed: key.lastUsed instanceof Date ? key.lastUsed.toISOString() : key.lastUsed,
                    });
                    // If we have a stream key, fetch the live session
                    const liveSession = await apiService.getLiveSessionByStreamKey(key.key);
                    setSession(liveSession?.stream_sessions);
                } else {
                    setStreamKey(null);
                    setStreamKeyData(null);
                }
            } catch (error) {
                console.error('Error fetching stream key:', error);
                setStreamKey(null);
                setStreamKeyData(null);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchUserData = async () => {
            try {
                const userData = await apiService.getUserByUsername(username);
                if (userData) {
                    setUser(userData);
                } else {
                    console.error('User not found');
                }
            } catch (err) {
                console.error('Failed to load user data');
                console.error('Error fetching user:', err);
            }
        };

        if (username) {
            fetchStreamKey();
            fetchUserData();
        }
    }, [username]);

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    if (isLoading) {
        return (
            <div className="relative flex h-screen overflow-hidden bg-[#18181b] text-white">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9147ff] mx-auto mb-4"></div>
                        <div className="text-gray-400">Loading stream...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!streamKey) {
        return (
            <div className="relative flex h-screen overflow-hidden bg-[#18181b] text-white">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-4xl mb-4">📺</div>
                        <div className="text-gray-400">No stream key found for this user</div>
                        <div className="text-sm text-gray-500 mt-2">The user may not have created a stream key yet</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="relative flex h-screen overflow-hidden bg-[#18181b] text-white">
            <div className={`flex-1 ${isSidebarExpanded ? 'mr-[400px]' : 'mr-0'} h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300`}>
                <div className="flex flex-col flex-1">
                    {/* <div className="relative bg-black overflow-hidden aspect-video w-full">
                        <label className="w-full h-full flex items-center justify-center text-3xl text-gray-400">[Stream Video]</label>
                        <span className="absolute top-4 left-4 bg-red-600 text-xs font-bold px-3 py-1 rounded-full">LIVE</span>
                        <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>43,778 viewers
                        </div>
                    </div> */}
                    <StreamPlayer 
                        streamKey={streamKey}
                        playbackUrl={streamKeyData?.playbackUrl}
                        streamId={streamKeyData?.livepeerStreamId}
                        playbackId={streamKeyData?.livepeerStreamId} // Use livepeerStreamId as playbackId
                    />
                    <div className="flex flex-col gap-4 px-6 pt-8 pb-4 bg-[#18181b]">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img
                                        src={user?.avatar}
                                        alt="Streamer"
                                        className="w-16 h-16 rounded-full border-2 border-[#9147ff]"
                                    />
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 text-[9px] font-bold px-2 py-0.5 rounded-full">LIVE</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Link to="/u/$username" params={{ username: user?.username || '' }}>
                                            <span className="font-bold text-lg hover:underline">{user?.username}</span>
                                        </Link>
                                        {/* <span className="bg-[#9147ff] text-xs px-2 py-0.5 rounded-full font-semibold">✔</span> */}
                                    </div>
                                    <div className="font-semibold text-2xl text-white">
                                        {session?.title || 'No title available'}
                                    </div>
                                    <div className="flex gap-2 mt-1">
                                        {user?.category && (
                                            <span className="bg-[#27272a] text-[#a78bfa] px-2 py-0.5 rounded text-xs font-semibold">{user.category}</span>
                                        )}
                                        {user?.subCategory && (
                                            <span className="bg-[#27272a] text-gray-300 px-2 py-0.5 rounded text-xs">{user.subCategory}</span>
                                        )}
                                        {user?.tags && user.tags.length > 0 && user.tags.slice(0, 2).map((tag, index) => (
                                            <span key={index} className="bg-[#27272a] text-gray-300 px-2 py-0.5 rounded text-xs">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-wrap items-center">
                                {/* Only show follow button if current user is not following and not viewing their own stream */}
                                {currentUser && currentUser.id !== user?.id && (
                                    <button 
                                        onClick={handleFollowAction}
                                        disabled={isCheckingFollow}
                                        className={`px-5 py-2 rounded-full font-bold text-white text-sm transition-colors ${
                                            isFollowing 
                                                ? 'bg-[#232327] hover:bg-[#18181b] border border-[#2f2f35]' 
                                                : 'bg-[#9147ff] hover:bg-[#772ce8]'
                                        } ${isCheckingFollow ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isCheckingFollow ? '...' : (isFollowing ? 'Following' : 'Follow')}
                                    </button>
                                )}
                                {/* Only show tip button if current user is not viewing their own stream */}
                                {currentUser && currentUser.username !== username && (
                                    <button 
                                        className="bg-[#232327] hover:bg-[#18181b] px-5 py-2 rounded-full font-bold text-white text-sm border border-[#2f2f35]"
                                        onClick={() => setIsTipModalOpen(true)}
                                    >
                                        Tip Now
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="font-semibold text-lg text-white">
                            {session?.description || 'No description available'}
                        </div>
                    </div>
                    <div className="px-6 pb-6">
                        <div className="mt-6 bg-[#232327] rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-lg">About {user?.fullName}</span>
                                <span className="bg-[#9147ff] text-xs px-2 py-0.5 rounded-full font-semibold">✔</span>
                            </div>
                            <div className="text-gray-400 text-sm mb-2">
                                <span className="font-bold text-white">{user?.followers} followers</span>
                            </div>
                            <div className="text-gray-300 mb-3">
                                {user?.description || 'No description available'}
                            </div>
                            <div className="flex gap-4 text-gray-400">
                                {user?.social?.youtube && (
                                    <a href={user.social.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white">
                                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M10 15l5.19-3L10 9v6zm12-3c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10 10-4.48 10-10zm-2 0c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8 8 3.58 8 8z"/></svg>
                                        YouTube
                                    </a>
                                )}
                                {user?.social?.twitter && (
                                    <a href={user.social.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white">
                                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.59-2.47.7a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.64-.58 1.38-.58 2.17 0 1.5.76 2.82 1.92 3.6a4.28 4.28 0 0 1-1.94-.54v.05c0 2.1 1.5 3.85 3.5 4.25-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.1 2.94 3.95 2.97A8.6 8.6 0 0 1 2 19.54a12.13 12.13 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.37-.01-.56A8.7 8.7 0 0 0 24 4.59a8.5 8.5 0 0 1-2.54.7z"/></svg>
                                        Twitter
                                    </a>
                                )}
                                {user?.social?.instagram && (
                                    <a href={user.social.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white">
                                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm6.25.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0z"/></svg>
                                        Instagram
                                    </a>
                                )}
                                {user?.social?.twitch && (
                                    <a href={user.social.twitch} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white">
                                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>
                                        Twitch
                                    </a>
                                )}
                                {user?.social?.tiktok && (
                                    <a href={user.social.tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white">
                                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                                        TikTok
                                    </a>
                                )}
                                {user?.social?.discord && (
                                    <a href={user.social.discord} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white">
                                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/></svg>
                                        Discord
                                    </a>
                                )}
                                {user?.social?.website && (
                                    <a href={user.social.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white">
                                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                                        Website
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            
            <button
                onClick={toggleSidebar}
                className={`fixed right-0 top-1/2 transform -translate-y-1/2 z-50 bg-[#232327] border border-[#2f2f35] border-r-0 rounded-l-lg p-2 hover:bg-[#2f2f35] transition-all duration-300 ${isSidebarExpanded ? 'right-[400px]' : 'right-0'}`}
            >
                <ArrowRightFromLine 
                    className={`w-4 h-4 text-white transition-transform duration-300 ${!isSidebarExpanded ? 'rotate-180' : ''}`} 
                />
            </button>

            {/* Chat Sidebar */}
            <div className={`fixed right-0 top-16 h-[calc(100vh-4rem)] transition-all duration-300 ${isSidebarExpanded ? 'w-[400px] min-w-[320px] max-w-[420px]' : 'w-0 overflow-hidden'}`}>
                {streamKey && (
                    <ChatSection 
                        streamKey={streamKey}
                    />
                )}
            </div>
            
        </div>
        <TipModal 
          open={isTipModalOpen} 
          onOpenChange={setIsTipModalOpen}
          receiverId={user?.id}
          receiverAddress={user?.aptosAddress}
          receiverName={user?.username}
          tipType="stream"
          contentId={session?.stream_sessions?.id || session?.id}
          streamKey={streamKey}
        />
        </>
    );
}