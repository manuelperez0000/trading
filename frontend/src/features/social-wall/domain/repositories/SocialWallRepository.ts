import type {
  CreateSocialPostInput,
  SocialPost,
} from '@features/social-wall/domain/entities/SocialPost';

export interface ISocialWallRepository {
  getPosts(): Promise<SocialPost[]>;
  createPost(input: CreateSocialPostInput): Promise<SocialPost>;
  toggleLike(postId: string): Promise<SocialPost>;
  setFollow(params: { userId: string; following: boolean }): Promise<void>;
}
