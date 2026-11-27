import { describe, expect, it } from 'vitest';
import { validateCreateSocialCommentDomainRule } from '@features/social-wall/domain/entities/SocialPost';
import {
  SocialCommentMapper,
  SocialPostMapper,
  SocialUserProfileMapper,
} from '@features/social-wall/infrastructure/mappers/SocialPostMapper';

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
      comments_count: '3',
      author_name: 'Ana Pérez',
      avatar_url: null,
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
      authorAvatarUrl: null,
      createdAtIso: '2026-11-27T10:00:00.000Z',
      text: 'Una actualización real del feed.',
      image: null,
      likesCount: 4,
      commentsCount: 3,
      likedByMe: true,
      followersCount: 12,
      followingCount: 3,
      isFollowing: true,
    });
  });

  it('maps comment DTO fields with author data into the social domain', () => {
    const comment = SocialCommentMapper.toDomain({
      id: 42,
      post_id: '18',
      user_id: 9,
      content: 'Excelente operación en Nasdaq.',
      created_at: '2026-11-27T11:15:00.000Z',
      author_name: 'Carlos Gómez',
      username: 'Carlos Gómez',
      avatar_url: null,
    });

    expect(comment).toEqual({
      id: '42',
      postId: '18',
      authorId: '9',
      authorName: 'Carlos Gómez',
      authorHandle: '@trader_9',
      authorAvatarUrl: null,
      content: 'Excelente operación en Nasdaq.',
      createdAtIso: '2026-11-27T11:15:00.000Z',
    });
  });

  it('maps user profile DTO fields into the social profile domain', () => {
    const profile = SocialUserProfileMapper.toDomain({
      id: 7,
      username: 'Ana Pérez',
      avatar_url: '',
      bio: 'Operando futuros NQ desde 2022.',
      followers_count: '18',
      following_count: 5,
      posts_count: '9',
      created_at: '2026-05-10T12:00:00.000Z',
      is_following: true,
      is_me: false,
    });

    expect(profile).toEqual({
      id: '7',
      username: 'Ana Pérez',
      handle: '@trader_7',
      avatarUrl: null,
      bio: 'Operando futuros NQ desde 2022.',
      followersCount: 18,
      followingCount: 5,
      postsCount: 9,
      createdAtIso: '2026-05-10T12:00:00.000Z',
      isFollowing: true,
      isMe: false,
    });
  });

  it('rejects empty or whitespace-only comments in domain validation', () => {
    expect(() =>
      validateCreateSocialCommentDomainRule({ postId: '18', content: '   ' })
    ).toThrow('El comentario no puede estar vacío.');
  });
});
