export interface SocialPost {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  createdAtIso: string;
  text: string;
  image: string | null;
  likesCount: number;
  likedByMe: boolean;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export interface CreateSocialPostInput {
  text: string;
  image?: File;
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
