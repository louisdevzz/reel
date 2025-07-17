import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FaTwitch, FaTwitter, FaTiktok, FaYoutube, FaCheckCircle, FaEnvelope, FaGlobe, FaUserFriends, FaPlay, FaChartLine } from "react-icons/fa";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Info, User2, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { apiService, User } from "../../lib/apiService";
import { VideoThumbnail } from "../../components/VideoThumbnail";
import { SocialMediaService, formatFollowerCount } from "../../lib/socialMediaService";
import { useUser } from "../../contexts/userContext";
import { CustomProfileDialog } from "../../components/CustomProfileDialog";
import { relayerService } from "../../lib/relayerService";

export const Route = createFileRoute('/u/$username')({
    component: ProfilePage,
})

function ProfilePage() {
    const { username } = Route.useParams();
    const navigate = useNavigate();
    const { currentUser } = useUser();
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [videos, setVideos] = useState<any[]>([]);
    const [shorts, setShorts] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [videosLoading, setVideosLoading] = useState(true);
    const [shortsLoading, setShortsLoading] = useState(true);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [socialStats, setSocialStats] = useState<any>({});
    const [socialStatsLoading, setSocialStatsLoading] = useState(true);
    const [showCustomProfileDialog, setShowCustomProfileDialog] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);

    // Check if current user is viewing their own profile
    const isOwnProfile = currentUser && user && currentUser.username === user.username;

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

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            setError(null);
            try {
                const userData = await apiService.getUserByUsername(username);
                if (userData) {
                    setUser(userData);
                } else {
                    navigate({ to: '/' });
                }
            } catch (err) {
                setError('Failed to load user data');
                console.error('Error fetching user:', err);
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchUserData();
        }
    }, [username]);

    // Fetch user's videos and shorts
    useEffect(() => {
        const fetchUserContent = async () => {
            if (!user) return;
            
            try {
                setVideosLoading(true);
                setShortsLoading(true);
                
                const [videosData, shortsData] = await Promise.all([
                    apiService.getVideosByUser(user.id),
                    apiService.getShortsByUser(user.id)
                ]);
                
                setVideos(videosData);
                setShorts(shortsData);
            } catch (err) {
                console.error('Error fetching user content:', err);
            } finally {
                setVideosLoading(false);
                setShortsLoading(false);
            }
        };

        fetchUserContent();
    }, [user]);

    // Fetch user analytics
    useEffect(() => {
        const fetchUserAnalytics = async () => {
            if (!user) return;
            
            try {
                setAnalyticsLoading(true);
                const analyticsData = await apiService.getUserAnalytics(user.id);
                setAnalytics(analyticsData);
            } catch (err) {
                console.error('Error fetching user analytics:', err);
            } finally {
                setAnalyticsLoading(false);
            }
        };

        fetchUserAnalytics();
    }, [user]);

    // Fetch social media stats
    useEffect(() => {
        const fetchSocialMediaStats = async () => {
            if (!user) return;
            
            try {
                setSocialStatsLoading(true);
                
                const realStats = await SocialMediaService.getAllSocialMediaStats(
                    {
                        youtube: user.social?.youtube,
                        // twitter: user.social?.twitter,
                        // tiktok: user.social?.tiktok,
                        // twitch: user.social?.twitch
                    },
                    {
                        youtubeApiKey: process.env.PUBLIC_YOUTUBE_API_KEY,
                        // twitterBearerToken: process.env.PUBLIC_TWITTER_BEARER_TOKEN,
                        // tiktokRapidApiKey: process.env.PUBLIC_TIKTOK_RAPID_API_KEY,
                        // twitchClientId: process.env.PUBLIC_TWITCH_CLIENT_ID,
                        // twitchOAuthToken: process.env.PUBLIC_TWITCH_OAUTH_TOKEN
                    }
                );

                const statsMap: any = {};
                realStats.forEach(stat => {
                    statsMap[stat.platform] = stat;
                });
                setSocialStats(statsMap);
                
                
            } catch (err) {
                console.error('Error fetching social media stats:', err);
            } finally {
                setSocialStatsLoading(false);
            }
        };

        fetchSocialMediaStats();
    }, [user]);

    // Check follow status when user data is loaded
    useEffect(() => {
        const checkFollowStatus = async () => {
            if (!currentUser?.id || !user?.id || currentUser.id === user.id) {
                setIsFollowing(false);
                return;
            }
            
            try {
                const following = await apiService.isFollowing(currentUser.id, user.id);
                setIsFollowing(following);
            } catch (error) {
                console.error('Error checking follow status:', error);
                setIsFollowing(false);
            }
        };
        
        checkFollowStatus();
    }, [currentUser?.id, user?.id]);

    const handleFollow = async () => {
        if (!currentUser?.id || !user?.id || isFollowing) return;

        // Prevent self-following
        if (currentUser.id === user.id) {
            console.log('Cannot follow yourself');
            return;
        }

        const newFollowers = Number(user.followers) + 1;

        try {
            // Follow
            await apiService.followUser(currentUser.id, user.id);
            setIsFollowing(true);
            await relayerService.updateFollowers(user.aptosAddress, newFollowers);
            
            // Update local user state to reflect new follower count
            setUser(prev => prev ? { ...prev, followers: newFollowers } : null);
            
            console.log('Followed user:', user.username);
        } catch (error) {
            console.error('Error handling follow:', error);
            // You could add a toast notification here to show the error to the user
        }
    };

    const handleCopy = () => {
        if (user?.aptosAddress) {
            navigator.clipboard.writeText(user.aptosAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        }
    };

    if (loading) {
        return (
            <div className="bg-[#18181b] min-h-screen text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366f1] mx-auto mb-4"></div>
                    <p className="text-[#a1a1aa]">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="bg-[#18181b] min-h-screen text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
                    <p className="text-[#a1a1aa]">{error || `User @${username} does not exist`}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#18181b] min-h-screen text-white w-full">
            <div className="flex flex-col flex-1 h-[calc(100vh-4rem)] overflow-y-auto w-full">
                <div className="relative">
                    <img
                        src={user.banner || "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80"}
                        alt="Banner"
                        className="w-full h-48 object-cover"
                    />
                    <div className="flex items-center justify-between p-6 px-6 lg:px-12">
                        <div className="flex items-center flex-wrap">
                            <div className="relative">
                                <img
                                    src={user.avatar || "https://i.pravatar.cc/100?img=3"}
                                    alt="Avatar"
                                    className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-full border-2 border-white shadow-xl object-cover"
                                />
                            </div>
                            <div className="ml-4 lg:ml-6">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl lg:text-3xl font-bold text-white">{user.fullName}</h1>
                                    <FaCheckCircle className="text-[#6366f1] text-lg lg:text-xl" />
                                </div>
                                <div className="text-[#a1a1aa] text-base lg:text-lg">@{user.username}</div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="bg-[#6366f1] text-white px-2 py-1 rounded text-xs font-medium">{user.category}</span>
                                    <span className="bg-[#23243a] text-white px-2 py-1 rounded text-xs font-medium">{user.subCategory}</span>
                                </div>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {user.tags?.map((tag, index) => (
                                        <span key={index} className="bg-[#23243a] text-[#fff] px-3 py-1 rounded-full text-xs font-medium">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {isOwnProfile ? (
                            <div className="flex gap-2 lg:gap-4 flex-wrap">
                                <button 
                                    onClick={() => setShowCustomProfileDialog(true)}
                                    className="bg-[#232323] text-white font-bold px-3 lg:px-6 py-2 rounded-full text-sm lg:text-base hover:bg-[#333] transition-colors"
                                >
                                    Customize Profile
                                </button>
                                <button 
                                    onClick={()=>navigate({to:"/studio"})}
                                    className="bg-[#232323] text-white font-bold px-3 lg:px-6 py-2 rounded-full text-sm lg:text-base"
                                >
                                    Manage Videos
                                </button>
                            </div>
                        ):(
                            <button 
                                onClick={handleFollow}
                                className={`font-bold px-3 lg:px-6 py-2 rounded-full text-sm lg:text-base transition-colors ${
                                    isFollowing 
                                        ? 'bg-[#6366f1] text-white hover:bg-[#4f46e5]' 
                                        : 'bg-[#232323] text-white hover:bg-[#333]'
                                }`}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 px-6 lg:px-12">
                    <div className="flex gap-6 lg:gap-10 items-center justify-center lg:justify-start flex-wrap">
                        {user.social?.twitch && (
                            <Stat 
                                icon={<FaTwitch className="text-[#9147ff] text-xl lg:text-2xl" />} 
                                label="twitch" 
                                value={
                                    socialStatsLoading 
                                        ? "Loading..." 
                                        : socialStats.twitch 
                                            ? formatFollowerCount(socialStats.twitch.followers)
                                            : "Active"
                                } 
                            />
                        )}
                        {user.social?.twitter && (
                            <Stat 
                                icon={<FaTwitter className="text-[#1da1f2] text-xl lg:text-2xl" />} 
                                label="twitter" 
                                value={
                                    socialStatsLoading 
                                        ? "Loading..." 
                                        : socialStats.twitter 
                                            ? formatFollowerCount(socialStats.twitter.followers)
                                            : "Active"
                                } 
                            />
                        )}
                        {user.social?.tiktok && (
                            <Stat 
                                icon={<FaTiktok className="text-[#fff] text-xl lg:text-2xl" />} 
                                label="tik tok" 
                                value={
                                    socialStatsLoading 
                                        ? "Loading..." 
                                        : socialStats.tiktok 
                                            ? formatFollowerCount(socialStats.tiktok.followers)
                                            : "Active"
                                } 
                            />
                        )}
                        {user.social?.youtube && (
                            <Stat 
                                icon={<FaYoutube className="text-[#ff0000] text-xl lg:text-2xl" />} 
                                label="youtube" 
                                value={
                                    socialStatsLoading 
                                        ? "Loading..." 
                                        : socialStats.youtube 
                                            ? formatFollowerCount(socialStats.youtube.followers)
                                            : "Active"
                                } 
                            />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[#a1a1aa] text-xs font-semibold mb-1">ABOUT ME</div>
                        <div className="text-[#fff] text-sm flex flex-row gap-5">
                            {user.description.length > 150 ? user.description?.substring(0, 150) + '...' : user.description}
                            <span className="text-[#6366f1] cursor-pointer" onClick={() => setOpen(true)}>Show more</span>
                        </div>
                    </div>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="bg-[#18181b] text-white max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold mb-2">{user.fullName}</DialogTitle>
                        </DialogHeader>
                        <div className="mb-4 max-h-[70vh] overflow-y-auto pr-2">
                            <div className="text-lg font-semibold mb-1">Description</div>
                            <div className="text-white text-sm mb-2">{user.description}</div>
                            <div className="text-lg font-semibold mt-4 mb-2">Other Information</div>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-3">
                                    <User2 className="w-5 h-5" />
                                    <span className="bg-[#333] px-4 py-2 rounded-full font-bold select-all">{user.aptosAddress.substring(0, 7) + '...' + user.aptosAddress.substring(user.aptosAddress.length - 7)}</span>
                                    <button onClick={handleCopy} className="ml-1 p-1 rounded hover:bg-[#232323] transition-colors" title="Copy address">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    {copied && <span className="text-green-400 text-xs ml-2">Copied!</span>}
                                </li>
                                <li className="flex items-center gap-3">
                                    <FaEnvelope className="w-5 h-5" />
                                    <span>{user.email}</span>
                                </li>
                                {user.social?.youtube && (
                                    <li className="flex items-center gap-3">
                                        <FaGlobe className="w-5 h-5" />
                                        <a href={user.social.youtube} className="hover:underline" target="_blank" rel="noopener noreferrer">{user.social.youtube}</a>
                                    </li>
                                )}
                                {user.social?.twitter && (
                                    <li className="flex items-center gap-3">
                                        <FaGlobe className="w-5 h-5" />
                                        <a href={user.social.twitter} className="hover:underline" target="_blank" rel="noopener noreferrer">{user.social.twitter}</a>
                                    </li>
                                )}
                                <li className="flex items-center gap-3">
                                    <Info className="w-5 h-5" />
                                    <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <FaUserFriends className="w-5 h-5" />
                                    <span>{user.followers} followers</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <FaPlay className="w-5 h-5" />
                                    <span>{user.videos + user.shorts} videos</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <FaChartLine className="w-5 h-5" />
                                    <span>{user.views} views</span>
                                </li>
                            </ul>
                            <div className="flex gap-4 mt-6">
                                {user.social?.youtube && (
                                    <a href={user.social.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#333] px-4 py-2 rounded-full font-bold text-sm"><FaYoutube /> YouTube</a>
                                )}
                                {user.social?.twitter && (
                                    <a href={user.social.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#333] px-4 py-2 rounded-full font-bold text-sm"><FaTwitter /> Twitter</a>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
                
                <div className="px-6 lg:px-12 mt-10">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-6">
                        <span className="text-lg font-semibold text-white">Overall reach:</span>
                        <div className="flex gap-2 flex-wrap">
                            {['All', 'Twitch', 'Twitter', 'Tik Tok', 'YouTube'].map(tab => (
                                <button key={tab} className="px-3 py-1 rounded-full text-sm font-medium bg-[#23243a] text-[#a1a1aa] hover:bg-[#6366f1] hover:text-white transition-colors">{tab}</button>
                            ))}
                        </div>
                        <div className="lg:ml-auto">
                            <select className="bg-[#23243a] text-[#a1a1aa] px-3 py-1 rounded text-sm border border-[#27272a]">
                                <option>Last 14 days</option>
                                <option>Last 30 days</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        <AnalyticsCard 
                            title="INFLUENCER RANK" 
                            value={`${user.rank}th`} 
                            subtext="↑ 2 positions vs previous day" 
                        />
                        <AnalyticsCard 
                            title="TOTAL FOLLOWERS" 
                            value={user.followers.toLocaleString()} 
                            subtext="-2% vs previous day" 
                        />
                        <AnalyticsCard 
                            title="TOTAL VIEWS" 
                            value={analyticsLoading ? "Loading..." : (analytics?.totalViews || user.views).toLocaleString()} 
                            subtext="-" 
                        />
                        <AnalyticsCard 
                            title="ENGAGEMENT RATE" 
                            value={analyticsLoading ? "Loading..." : `${analytics?.engagementScore || 0}%`} 
                            subtext="-" 
                        />
                    </div>
                </div>

                <div className="px-6 lg:px-12 mt-10">
                    <div className="flex items-center mb-4 space-x-2">
                        <img src="/logo-light-rmbg.png" alt="Shorts" className="w-6 h-6" />
                        <span className="text-xl font-bold">Shorts</span>
                    </div>
                    {shortsLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366f1]"></div>
                        </div>
                    ) : shorts.length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {shorts.map((short) => (
                                <div key={short.id} className="w-[214px] h-[394px] bg-[#18181b] rounded-lg overflow-hidden shadow flex-shrink-0 flex flex-col">
                                    <div className="w-[210px] h-[315px] overflow-hidden">
                                        <VideoThumbnail
                                            videoUrl={short.videoUrl}
                                            title={short.title}
                                            duration={short.duration}
                                            className="w-full h-full"
                                            showDuration={true}
                                            fallbackThumbnail={short.thumbnail}
                                            videoId={short.id}
                                        />
                                    </div>
                                    <div className="p-2 flex-1 flex flex-col justify-between">
                                        <div className="font-semibold text-sm line-clamp-2">{short.description.length > 20 ? short.description.slice(0, 20) + '...' : short.description}</div>
                                        <div className="text-xs text-[#a1a1aa]">{short.views?.toLocaleString() || 0} views</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-[#a1a1aa]">
                            <p>No shorts uploaded yet</p>
                        </div>
                    )}
                    <div className="border-b-2 border-[#27272a] pb-10 w-full -mt-5"/>
                </div>
                
                <div className="px-6 lg:px-12 mt-8 mb-8">
                    <div className="text-xl font-bold mb-4">Video</div>
                    {videosLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366f1]"></div>
                        </div>
                    ) : videos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {videos.map((video: any) => (
                                <div key={video.id} className="bg-[#18181b] rounded-lg overflow-hidden shadow">
                                    <VideoThumbnail
                                        videoUrl={video.videoUrl}
                                        title={video.title}
                                        duration={video.duration}
                                        className="w-full h-24 sm:h-28 lg:h-32"
                                        showDuration={true}
                                        fallbackThumbnail={video.thumbnail}
                                        videoId={video.id}
                                    />
                                    <div className="p-2">
                                        <div className="font-semibold text-sm line-clamp-2">{video.title}</div>
                                        <div className="text-xs text-[#a1a1aa]">{video.views?.toLocaleString() || 0} lượt xem</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-[#a1a1aa]">
                            <p>No videos uploaded yet</p>
                        </div>
                    )}
                </div>
            </div>
            {/* Custom Profile Dialog */}
            {isOwnProfile && user && (
                <CustomProfileDialog
                    isOpen={showCustomProfileDialog}
                    onClose={() => setShowCustomProfileDialog(false)}
                    onProfileUpdated={(updatedUser) => {
                        setUser(updatedUser);
                        setShowCustomProfileDialog(false);
                    }}
                    currentUser={user}
                />
            )}
        </div>
    );
}

function Stat({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex flex-col items-center min-w-[80px]">
            <div>{icon}</div>
            <div className="font-bold text-lg mt-1 text-white">{value}</div>
            <div className="text-[#a1a1aa] text-xs uppercase">{label}</div>
        </div>
    );
}

function AnalyticsCard({ title, value, subtext }: { title: string, value: string, subtext: string }) {
    return (
        <div className="bg-[#222226] rounded-xl p-5 shadow flex flex-col gap-2 min-h-[110px] border border-[#27272a]">
            <div className="text-xs text-[#a1a1aa] font-semibold">{title}</div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-[#6366f1]">{subtext}</div>
        </div>
    );
}
