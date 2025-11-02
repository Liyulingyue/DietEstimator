import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import MobileSidebar from './MobileSidebar';
import FloatingMenuButton from './FloatingMenuButton';
import MobileTabBar from './MobileTabBar';

interface ResponsiveLayoutProps {
  children: ReactNode;
  showTabBar?: boolean;
}

export default function ResponsiveLayout({ children, showTabBar = false }: ResponsiveLayoutProps) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: '100%',
      margin: '0 auto',
      position: 'relative'
    }}>
      {/* 主内容区域 */}
      <div style={{
        paddingBottom: (isMobile && showTabBar) ? '80px' : '0'
      }}>
        {children}
      </div>

      {/* 侧边栏 - 移动端和桌面端都使用抽屉式 */}
      <MobileSidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      
      {/* 悬浮菜单按钮 - 移动端和桌面端都显示 */}
      <FloatingMenuButton onClick={() => setSidebarVisible(!sidebarVisible)} />

      {/* 移动端可选：底部导航栏 */}
      {isMobile && showTabBar && <MobileTabBar />}
    </div>
  );
}