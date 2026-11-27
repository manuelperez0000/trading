import { z } from 'zod';

export const SocialPostDtoSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  user_id: z.union([z.string(), z.number()]).transform(String),
  title: z.string(),
  text: z.string(),
  image: z.string().nullable(),
  status: z.boolean(),
  created_at: z.union([z.string(), z.date()]).transform((value) =>
    value instanceof Date ? value.toISOString() : value
  ),
  likes_count: z.coerce.number().int().nonnegative(),
  comments_count: z.coerce.number().int().nonnegative().default(0),
  author_name: z.string(),
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
  created_at: z.union([z.string(), z.date()]).transform((value) =>
    value instanceof Date ? value.toISOString() : value
  ),
  author_name: z.string().optional(),
  username: z.string().optional(),
  avatar_url: z.string().nullable().optional(),
});

export type SocialCommentDto = z.infer<typeof SocialCommentDtoSchema>;
