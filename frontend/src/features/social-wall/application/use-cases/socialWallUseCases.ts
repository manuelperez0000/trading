import {
  validateCreateSocialCommentDomainRule,
  validateCreateSocialPostDomainRule,
  type CreateSocialCommentInput,
  type CreateSocialPostInput,
  type SocialComment,
  type SocialPost,
} from '@features/social-wall/domain/entities/SocialPost';
import type { ISocialWallRepository } from '@features/social-wall/domain/repositories/SocialWallRepository';

export class CreateSocialPostUseCase {
  private readonly repository: ISocialWallRepository;

  constructor(repository: ISocialWallRepository) {
    this.repository = repository;
  }

  public async execute(input: CreateSocialPostInput): Promise<SocialPost> {
    validateCreateSocialPostDomainRule(input);
    return this.repository.createPost(input);
  }
}

export class CreateSocialCommentUseCase {
  private readonly repository: ISocialWallRepository;

  constructor(repository: ISocialWallRepository) {
    this.repository = repository;
  }

  public async execute(
    input: CreateSocialCommentInput
  ): Promise<{ comment: SocialComment; post: SocialPost }> {
    validateCreateSocialCommentDomainRule(input);
    return this.repository.createComment(input);
  }
}
