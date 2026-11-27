import { env } from '@core/config/env';
import { httpClient, type ApiResponse } from '@core/http/httpClient';
import type {
  CreateSocialPostInput,
  SocialPost,
} from '@features/social-wall/domain/entities/SocialPost';
import type { ISocialWallRepository } from '@features/social-wall/domain/repositories/SocialWallRepository';
import type { SocialPostDto } from '@features/social-wall/infrastructure/dto/SocialPostDto';
import { SocialPostMapper } from '@features/social-wall/infrastructure/mappers/SocialPostMapper';

interface ImageUploadResponse {
  id: string;
}

export class HttpSocialWallRepository implements ISocialWallRepository {
  public async getPosts(): Promise<SocialPost[]> {
    const response =
      await httpClient.get<ApiResponse<{ posts: SocialPostDto[] }>>('/posts');
    return response.body.posts.map((post) =>
      SocialPostMapper.toDomain(post)
    );
  }

  public async createPost(input: CreateSocialPostInput): Promise<SocialPost> {
    let imageUrl = '';
    if (input.image) {
      const formData = new FormData();
      formData.append('image', input.image);
      const uploaded = await httpClient.postFormData<
        ApiResponse<ImageUploadResponse>
      >('/images', formData);
      const apiBaseUrl = new URL(
        env.apiBaseUrl,
        window.location.origin
      ).toString().replace(/\/$/, '');
      imageUrl = `${apiBaseUrl}/images/${uploaded.body.id}`;
    }

    const title = input.text.trim().slice(0, 200) || 'Publicación con imagen';
    const response = await httpClient.post<ApiResponse<{ post: SocialPostDto }>>(
      '/posts',
      {
        title,
        text: input.text.trim(),
        image: imageUrl,
      }
    );
    return SocialPostMapper.toDomain(response.body.post);
  }

  public async toggleLike(postId: string): Promise<SocialPost> {
    const response = await httpClient.post<
      ApiResponse<{ liked: boolean; post: SocialPostDto }>
    >(`/posts/${encodeURIComponent(postId)}/like`);
    return SocialPostMapper.toDomain(response.body.post);
  }

  public async setFollow(params: {
    userId: string;
    following: boolean;
  }): Promise<void> {
    const path = `/users/${encodeURIComponent(params.userId)}/follow`;
    if (params.following) {
      await httpClient.put<ApiResponse<{ follow: unknown }>>(path);
      return;
    }
    await httpClient.delete<ApiResponse<{ follow: unknown }>>(path);
  }
}
