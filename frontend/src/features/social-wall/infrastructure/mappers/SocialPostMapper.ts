import type {
  SocialComment,
  SocialPost,
} from '@features/social-wall/domain/entities/SocialPost';
import {
  SocialCommentDtoSchema,
  SocialPostDtoSchema,
  type SocialCommentDto,
  type SocialPostDto,
} from '@features/social-wall/infrastructure/dto/SocialPostDto';

export class SocialPostMapper {
  public static toDomain(raw: unknown): SocialPost {
    const dto: SocialPostDto = SocialPostDtoSchema.parse(raw);
    return {
      id: dto.id,
      authorId: dto.user_id,
      authorName: dto.author_name,
      authorHandle: `@trader_${dto.user_id}`,
      createdAtIso: dto.created_at,
      text: dto.text,
      image: dto.image || null,
      likesCount: dto.likes_count,
      commentsCount: dto.comments_count,
      likedByMe: dto.liked_by_me,
      followersCount: dto.followers_count,
      followingCount: dto.following_count,
      isFollowing: dto.is_following,
    };
  }
}

export class SocialCommentMapper {
  public static toDomain(raw: unknown): SocialComment {
    const dto: SocialCommentDto = SocialCommentDtoSchema.parse(raw);
    const authorName =
      dto.author_name ?? dto.username ?? `Trader ${dto.user_id}`;
    return {
      id: dto.id,
      postId: dto.post_id,
      authorId: dto.user_id,
      authorName,
      authorHandle: `@trader_${dto.user_id}`,
      authorAvatarUrl: dto.avatar_url || null,
      content: dto.content,
      createdAtIso: dto.created_at,
    };
  }
}
