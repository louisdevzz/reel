import { pgTable, text, timestamp, integer, jsonb, uuid, boolean, unique } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  rank: integer('rank').notNull().default(1),
  username: text('username').notNull().unique(),
  fullName: text('full_name').notNull(),
  description: text('description').notNull(),
  avatar: text('avatar'),
  banner: text('banner'),
  category: text('category').notNull().default('Gaming'),
  subCategory: text('sub_category').notNull().default('Valorant'),
  email: text('email').notNull(),
  aptosAddress: text('aptos_address').notNull().unique(),
  joinDate: timestamp('join_date').notNull().defaultNow(),
  followers: integer('followers').notNull().default(0),
  following: integer('following').notNull().default(0),
  videos: integer('videos').notNull().default(0),
  shorts: integer('shorts').notNull().default(0),
  views: integer('views').notNull().default(0),
  totalDonation: integer('total_donation').notNull().default(0),
  totalDonationCount: integer('total_donation_count').notNull().default(0),
  balance: integer('balance').notNull().default(0),
  tags: jsonb('tags').$type<string[]>(),
  social: jsonb('social').$type<{
    youtube?: string
    twitter?: string
    tiktok?: string
    twitch?: string
    instagram?: string
    website?: string
    discord?: string
    telegram?: string
    facebook?: string
    linkedin?: string
    github?: string
    other?: string
  }>(),
})

export const videos = pgTable('videos', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  duration: integer('duration').notNull(), // in seconds
  type: text('type').notNull().default('video'), // 'video' | 'short'
  thumbnail: text('thumbnail').notNull(),
  videoUrl: text('video_url').notNull(),
  views: integer('views').notNull().default(0),
  likes: integer('likes').notNull().default(0),
  shares: integer('shares').notNull().default(0),
  comments: integer('comments').notNull().default(0),
  uploadDate: timestamp('upload_date').notNull().defaultNow(),
  userId: uuid('user_id').notNull().references(() => users.id),
  tags: jsonb('tags').$type<string[]>(),
  isPublic: boolean('is_public').notNull().default(true),
})

export const shorts = pgTable('shorts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  duration: integer('duration').notNull(), // in seconds, must be <= 60
  thumbnail: text('thumbnail').notNull(),
  videoUrl: text('video_url').notNull(),
  views: integer('views').notNull().default(0),
  likes: integer('likes').notNull().default(0),
  shares: integer('shares').notNull().default(0),
  comments: integer('comments').notNull().default(0),
  bookmarks: integer('bookmarks').notNull().default(0),
  uploadDate: timestamp('upload_date').notNull().defaultNow(),
  userId: uuid('user_id').notNull().references(() => users.id),
  tags: jsonb('tags').$type<string[]>(),
  isPublic: boolean('is_public').notNull().default(true)
})

