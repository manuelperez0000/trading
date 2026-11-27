import type {
  SocialComment,
  SocialPost,
  SocialUserProfile,
} from '@features/social-wall/domain/entities/SocialPost';
import {
  SocialCommentDtoSchema,
  SocialPostDtoSchema,
  SocialUserProfileDtoSchema,
  type SocialCommentDto,
  type SocialPostDto,
  type SocialUserProfileDto,
} from '@features/social-wall/infrastructure/dto/SocialPostDto';

export class SocialPostMapper {
  public static toDomain(raw: unknown): SocialPost {
    const dto: SocialPostDto = SocialPostDtoSchema.parse(raw);
    return {
      id: dto.id,
      authorId: dto.user_id,
      authorName: dto.author_name,
      authorHandle: `@trader_${dto.user_id}`,
      authorAvatarUrl: dto.avatar_url || null,
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

export class SocialUserProfileMapper {
  public static toDomain(raw: unknown): SocialUserProfile {
    const dto: SocialUserProfileDto = SocialUserProfileDtoSchema.parse(raw);
    const username = dto.username || dto.full_name || `Trader ${dto.id}`;
    return {
      id: dto.id,
      username,
      handle: `@trader_${dto.id}`,
      avatarUrl: dto.avatar_url || null,
      bio: dto.bio,
      followersCount: dto.followers_count,
      followingCount: dto.following_count,
      postsCount: dto.posts_count,
      createdAtIso: dto.created_at,
      isFollowing: dto.is_following,
      isMe: dto.is_me,
    };
  }
}
