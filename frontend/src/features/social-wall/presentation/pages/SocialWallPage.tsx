import React, { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  ArrowUpRight,
  Heart,
  ImagePlus,
  MessageCircle,
  Send,
  Users,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@features/auth/application/useAuthStore';
import {
  useCreateCommentMutation,
  useCreateSocialPostMutation,
  useSetFollowMutation,
  useSocialPostsQuery,
  useToggleLikePostMutation,
} from '@features/social-wall/application/hooks/useSocialWall';
import type { SocialPost } from '@features/social-wall/domain/entities/SocialPost';
import { PostCommentsModal } from '@features/social-wall/presentation/components/PostCommentsModal';
import {
  getInitials,
  getRelativeTime,
} from '@features/social-wall/presentation/utils/socialFormatters';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

function getErrorMessage(error: Error | null): string | null {
  return error?.message ?? null;
}

export const SocialWallPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const composerName = isAuthenticated ? user.fullName : 'Visitante';
  const postsQuery = useSocialPostsQuery();
  const createPostMutation = useCreateSocialPostMutation();
  const toggleLikeMutation = useToggleLikePostMutation();
  const createCommentMutation = useCreateCommentMutation();
  const setFollowMutation = useSetFollowMutation();
  const posts = postsQuery.data ?? [];

  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const composerTextareaRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    composerTextareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!imagePreview) return undefined;
    return () => URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageError('La imagen no puede superar los 5 MB.');
      return;
    }

    setImageError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handlePublish = () => {
    createPostMutation.mutate(
      { text: content, image: imageFile ?? undefined },
      {
        onSuccess: () => {
          setContent('');
          setImageFile(null);
          setImagePreview(null);
          setImageError('');
        },
      }
    );
  };

  const handleToggleQuickComment = (postId: string) => {
    setQuickCommentError(null);
    setOpenQuickCommentPostId((prev) => (prev === postId ? null : postId));
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

  const modalPost =
    posts.find((candidate) => candidate.id === modalPostId) ?? null;

  const followedProfiles = posts
    .filter(
      (post, index, allPosts) =>
        post.isFollowing &&
        allPosts.findIndex((candidate) => candidate.authorId === post.authorId) ===
          index
    )
    .map((profile) => ({
      ...profile,
      totalLikes: posts
        .filter((post) => post.authorId === profile.authorId)
        .reduce((total, post) => total + post.likesCount, 0),
    }));

  const actionError =
    createPostMutation.error ??
    toggleLikeMutation.error ??
    setFollowMutation.error;

  return (
    <div className="mx-auto flex w-full max-w-7xl items-start gap-6 pb-10">
      <main className="min-w-0 flex-1 space-y-8">
        <section
          aria-label="Crear publicación"
          className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-black/10 sm:p-5"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <div
              aria-label={`Foto de ${composerName}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-sm font-bold text-slate-950 ring-2 ring-amber-400/20"
            >
              {getInitials(composerName)}
            </div>
            <div className="min-w-0 flex-1">
              <textarea
                ref={composerTextareaRef}
                aria-label="Cuéntanos tu experiencia"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Cuéntanos tu experiencia"
                rows={2}
                maxLength={5000}
                className="min-h-20 w-full resize-y rounded-xl border border-slate-700/70 bg-slate-800/55 px-4 py-3 text-base font-medium text-slate-100 shadow-inner shadow-black/5 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-400/60 focus:bg-slate-800/75 focus:outline-none focus:ring-0 sm:text-lg"
              />
              {imageError && (
                <p role="alert" className="mt-2 text-xs text-rose-300">
                  {imageError}
                </p>
              )}
              {imagePreview && (
                <div className="relative mt-3 inline-block">
                  <img
                    src={imagePreview}
                    alt="Vista previa de la imagen para publicar"
                    className="max-h-56 max-w-full rounded-xl border border-slate-700 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      setImageError('');
                    }}
                    aria-label="Quitar imagen"
                    className="absolute -right-2 -top-2 rounded-full border border-slate-700 bg-slate-950 p-1.5 text-slate-300 transition hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              aria-label="Subir una foto"
              title="Subir una foto"
              disabled={!isAuthenticated || createPostMutation.isPending}
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-emerald-300 transition hover:border-emerald-400/50 hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ImagePlus className="h-5 w-5" />
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
            <span className="text-xs text-slate-500">
              {isAuthenticated ? (
                'Comparte texto, una foto o ambos.'
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className="font-semibold text-emerald-300 hover:text-emerald-200"
                  >
                    Inicia sesión
                  </Link>{' '}
                  para publicar, dar me gusta, comentar y seguir perfiles.
                </>
              )}
            </span>
            <button
              type="button"
              onClick={handlePublish}
              disabled={
                !isAuthenticated ||
                (!content.trim() && !imageFile) ||
                createPostMutation.isPending
              }
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {createPostMutation.isPending ? 'Publicando…' : 'Publicar'}
              <Send className="h-4 w-4" />
            </button>
          </div>
          {getErrorMessage(createPostMutation.error) && (
            <p role="alert" className="mt-3 text-sm text-rose-300">
              {getErrorMessage(createPostMutation.error)}
            </p>
          )}
        </section>

        <section
          aria-label="Publicaciones de la comunidad"
          className="space-y-4 social-wall-spacing"
        >
          <div className="flex items-end justify-between px-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
                En el feed
              </p>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                Últimos posts de la comunidad
              </h2>
            </div>
            <span className="hidden items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {posts.length} publicaciones
            </span>
          </div>

          {postsQuery.isPending && (
            <p className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-center text-sm text-slate-400">
              Cargando publicaciones…
            </p>
          )}
          {postsQuery.isError && (
            <div
              role="alert"
              className="rounded-2xl border border-rose-900/60 bg-slate-900/80 p-6 text-center"
            >
              <p className="text-sm text-rose-300">
                {postsQuery.error.message}
              </p>
              <button
                type="button"
                onClick={() => void postsQuery.refetch()}
                className="mt-3 text-sm font-semibold text-emerald-300 hover:text-emerald-200"
              >
                Intentar de nuevo
              </button>
            </div>
          )}
          {actionError && (
            <p role="alert" className="rounded-xl bg-rose-950/40 p-3 text-sm text-rose-300">
              {actionError.message}
            </p>
          )}
          {!postsQuery.isPending && !postsQuery.isError && posts.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-700 px-4 py-10 text-center text-sm text-slate-400">
              Aún no hay publicaciones. ¡Comparte la primera!
            </p>
          )}

          {posts.map((post: SocialPost) => {
            const isQuickCommentOpen = openQuickCommentPostId === post.id;
            const draftValue = quickCommentDrafts[post.id] ?? '';

            return (
              <article
                key={post.id}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg shadow-black/10"
              >
                <div className="flex items-center gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
                  <div
                    aria-label={`Foto de ${post.authorName}`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-xs font-bold text-slate-950"
                  >
                    {getInitials(post.authorName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <h3 className="truncate text-sm font-bold text-slate-100">
                        {post.authorName}
                      </h3>
                      <span className="text-xs text-slate-500">
                        {getRelativeTime(post.createdAtIso)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {post.authorHandle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleLikeMutation.mutate(post.id)}
                    disabled={!isAuthenticated || toggleLikeMutation.isPending}
                    aria-label={
                      post.likedByMe ? 'Quitar me gusta' : 'Dar me gusta'
                    }
                    aria-pressed={post.likedByMe}
                    className={`rounded-full p-2.5 transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      post.likedByMe
                        ? 'bg-rose-500/10 text-rose-400'
                        : 'text-slate-500 hover:bg-rose-500/10 hover:text-rose-400'
                    }`}
                  >
                    <Heart
                      className="h-5 w-5"
                      fill={post.likedByMe ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>

                {post.text && (
                  <p className="whitespace-pre-wrap px-4 pb-4 pt-4 text-sm leading-6 text-slate-300 sm:px-5">
                    {post.text}
                  </p>
                )}

                {post.image && (
                  <img
                    src={post.image}
                    alt={`Imagen compartida por ${post.authorName}`}
                    className="max-h-[460px] w-full border-y border-slate-800 bg-slate-950 object-cover"
                  />
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => toggleLikeMutation.mutate(post.id)}
                      disabled={!isAuthenticated || toggleLikeMutation.isPending}
                      aria-label={
                        post.likedByMe ? 'Quitar me gusta' : 'Dar me gusta'
                      }
                      aria-pressed={post.likedByMe}
                      className={`inline-flex cursor-pointer items-center gap-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        post.likedByMe
                          ? 'text-rose-400'
                          : 'text-slate-400 hover:text-rose-400'
                      }`}
                    >
                      <Heart
                        className="h-4 w-4"
                        fill={post.likedByMe ? 'currentColor' : 'none'}
                      />
                      <span>
                        {post.likesCount.toLocaleString('es-ES')} me gusta
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleQuickComment(post.id)}
                      aria-expanded={isQuickCommentOpen}
                      aria-label="Comentar publicación"
                      className={`inline-flex cursor-pointer items-center gap-2 text-sm transition ${
                        isQuickCommentOpen
                          ? 'text-emerald-300'
                          : 'text-slate-400 hover:text-emerald-300'
                      }`}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>
                        {post.commentsCount.toLocaleString('es-ES')}{' '}
                        {post.commentsCount === 1 ? 'comentario' : 'comentarios'}
                      </span>
                    </button>
                  </div>

                  {(!isAuthenticated || post.authorId !== user.id) && (
                    <button
                      type="button"
                      onClick={() =>
                        setFollowMutation.mutate({
                          userId: post.authorId,
                          following: !post.isFollowing,
                        })
                      }
                      disabled={!isAuthenticated || setFollowMutation.isPending}
                      aria-pressed={post.isFollowing}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                        post.isFollowing
                          ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                          : 'border-slate-700 text-slate-300 hover:border-emerald-400/40 hover:text-emerald-300'
                      }`}
                    >
                      {post.isFollowing ? 'Siguiendo' : 'Seguir'}
                      {!post.isFollowing && (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {(post.commentsCount > 0 || isQuickCommentOpen) && (
                  <div className="border-t border-slate-800/70 px-4 py-2.5 sm:px-5">
                    <button
                      type="button"
                      onClick={() => setModalPostId(post.id)}
                      className="cursor-pointer text-xs font-semibold text-slate-400 transition hover:text-emerald-300"
                    >
                      {post.commentsCount === 0
                        ? 'Abrir vista de comentarios'
                        : post.commentsCount === 1
                          ? 'Ver 1 comentario'
                          : `Ver los ${post.commentsCount.toLocaleString('es-ES')} comentarios`}
                    </button>
                  </div>
                )}

                {isQuickCommentOpen && (
                  <div className="border-t border-slate-800/80 bg-slate-950/50 px-4 py-3 sm:px-5">
                    {isAuthenticated ? (
                      <form
                        onSubmit={(event) =>
                          handleQuickCommentSubmit(event, post.id)
                        }
                        className="space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            autoFocus
                            value={draftValue}
                            onChange={(event) => {
                              const value = event.target.value;
                              setQuickCommentDrafts((prev) => ({
                                ...prev,
                                [post.id]: value,
                              }));
                              if (quickCommentError) setQuickCommentError(null);
                            }}
                            placeholder="Escribe un comentario rápido..."
                            aria-label="Escribe un comentario rápido"
                            maxLength={2000}
                            disabled={createCommentMutation.isPending}
                            className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none disabled:opacity-50"
                          />
                          <button
                            type="submit"
                            disabled={
                              !draftValue.trim() ||
                              createCommentMutation.isPending
                            }
                            aria-label="Enviar comentario rápido"
                            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <span className="hidden sm:inline">
                              {createCommentMutation.isPending
                                ? 'Enviando…'
                                : 'Enviar'}
                            </span>
                            <Send className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {quickCommentError && (
                          <p role="alert" className="text-xs text-rose-300">
                            {quickCommentError}
                          </p>
                        )}
                      </form>
                    ) : (
                      <p className="text-xs text-slate-400">
                        <Link
                          to="/auth/login"
                          className="font-semibold text-emerald-300 hover:text-emerald-200"
                        >
                          Inicia sesión
                        </Link>{' '}
                        para comentar en esta publicación.
                      </p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </main>

      <div aria-hidden="true" className="hidden w-72 shrink-0 lg:block" />

      <aside
        aria-label="Personas que sigues"
        className="fixed right-0 top-14 z-20 hidden h-[calc(100vh-3.5rem)] w-72 overflow-y-auto border-l border-slate-800 bg-slate-900/95 p-4 shadow-lg shadow-black/10 lg:block"
      >
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <Heart className="h-5 w-5 fill-rose-400 text-rose-400" />
          Siguiendo
        </h2>

        {followedProfiles.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-slate-700 px-3 py-8 text-center text-sm leading-6 text-slate-400">
            Aún no sigues a nadie.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {followedProfiles.map((profile) => (
              <li key={profile.authorId} className="p-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-xs font-bold text-slate-950">
                    {getInitials(profile.authorName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-100">
                      {profile.authorName}
                    </p>
                    <div className="mt-1 flex items-center gap-4 text-xs text-slate-400">
                      <span
                        className="inline-flex items-center gap-1"
                        aria-label={`${profile.followersCount} seguidores`}
                        title={`${profile.followersCount.toLocaleString('es-ES')} seguidores`}
                      >
                        <Users className="h-3.5 w-3.5 text-emerald-300" />
                        {profile.followersCount.toLocaleString('es-ES')}
                      </span>
                      <span
                        className="inline-flex items-center gap-1"
                        aria-label={`${profile.followingCount} seguidos`}
                        title={`${profile.followingCount.toLocaleString('es-ES')} seguidos`}
                      >
                        <Users className="h-3.5 w-3.5 text-sky-300" />
                        {profile.followingCount.toLocaleString('es-ES')}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 text-rose-300"
                        aria-label={`${profile.totalLikes} me gusta`}
                        title={`${profile.totalLikes.toLocaleString('es-ES')} me gusta`}
                      >
                        <Heart className="h-3.5 w-3.5 fill-current" />
                        {profile.totalLikes.toLocaleString('es-ES')}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <PostCommentsModal
        post={modalPost}
        isAuthenticated={isAuthenticated}
        currentUserId={user.id}
        onClose={() => setModalPostId(null)}
      />
    </div>
  );
};
