import type {
  CreateSocialCommentInput,
  CreateSocialPostInput,
  SocialComment,
  SocialPost,
  SocialUserFeed,
} from '@features/social-wall/domain/entities/SocialPost';

export interface ISocialWallRepository {
  getPosts(): Promise<SocialPost[]>;
  getUserProfileFeed(userId: string): Promise<SocialUserFeed>;
  createPost(input: CreateSocialPostInput): Promise<SocialPost>;
  toggleLike(postId: string): Promise<SocialPost>;
  setFollow(params: { userId: string; following: boolean }): Promise<void>;
  getComments(postId: string): Promise<SocialComment[]>;
  createComment(
    input: CreateSocialCommentInput
  ): Promise<{ comment: SocialComment; post: SocialPost }>;
  deleteComment(params: {
    postId: string;
    commentId: string;
  }): Promise<{ commentId: string; post: SocialPost }>;
}
