import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bot, Compass, KeyRound } from 'lucide-react';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { Badge } from '@shared/ui/Badge';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4 text-center">
      <Card className="w-full max-w-lg p-8 border-slate-800 bg-slate-900/90 shadow-2xl space-y-6">
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mb-3">
            <Compass className="h-8 w-8 animate-spin-slow" />
          </div>
          <Badge variant="amber">Error 404 • Ruta no encontrada</Badge>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">
            Página No Encontrada
          </h1>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed max-w-sm">
            La sección a la que intentas acceder no existe en la plataforma de Trading Life Academy o fue reubicada.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 pt-2">
          <Link to="/catalog">
            <Button variant="primary" size="md" className="w-full">
              <Bot className="h-4 w-4" />
              Catálogo de Bots
            </Button>
          </Link>
          <Link to="/my-subscriptions">
            <Button variant="secondary" size="md" className="w-full">
              <KeyRound className="h-4 w-4" />
              Mis Licencias
            </Button>
          </Link>
        </div>

        <div className="border-t border-slate-800/80 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a la pantalla anterior
          </button>
        </div>
      </Card>
    </div>
  );
};
