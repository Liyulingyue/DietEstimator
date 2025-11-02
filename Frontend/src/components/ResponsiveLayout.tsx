import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import MobileSidebar from './MobileSidebar';
import FloatingMenuButton from './FloatingMenuButton';
import MobileTabBar from './MobileTabBar';
import GitHubButton from './GitHubButton';
import Footer from './Footer';

interface ResponsiveLayoutProps {
  children: ReactNode;
  showTabBar?: boolean;
  showGitHubButton?: boolean;
}

export default function ResponsiveLayout({ children, showTabBar = false, showGitHubButton = false }: ResponsiveLayoutProps) {
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
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 主内容区域 */}
      <div style={{
        flex: 1,
        paddingBottom: (isMobile && showTabBar) ? '80px' : '0'
      }}>
        {children}
      </div>

      {/* 底部版权信息 */}
      <Footer />

      {/* 侧边栏 - 移动端和桌面端都使用抽屉式 */}
      <MobileSidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {/* 悬浮菜单按钮 - 移动端和桌面端都显示 */}
      <FloatingMenuButton onClick={() => setSidebarVisible(!sidebarVisible)} />

      {/* GitHub 按钮 - 可选择显示 */}
      <GitHubButton visible={showGitHubButton} />

      {/* 移动端可选：底部导航栏 */}
      {isMobile && showTabBar && <MobileTabBar />}
    </div>
  );
}