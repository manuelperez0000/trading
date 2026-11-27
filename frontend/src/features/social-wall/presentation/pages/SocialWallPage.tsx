import React, { useRef, useState } from 'react';
import {
  ArrowUpRight,
  Heart,
  ImagePlus,
  Send,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useAuthStore } from '@features/auth/application/useAuthStore';

interface SocialPost {
  id: string;
  author: string;
  handle: string;
  initials: string;
  avatar: string;
  createdAt: number;
  content: string;
  image?: string;
  likes: number;
  likedByMe: boolean;
  followersCount: number;
}

const INITIAL_POSTS: SocialPost[] = [
  {
    id: 'post-1',
    author: 'Sofía Ramírez',
    handle: '@sofia.trades',
    initials: 'SR',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
    createdAt: Date.now() - 5 * 60 * 1000,
    content:
      'Hoy aprendí que la paciencia también es parte de la estrategia. Esperé mi entrada, respeté mi plan y cerré la sesión en positivo. ¡Un paso a la vez! 📈',
    image:
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=85',
    likes: 24,
    likedByMe: false,
    followersCount: 1280,
  },
  {
    id: 'post-2',
    author: 'Andrés Molina',
    handle: '@amolina_futures',
    initials: 'AM',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
    createdAt: Date.now() - 8 * 60 * 60 * 1000,
    content:
      'Primera semana siguiendo mi diario de trading todos los días. La diferencia en mi disciplina es enorme. ¿Qué hábito les ha ayudado más a mejorar?',
    likes: 18,
    likedByMe: false,
    followersCount: 846,
  },
  {
    id: 'post-3',
    author: 'Valentina Cruz',
    handle: '@vale.market',
    initials: 'VC',
    avatar:
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=120&h=120&q=80',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    content:
      'Hace tres días tuve una sesión complicada y terminé antes de alcanzar mi límite diario. Proteger el capital también es ganar. Hoy vuelvo con la mente clara. 💪',
    image:
      'https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1200&q=85',
    likes: 32,
    likedByMe: false,
    followersCount: 2150,
  },
];

function getRelativeTime(timestamp: number): string {
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));

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

export const SocialWallPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState('');
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageError('');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
      } else {
        setImageError('No se pudo cargar la imagen. Inténtalo de nuevo.');
      }
    };
    reader.onerror = () =>
      setImageError('No se pudo leer la imagen. Inténtalo de nuevo.');
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handlePublish = () => {
    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    const authorName = user?.fullName || 'Trader';
    const initials = getInitials(authorName);
    const newPost: SocialPost = {
      id: `post-${Date.now()}`,
      author: authorName,
      handle: user?.handle || '@trader',
      initials,
      avatar: '',
      createdAt: Date.now(),
      content: trimmedContent,
      image: image ?? undefined,
      likes: 0,
      likedByMe: false,
      followersCount: 0,
    };

    setPosts((currentPosts) => [newPost, ...currentPosts]);
    setContent('');
    setImage(null);
    setImageError('');
  };

  const toggleLike = (postId: string) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likedByMe: !post.likedByMe,
              likes: post.likes + (post.likedByMe ? -1 : 1),
            }
          : post
      )
    );
  };

  const toggleFollow = (handle: string) => {
    setFollowedUsers((currentUsers) =>
      currentUsers.includes(handle)
        ? currentUsers.filter((currentHandle) => currentHandle !== handle)
        : [...currentUsers, handle]
    );
  };

  const followedProfiles = followedUsers.flatMap((handle) => {
    const profile = posts.find((post) => post.handle === handle);
    if (!profile) return [];

    return [
      {
        ...profile,
        totalLikes: posts
          .filter((post) => post.handle === handle)
          .reduce((total, post) => total + post.likes, 0),
      },
    ];
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl items-start gap-6 pb-10">
      <main className="min-w-0 flex-1 space-y-8">
     

      <section
        aria-label="Crear publicación"
        className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-black/10 sm:p-5"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div
            aria-label={`Foto de ${user?.fullName || 'Trader'}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-sm font-bold text-slate-950 ring-2 ring-amber-400/20"
          >
            {getInitials(user?.fullName || 'Trader')}
          </div>
          <div className="min-w-0 flex-1">
            <textarea
              aria-label="Cuéntanos tu experiencia"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Cuéntanos tu experiencia"
              rows={2}
              className="min-h-20 w-full resize-y border-0 bg-transparent py-1 text-lg font-medium text-slate-100 shadow-none outline-none ring-0 placeholder:text-slate-500 focus:border-0 focus:bg-transparent focus:shadow-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 sm:text-xl"
            />
            {imageError && (
              <p role="alert" className="mt-2 text-xs text-rose-300">
                {imageError}
              </p>
            )}
            {image && (
              <div className="relative mt-3 inline-block">
                <img
                  src={image}
                  alt="Vista previa de la imagen para publicar"
                  className="max-h-56 max-w-full rounded-xl border border-slate-700 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
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
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-emerald-300 transition hover:border-emerald-400/50 hover:bg-emerald-400/10"
          >
            <ImagePlus className="h-5 w-5" />
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
          <span>
          </span>
          <button
            type="button"
            onClick={handlePublish}
            disabled={!content.trim()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Publicar
            <Send className="h-4 w-4" />
          </button>
        </div>
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

          {posts.map((post) => {
            const isFollowing = followedUsers.includes(post.handle);

            return (
              <article
                key={post.id}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg shadow-black/10"
              >
                <div className="flex items-center gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
                  {post.avatar ? (
                    <img
                      src={post.avatar}
                      alt={`Foto de ${post.author}`}
                      className="h-11 w-11 shrink-0 rounded-full border border-slate-700 object-cover"
                    />
                  ) : (
                    <div
                      aria-label={`Foto de ${post.author}`}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-xs font-bold text-slate-950"
                    >
                      {post.initials}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <h3 className="truncate text-sm font-bold text-slate-100">
                        {post.author}
                      </h3>
                      <span className="text-xs text-slate-500">
                        {getRelativeTime(post.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {post.handle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleLike(post.id)}
                    aria-label={
                      post.likedByMe ? 'Quitar me gusta' : 'Dar me gusta'
                    }
                    aria-pressed={post.likedByMe}
                    className={`rounded-full p-2.5 transition ${
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

                <p className="whitespace-pre-wrap px-4 pb-4 pt-4 text-sm leading-6 text-slate-300 sm:px-5">
                  {post.content}
                </p>

                {post.image && (
                  <img
                    src={post.image}
                    alt={`Imagen compartida por ${post.author}`}
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
                    <span>{post.likes} me gusta</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleFollow(post.handle)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                      isFollowing
                        ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                        : 'border-slate-700 text-slate-300 hover:border-emerald-400/40 hover:text-emerald-300'
                    }`}
                  >
                    {isFollowing ? 'Siguiendo' : 'Seguir'}
                    {!isFollowing && (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </article>
            );
          })}
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
                <li
                  key={profile.handle}
                  className="p-1"
                >
                  <div className="flex items-center gap-3">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={`Foto de ${profile.author}`}
                        className="h-10 w-10 shrink-0 rounded-full border border-slate-700 object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-xs font-bold text-slate-950">
                        {profile.initials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-100">
                        {profile.author}
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
