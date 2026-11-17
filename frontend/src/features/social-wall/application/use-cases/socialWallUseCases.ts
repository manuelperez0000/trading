import {
  validateCreateSocialPostDomainRule,
  type CreateSocialPostInput,
  type ModerationStatus,
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

export class ModerateSocialPostUseCase {
  private readonly repository: ISocialWallRepository;

  constructor(repository: ISocialWallRepository) {
    this.repository = repository;
  }

  public async execute(params: {
    postId: string;
    status: ModerationStatus;
  }): Promise<SocialPost> {
    return this.repository.moderatePost(params);
  }
}
