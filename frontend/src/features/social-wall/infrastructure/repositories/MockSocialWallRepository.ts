import type {
  CreateSocialPostInput,
  ModerationStatus,
  SocialPost,
} from '@features/social-wall/domain/entities/SocialPost';
import type { ISocialWallRepository } from '@features/social-wall/domain/repositories/SocialWallRepository';

const INITIAL_SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'post-901',
    authorName: 'Alejandro Mendoza',
    authorHandle: '@amendoza_nq',
    authorPlan: 'Institutional Bot',
    instrument: 'NQ 12-26',
    strategyUsed: 'QuantumOrderFlowScalperV4',
    profitUsd: 2840.5,
    profitTicks: 142,
    tradesCount: 6,
    testimonialText:
      'Increíble precisión en la apertura de NY hoy. El filtro de absorción en el OrderFlow evitó el falso quiebre de las 9:35 AM EST y capturó todo el impulso alcista en NQ. Retiro aprobado en Apex.',
    chartSummaryTag: 'Apertura NY • Absorción +56.8 pts en NQ (2 Contratos)',
    verificationType: 'API_VERIFIED_NT8',
    ninjaExecutionHash: 'NT8-EXEC-9F82A1C0-20261116',
    moderationStatus: 'APPROVED',
    isPinned: true,
    likesCount: 38,
    likedByMe: false,
    comments: [
      {
        id: 'c-1',
        authorName: 'Valeria Rojas',
        content: '¡Brutal entrada Alejandro! Yo tomé el mismo movimiento en ES.',
        createdAtIso: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 'c-2',
        authorName: 'Carlos Admin',
        content: 'Ejecución verificada vía telemetría NT8. ¡Felicidades por el payout!',
        createdAtIso: new Date(Date.now() - 900000).toISOString(),
      },
    ],
    createdAtIso: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'post-902',
    authorName: 'Valeria Rojas',
    authorHandle: '@valeria_futures',
    authorPlan: 'Prop Firm Elite',
    instrument: 'ES 12-26',
    strategyUsed: 'DeltaMomentumBreakout',
    profitUsd: 1425.0,
    profitTicks: 57,
    tradesCount: 4,
    testimonialText:
      'Tercer día consecutivo cerrando en verde mi cuenta fondeada XFA de 50k. Lo que más valoro es que el bot respeta el límite de pérdida diaria automáticamente sin emociones.',
    chartSummaryTag: 'Sesión Londres/NY • 4/4 Trades Ganadores (100% WinRate)',
    verificationType: 'API_VERIFIED_NT8',
    ninjaExecutionHash: 'NT8-EXEC-77B4E211-20261116',
    moderationStatus: 'APPROVED',
    isPinned: false,
    likesCount: 24,
    likedByMe: true,
    comments: [
      {
        id: 'c-3',
        authorName: 'Marco Santillán',
        content: 'La gestión de riesgo automática vale oro para cuentas de fondeo.',
        createdAtIso: new Date(Date.now() - 2400000).toISOString(),
      },
    ],
    createdAtIso: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'post-903',
    authorName: 'Marco Santillán',
    authorHandle: '@msantillan_quant',
    authorPlan: 'Prop Firm Elite',
    instrument: 'MNQ 12-26',
    strategyUsed: 'VWAPReversionInstitutional',
    profitUsd: 965.25,
    profitTicks: 193,
    tradesCount: 9,
    testimonialText:
      'Operando micros con 5 contratos en rango lateral de mediodía. La reversión al VWAP institucional funcionó como reloj suizo.',
    chartSummaryTag: 'Reversión Banda 2SD VWAP • +193 Ticks en MNQ',
    verificationType: 'COMMUNITY_SCREENSHOT',
    ninjaExecutionHash: null,
    moderationStatus: 'APPROVED',
    isPinned: false,
    likesCount: 15,
    likedByMe: false,
    comments: [],
    createdAtIso: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'post-904',
    authorName: 'Fernando Ibarra',
    authorHandle: '@fibarra_gold',
    authorPlan: 'Pro Scalper',
    instrument: 'GC 12-26',
    strategyUsed: 'LiquiditySweepBot',
    profitUsd: 1890.0,
    profitTicks: 63,
    tradesCount: 3,
    testimonialText:
      'Barrido de liquidez en futuros del Oro (GC) tras noticia del bono a 10 años. Envío mi reporte para validación del administrador.',
    chartSummaryTag: 'Futuros del Oro (GC) • +63 Ticks post-noticia',
    verificationType: 'COMMUNITY_SCREENSHOT',
    ninjaExecutionHash: null,
    moderationStatus: 'PENDING_REVIEW',
    isPinned: false,
    likesCount: 4,
    likedByMe: false,
    comments: [],
    createdAtIso: new Date(Date.now() - 600000).toISOString(),
  },
];

