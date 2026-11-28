import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Heart,
  MessageCircle,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { ConfirmDialog } from '@shared/ui/ConfirmDialog';
import { toast } from '@shared/ui/toast/toastStore';
import { useAuthStore } from '@features/auth/application/useAuthStore';
import type { SocialPost } from '@features/social-wall/domain/entities/SocialPost';
import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useDeletePostMutation,
  usePostCommentsQuery,
  useSocialPostsQuery,
  useUpdatePostStatusMutation,
} from '@features/social-wall/application/hooks/useSocialWall';
import { PostCommentsModal } from '@features/social-wall/presentation/components/PostCommentsModal';
import {
  getInitials,
  getRelativeTime,
} from '@features/social-wall/presentation/utils/socialFormatters';

const POSTS_PER_PAGE = 25;

export const SocialModerationAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const isStrictAdmin = isAuthenticated && user.role === 'ADMIN';

  const postsQuery = useSocialPostsQuery();
  const updateStatusMutation = useUpdatePostStatusMutation();
  const deletePostMutation = useDeletePostMutation();
  const createCommentMutation = useCreateCommentMutation();
  const deleteCommentMutation = useDeleteCommentMutation();

  const [currentPage, setCurrentPage] = useState(1);
  const [modalPostId, setModalPostId] = useState<string | null>(null);
  const [deletingPost, setDeletingPost] = useState<SocialPost | null>(null);

  const posts = postsQuery.data ?? [];
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedPosts = useMemo(() => {
    const startIdx = (safePage - 1) * POSTS_PER_PAGE;
    return posts.slice(startIdx, startIdx + POSTS_PER_PAGE);
  }, [posts, safePage]);

  const modalPost = useMemo(
    () => posts.find((post) => post.id === modalPostId) ?? null,
    [posts, modalPostId]
  );

  const modalCommentsQuery = usePostCommentsQuery(
    modalPostId,
    Boolean(modalPostId)
  );

  if (!isStrictAdmin) {
    return (
      <Card className="p-8 text-center space-y-4 max-w-lg mx-auto mt-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/15 text-rose-400">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-white">
          Acceso Restringido — Solo Administradores
        </h1>
        <p className="text-sm text-slate-400">
          No tienes permisos para acceder al panel de moderación de la red social.
        </p>
        <div className="flex justify-center">
          <Button variant="primary" size="sm" onClick={() => navigate('/social')}>
            Volver a Red Social
          </Button>
        </div>
      </Card>
    );
  }

  const handleToggleStatus = (post: SocialPost) => {
    const nextStatus = !post.status;
    updateStatusMutation.mutate(
      { postId: post.id, status: nextStatus },
      {
        onSuccess: () => {
          toast.success(
            nextStatus ? 'Publicación activada' : 'Publicación desactivada',
            nextStatus
              ? 'La publicación vuelve a ser visible en /social.'
              : 'La publicación quedó oculta para los clientes en /social.'
          );
        },
        onError: (err) => {
          toast.danger(
            'Error al actualizar estado',
            err instanceof Error ? err.message : 'No se pudo cambiar el estado.'
          );
        },
      }
    );
  };

  const handleConfirmDelete = () => {
    if (!deletingPost) return;
    deletePostMutation.mutate(deletingPost.id, {
      onSuccess: () => {
        if (modalPostId === deletingPost.id) {
          setModalPostId(null);
        }
        setDeletingPost(null);
        toast.success(
          'Publicación eliminada',
          'El post fue eliminado permanentemente de la base de datos.'
        );
      },
      onError: (err) => {
        toast.danger(
          'Error al eliminar',
          err instanceof Error ? err.message : 'No se pudo eliminar el post.'
        );
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Moderación de Red Social
            </h1>
            <Badge variant="sky">{posts.length} Publicaciones</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Revisa todas las publicaciones de la comunidad, activa o desactiva su visibilidad en el feed y elimina contenido si es necesario.
          </p>
        </div>
      </div>

      {postsQuery.isLoading ? (
        <Card className="p-8 text-center text-sm text-slate-400">
          Cargando publicaciones para moderación...
        </Card>
      ) : postsQuery.isError ? (
        <Card className="p-8 text-center space-y-3">
          <p className="text-sm text-rose-400">
            No se pudieron cargar las publicaciones.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void postsQuery.refetch()}
          >
            Reintentar
          </Button>
        </Card>
      ) : posts.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-400">
          Aún no hay publicaciones registradas en la red social.
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedPosts.map((post) => (
              <Card
                key={post.id}
                className={`p-4 sm:p-5 transition-colors ${
                  post.status
                    ? 'border-slate-800'
                    : 'border-rose-500/30 bg-rose-950/10'
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Foto pequeña a mano izquierda si el post tiene imagen */}
                  {post.image && (
                    <div className="shrink-0">
                      <img
                        src={post.image}
                        alt={`Publicación de ${post.authorName}`}
                        className="h-28 w-28 sm:h-32 sm:w-32 rounded-xl object-cover border border-slate-800 bg-slate-950"
                      />
                    </div>
                  )}

                  {/* Contenido a la derecha */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {post.authorAvatarUrl ? (
                            <img
                              src={post.authorAvatarUrl}
                              alt={post.authorName}
                              className="h-8 w-8 rounded-full object-cover border border-slate-700"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15 text-xs font-bold text-amber-300 border border-amber-500/30">
                              {getInitials(post.authorName)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white truncate">
                              {post.authorName}
                            </div>
                            <div className="text-xs text-slate-400">
                              {getRelativeTime(post.createdAtIso)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant={post.status ? 'emerald' : 'rose'}>
                            {post.status ? 'Activa' : 'Inactiva'}
                          </Badge>
                          <Button
                            variant="secondary"
                            size="xs"
                            isLoading={
                              updateStatusMutation.isPending &&
                              updateStatusMutation.variables?.postId === post.id
                            }
                            onClick={() => handleToggleStatus(post)}
                            className={
                              post.status
                                ? 'border-amber-500/40 text-amber-300 hover:bg-amber-500/15'
                                : 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/15'
                            }
                          >
                            {post.status ? (
                              <>
                                <EyeOff className="h-3.5 w-3.5" />
                                Desactivar
                              </>
                            ) : (
                              <>
                                <Eye className="h-3.5 w-3.5" />
                                Activar
                              </>
                            )}
                          </Button>
                          <Button
                            variant="danger"
                            size="xs"
                            onClick={() => setDeletingPost(post)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Eliminar
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-slate-200 whitespace-pre-wrap break-words">
                        {post.text}
                      </p>
                    </div>

                    {/* Debajo del texto: Me gusta (solo lectura) y Comentarios (abribles) */}
                    <div className="flex items-center gap-4 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                      <span
                        className="inline-flex items-center gap-1.5 select-none"
                        title="Me gusta recibidos (solo lectura en moderación)"
                      >
                        <Heart className="h-4 w-4 text-rose-400" />
                        <span>{post.likesCount}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => setModalPostId(post.id)}
                        className="inline-flex items-center gap-1.5 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>
                          {post.commentsCount}{' '}
                          {post.commentsCount === 1
                            ? 'comentario'
                            : 'comentarios'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Paginación de 25 en 25 con botón Siguientes */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 text-xs text-slate-400">
            <div>
              Mostrando{' '}
              <span className="font-semibold text-white">
                {(safePage - 1) * POSTS_PER_PAGE + 1}
              </span>{' '}
              a{' '}
              <span className="font-semibold text-white">
                {Math.min(safePage * POSTS_PER_PAGE, posts.length)}
              </span>{' '}
              de{' '}
              <span className="font-semibold text-amber-400">
                {posts.length}
              </span>{' '}
              publicaciones (25 por página)
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="xs"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Anterior
              </Button>
              <span className="px-2 font-mono text-slate-300">
                Página {safePage} / {totalPages}
              </span>
              <Button
                variant="primary"
                size="xs"
                disabled={safePage >= totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                Siguientes
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Modal de Comentarios */}
      <PostCommentsModal
        post={modalPost}
        comments={modalCommentsQuery.data ?? []}
        isLoadingComments={modalCommentsQuery.isLoading}
        commentsError={
          modalCommentsQuery.error instanceof Error
            ? modalCommentsQuery.error.message
            : null
        }
        isAuthenticated={isAuthenticated}
        currentUserId={user.id}
        isSubmittingComment={createCommentMutation.isPending}
        isDeletingCommentId={
          deleteCommentMutation.isPending
            ? (deleteCommentMutation.variables?.commentId ?? null)
            : null
        }
        onClose={() => setModalPostId(null)}
        onSubmitComment={async (postId, content) => {
          await createCommentMutation.mutateAsync({ postId, content });
        }}
        onDeleteComment={async (postId, commentId) => {
          await deleteCommentMutation.mutateAsync({ postId, commentId });
        }}
      />

      {/* Confirmación de eliminación */}
      <ConfirmDialog
        open={deletingPost !== null}
        variant="danger"
        title="Eliminar publicación"
        description={
          deletingPost
            ? `¿Estás seguro de eliminar la publicación de ${deletingPost.authorName}? Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        isLoading={deletePostMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingPost(null)}
      />
    </div>
  );
};
