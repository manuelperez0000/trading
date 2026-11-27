import React, { useEffect, useRef, useState } from 'react';
import { Heart, MessageCircle, Send, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
  usePostCommentsQuery,
} from '@features/social-wall/application/hooks/useSocialWall';
import type { SocialPost } from '@features/social-wall/domain/entities/SocialPost';
import {
  getInitials,
  getRelativeTime,
} from '@features/social-wall/presentation/utils/socialFormatters';

interface PostCommentsModalProps {
  post: SocialPost | null;
  isAuthenticated: boolean;
  currentUserId: string;
  onClose: () => void;
}

export const PostCommentsModal: React.FC<PostCommentsModalProps> = ({
  post,
  isAuthenticated,
  currentUserId,
  onClose,
}) => {
  const [commentText, setCommentText] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const commentsEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const commentsQuery = usePostCommentsQuery(post?.id ?? null, Boolean(post));
  const createCommentMutation = useCreateCommentMutation();
  const deleteCommentMutation = useDeleteCommentMutation();

  const comments = commentsQuery.data ?? [];

  useEffect(() => {
    if (!post) return undefined;
    setCommentText('');
    setLocalError(null);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [post?.id, onClose]);

  useEffect(() => {
    if (!post) return;
    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => window.clearTimeout(focusTimer);
  }, [post?.id]);

  useEffect(() => {
    if (comments.length > 0) {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [comments.length]);

  if (!post) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) {
      setLocalError('Escribe un comentario antes de enviar.');
      return;
    }

    setLocalError(null);
    createCommentMutation.mutate(
      { postId: post.id, content: trimmed },
      {
        onSuccess: () => {
          setCommentText('');
        },
        onError: (err) => {
          setLocalError(err.message);
        },
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-comments-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/60 md:h-[min(640px,88vh)]">
        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[290px_1fr] lg:grid-cols-[320px_1fr]">
          {/* Parte superior izquierda: miniatura de imagen o vista compacta del post */}
          <aside className="flex flex-col border-b border-slate-800 bg-slate-950/70 p-4 md:border-b-0 md:border-r md:overflow-y-auto">
            <div className="mb-3 flex items-center justify-between md:hidden">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Publicación
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar modal de comentarios"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {post.image ? (
              <div className="flex items-start gap-3 md:flex-col">
                <img
                  src={post.image}
                  alt={`Miniatura de la publicación de ${post.authorName}`}
                  className="h-24 w-24 shrink-0 rounded-xl border border-slate-800 bg-slate-950 object-cover sm:h-28 sm:w-28 md:h-48 md:w-full"
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-[11px] font-bold text-slate-950">
                      {getInitials(post.authorName)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-100">
                        {post.authorName}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {post.authorHandle} · {getRelativeTime(post.createdAtIso)}
                      </p>
                    </div>
                  </div>
                  {post.text && (
                    <p className="line-clamp-3 md:line-clamp-6 whitespace-pre-wrap text-xs leading-5 text-slate-300">
                      {post.text}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-800/90 bg-slate-900/90 p-3.5 md:flex-1">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-xs font-bold text-slate-950">
                      {getInitials(post.authorName)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-100">
                        {post.authorName}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {post.authorHandle} · {getRelativeTime(post.createdAtIso)}
                      </p>
                    </div>
                  </div>
                  <p className="line-clamp-4 md:line-clamp-none whitespace-pre-wrap text-sm leading-6 text-slate-200">
                    {post.text}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-3 hidden items-center gap-4 border-t border-slate-800/80 pt-3 text-xs text-slate-400 md:flex">
              <span
                className={`inline-flex items-center gap-1.5 ${
                  post.likedByMe ? 'text-rose-400' : ''
                }`}
              >
                <Heart
                  className="h-3.5 w-3.5"
                  fill={post.likedByMe ? 'currentColor' : 'none'}
                />
                {post.likesCount.toLocaleString('es-ES')} me gusta
              </span>
              <span className="inline-flex items-center gap-1.5 text-emerald-300">
                <MessageCircle className="h-3.5 w-3.5" />
                {post.commentsCount.toLocaleString('es-ES')}{' '}
                {post.commentsCount === 1 ? 'comentario' : 'comentarios'}
              </span>
            </div>
          </aside>

          {/* Columna derecha: lista cronológica con scroll interno + input abajo */}
          <section className="flex min-h-0 flex-1 flex-col bg-slate-900">
            <header className="hidden shrink-0 items-center justify-between border-b border-slate-800 px-5 py-3.5 md:flex">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <h2
                  id="post-comments-modal-title"
                  className="text-sm font-bold text-white"
                >
                  Comentarios ({post.commentsCount.toLocaleString('es-ES')})
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar modal de comentarios"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="min-h-[200px] flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
              {commentsQuery.isPending && (
                <p className="py-8 text-center text-sm text-slate-400">
                  Cargando comentarios…
                </p>
              )}

              {commentsQuery.isError && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-900/60 bg-rose-950/30 p-4 text-center"
                >
                  <p className="text-sm text-rose-300">
                    {commentsQuery.error.message}
                  </p>
                  <button
                    type="button"
                    onClick={() => void commentsQuery.refetch()}
                    className="mt-2 text-xs font-semibold text-emerald-300 hover:text-emerald-200 cursor-pointer"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              )}

              {!commentsQuery.isPending &&
                !commentsQuery.isError &&
                comments.length === 0 && (
                  <div className="flex h-full min-h-[160px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 px-4 py-8 text-center">
                    <MessageCircle className="h-7 w-7 text-slate-600" />
                    <p className="mt-2 text-sm font-medium text-slate-300">
                      Aún no hay comentarios
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Sé el primero en compartir tu opinión sobre esta publicación.
                    </p>
                  </div>
                )}

              {comments.map((comment) => {
                const canDelete =
                  isAuthenticated &&
                  (comment.authorId === currentUserId ||
                    post.authorId === currentUserId);

                return (
                  <div
                    key={comment.id}
                    className="group flex items-start gap-3 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3"
                  >
                    {comment.authorAvatarUrl ? (
                      <img
                        src={comment.authorAvatarUrl}
                        alt={`Avatar de ${comment.authorName}`}
                        className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-slate-700"
                      />
                    ) : (
                      <div
                        aria-label={`Avatar de ${comment.authorName}`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-[11px] font-bold text-slate-950"
                      >
                        {getInitials(comment.authorName)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                          <Link
                            to={`/social/user/${encodeURIComponent(comment.authorId)}`}
                            onClick={onClose}
                            className="cursor-pointer truncate text-xs font-bold text-slate-100 transition-colors hover:text-emerald-300"
                          >
                            {comment.authorName}
                          </Link>
                          <span className="text-[11px] text-slate-500">
                            {getRelativeTime(comment.createdAtIso)}
                          </span>
                        </div>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() =>
                              deleteCommentMutation.mutate({
                                postId: post.id,
                                commentId: comment.id,
                              })
                            }
                            disabled={deleteCommentMutation.isPending}
                            aria-label="Eliminar comentario"
                            title="Eliminar comentario"
                            className="rounded-md p-1 text-slate-500 opacity-80 transition hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100 disabled:opacity-40 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-5 text-slate-300">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                );
              })}

              <div ref={commentsEndRef} />
            </div>

            {/* Input inferior para comentar dentro del modal */}
            <div className="shrink-0 border-t border-slate-800 bg-slate-950/70 p-3 sm:p-4">
              {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={commentText}
                      onChange={(event) => {
                        setCommentText(event.target.value);
                        if (localError) setLocalError(null);
                      }}
                      placeholder="Escribe un comentario..."
                      aria-label="Escribe un comentario"
                      maxLength={2000}
                      disabled={createCommentMutation.isPending}
                      className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={
                        !commentText.trim() || createCommentMutation.isPending
                      }
                      aria-label="Enviar comentario"
                      className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-400 px-3.5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className="hidden sm:inline">
                        {createCommentMutation.isPending ? 'Enviando…' : 'Enviar'}
                      </span>
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  {(localError || deleteCommentMutation.error) && (
                    <p role="alert" className="text-xs text-rose-300">
                      {localError ?? deleteCommentMutation.error?.message}
                    </p>
                  )}
                </form>
              ) : (
                <p className="text-center text-xs text-slate-400">
                  <Link
                    to="/auth/login"
                    onClick={onClose}
                    className="font-semibold text-emerald-300 hover:text-emerald-200"
                  >
                    Inicia sesión
                  </Link>{' '}
                  para agregar comentarios a esta publicación.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
