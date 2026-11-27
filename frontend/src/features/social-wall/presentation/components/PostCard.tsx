import React from 'react';
import {
  ArrowUpRight,
  Heart,
  MessageCircle,
  Send,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SocialPost } from '@features/social-wall/domain/entities/SocialPost';
import {
  getInitials,
  getRelativeTime,
} from '@features/social-wall/presentation/utils/socialFormatters';

interface PostCardProps {
  post: SocialPost;
  isAuthenticated: boolean;
  currentUserId: string;
  isLikePending: boolean;
  isFollowPending: boolean;
  isQuickCommentOpen: boolean;
  quickCommentDraft: string;
  quickCommentError: string | null;
  isCreateCommentPending: boolean;
  showFollowButton?: boolean;
  onToggleLike: (postId: string) => void;
  onToggleFollow: (params: { userId: string; following: boolean }) => void;
  onToggleQuickComment: (postId: string) => void;
  onQuickCommentDraftChange: (postId: string, value: string) => void;
  onQuickCommentSubmit: (event: React.FormEvent, postId: string) => void;
  onOpenCommentsModal: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  isAuthenticated,
  currentUserId,
  isLikePending,
  isFollowPending,
  isQuickCommentOpen,
  quickCommentDraft,
  quickCommentError,
  isCreateCommentPending,
  showFollowButton = true,
  onToggleLike,
  onToggleFollow,
  onToggleQuickComment,
  onQuickCommentDraftChange,
  onQuickCommentSubmit,
  onOpenCommentsModal,
}) => {
  const authorProfilePath = `/social/user/${encodeURIComponent(post.authorId)}`;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg shadow-black/10">
      <div className="flex items-center gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <Link
          to={authorProfilePath}
          aria-label={`Ver perfil de ${post.authorName}`}
          className="group/author-avatar shrink-0 cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          {post.authorAvatarUrl ? (
            <img
              src={post.authorAvatarUrl}
              alt={`Foto de ${post.authorName}`}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-transparent transition group-hover/author-avatar:scale-105 group-hover/author-avatar:ring-emerald-400/60"
            />
          ) : (
            <div
              aria-label={`Foto de ${post.authorName}`}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-xs font-bold text-slate-950 ring-2 ring-transparent transition group-hover/author-avatar:scale-105 group-hover/author-avatar:ring-emerald-400/60"
            >
              {getInitials(post.authorName)}
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <Link
              to={authorProfilePath}
              className="cursor-pointer truncate text-sm font-bold text-slate-100 transition-colors hover:text-emerald-300"
            >
              {post.authorName}
            </Link>
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
          onClick={() => onToggleLike(post.id)}
          disabled={!isAuthenticated || isLikePending}
          aria-label={post.likedByMe ? 'Quitar me gusta' : 'Dar me gusta'}
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
            onClick={() => onToggleLike(post.id)}
            disabled={!isAuthenticated || isLikePending}
            aria-label={post.likedByMe ? 'Quitar me gusta' : 'Dar me gusta'}
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
            <span>{post.likesCount.toLocaleString('es-ES')} me gusta</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleQuickComment(post.id)}
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

        {showFollowButton && (!isAuthenticated || post.authorId !== currentUserId) && (
          <button
            type="button"
            onClick={() =>
              onToggleFollow({
                userId: post.authorId,
                following: !post.isFollowing,
              })
            }
            disabled={!isAuthenticated || isFollowPending}
            aria-pressed={post.isFollowing}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
              post.isFollowing
                ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                : 'border-slate-700 text-slate-300 hover:border-emerald-400/40 hover:text-emerald-300'
            }`}
          >
            {post.isFollowing ? 'Siguiendo' : 'Seguir'}
            {!post.isFollowing && <ArrowUpRight className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {(post.commentsCount > 0 || isQuickCommentOpen) && (
        <div className="border-t border-slate-800/70 px-4 py-2.5 sm:px-5">
          <button
            type="button"
            onClick={() => onOpenCommentsModal(post.id)}
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
              onSubmit={(event) => onQuickCommentSubmit(event, post.id)}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  value={quickCommentDraft}
                  onChange={(event) =>
                    onQuickCommentDraftChange(post.id, event.target.value)
                  }
                  placeholder="Escribe un comentario rápido..."
                  aria-label="Escribe un comentario rápido"
                  maxLength={2000}
                  disabled={isCreateCommentPending}
                  className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!quickCommentDraft.trim() || isCreateCommentPending}
                  aria-label="Enviar comentario rápido"
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="hidden sm:inline">
                    {isCreateCommentPending ? 'Enviando…' : 'Enviar'}
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
};
