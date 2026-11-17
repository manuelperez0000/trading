import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { container } from '@app/di/container';
import type {
  CreateSocialPostInput,
  ModerationStatus,
} from '@features/social-wall/domain/entities/SocialPost';

export const SOCIAL_POSTS_QUERY_KEY = ['social-wall', 'posts'] as const;

export function useSocialPostsQuery() {
  return useQuery({
    queryKey: SOCIAL_POSTS_QUERY_KEY,
    queryFn: () => container.socialWallRepository.getPosts(),
  });
}

export function useCreateSocialPostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSocialPostInput) =>
      container.createSocialPostUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_POSTS_QUERY_KEY });
    },
  });
}

export function useToggleLikePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) =>
      container.socialWallRepository.toggleLike(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_POSTS_QUERY_KEY });
    },
  });
}

export function useAddCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      postId: string;
      authorName: string;
      content: string;
    }) => container.socialWallRepository.addComment(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_POSTS_QUERY_KEY });
    },
  });
}

export function useModeratePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { postId: string; status: ModerationStatus }) =>
      container.moderateSocialPostUseCase.execute(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_POSTS_QUERY_KEY });
    },
  });
}

export function useTogglePinPostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) =>
      container.socialWallRepository.togglePinPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_POSTS_QUERY_KEY });
    },
  });
}
