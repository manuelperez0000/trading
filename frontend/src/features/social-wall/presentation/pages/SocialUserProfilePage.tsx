import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  FileText,
  Heart,
  Users,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useAuthStore } from '@features/auth/application/useAuthStore';
import {
  useCreateCommentMutation,
  useSetFollowMutation,
  useSocialUserProfileQuery,
  useToggleLikePostMutation,
} from '@features/social-wall/application/hooks/useSocialWall';
import type { SocialPost } from '@features/social-wall/domain/entities/SocialPost';
import { PostCard } from '@features/social-wall/presentation/components/PostCard';
import { PostCommentsModal } from '@features/social-wall/presentation/components/PostCommentsModal';
import { getInitials } from '@features/social-wall/presentation/utils/socialFormatters';

function formatMemberSince(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });
}

export const SocialUserProfilePage: React.FC = () => {
  const { userId = '' } = useParams<{ userId: string }>();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const profileQuery = useSocialUserProfileQuery(userId);
  const toggleLikeMutation = useToggleLikePostMutation();
  const createCommentMutation = useCreateCommentMutation();
  const setFollowMutation = useSetFollowMutation();

  const [openQuickCommentPostId, setOpenQuickCommentPostId] = useState<
    string | null
  >(null);
  const [quickCommentDrafts, setQuickCommentDrafts] = useState<
    Record<string, string>
  >({});
  const [quickCommentError, setQuickCommentError] = useState<string | null>(
    null
  );
  const [modalPostId, setModalPostId] = useState<string | null>(null);

  const handleToggleQuickComment = (postId: string) => {
    setQuickCommentError(null);
    setOpenQuickCommentPostId((prev) => (prev === postId ? null : postId));
  };

  const handleQuickCommentDraftChange = (postId: string, value: string) => {
    setQuickCommentDrafts((prev) => ({
      ...prev,
      [postId]: value,
    }));
    if (quickCommentError) setQuickCommentError(null);
  };

  const handleQuickCommentSubmit = (
    event: React.FormEvent,
    postId: string
  ) => {
    event.preventDefault();
    const draft = (quickCommentDrafts[postId] ?? '').trim();
    if (!draft) {
      setQuickCommentError('El comentario no puede estar vacío.');
      return;
    }

    setQuickCommentError(null);
    createCommentMutation.mutate(
      { postId, content: draft },
      {
        onSuccess: () => {
          setQuickCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
        },
        onError: (err) => {
          setQuickCommentError(err.message);
        },
      }
    );
  };

  const profile = profileQuery.data?.profile ?? null;
  const posts = profileQuery.data?.posts ?? [];
  const modalPost =
    posts.find((candidate) => candidate.id === modalPostId) ?? null;

  const actionError =
    toggleLikeMutation.error ?? setFollowMutation.error;

  const totalLikesReceived = posts.reduce(
    (total, post) => total + post.likesCount,
    0
  );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 pb-12">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/social"
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-emerald-400/50 hover:text-emerald-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al feed general
        </Link>
      </div>

      {profileQuery.isPending && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center text-sm text-slate-400">
          Cargando perfil del trader…
        </div>
      )}

      {profileQuery.isError && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-900/60 bg-slate-900/80 p-8 text-center"
        >
          <p className="text-base font-bold text-white">
            No pudimos cargar este perfil
          </p>
          <p className="mt-1.5 text-sm text-rose-300">
            {profileQuery.error.message}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/social"
              className="rounded-xl bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-300"
            >
              Ir a /social
            </Link>
            <button
              type="button"
              onClick={() => void profileQuery.refetch()}
              className="cursor-pointer rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      )}

      {profile && (
        <>
          <section
            aria-label={`Perfil de ${profile.username}`}
            className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-black/10 sm:p-6"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={`Avatar de ${profile.username}`}
                    className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-amber-400/30 sm:h-20 sm:w-20"
                  />
                ) : (
                  <div
                    aria-label={`Avatar de ${profile.username}`}
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-lg font-extrabold text-slate-950 ring-2 ring-amber-400/30 sm:h-20 sm:w-20 sm:text-xl"
                  >
                    {getInitials(profile.username)}
                  </div>
                )}

                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-xl font-extrabold text-white sm:text-2xl">
                      {profile.username}
                    </h1>
                    {profile.isMe && (
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                        Tu perfil
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-400">
                    {profile.handle}
                  </p>
                  {profile.createdAtIso && (
                    <p className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Miembro desde {formatMemberSince(profile.createdAtIso)}
                    </p>
                  )}
                </div>
              </div>

              {!profile.isMe && (!isAuthenticated || profile.id !== user.id) && (
                <div className="flex flex-col items-start gap-1.5 sm:items-end">
                  <button
                    type="button"
                    onClick={() =>
                      setFollowMutation.mutate({
                        userId: profile.id,
                        following: !profile.isFollowing,
                      })
                    }
                    disabled={!isAuthenticated || setFollowMutation.isPending}
                    aria-pressed={profile.isFollowing}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      profile.isFollowing
                        ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-300 hover:bg-emerald-400/25'
                        : 'border-emerald-400 bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                    }`}
                  >
                    {profile.isFollowing ? 'Siguiendo' : 'Seguir'}
                    {!profile.isFollowing && (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </button>
                  {!isAuthenticated && (
                    <span className="text-[11px] text-slate-500">
                      <Link
                        to="/auth/login"
                        className="font-semibold text-emerald-300 hover:text-emerald-200"
                      >
                        Inicia sesión
                      </Link>{' '}
                      para seguir
                    </span>
                  )}
                </div>
              )}
            </div>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-300">
              {profile.bio.trim()
                ? profile.bio
                : 'Trader miembro de la comunidad Trading Life Academy.'}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-800 pt-4 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 px-3.5 py-2.5">
                <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Users className="h-3.5 w-3.5 text-emerald-300" />
                  Seguidores
                </p>
                <p className="mt-1 text-base font-extrabold text-white">
                  {profile.followersCount.toLocaleString('es-ES')}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 px-3.5 py-2.5">
                <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Users className="h-3.5 w-3.5 text-sky-300" />
                  Siguiendo
                </p>
                <p className="mt-1 text-base font-extrabold text-white">
                  {profile.followingCount.toLocaleString('es-ES')}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 px-3.5 py-2.5">
                <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <FileText className="h-3.5 w-3.5 text-amber-300" />
                  Publicaciones
                </p>
                <p className="mt-1 text-base font-extrabold text-white">
                  {profile.postsCount.toLocaleString('es-ES')}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 px-3.5 py-2.5">
                <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Heart className="h-3.5 w-3.5 text-rose-400" />
                  Me gusta
                </p>
                <p className="mt-1 text-base font-extrabold text-white">
                  {totalLikesReceived.toLocaleString('es-ES')}
                </p>
              </div>
            </div>
          </section>

          <section
            aria-label={`Publicaciones de ${profile.username}`}
            className="space-y-4"
          >
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-bold text-white sm:text-xl">
                Publicaciones de {profile.username}
              </h2>
              <span className="text-xs text-slate-400">
                {posts.length}{' '}
                {posts.length === 1 ? 'publicación' : 'publicaciones'}
              </span>
            </div>

            {actionError && (
              <p
                role="alert"
                className="rounded-xl bg-rose-950/40 p-3 text-sm text-rose-300"
              >
                {actionError.message}
              </p>
            )}

            {posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-12 text-center">
                <p className="text-sm font-semibold text-slate-300">
                  Este usuario aún no tiene publicaciones.
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Cuando comparta actualizaciones o capturas aparecerán aquí.
                </p>
              </div>
            ) : (
              posts.map((post: SocialPost) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isAuthenticated={isAuthenticated}
                  currentUserId={user.id}
                  isLikePending={toggleLikeMutation.isPending}
                  isFollowPending={setFollowMutation.isPending}
                  isQuickCommentOpen={openQuickCommentPostId === post.id}
                  quickCommentDraft={quickCommentDrafts[post.id] ?? ''}
                  quickCommentError={
                    openQuickCommentPostId === post.id
                      ? quickCommentError
                      : null
                  }
                  isCreateCommentPending={createCommentMutation.isPending}
                  showFollowButton={false}
                  onToggleLike={(postId) => toggleLikeMutation.mutate(postId)}
                  onToggleFollow={(params) => setFollowMutation.mutate(params)}
                  onToggleQuickComment={handleToggleQuickComment}
                  onQuickCommentDraftChange={handleQuickCommentDraftChange}
                  onQuickCommentSubmit={handleQuickCommentSubmit}
                  onOpenCommentsModal={(postId) => setModalPostId(postId)}
                />
              ))
            )}
          </section>
        </>
      )}

      <PostCommentsModal
        post={modalPost}
        isAuthenticated={isAuthenticated}
        currentUserId={user.id}
        onClose={() => setModalPostId(null)}
      />
    </div>
  );
};
