import React, { useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PlatformShellLayout } from '@shared/layouts/PlatformShellLayout';
import { ToastViewport } from '@shared/ui/toast/ToastViewport';
import { SubscriptionsAdminPage } from '@features/subscriptions/presentation/pages/SubscriptionsAdminPage';
import { NinjaRemoteTesterPage } from '@features/subscriptions/presentation/pages/NinjaRemoteTesterPage';
import { SocialWallPage } from '@features/social-wall/presentation/pages/SocialWallPage';
import {
  LoginPage,
  PasswordRecoveryPage,
  RegisterPage,
} from '@features/auth/presentation/pages/AuthPages';
import {
  BotDetailPage,
  BotsCatalogPage,
} from '@features/bots-catalog/presentation/pages/BotsCatalogPages';
import {
  BillingHistoryPage,
  MyLicensesPage,
  UserProfilePage,
} from '@features/account/presentation/pages/AccountPages';
import { NotFoundPage } from '@shared/ui/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLabLicense, setSelectedLabLicense] = useState<string | null>(
    null
  );

  const handleOpenLicenseInLab = (licenseKey: string) => {
    setSelectedLabLicense(licenseKey);
    navigate('/admin/ninja-lab');
  };

  return (
    <Routes>
      {/* Vistas Públicas de Autenticación (Sin Menú Lateral) */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route
        path="/auth/recover-password"
        element={<PasswordRecoveryPage />}
      />

      {/* Alias de rutas comunes para evitar 404 o puntos muertos */}
      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/register" element={<Navigate to="/auth/register" replace />} />
      <Route path="/recover" element={<Navigate to="/auth/recover-password" replace />} />
      <Route path="/recover-password" element={<Navigate to="/auth/recover-password" replace />} />
      <Route path="/admin" element={<Navigate to="/admin/subscriptions" replace />} />
      <Route path="/bots" element={<Navigate to="/catalog" replace />} />
      <Route path="/licenses" element={<Navigate to="/my-subscriptions" replace />} />

      {/* Plantilla Administrativa y Portal Trader con Menú Lateral Colapsable */}
      <Route element={<PlatformShellLayout />}>
        <Route
          index
          element={<Navigate to="/admin/subscriptions" replace />}
        />

        {/* Módulos Fase 2: Panel Admin + Laboratorio Apagado Remoto + Red Social */}
        <Route
          path="/admin/subscriptions"
          element={
            <SubscriptionsAdminPage
              onSelectLicenseForLab={handleOpenLicenseInLab}
            />
          }
        />
        <Route
          path="/admin/ninja-lab"
          element={
            <NinjaRemoteTesterPage initialLicenseKey={selectedLabLicense} />
          }
        />
        <Route path="/social" element={<SocialWallPage />} />

        {/* Módulos del Tablero Frontend: Catálogo, Detalle, Licencias, Pagos y Perfil */}
        <Route path="/catalog" element={<BotsCatalogPage />} />
        <Route path="/catalog/:botId" element={<BotDetailPage />} />
        <Route path="/my-subscriptions" element={<MyLicensesPage />} />
        <Route path="/billing" element={<BillingHistoryPage />} />
        <Route path="/profile" element={<UserProfilePage />} />

        {/* Página 404 estructurada (sin puntos muertos) */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <ToastViewport />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
