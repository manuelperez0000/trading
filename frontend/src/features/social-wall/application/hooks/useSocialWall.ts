import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { container } from '@app/di/container';
import type {
  CreateSocialCommentInput,
  CreateSocialPostInput,
  SocialComment,
  SocialPost,
  SocialUserFeed,
} from '@features/social-wall/domain/entities/SocialPost';

export const SOCIAL_POSTS_QUERY_KEY = ['social-wall', 'posts'] as const;
export const SOCIAL_USER_PROFILES_ROOT_KEY = ['social-wall', 'users'] as const;

export function getSocialUserProfileQueryKey(userId: string) {
  return ['social-wall', 'users', userId, 'profile'] as const;
}

export function getSocialCommentsQueryKey(postId: string) {
  return ['social-wall', 'posts', postId, 'comments'] as const;
}

function syncUpdatedPostAcrossCaches(
  queryClient: QueryClient,
  updatedPost: SocialPost
): void {
  queryClient.setQueryData<SocialPost[]>(SOCIAL_POSTS_QUERY_KEY, (prev) =>
    prev
      ? prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
      : prev
  );
  queryClient.setQueriesData<SocialUserFeed>(
    { queryKey: SOCIAL_USER_PROFILES_ROOT_KEY },
    (prev) =>
      prev
        ? {
            ...prev,
            posts: prev.posts.map((post) =>
              post.id === updatedPost.id ? updatedPost : post
            ),
          }
        : prev
  );
}

export function useSocialPostsQuery() {
  return useQuery({
    queryKey: SOCIAL_POSTS_QUERY_KEY,
    queryFn: () => container.socialWallRepository.getPosts(),
  });
}

export function useSocialUserProfileQuery(userId: string) {
  return useQuery({
    queryKey: getSocialUserProfileQueryKey(userId),
    queryFn: () => container.socialWallRepository.getUserProfileFeed(userId),
    enabled: Boolean(userId),
    retry: false,
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
      queryClient.invalidateQueries({
        queryKey: SOCIAL_USER_PROFILES_ROOT_KEY,
      });
    },
  });
}

export function useToggleLikePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) =>
      container.socialWallRepository.toggleLike(postId),
    onSuccess: (updatedPost) => {
      syncUpdatedPostAcrossCaches(queryClient, updatedPost);
      queryClient.invalidateQueries({ queryKey: SOCIAL_POSTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: SOCIAL_USER_PROFILES_ROOT_KEY,
      });
    },
  });
}

export function useCreateCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSocialCommentInput) =>
      container.createSocialCommentUseCase.execute(input),
    onSuccess: (result, variables) => {
      syncUpdatedPostAcrossCaches(queryClient, result.post);
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
      queryClient.invalidateQueries({
        queryKey: SOCIAL_USER_PROFILES_ROOT_KEY,
      });
    },
  });
}

export function useDeleteCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { postId: string; commentId: string }) =>
      container.socialWallRepository.deleteComment(params),
    onSuccess: (result, variables) => {
      syncUpdatedPostAcrossCaches(queryClient, result.post);
      queryClient.setQueryData<SocialComment[]>(
        getSocialCommentsQueryKey(variables.postId),
        (prev) =>
          prev ? prev.filter((c) => c.id !== result.commentId) : prev
      );
      queryClient.invalidateQueries({
        queryKey: getSocialCommentsQueryKey(variables.postId),
      });
      queryClient.invalidateQueries({ queryKey: SOCIAL_POSTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: SOCIAL_USER_PROFILES_ROOT_KEY,
      });
    },
  });
}

export function useSetFollowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { userId: string; following: boolean }) =>
      container.socialWallRepository.setFollow(params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_POSTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: getSocialUserProfileQueryKey(variables.userId),
      });
    },
  });
}
