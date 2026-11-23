import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  CheckCircle,
  Heart,
  Lock,
  MessageSquare,
  Pin,
  PlusCircle,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { StatCard } from '@shared/ui/StatCard';
import { useI18n } from '@core/i18n/useLanguageStore';
import { useAuthStore } from '@features/auth/application/useAuthStore';
import { toast } from '@shared/ui/toast/toastStore';
import { formatRelativeTime, formatUsd } from '@shared/utils/formatters';
import {
  useAddCommentMutation,
  useCreateSocialPostMutation,
  useModeratePostMutation,
  useSocialPostsQuery,
  useToggleLikePostMutation,
  useTogglePinPostMutation,
} from '@features/social-wall/application/hooks/useSocialWall';
import type { VerificationType } from '@features/social-wall/domain/entities/SocialPost';

export const SocialWallPage: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { data: posts = [], isLoading } = useSocialPostsQuery();
  const createPostMutation = useCreateSocialPostMutation();
  const toggleLikeMutation = useToggleLikePostMutation();
  const addCommentMutation = useAddCommentMutation();
  const moderateMutation = useModeratePostMutation();
  const togglePinMutation = useTogglePinPostMutation();

  const [isAdminModerationMode, setIsAdminModerationMode] = useState(false);
  const [filterType, setFilterType] = useState<
    'ALL' | 'API_VERIFIED' | 'PINNED' | 'PENDING_MODERATION'
  >('ALL');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Estado del formulario de nuevo testimonio y ganancia
  const [authorName, setAuthorName] = useState('Carlos Trader');
  const [authorHandle, setAuthorHandle] = useState('@carlos_nt8');
  const [instrument, setInstrument] = useState('NQ 12-26');
  const [strategyUsed, setStrategyUsed] = useState('QuantumOrderFlowScalperV4');
  const [profitUsd, setProfitUsd] = useState(1250);
  const [profitTicks, setProfitTicks] = useState(84);
  const [tradesCount, setTradesCount] = useState(5);
  const [chartSummaryTag, setChartSummaryTag] = useState(
    'Sesión NY • +84 Ticks en NQ sin drawdown'
  );
  const [testimonialText, setTestimonialText] = useState('');
  const [verificationType, setVerificationType] =
    useState<VerificationType>('API_VERIFIED_NT8');
  const [formError, setFormError] = useState<string | null>(null);

  // Comentarios por post
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>(
    {}
  );

  const visiblePosts = useMemo(() => {
    const filtered = posts.filter((post) => {
      if (!isAdminModerationMode && post.moderationStatus !== 'APPROVED') {
        return false;
      }
      if (filterType === 'API_VERIFIED') {
        return post.verificationType === 'API_VERIFIED_NT8';
      }
      if (filterType === 'PINNED') {
        return post.isPinned;
      }
      if (filterType === 'PENDING_MODERATION') {
        return post.moderationStatus === 'PENDING_REVIEW';
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return (
        new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime()
      );
    });
  }, [posts, isAdminModerationMode, filterType]);

  const stats = useMemo(() => {
    const approved = posts.filter((p) => p.moderationStatus === 'APPROVED');
    const totalVerifiedUsd = approved.reduce((sum, p) => sum + p.profitUsd, 0);
    const apiVerifiedCount = approved.filter(
      (p) => p.verificationType === 'API_VERIFIED_NT8'
    ).length;
    const pendingReviewCount = posts.filter(
      (p) => p.moderationStatus === 'PENDING_REVIEW'
    ).length;

    return {
      totalVerifiedUsd,
      apiVerifiedCount,
      approvedCount: approved.length,
      pendingReviewCount,
    };
  }, [posts]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      await createPostMutation.mutateAsync({
        authorName,
        authorHandle,
        instrument,
        strategyUsed,
        profitUsd: Number(profitUsd),
        profitTicks: Number(profitTicks),
        tradesCount: Number(tradesCount),
        testimonialText,
        chartSummaryTag,
        verificationType,
      });
      setTestimonialText('');
      setShowCreateForm(false);
      toast.success(t.toast.postPublished, t.toast.postPublishedDesc);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Error al publicar testimonio.'
      );
    }
  };

  const handleSendComment = (postId: string) => {
    if (!isAuthenticated) {
      toast.info(
        'Inicia sesión para comentar',
        'La lectura del muro es pública, pero debes iniciar sesión para publicar comentarios.'
      );
      navigate('/auth/login?redirect=/social');
      return;
    }
    const text = (commentDrafts[postId] || '').trim();
    if (!text) return;

    addCommentMutation.mutate({
      postId,
      authorName: isAdminModerationMode
        ? 'Admin Oficial Trading Life Academy'
        : user.fullName || 'Trader Comunidad',
      content: text,
    });

    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleToggleCreateForm = () => {
    if (!isAuthenticated) {
      toast.info(
        'Inicia sesión para publicar en el muro',
        'Necesitas una cuenta activa para compartir tus resultados y testimonios.'
      );
      navigate('/auth/login?redirect=/social');
      return;
    }
    setShowCreateForm((prev) => !prev);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera de la Red Social */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {t.social.title}
            </h1>
            <Badge variant="emerald" pulse>
              {t.social.badge}
            </Badge>
            {!isAuthenticated && (
              <Badge variant="amber">Lectura Pública • Sin Login</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {t.social.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isAuthenticated && user.role === 'ADMIN' && (
            <Button
              variant={isAdminModerationMode ? 'warning' : 'secondary'}
              size="md"
              onClick={() => setIsAdminModerationMode((prev) => !prev)}
            >
              <ShieldCheck className="h-4 w-4" />
              {isAdminModerationMode
                ? `${t.social.moderationActive} (${stats.pendingReviewCount})`
                : t.social.enableModeration}
            </Button>
          )}

          <Button
            variant="primary"
            size="md"
            onClick={handleToggleCreateForm}
          >
            {isAuthenticated ? (
              <PlusCircle className="h-4 w-4" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            {showCreateForm
              ? t.social.closeFormBtn
              : isAuthenticated
              ? t.social.newPostBtn
              : 'Publicar Resultado (Requiere Login)'}
          </Button>
        </div>
      </div>

      {/* KPIs del Muro Social */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Ganancias Compartidas en el Muro"
          value={formatUsd(stats.totalVerifiedUsd, true)}
          subtitle="Suma de sesiones aprobadas en la comunidad"
          icon={<TrendingUp className="h-5 w-5 text-emerald-400" />}
          accent="emerald"
        />
        <StatCard
          title="Reportes Verificados por API NT8"
          value={`${stats.apiVerifiedCount} / ${stats.approvedCount}`}
          subtitle="Certificados con firma de ejecución de NinjaTrader"
          icon={<Award className="h-5 w-5 text-sky-400" />}
          accent="sky"
        />
        <StatCard
          title="Cola de Moderación Admin"
          value={stats.pendingReviewCount}
          subtitle={
            stats.pendingReviewCount > 0
              ? 'Testimonios esperando aprobación'
              : 'Todos los testimonios están al día'
          }
          icon={<Sparkles className="h-5 w-5 text-amber-400" />}
          accent="amber"
        />
      </div>

      {/* Formulario Desplegable para Publicar Ganancia / Testimonio */}
      {showCreateForm && (
        <Card className="p-5 border-emerald-500/40">
          <h2 className="text-base font-bold text-white mb-4">
            Publicar Nuevo Testimonio y Resultado de Sesión
          </h2>
          <form onSubmit={handleCreatePost} className="space-y-4">
            {formError && (
              <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Nombre del Trader
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Usuario / Handle
                </label>
                <input
                  type="text"
                  value={authorHandle}
                  onChange={(e) => setAuthorHandle(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Instrumento (Futuros)
                </label>
                <select
                  value={instrument}
                  onChange={(e) => setInstrument(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                >
                  <option value="NQ 12-26">NQ 12-26 (E-mini Nasdaq)</option>
                  <option value="ES 12-26">ES 12-26 (E-mini S&P 500)</option>
                  <option value="MNQ 12-26">MNQ 12-26 (Micro Nasdaq)</option>
                  <option value="GC 12-26">GC 12-26 (Gold Futures)</option>
                  <option value="CL 12-26">CL 12-26 (Crude Oil)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Estrategia / Bot Utilizado
                </label>
                <input
                  type="text"
                  value={strategyUsed}
                  onChange={(e) => setStrategyUsed(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Ganancia Neta (USD)
                </label>
                <input
                  type="number"
                  step="0.25"
                  value={profitUsd}
                  onChange={(e) => setProfitUsd(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-mono text-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Puntos / Ticks Capturados
                </label>
                <input
                  type="number"
                  value={profitTicks}
                  onChange={(e) => setProfitTicks(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-mono text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Número de Operaciones
                </label>
                <input
                  type="number"
                  min={1}
                  value={tradesCount}
                  onChange={(e) => setTradesCount(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Tipo de Verificación
                </label>
                <select
                  value={verificationType}
                  onChange={(e) =>
                    setVerificationType(e.target.value as VerificationType)
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-emerald-300"
                >
                  <option value="API_VERIFIED_NT8">
                    Verificado por API NinjaTrader 8
                  </option>
                  <option value="COMMUNITY_SCREENSHOT">
                    Testimonio Manual / Captura
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Titular de la Captura / Resumen de Ejecución
              </label>
              <input
                type="text"
                value={chartSummaryTag}
                onChange={(e) => setChartSummaryTag(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Testimonio de la Sesión (mínimo 12 caracteres)
              </label>
              <textarea
                rows={3}
                value={testimonialText}
                onChange={(e) => setTestimonialText(e.target.value)}
                placeholder="Comparte cómo se comportó la estrategia hoy, gestión de riesgo o retiro aprobado..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCreateForm(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={createPostMutation.isPending}
              >
                Publicar en el Muro Social
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filtros del Feed */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { id: 'ALL', label: 'Todos los Testimonios' },
            { id: 'API_VERIFIED', label: 'Verificados por API NT8' },
            { id: 'PINNED', label: 'Destacados por Admin' },
            ...(isAdminModerationMode
              ? [
                  {
                    id: 'PENDING_MODERATION' as const,
                    label: `Pendientes de Revisión (${stats.pendingReviewCount})`,
                  },
                ]
              : []),
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterType(tab.id)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              filterType === tab.id
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lista de Tarjetas del Muro Social */}
      {isLoading ? (
        <Card className="p-8 text-center text-slate-400">
          Cargando publicaciones de la comunidad...
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {visiblePosts.map((post) => (
            <Card
              key={post.id}
              className={`p-5 flex flex-col justify-between space-y-4 ${
                post.isPinned ? 'border-emerald-500/40' : ''
              }`}
            >
              <div className="space-y-4">
                {/* Encabezado del Autor y Sello de Verificación */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-sky-600 font-bold text-slate-950">
                      {post.authorName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">
                          {post.authorName}
                        </span>
                        <span className="text-xs text-slate-400">
                          {post.authorHandle}
                        </span>
                        {post.isPinned && (
                          <Badge variant="amber">
                            <Pin className="h-3 w-3" /> Destacado
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        Plan {post.authorPlan} •{' '}
                        {formatRelativeTime(post.createdAtIso)}
                      </div>
                    </div>
                  </div>

                  {post.verificationType === 'API_VERIFIED_NT8' ? (
                    <Badge variant="emerald">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      PnL Verificado API NT8
                    </Badge>
                  ) : (
                    <Badge variant="slate">Captura Comunidad</Badge>
                  )}
                </div>

                {/* Banner de Ganancia y Métricas de la Sesión */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Resultado de Sesión Verificado
                      </div>
                      <div className="mt-0.5 text-2xl font-extrabold font-mono text-emerald-400">
                        {formatUsd(post.profitUsd, true)}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {post.chartSummaryTag}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 text-xs font-mono">
                      <Badge variant="sky">{post.instrument}</Badge>
                      <span className="text-slate-300">
                        +{post.profitTicks} Ticks ({post.tradesCount} trades)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Bot: {post.strategyUsed}
                      </span>
                    </div>
                  </div>

                  {post.ninjaExecutionHash && (
                    <div className="mt-2.5 border-t border-slate-800/80 pt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Hash Telemetría NinjaTrader:</span>
                      <span className="text-emerald-400">
                        {post.ninjaExecutionHash}
                      </span>
                    </div>
                  )}
                </div>

                {/* Texto del Testimonio */}
                <p className="text-sm leading-relaxed text-slate-200">
                  &ldquo;{post.testimonialText}&rdquo;
                </p>
              </div>

              {/* Pie de Tarjeta: Likes, Moderación Admin y Comentarios */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleLikeMutation.mutate(post.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                        post.likedByMe
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Heart
                        className={`h-3.5 w-3.5 ${
                          post.likedByMe ? 'fill-rose-400 text-rose-400' : ''
                        }`}
                      />
                      <span>{post.likesCount}</span>
                    </button>

                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {post.comments.length} comentarios
                    </span>
                  </div>

                  {/* Controles exclusivos del Modo Moderación Admin */}
                  {isAdminModerationMode && (
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant={
                          post.moderationStatus === 'APPROVED'
                            ? 'emerald'
                            : post.moderationStatus === 'PENDING_REVIEW'
                            ? 'amber'
                            : 'rose'
                        }
                      >
                        {post.moderationStatus}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePinMutation.mutate(post.id)}
                        title="Fijar o desfijar en la parte superior"
                      >
                        <Pin className="h-3.5 w-3.5 text-amber-400" />
                      </Button>
                      {post.moderationStatus !== 'APPROVED' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            moderateMutation.mutate({
                              postId: post.id,
                              status: 'APPROVED',
                            })
                          }
                        >
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                          Aprobar
                        </Button>
                      )}
                      {post.moderationStatus !== 'REJECTED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            moderateMutation.mutate({
                              postId: post.id,
                              status: 'REJECTED',
                            })
                          }
                        >
                          <XCircle className="h-3.5 w-3.5 text-rose-400" />
                          Ocultar
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Lista de Comentarios */}
                {post.comments.length > 0 && (
                  <div className="space-y-1.5 rounded-lg bg-slate-950/60 p-3">
                    {post.comments.map((c) => (
                      <div key={c.id} className="text-xs">
                        <span className="font-semibold text-emerald-300">
                          {c.authorName}:{' '}
                        </span>
                        <span className="text-slate-300">{c.content}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input rápido para comentar */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={commentDrafts[post.id] || ''}
                    onChange={(e) =>
                      setCommentDrafts((prev) => ({
                        ...prev,
                        [post.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendComment(post.id);
                      }
                    }}
                    placeholder="Escribe una felicitación o comentario..."
                    className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSendComment(post.id)}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
