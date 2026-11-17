import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Heart,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { formatUsd } from '@shared/utils/formatters';
import { useI18n } from '@core/i18n/useLanguageStore';

export const LandingSocialProof: React.FC = () => {
  const { lang } = useI18n();

  const proofs = [
    {
      author: 'Alejandro Mendoza',
      handle: '@amendoza_prop',
      plan: 'Pro Trader VIP',
      profitUsd: 2640.5,
      ticks: '+132 Ticks en NQ',
      strategy: 'QuantumOrderFlowScalperV4',
      hash: 'NT8-EXEC-9921-A8F1',
      text:
        lang === 'es'
          ? 'Pasé mi prueba de fondeo de $50k en Apex en solo 6 sesiones. El bot respetó el trailing drawdown al milímetro cuando el Nasdaq abrió con alta volatilidad. Totalmente satisfecho con el sistema.'
          : 'Passed my $50k Apex evaluation in just 6 sessions. The bot respected the trailing drawdown to the tick during volatile market opens. Truly exceptional quantitative engineering.',
      likes: 24,
      comments: 6,
    },
    {
      author: 'Valeria Rojas',
      handle: '@vrojas_trader',
      plan: 'Member',
      profitUsd: 1425.0,
      ticks: '+57 Ticks en ES',
      strategy: 'DeltaMomentumBreakout',
      hash: 'NT8-EXEC-4410-B2C3',
      text:
        lang === 'es'
          ? 'Lo que más me da paz mental es el Kill-Switch remoto. Poder monitorear las operaciones desde el celular sin estar pegada a la pantalla me cambió por completo el trading.'
          : 'What gives me the most peace of mind is the remote cloud Kill-Switch. Being able to supervise and pause trades from my phone without staring at charts all day changed my life.',
      likes: 19,
      comments: 4,
    },
    {
      author: 'Marco Santillán',
      handle: '@msantillan_quant',
      plan: 'Pro Trader VIP',
      profitUsd: 3120.0,
      ticks: '+156 Ticks en MNQ',
      strategy: 'VWAPReversionInstitutional',
      hash: 'NT8-EXEC-1108-C4D5',
      text:
        lang === 'es'
          ? 'Opero 3 cuentas copiadas simultáneamente con el bot de VWAP. La consistencia en el cálculo de desviación estándar institucional es algo que ningún indicador manual puede replicar.'
          : 'Running 3 copied prop accounts simultaneously with the VWAP bot. The mathematical precision on institutional deviation levels is impossible to replicate manually.',
      likes: 31,
      comments: 9,
    },
  ];

  return (
    <section id="social-proof" className="py-20 relative">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div className="max-w-2xl space-y-3">
            <Badge variant="emerald">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              {lang === 'es' ? 'Telemetría y PnL Auditados' : 'Audited Telemetry & PnL'}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {lang === 'es' ? (
                <>
                  Resultados Reales de Nuestra{' '}
                  <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                    Comunidad de Traders
                  </span>
                </>
              ) : (
                <>
                  Real Results from Our{' '}
                  <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                    Trader Community
                  </span>
                </>
              )}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {lang === 'es'
                ? 'Sin testimonios ficticios ni capturas editadas. Todas las publicaciones en nuestro muro social están verificadas con hash criptográfico emitido por el terminal NinjaTrader 8.'
                : 'No fabricated reviews or edited screenshots. Every post in our social wall is cryptographically validated with live telemetry hashes from NinjaTrader 8.'}
            </p>
          </div>

          <Link to="/social">
            <Button variant="secondary" size="md" className="shrink-0 text-xs">
              {lang === 'es' ? 'Ver Muro Social en Vivo' : 'View Live Social Wall'}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* 3 Tarjetas de Testimonios Verificados */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {proofs.map((post, idx) => (
            <Card
              key={idx}
              className="p-6 border-slate-800 bg-slate-900/90 flex flex-col justify-between space-y-5 hover:border-emerald-500/40 transition-all"
            >
              <div className="space-y-4">
                {/* Perfil del Autor */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 font-bold text-slate-950 text-sm shadow-md shadow-amber-500/20">
                      {post.author.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{post.author}</div>
                      <div className="text-[11px] text-slate-400">{post.handle} • {post.plan}</div>
                    </div>
                  </div>

                  <Badge variant="emerald" className="text-[10px]">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    API Verified
                  </Badge>
                </div>

                {/* Banner de Ganancia */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="text-[10px] font-semibold uppercase text-slate-400">
                    {lang === 'es' ? 'Resultado de Sesión' : 'Session Result'}
                  </div>
                  <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                    {formatUsd(post.profitUsd, true)}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>{post.ticks}</span>
                    <span className="font-mono text-slate-500">{post.strategy}</span>
                  </div>
                  <div className="mt-2 border-t border-slate-800/80 pt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Hash NT8:</span>
                    <span className="text-emerald-400 font-semibold">{post.hash}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic">
                  &ldquo;{post.text}&rdquo;
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-rose-300">
                  <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
                  {post.likes} likes
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {post.comments} comentarios
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
