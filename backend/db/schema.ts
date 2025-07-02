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
  uploadDate: timestamp('upload_date').notNull().defaultNow(),
  userId: uuid('user_id').notNull().references(() => users.id),
  tags: jsonb('tags').$type<string[]>(),
  isPublic: boolean('is_public').notNull().default(true),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Video = typeof videos.$inferSelect
export type NewVideo = typeof videos.$inferInsert
export type Short = typeof shorts.$inferSelect
export type NewShort = typeof shorts.$inferInsert 