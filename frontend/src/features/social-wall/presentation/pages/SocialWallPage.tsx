import React, { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  ArrowUpRight,
  Heart,
  ImagePlus,
  Send,
  Users,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@features/auth/application/useAuthStore';
import {
  useCreateSocialPostMutation,
  useSetFollowMutation,
  useSocialPostsQuery,
  useToggleLikePostMutation,
} from '@features/social-wall/application/hooks/useSocialWall';
import type { SocialPost } from '@features/social-wall/domain/entities/SocialPost';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

function getRelativeTime(date: string): string {
  const elapsedMinutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  );

  if (elapsedMinutes < 1) return 'ahora mismo';
  if (elapsedMinutes < 60) {
    return `hace ${elapsedMinutes} ${elapsedMinutes === 1 ? 'minuto' : 'minutos'}`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return `hace ${elapsedHours} ${elapsedHours === 1 ? 'hora' : 'horas'}`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  return `hace ${elapsedDays} ${elapsedDays === 1 ? 'día' : 'días'}`;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

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
  const setFollowMutation = useSetFollowMutation();
  const posts = postsQuery.data ?? [];

  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

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
                aria-label="Cuéntanos tu experiencia"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Cuéntanos tu experiencia"
                rows={2}
                maxLength={5000}
                className="min-h-20 w-full resize-y border-0 bg-transparent py-1 text-lg font-medium text-slate-100 shadow-none outline-none ring-0 placeholder:text-slate-500 focus:border-0 focus:bg-transparent focus:shadow-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 sm:text-xl"
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
                  para publicar, dar me gusta y seguir perfiles.
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

          {posts.map((post: SocialPost) => (
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
                <span
                  className={`inline-flex items-center gap-2 text-sm ${
                    post.likedByMe ? 'text-rose-400' : 'text-slate-400'
                  }`}
                >
                  <Heart
                    className="h-4 w-4"
                    fill={post.likedByMe ? 'currentColor' : 'none'}
                  />
                  <span>{post.likesCount.toLocaleString('es-ES')} me gusta</span>
                </span>
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
            </article>
          ))}
        </section>
      </main>

      <div aria-hidden="true" className="w-72 shrink-0" />

      <aside
        aria-label="Personas que sigues"
        className="fixed right-0 top-14 z-20 h-[calc(100vh-3.5rem)] w-72 overflow-y-auto border-l border-slate-800 bg-slate-900/95 p-4 shadow-lg shadow-black/10"
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
    </div>
  );
};
