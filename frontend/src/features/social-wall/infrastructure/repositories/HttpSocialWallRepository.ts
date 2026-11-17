import { httpClient } from '@core/http/httpClient';
import type {
  CreateSocialPostInput,
  ModerationStatus,
  SocialPost,
} from '@features/social-wall/domain/entities/SocialPost';
import type { ISocialWallRepository } from '@features/social-wall/domain/repositories/SocialWallRepository';

export class HttpSocialWallRepository implements ISocialWallRepository {
  public async getPosts(): Promise<SocialPost[]> {
    return httpClient.get<SocialPost[]>('/social/posts');
  }

  public async createPost(input: CreateSocialPostInput): Promise<SocialPost> {
    return httpClient.post<SocialPost>('/social/posts', input);
  }

  public async toggleLike(postId: string): Promise<SocialPost> {
    return httpClient.post<SocialPost>(`/social/posts/${postId}/like`);
  }

  public async addComment(params: {
    postId: string;
    authorName: string;
    content: string;
  }): Promise<SocialPost> {
    return httpClient.post<SocialPost>(
      `/social/posts/${params.postId}/comments`,
      params
    );
  }

  public async moderatePost(params: {
    postId: string;
    status: ModerationStatus;
  }): Promise<SocialPost> {
    return httpClient.patch<SocialPost>(
      `/social/posts/${params.postId}/moderation`,
      { status: params.status }
    );
  }

  public async togglePinPost(postId: string): Promise<SocialPost> {
    return httpClient.patch<SocialPost>(`/social/posts/${postId}/pin`);
  }
}
