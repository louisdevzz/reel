import { pgTable, text, timestamp, integer, jsonb, uuid, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  rank: integer('rank').notNull().default(1),
  username: text('username').notNull().unique(),
  fullName: text('full_name').notNull(),
  description: text('description').notNull(),
  avatar: text('avatar'),
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