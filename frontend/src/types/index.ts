export interface Video {
    id: string;
    title: string;
    description?: string;
    duration: number; // in seconds
    type: 'video' | 'short'; // video: > 60s, short: <= 60s
    thumbnail: string;
    videoUrl: string;
    views: number;
    likes: number;
    uploadDate: Date;
    userId: string;
    tags?: string[];
    isPublic: boolean;
}

export interface Short {
    id: string;
    title: string;
    description?: string;
    duration: number; // in seconds, must be <= 60
    thumbnail: string;
    videoUrl: string;
    views: number;
    likes: number;
    uploadDate: Date;
    userId: string;
    tags?: string[];
    isPublic: boolean;
}

export interface User {
    id: string;
    rank: number;
    username: string;
    description: string;
    avatar: string;
    email: string;
    aptosAddress: string;
    joinDate: Date;
    followers: number;
    following: number;
    videos: number; // total regular videos
    shorts: number; // total short videos
    views: number;
    totalDonation: number;
    totalDonationCount: number;
    tags?: string[];
    social?: {
        youtube?: string;
        twitter?: string;
        tiktok?: string;
        twitch?: string;
        instagram?: string;
        website?: string;
        discord?: string;
        telegram?: string;
        facebook?: string;
        linkedin?: string;
        github?: string;
        other?: string;
    }
}