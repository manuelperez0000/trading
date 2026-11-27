export interface SocialPost {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatarUrl: string | null;
  createdAtIso: string;
  text: string;
  image: string | null;
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export interface CreateSocialPostInput {
  text: string;
  image?: File;
}

export interface SocialComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatarUrl: string | null;
  content: string;
  createdAtIso: string;
}

export interface CreateSocialCommentInput {
  postId: string;
  content: string;
}

export interface SocialUserProfile {
  id: string;
  username: string;
  handle: string;
  avatarUrl: string | null;
  bio: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAtIso: string;
  isFollowing: boolean;
  isMe: boolean;
}

export interface SocialUserFeed {
  profile: SocialUserProfile;
  posts: SocialPost[];
}

export function validateCreateSocialPostDomainRule(
  input: CreateSocialPostInput
): void {
  if (!input.text.trim() && !input.image) {
    throw new Error('La publicación debe incluir texto o una imagen.');
  }
  if (input.text.length > 5000) {
    throw new Error('El texto no puede superar 5000 caracteres.');
  }
  if (input.image && input.image.size > 5 * 1024 * 1024) {
    throw new Error('La imagen no puede superar los 5 MB.');
  }
}

export function validateCreateSocialCommentDomainRule(
  input: CreateSocialCommentInput
): void {
  const normalized = input.content.trim();
  if (!normalized) {
    throw new Error('El comentario no puede estar vacío.');
  }
  if (normalized.length > 2000) {
    throw new Error('El comentario no puede superar 2000 caracteres.');
  }
}
