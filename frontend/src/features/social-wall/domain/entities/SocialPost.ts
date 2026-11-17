export type VerificationType = 'API_VERIFIED_NT8' | 'COMMUNITY_SCREENSHOT';

export type ModerationStatus = 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED';

export interface SocialComment {
  id: string;
  authorName: string;
  content: string;
  createdAtIso: string;
}

export interface SocialPost {
  id: string;
  authorName: string;
  authorHandle: string;
  authorPlan: string;
  instrument: string;
  strategyUsed: string;
  profitUsd: number;
  profitTicks: number;
  tradesCount: number;
  testimonialText: string;
  chartSummaryTag: string;
  verificationType: VerificationType;
  ninjaExecutionHash: string | null;
  moderationStatus: ModerationStatus;
  isPinned: boolean;
  likesCount: number;
  likedByMe: boolean;
  comments: SocialComment[];
  createdAtIso: string;
}

export interface CreateSocialPostInput {
  authorName: string;
  authorHandle: string;
  instrument: string;
  strategyUsed: string;
  profitUsd: number;
  profitTicks: number;
  tradesCount: number;
  testimonialText: string;
  chartSummaryTag: string;
  verificationType: VerificationType;
  ninjaLicenseKeyForVerification?: string;
}

export function validateCreateSocialPostDomainRule(
  input: CreateSocialPostInput
): void {
  if (input.authorName.trim().length < 3) {
    throw new Error('El nombre del trader debe tener al menos 3 caracteres.');
  }
  if (input.testimonialText.trim().length < 12) {
    throw new Error(
      'El testimonio debe describir la sesión con al menos 12 caracteres.'
    );
  }
  if (!Number.isFinite(input.profitUsd) || input.profitUsd === 0) {
    throw new Error('El monto de resultado (USD) debe ser distinto de cero.');
  }
}
