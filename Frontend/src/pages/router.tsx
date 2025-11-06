import React, { useState, useEffect } from 'react';
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
import Debug from './Debug';
import { isLogin } from '../utils/auth';

function RequireAuth({ children }: { children: React.ReactElement }) {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const loggedIn = await isLogin();
        setIsAuthenticated(loggedIn);
      } catch (error) {
        console.error('检查登录状态失败:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    // 显示加载状态
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        正在检查登录状态...
      </div>
    );
  }

  if (!isAuthenticated && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/debug" element={<Debug />} />
        {/* 桌面端路由 */}
        <Route path="/" element={<RequireAuth><Index /></RequireAuth>} />
        <Route path="/analyse" element={<RequireAuth><Analyse /></RequireAuth>} />
        <Route path="/labs" element={<RequireAuth><Labs /></RequireAuth>} />
        <Route path="/panel" element={<RequireAuth><Panel /></RequireAuth>} />
        {/* 移动端路由 */}
        <Route path="/app/home" element={<RequireAuth><MobileHome /></RequireAuth>} />
        <Route path="/app/analyse" element={<RequireAuth><MobileAnalyse /></RequireAuth>} />
        <Route path="/app/labs" element={<RequireAuth><MobileLabs /></RequireAuth>} />
        <Route path="/app/panel" element={<MobilePanel />} />
        <Route path="/app/config" element={<AppConfig />} />
        <Route path="/app/introduction" element={<RequireAuth><AppIntroduction /></RequireAuth>} />
        <Route path="/app/gallery" element={<RequireAuth><AppGallery /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  );
}
