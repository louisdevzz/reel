export interface Video {
  id: string
  title: string
  description: string
  videoUrl: string
  thumbnail: string
  views: number
  likes: number
  shares: number
  comments: number
  uploadDate: string
  userId: string
  creator?: string
  creatorFullName?: string
  creatorAvatar?: string
  creatorFollowers?: number
}

export interface Comment {
  id: string
  content: string
  userId: string
  videoId: string
  createdAt: string
  user: {
    username: string
    fullName: string
    avatar: string
  }
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
    balance: number;
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

export interface StreamKey {
    id: string;
    key: string;
    name: string;
    isActive: boolean;
    isLive?: boolean;
    createdAt: Date;
    lastUsed?: Date;
    // Livepeer-specific fields
    livepeerStreamId?: string;
    playbackUrl?: string;
}

// Copyright © Aptos
// SPDX-License-Identifier: Apache-2.0

import { z } from "zod";

export const idTokenSchema = z.object({
  aud: z.string(),
  exp: z.number(),
  iat: z.number(),
  iss: z.string(),
  sub: z.string(),
});

export const nonceEncryptedIdTokenSchema = idTokenSchema.extend({
  nonce: z.string(),
});

export const profileScopedPayloadSchema = nonceEncryptedIdTokenSchema.extend({
  family_name: z.string().optional(),
  given_name: z.string().optional(),
  locale: z.string().optional(),
  name: z.string(),
  picture: z.string().optional(),
});

export const emailScopedPayloadSchema = nonceEncryptedIdTokenSchema.extend({
  email: z.string().optional(),
  email_verified: z.boolean(),
});

export const scopedPayloadSchema = profileScopedPayloadSchema.merge(
  emailScopedPayloadSchema
);

export type IDToken = z.infer<typeof idTokenSchema>;

export type NonceEncryptedIdToken = z.infer<typeof nonceEncryptedIdTokenSchema>;

export type ProfileScopedPayloadSchema = z.infer<
  typeof profileScopedPayloadSchema
>;

export type EmailScopedPayloadSchema = z.infer<typeof emailScopedPayloadSchema>;

export type EncryptedScopedIdToken = z.infer<typeof scopedPayloadSchema>;