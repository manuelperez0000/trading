import React, { useEffect } from 'react';
import { LandingNavbar } from '../components/LandingNavbar';
import { LandingHero } from '../components/LandingHero';
import { LandingStatsTicker } from '../components/LandingStatsTicker';
import { LandingPropFirms } from '../components/LandingPropFirms';
import { LandingBotsShowcase } from '../components/LandingBotsShowcase';
import { LandingMechanism } from '../components/LandingMechanism';
import { LandingHowItWorks } from '../components/LandingHowItWorks';
import { LandingSocialProof } from '../components/LandingSocialProof';
import { LandingPricing } from '../components/LandingPricing';
import { LandingFaq } from '../components/LandingFaq';
import { LandingFooter } from '../components/LandingFooter';

export const LandingPage: React.FC = () => {
  useEffect(() => {
    // Título dinámico optimizado para SEO y branding
    document.title = 'Trading Life Academy | Bots Algorítmicos NinjaTrader 8 & Prop Firms';
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500/30 selection:text-amber-200 relative overflow-x-hidden">
      {/* Resplandores ambientales y partículas sutiles de fondo */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-amber-500/10 via-amber-600/5 to-transparent blur-[140px]" />
        <div className="absolute top-[35%] -left-[200px] w-[500px] h-[500px] bg-amber-500/5 blur-[150px] rounded-full" />
        <div className="absolute top-[65%] -right-[200px] w-[600px] h-[600px] bg-amber-600/5 blur-[160px] rounded-full" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-amber-500/10 to-transparent blur-[130px]" />
      </div>

      {/* Contenido en capa superior */}
      <div className="relative z-10 flex flex-col">
        {/* Barra de navegación institucional fija */}
        <LandingNavbar />

        {/* Secciones de conversión */}
        <main className="flex-1 w-full flex flex-col">
          <LandingHero />
          <LandingStatsTicker />
          <LandingPropFirms />
          <LandingBotsShowcase />
          <LandingMechanism />
          <LandingHowItWorks />
          <LandingSocialProof />
          <LandingPricing />
          <LandingFaq />
        </main>

        {/* Footer con banner final de llamada a la acción y descargo legal */}
        <LandingFooter />
      </div>
    </div>
  );
};

export default LandingPage;
