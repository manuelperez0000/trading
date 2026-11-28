import { env } from '@core/config/env';
import { httpClient, type ApiResponse } from '@core/http/httpClient';
import type {
  CreateSocialCommentInput,
  CreateSocialPostInput,
  SocialComment,
  SocialPost,
  SocialUserFeed,
} from '@features/social-wall/domain/entities/SocialPost';
import type { ISocialWallRepository } from '@features/social-wall/domain/repositories/SocialWallRepository';
import type {
  SocialCommentDto,
  SocialPostDto,
  SocialUserProfileDto,
} from '@features/social-wall/infrastructure/dto/SocialPostDto';
import {
  SocialCommentMapper,
  SocialPostMapper,
  SocialUserProfileMapper,
} from '@features/social-wall/infrastructure/mappers/SocialPostMapper';

interface ImageUploadResponse {
  id: string;
}

export class HttpSocialWallRepository implements ISocialWallRepository {
  public async getPosts(status?: boolean): Promise<SocialPost[]> {
    const query =
      typeof status === 'boolean' ? `?status=${String(status)}` : '';
    const response = await httpClient.get<ApiResponse<{ posts: SocialPostDto[] }>>(
      `/posts${query}`
    );
    return response.body.posts.map((post) =>
      SocialPostMapper.toDomain(post)
    );
  }

  public async updatePostStatus(
    postId: string,
    status: boolean
  ): Promise<SocialPost> {
    const response = await httpClient.patch<
      ApiResponse<{ post: SocialPostDto }>
    >(`/posts/${encodeURIComponent(postId)}/status`, { status });
    return SocialPostMapper.toDomain(response.body.post);
  }

  public async deletePost(postId: string): Promise<void> {
    await httpClient.delete(`/posts/${encodeURIComponent(postId)}`);
  }

  public async getUserProfileFeed(userId: string): Promise<SocialUserFeed> {
    const response = await httpClient.get<
      ApiResponse<{
        profile: SocialUserProfileDto;
        posts: SocialPostDto[];
      }>
    >(`/users/${encodeURIComponent(userId)}/profile`);

    return {
      profile: SocialUserProfileMapper.toDomain(response.body.profile),
      posts: response.body.posts.map((post) =>
        SocialPostMapper.toDomain(post)
      ),
    };
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

  public async getComments(postId: string): Promise<SocialComment[]> {
    const response = await httpClient.get<
      ApiResponse<{ comments: SocialCommentDto[] }>
    >(`/posts/${encodeURIComponent(postId)}/comments`);
    return response.body.comments.map((comment) =>
      SocialCommentMapper.toDomain(comment)
    );
  }

  public async createComment(
    input: CreateSocialCommentInput
  ): Promise<{ comment: SocialComment; post: SocialPost }> {
    const response = await httpClient.post<
      ApiResponse<{
        comment: SocialCommentDto;
        comments_count: number;
        post: SocialPostDto;
      }>
    >(`/posts/${encodeURIComponent(input.postId)}/comments`, {
      content: input.content.trim(),
    });
    return {
      comment: SocialCommentMapper.toDomain(response.body.comment),
      post: SocialPostMapper.toDomain(response.body.post),
    };
  }

  public async deleteComment(params: {
    postId: string;
    commentId: string;
  }): Promise<{ commentId: string; post: SocialPost }> {
    const response = await httpClient.delete<
      ApiResponse<{
        comment: { id: string | number };
        comments_count: number;
        post: SocialPostDto;
      }>
    >(
      `/posts/${encodeURIComponent(params.postId)}/comments/${encodeURIComponent(
        params.commentId
      )}`
    );
    return {
      commentId: String(response.body.comment.id),
      post: SocialPostMapper.toDomain(response.body.post),
    };
  }
}
