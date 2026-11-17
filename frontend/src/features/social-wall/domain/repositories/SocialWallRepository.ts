import type {
  CreateSocialPostInput,
  ModerationStatus,
  SocialPost,
} from '@features/social-wall/domain/entities/SocialPost';

export interface ISocialWallRepository {
  getPosts(): Promise<SocialPost[]>;
  createPost(input: CreateSocialPostInput): Promise<SocialPost>;
  toggleLike(postId: string): Promise<SocialPost>;
  addComment(params: {
    postId: string;
    authorName: string;
    content: string;
  }): Promise<SocialPost>;
  moderatePost(params: {
    postId: string;
    status: ModerationStatus;
  }): Promise<SocialPost>;
  togglePinPost(postId: string): Promise<SocialPost>;
}
