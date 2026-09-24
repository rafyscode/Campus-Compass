import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { ROUTE_PATHS } from './routes';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { CampusDataProvider } from '../hooks/useCampusData';

const HomePage = lazy(() => import('../pages/HomePage'));
const LivePage = lazy(() => import('../pages/LivePage'));
const ForecastPage = lazy(() => import('../pages/ForecastPage'));
const CampusPage = lazy(() => import('../pages/CampusPage'));
const HardwarePage = lazy(() => import('../pages/HardwarePage'));
const StatusPage = lazy(() => import('../pages/StatusPage'));
const AboutPage = lazy(() => import('../pages/AboutPage'));
const PrivacyPage = lazy(() => import('../pages/PrivacyPage'));
const ImprintPage = lazy(() => import('../pages/ImprintPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

export default function App() {
  return (
    <BrowserRouter>
      <CampusDataProvider>
        <AppShell>
          <Suspense fallback={<div className="content"><LoadingSkeleton /></div>}>
            <Routes>
              <Route path={ROUTE_PATHS.home} element={<HomePage />} />
              <Route path={ROUTE_PATHS.live} element={<LivePage />} />
              <Route path={ROUTE_PATHS.forecast} element={<ForecastPage />} />
              <Route path={ROUTE_PATHS.campus} element={<CampusPage />} />
              <Route path={ROUTE_PATHS.hardware} element={<HardwarePage />} />
              <Route path={ROUTE_PATHS.status} element={<StatusPage />} />
              <Route path={ROUTE_PATHS.about} element={<AboutPage />} />
              <Route path={ROUTE_PATHS.privacy} element={<PrivacyPage />} />
              <Route path={ROUTE_PATHS.imprint} element={<ImprintPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </AppShell>
      </CampusDataProvider>
    </BrowserRouter>
  );
}
