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
  author_name: z.string(),
  followers_count: z.coerce.number().int().nonnegative(),
  following_count: z.coerce.number().int().nonnegative(),
  liked_by_me: z.boolean(),
  is_following: z.boolean(),
});

export type SocialPostDto = z.infer<typeof SocialPostDtoSchema>;
