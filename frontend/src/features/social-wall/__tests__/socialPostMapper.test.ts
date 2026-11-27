import { describe, expect, it } from 'vitest';
import { SocialPostMapper } from '@features/social-wall/infrastructure/mappers/SocialPostMapper';

describe('SocialPostMapper', () => {
  it('maps database feed fields and viewer state into the social domain', () => {
    const post = SocialPostMapper.toDomain({
      id: '18',
      user_id: 7,
      title: 'Publicación de prueba',
      text: 'Una actualización real del feed.',
      image: '',
      status: false,
      created_at: '2026-11-27T10:00:00.000Z',
      likes_count: '4',
      author_name: 'Ana Pérez',
      followers_count: '12',
      following_count: 3,
      liked_by_me: true,
      is_following: true,
    });

    expect(post).toEqual({
      id: '18',
      authorId: '7',
      authorName: 'Ana Pérez',
      authorHandle: '@trader_7',
      createdAtIso: '2026-11-27T10:00:00.000Z',
      text: 'Una actualización real del feed.',
      image: null,
      likesCount: 4,
      likedByMe: true,
      followersCount: 12,
      followingCount: 3,
      isFollowing: true,
    });
  });
});
