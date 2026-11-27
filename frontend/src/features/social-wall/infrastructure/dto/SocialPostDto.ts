import { z } from 'zod';

const isoDateTransform = z
  .union([z.string(), z.date()])
  .transform((value) => (value instanceof Date ? value.toISOString() : value));

export const SocialPostDtoSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  user_id: z.union([z.string(), z.number()]).transform(String),
  title: z.string(),
  text: z.string(),
  image: z.string().nullable(),
  status: z.boolean(),
  created_at: isoDateTransform,
  likes_count: z.coerce.number().int().nonnegative(),
  comments_count: z.coerce.number().int().nonnegative().default(0),
  author_name: z.string(),
  avatar_url: z.string().nullable().optional(),
  followers_count: z.coerce.number().int().nonnegative(),
  following_count: z.coerce.number().int().nonnegative(),
  liked_by_me: z.boolean(),
  is_following: z.boolean(),
});

export type SocialPostDto = z.infer<typeof SocialPostDtoSchema>;

export const SocialCommentDtoSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  post_id: z.union([z.string(), z.number()]).transform(String),
  user_id: z.union([z.string(), z.number()]).transform(String),
  content: z.string(),
  created_at: isoDateTransform,
  author_name: z.string().optional(),
  username: z.string().optional(),
  avatar_url: z.string().nullable().optional(),
});

export type SocialCommentDto = z.infer<typeof SocialCommentDtoSchema>;

export const SocialUserProfileDtoSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  username: z.string(),
  full_name: z.string().optional(),
  avatar_url: z.string().nullable().optional(),
  bio: z.string().default(''),
  followers_count: z.coerce.number().int().nonnegative(),
  following_count: z.coerce.number().int().nonnegative(),
  posts_count: z.coerce.number().int().nonnegative().default(0),
  created_at: isoDateTransform,
  is_following: z.boolean(),
  is_me: z.boolean().default(false),
});

export type SocialUserProfileDto = z.infer<typeof SocialUserProfileDtoSchema>;
