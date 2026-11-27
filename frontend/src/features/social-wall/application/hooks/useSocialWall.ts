import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { container } from '@app/di/container';
import type {
  CreateSocialCommentInput,
  CreateSocialPostInput,
  SocialComment,
  SocialPost,
} from '@features/social-wall/domain/entities/SocialPost';

export const SOCIAL_POSTS_QUERY_KEY = ['social-wall', 'posts'] as const;

export function getSocialCommentsQueryKey(postId: string) {
  return ['social-wall', 'posts', postId, 'comments'] as const;
}

export function useSocialPostsQuery() {
  return useQuery({
    queryKey: SOCIAL_POSTS_QUERY_KEY,
    queryFn: () => container.socialWallRepository.getPosts(),
  });
}

export function usePostCommentsQuery(
  postId: string | null,
  enabled = true
) {
  return useQuery({
    queryKey: getSocialCommentsQueryKey(postId ?? ''),
    queryFn: () => container.socialWallRepository.getComments(postId as string),
    enabled: Boolean(postId) && enabled,
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
    onSuccess: (updatedPost) => {
      queryClient.setQueryData<SocialPost[]>(SOCIAL_POSTS_QUERY_KEY, (prev) =>
        prev
          ? prev.map((post) =>
              post.id === updatedPost.id ? updatedPost : post
            )
          : prev
      );
      queryClient.invalidateQueries({ queryKey: SOCIAL_POSTS_QUERY_KEY });
    },
  });
}

export function useCreateCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSocialCommentInput) =>
      container.createSocialCommentUseCase.execute(input),
    onSuccess: (result, variables) => {
      queryClient.setQueryData<SocialPost[]>(SOCIAL_POSTS_QUERY_KEY, (prev) =>
        prev
          ? prev.map((post) =>
              post.id === result.post.id ? result.post : post
            )
          : prev
      );
      queryClient.setQueryData<SocialComment[]>(
        getSocialCommentsQueryKey(variables.postId),
        (prev) => {
          if (!prev) return [result.comment];
          if (prev.some((c) => c.id === result.comment.id)) return prev;
          return [...prev, result.comment];
        }
      );
      queryClient.invalidateQueries({
        queryKey: getSocialCommentsQueryKey(variables.postId),
      });
      queryClient.invalidateQueries({ queryKey: SOCIAL_POSTS_QUERY_KEY });
    },
  });
}

export function useDeleteCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { postId: string; commentId: string }) =>
      container.socialWallRepository.deleteComment(params),
    onSuccess: (result, variables) => {
      queryClient.setQueryData<SocialPost[]>(SOCIAL_POSTS_QUERY_KEY, (prev) =>
        prev
          ? prev.map((post) =>
              post.id === result.post.id ? result.post : post
            )
          : prev
      );
      queryClient.setQueryData<SocialComment[]>(
        getSocialCommentsQueryKey(variables.postId),
        (prev) =>
          prev ? prev.filter((c) => c.id !== result.commentId) : prev
      );
      queryClient.invalidateQueries({
        queryKey: getSocialCommentsQueryKey(variables.postId),
      });
      queryClient.invalidateQueries({ queryKey: SOCIAL_POSTS_QUERY_KEY });
    },
  });
}

export function useSetFollowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { userId: string; following: boolean }) =>
      container.socialWallRepository.setFollow(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_POSTS_QUERY_KEY });
    },
  });
}
