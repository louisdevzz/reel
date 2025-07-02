import { createFileRoute } from "@tanstack/react-router";
import { FaTwitch, FaTwitter, FaTiktok, FaYoutube, FaCheckCircle, FaEnvelope, FaGlobe, FaUserFriends, FaPlay, FaChartLine } from "react-icons/fa";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Info, User2, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { apiService, User } from "../../lib/apiService";

export const Route = createFileRoute('/u/$username')({
    component: ProfilePage,
})

function ProfilePage() {
    const { username } = Route.useParams();
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            setError(null);
            try {
                const userData = await apiService.getUserByUsername(username);
                if (userData) {
                    setUser(userData);
                } else {
                    setError('User not found');
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

    const handleCopy = () => {
        if (user?.aptosAddress) {
            navigator.clipboard.writeText(user.aptosAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        }
    };

    // Mock shorts data
    const shorts = [
        {
            id: 1,
            title: "Jutsu kaisen 🥵🔥",
            thumbnail: "https://i.ytimg.com/vi/shorts1.jpg",
            views: "0 lượt xem",
        },
        {
            id: 2,
            title: "Solo leveling 🔥🥵",
            thumbnail: "https://i.ytimg.com/vi/shorts2.jpg",
            views: "1 lượt xem",
        },
        {
            id: 3,
            title: "One-Punch Man: Saitama's Most Epic...",
            thumbnail: "https://i.ytimg.com/vi/shorts3.jpg",
            views: "2 lượt xem",
        },
        {
            id: 4,
            title: "🔥 Deku vs Flect Showdown - My Hero ...",
            thumbnail: "https://i.ytimg.com/vi/shorts4.jpg",
            views: "25 lượt xem",
        },
    ];

    // Mock videos data (move from below)
    const recommendedVideos = [
        {
            id: 1,
            title: "ALL IN ONE | Cậu Bé Vô Tình Nhận Được Thần Giáo Vô Địch | Review Phim Anime Hay",
            thumbnail: "https://i.ytimg.com/vi/1.jpg",
            duration: "2:45:24",
            views: "28 N lượt xem",
            date: "3 ngày trước",
        },
        {
            id: 2,
            title: "ALL IN ONE | Chuyển Sinh Làm Nông Dân Tại Dị Giới | Review Anime Hay",
            thumbnail: "https://i.ytimg.com/vi/2.jpg",
            duration: "1:14:59",
            views: "366 N lượt xem",
            date: "11 ngày trước",
        },
        {
            id: 3,
            title: "ALL IN ONE | Chuyển Sinh với Năng Lực Cấp Thần Tại Dị Giới | Review Anime Hay",
            thumbnail: "https://i.ytimg.com/vi/3.jpg",
            duration: "1:20:20",
            views: "551 N lượt xem",
            date: "1 tháng trước",
        },
    ];
    const videos = [
        ...recommendedVideos,
    ];

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
                    <div className="text-red-400 text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
                    <p className="text-[#a1a1aa]">{error || `User @${username} does not exist`}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#18181b] min-h-screen text-white">
            <div className="flex flex-col flex-1 h-[calc(100vh-4rem)] overflow-y-auto">
                <div className="relative">
                    <img
                        src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80"
                        alt="Banner"
                        className="w-full h-48 object-cover opacity-60"
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
                                    )) || (
                                        <>
                                            <span className="bg-[#23243a] text-[#fff] px-3 py-1 rounded-full text-xs font-medium">#minecraft</span>
                                            <span className="bg-[#23243a] text-[#fff] px-3 py-1 rounded-full text-xs font-medium">#CS:GO</span>
                                            <span className="bg-[#23243a] text-[#fff] px-3 py-1 rounded-full text-xs font-medium">#dota2</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 lg:gap-4 flex-wrap">
                            <button className="bg-[#232323] text-white font-bold px-3 lg:px-6 py-2 rounded-full text-sm lg:text-base">Customize Channel</button>
                            <button className="bg-[#232323] text-white font-bold px-3 lg:px-6 py-2 rounded-full text-sm lg:text-base">Manage Videos</button>
                            <button className="bg-[#232323] text-white font-bold px-3 lg:px-6 py-2 rounded-full text-sm lg:text-base">Follow</button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 px-6 lg:px-12">
                    <div className="flex gap-6 lg:gap-10 items-center justify-center lg:justify-start flex-wrap">
                        <Stat icon={<FaTwitch className="text-[#9147ff] text-xl lg:text-2xl" />} label="twitch" value={user.social?.twitch ? "Active" : "N/A"} />
                        <Stat icon={<FaTwitter className="text-[#1da1f2] text-xl lg:text-2xl" />} label="twitter" value={user.social?.twitter ? "Active" : "N/A"} />
                        <Stat icon={<FaTiktok className="text-[#fff] text-xl lg:text-2xl" />} label="tik tok" value={user.social?.tiktok ? "Active" : "N/A"} />
                        <Stat icon={<FaYoutube className="text-[#ff0000] text-xl lg:text-2xl" />} label="youtube" value={user.social?.youtube ? "Active" : "N/A"} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[#a1a1aa] text-xs font-semibold mb-1">ABOUT ME</div>
                        <div className="text-[#fff] text-sm">
                            {user.description?.substring(0, 150)}...{' '}
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
                            <div className="text-white text-sm mb-2">Gmail: {user.email}</div>
                            <div className="text-lg font-semibold mt-4 mb-2">Other Information</div>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-3">
                                    <User2 className="w-5 h-5" />
                                    <span className="bg-[#333] px-4 py-2 rounded-full font-bold select-all">{user.aptosAddress}</span>
                                    <button onClick={handleCopy} className="ml-1 p-1 rounded hover:bg-[#232323] transition-colors" title="Copy address">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    {copied && <span className="text-green-400 text-xs ml-2">Copied!</span>}
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="bg-[#6366f1] text-white px-2 py-1 rounded text-xs font-medium">{user.category}</span>
                                    <span className="bg-[#23243a] text-white px-2 py-1 rounded text-xs font-medium">{user.subCategory}</span>
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
                                    <span>{user.videos} videos</span>
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
                        <AnalyticsCard title="INFLUENCER RANK" value={`${user.rank}th`} subtext="↑ 2 positions vs previous day" />
                        <AnalyticsCard title="TOTAL FOLLOWERS" value={user.followers.toLocaleString()} subtext="-2% vs previous day" />
                        <AnalyticsCard title="TOTAL VIEWS" value={user.views.toLocaleString()} subtext="-" />
                        <AnalyticsCard title="ENGAGEMENT RATE" value="3.8%" subtext="-" />
                    </div>
                </div>

                <div className="px-6 lg:px-12 mt-10">
                    <div className="flex items-center mb-4">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5f/YouTube_Short_Logo.png" alt="Shorts" className="w-6 h-6 mr-2" />
                        <span className="text-xl font-bold">Shorts</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {shorts.map((short) => (
                            <div key={short.id} className="w-[214px] h-[394px] bg-[#18181b] rounded-lg overflow-hidden shadow flex-shrink-0 flex flex-col">
                                <div className="w-[210px] h-[315px] overflow-hidden">
                                    <img src={short.thumbnail} alt={short.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-2 flex-1 flex flex-col justify-between">
                                    <div className="font-semibold text-sm line-clamp-2">{short.title}</div>
                                    <div className="text-xs text-[#a1a1aa] mt-1">{short.views}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="px-6 lg:px-12 mt-8 mb-8">
                    <div className="text-xl font-bold mb-4">Video</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {videos.map((video: any) => (
                            <div key={video.id} className="bg-[#18181b] rounded-lg overflow-hidden shadow">
                                <img src={video.thumbnail} alt={video.title} className="w-full h-24 sm:h-28 lg:h-32 object-cover" />
                                <div className="p-2">
                                    <div className="font-semibold text-sm line-clamp-2">{video.title}</div>
                                    <div className="text-xs text-[#a1a1aa]">{video.views}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
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