// Bookmark table only for shorts
export const shortBookmarks = pgTable('short_bookmarks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  shortId: uuid('short_id').notNull().references(() => shorts.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Like tables for videos and shorts
export const videoLikes = pgTable('video_likes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  videoId: uuid('video_id').notNull().references(() => videos.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const shortLikes = pgTable('short_likes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  shortId: uuid('short_id').notNull().references(() => shorts.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Comment tables for videos and shorts
export const videoComments = pgTable('video_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  videoId: uuid('video_id').notNull().references(() => videos.id),
  content: text('content').notNull(),
  parentId: uuid('parent_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const shortComments = pgTable('short_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  shortId: uuid('short_id').notNull().references(() => shorts.id),
  content: text('content').notNull(),
  parentId: uuid('parent_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Share tables for videos and shorts
export const videoShares = pgTable('video_shares', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  videoId: uuid('video_id').notNull().references(() => videos.id),
  platform: text('platform').notNull(),
  shareUrl: text('share_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const shortShares = pgTable('short_shares', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  shortId: uuid('short_id').notNull().references(() => shorts.id),
  platform: text('platform').notNull(),
  shareUrl: text('share_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// View tracking tables for analytics
export const videoViews = pgTable('video_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  videoId: uuid('video_id').notNull().references(() => videos.id),
  sessionId: text('session_id').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  watchDuration: integer('watch_duration'),
  isCompleted: boolean('is_completed').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const shortViews = pgTable('short_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  shortId: uuid('short_id').notNull().references(() => shorts.id),
  sessionId: text('session_id').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  watchDuration: integer('watch_duration'),
  isCompleted: boolean('is_completed').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Follow relationship table
export const userFollows = pgTable('user_follows', {
  id: uuid('id').primaryKey().defaultRandom(),
  followerId: uuid('follower_id').notNull().references(() => users.id),
  followingId: uuid('following_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  uniqueFollow: unique().on(table.followerId, table.followingId),
}))

// Stream keys table - each user can only have one stream key
export const streamKeys = pgTable('stream_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id).unique(),
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  isLive: boolean('is_live').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastUsed: timestamp('last_used'),
  // Livepeer-specific fields
  livepeerStreamId: text('livepeer_stream_id'),
  playbackId: text('playback_id'),
  playbackUrl: text('playback_url'),
})

// Stream sessions table to track live streaming sessions
export const streamSessions = pgTable('stream_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  streamKeyId: uuid('stream_key_id').notNull().references(() => streamKeys.id),
  title: text('title'),
  description: text('description'),
  status: text('status').notNull().default('idle'), // 'idle' | 'live' | 'ended'
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
  viewerCount: integer('viewer_count').notNull().default(0),
  maxViewerCount: integer('max_viewer_count').notNull().default(0),
  totalDonation: integer('total_donation').notNull().default(0),
  totalDonationCount: integer('total_donation_count').notNull().default(0),
  duration: integer('duration').notNull().default(0), // in seconds
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// transactions table
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  amount: integer('amount').notNull(),
  type: text('type').notNull(), // 'deposit' | 'withdraw' | 'transfer' | 'reward' | 'fee' | 'other'
  txHash: text('tx_hash').notNull().unique(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  status: text('status').notNull().default('pending'), // 'pending' | 'confirmed' | 'failed'
  userAddr: text('user_addr').notNull(),
  referralCode: text('referral_code'), // optional
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Tip history table to track all tip transactions
export const tipHistory = pgTable('tip_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  tipperId: uuid('tipper_id').notNull().references(() => users.id), // User who sent the tip
  receiverId: uuid('receiver_id').notNull().references(() => users.id), // User who received the tip
  amount: integer('amount').notNull(), // Tip amount in smallest unit
  message: text('message'), // Optional message with the tip
  txHash: text('tx_hash').notNull().unique(), // Blockchain transaction hash
  status: text('status').notNull().default('pending'), // 'pending' | 'confirmed' | 'failed'
  tipType: text('tip_type').notNull().default('general'), // 'general' | 'stream' | 'video' | 'short'
  streamSessionId: uuid('stream_session_id').references(() => streamSessions.id), // If tip was during a stream
  videoId: uuid('video_id').references(() => videos.id), // If tip was for a specific video
  shortId: uuid('short_id').references(() => shorts.id), // If tip was for a specific short
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Video = typeof videos.$inferSelect
export type NewVideo = typeof videos.$inferInsert
export type Short = typeof shorts.$inferSelect
export type NewShort = typeof shorts.$inferInsert
export type ShortBookmark = typeof shortBookmarks.$inferSelect
export type NewShortBookmark = typeof shortBookmarks.$inferInsert
export type VideoLike = typeof videoLikes.$inferSelect
export type NewVideoLike = typeof videoLikes.$inferInsert
export type ShortLike = typeof shortLikes.$inferSelect
export type NewShortLike = typeof shortLikes.$inferInsert
export type VideoComment = typeof videoComments.$inferSelect
export type NewVideoComment = typeof videoComments.$inferInsert
export type ShortComment = typeof shortComments.$inferSelect
export type NewShortComment = typeof shortComments.$inferInsert
export type VideoShare = typeof videoShares.$inferSelect
export type NewVideoShare = typeof videoShares.$inferInsert
export type ShortShare = typeof shortShares.$inferSelect
export type NewShortShare = typeof shortShares.$inferInsert
export type VideoView = typeof videoViews.$inferSelect
export type NewVideoView = typeof videoViews.$inferInsert
export type ShortView = typeof shortViews.$inferSelect
export type NewShortView = typeof shortViews.$inferInsert
export type UserFollow = typeof userFollows.$inferSelect
export type NewUserFollow = typeof userFollows.$inferInsert
export type StreamKey = typeof streamKeys.$inferSelect
export type NewStreamKey = typeof streamKeys.$inferInsert
export type StreamSession = typeof streamSessions.$inferSelect
export type NewStreamSession = typeof streamSessions.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
export type TipHistory = typeof tipHistory.$inferSelect
export type NewTipHistory = typeof tipHistory.$inferInsert 