export class MockSocialWallRepository implements ISocialWallRepository {
  private posts: SocialPost[] = structuredClone(INITIAL_SOCIAL_POSTS);

  public async getPosts(): Promise<SocialPost[]> {
    return structuredClone(this.posts);
  }

  public async createPost(input: CreateSocialPostInput): Promise<SocialPost> {
    const isVerified = input.verificationType === 'API_VERIFIED_NT8';
    const newPost: SocialPost = {
      id: `post-${Date.now()}`,
      authorName: input.authorName.trim(),
      authorHandle: input.authorHandle.startsWith('@')
        ? input.authorHandle.trim()
        : `@${input.authorHandle.trim()}`,
      authorPlan: isVerified ? 'Prop Firm Elite (API Linked)' : 'Pro Scalper',
      instrument: input.instrument,
      strategyUsed: input.strategyUsed,
      profitUsd: input.profitUsd,
      profitTicks: input.profitTicks,
      tradesCount: input.tradesCount,
      testimonialText: input.testimonialText.trim(),
      chartSummaryTag: input.chartSummaryTag.trim(),
      verificationType: input.verificationType,
      ninjaExecutionHash: isVerified
        ? `NT8-EXEC-${Math.random().toString(16).slice(2, 10).toUpperCase()}`
        : null,
      moderationStatus: 'APPROVED',
      isPinned: false,
      likesCount: 1,
      likedByMe: true,
      comments: [],
      createdAtIso: new Date().toISOString(),
    };

    this.posts = [newPost, ...this.posts];
    return structuredClone(newPost);
  }

  public async toggleLike(postId: string): Promise<SocialPost> {
    const idx = this.posts.findIndex((p) => p.id === postId);
    if (idx === -1) throw new Error('Publicación no encontrada.');

    const current = this.posts[idx];
    const nextLiked = !current.likedByMe;
    const updated: SocialPost = {
      ...current,
      likedByMe: nextLiked,
      likesCount: nextLiked
        ? current.likesCount + 1
        : Math.max(0, current.likesCount - 1),
    };
    this.posts[idx] = updated;
    return structuredClone(updated);
  }

  public async addComment(params: {
    postId: string;
    authorName: string;
    content: string;
  }): Promise<SocialPost> {
    const idx = this.posts.findIndex((p) => p.id === params.postId);
    if (idx === -1) throw new Error('Publicación no encontrada.');

    const current = this.posts[idx];
    const updated: SocialPost = {
      ...current,
      comments: [
        ...current.comments,
        {
          id: `c-${Date.now()}`,
          authorName: params.authorName.trim() || 'Trader Verificado',
          content: params.content.trim(),
          createdAtIso: new Date().toISOString(),
        },
      ],
    };
    this.posts[idx] = updated;
    return structuredClone(updated);
  }

  public async moderatePost(params: {
    postId: string;
    status: ModerationStatus;
  }): Promise<SocialPost> {
    const idx = this.posts.findIndex((p) => p.id === params.postId);
    if (idx === -1) throw new Error('Publicación no encontrada.');

    const updated: SocialPost = {
      ...this.posts[idx],
      moderationStatus: params.status,
    };
    this.posts[idx] = updated;
    return structuredClone(updated);
  }

  public async togglePinPost(postId: string): Promise<SocialPost> {
    const idx = this.posts.findIndex((p) => p.id === postId);
    if (idx === -1) throw new Error('Publicación no encontrada.');

    const updated: SocialPost = {
      ...this.posts[idx],
      isPinned: !this.posts[idx].isPinned,
    };
    this.posts[idx] = updated;
    return structuredClone(updated);
  }
}
