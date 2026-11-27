import type { SocialPost } from '@features/social-wall/domain/entities/SocialPost';
import {
  SocialPostDtoSchema,
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
      likedByMe: dto.liked_by_me,
      followersCount: dto.followers_count,
      followingCount: dto.following_count,
      isFollowing: dto.is_following,
    };
  }
}
