import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Index from './index';
import Analyse from './analyse';
import Labs from './labs';
import Panel from './panel';
import Login from './login';
import MobileHome from './mobile-home';
import MobileAnalyse from './mobile-analyse';
import MobileLabs from './mobile-labs';
import MobilePanel from './mobile-panel';
import AppConfig from './AppConfig';
import AppIntroduction from './AppIntroduction';
import AppGallery from './AppGallery';
import { isLogin } from '../utils/auth';

function RequireAuth({ children }: { children: React.ReactElement }) {
  const location = useLocation();
  if (!isLogin() && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* 桌面端路由 */}
        <Route path="/" element={<RequireAuth><Index /></RequireAuth>} />
        <Route path="/analyse" element={<RequireAuth><Analyse /></RequireAuth>} />
        <Route path="/labs" element={<RequireAuth><Labs /></RequireAuth>} />
        <Route path="/panel" element={<RequireAuth><Panel /></RequireAuth>} />
        {/* 移动端路由 */}
        <Route path="/app/home" element={<RequireAuth><MobileHome /></RequireAuth>} />
        <Route path="/app/analyse" element={<RequireAuth><MobileAnalyse /></RequireAuth>} />
        <Route path="/app/labs" element={<RequireAuth><MobileLabs /></RequireAuth>} />
        <Route path="/app/panel" element={<RequireAuth><MobilePanel /></RequireAuth>} />
        <Route path="/app/config" element={<RequireAuth><AppConfig /></RequireAuth>} />
        <Route path="/app/introduction" element={<RequireAuth><AppIntroduction /></RequireAuth>} />
        <Route path="/app/gallery" element={<RequireAuth><AppGallery /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  );
}
