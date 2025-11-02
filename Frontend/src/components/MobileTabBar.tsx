import { useLocation, useNavigate } from 'react-router-dom';
import { HomeOutlined, FireOutlined, ExperimentOutlined, BarChartOutlined } from '@ant-design/icons';
import { useState } from 'react';

export default function MobileTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pressedTab, setPressedTab] = useState<string | null>(null);

  const tabs = [
    { key: '/app/home', label: '首页', icon: HomeOutlined, color: '#1890ff' },
    { key: '/app/analyse', label: '分析', icon: FireOutlined, color: '#52c41a' },
    { key: '/app/panel', label: '记录', icon: BarChartOutlined, color: '#722ed1' },
    { key: '/app/labs', label: '实验室', icon: ExperimentOutlined, color: '#fa8c16' },
  ];

  const handleTabClick = (key: string) => {
    setPressedTab(key);
    setTimeout(() => setPressedTab(null), 200);
    navigate(key);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(0, 0, 0, 0.06)',
      padding: '10px 0 max(10px, env(safe-area-inset-bottom))',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 1000,
      boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)'
    }}>
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.key;
        const isPressed = pressedTab === tab.key;
        
        return (
          <div
            key={tab.key}
            onClick={() => handleTabClick(tab.key)}
            onTouchStart={() => setPressedTab(tab.key)}
            onTouchEnd={() => setTimeout(() => setPressedTab(null), 200)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '6px 16px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isPressed ? 'scale(0.92)' : 'scale(1)',
              position: 'relative',
              minWidth: '60px'
            }}
          >
            {/* 活动指示器 */}
            {isActive && (
              <div style={{
                position: 'absolute',
                top: -10,
                width: '32px',
                height: '3px',
                background: `linear-gradient(90deg, ${tab.color}, ${tab.color}dd)`,
                borderRadius: '0 0 3px 3px',
                boxShadow: `0 2px 8px ${tab.color}66`
              }} />
            )}
            
            {/* 图标容器 */}
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isActive 
                ? `linear-gradient(135deg, ${tab.color}15, ${tab.color}08)` 
                : 'transparent',
              marginBottom: '4px',
              transition: 'all 0.3s ease'
            }}>
              <Icon style={{ 
                fontSize: isActive ? '24px' : '22px', 
                color: isActive ? tab.color : '#8c8c8c',
                transition: 'all 0.3s ease'
              }} />
            </div>
            
            {/* 标签文字 */}
            <span style={{
              fontSize: '11px',
              fontWeight: isActive ? '600' : '400',
              color: isActive ? tab.color : '#8c8c8c',
              transition: 'all 0.3s ease',
              letterSpacing: '0.2px'
            }}>
              {tab.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}