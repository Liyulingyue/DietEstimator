import { Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';

interface FloatingMenuButtonProps {
  onClick: () => void;
  visible?: boolean;
}

export default function FloatingMenuButton({ onClick, visible = true }: FloatingMenuButtonProps) {
  if (!visible) return null;

  return (
    <Button
      type="primary"
      shape="circle"
      size="large"
      icon={<MenuOutlined />}
      onClick={onClick}
      className="floating-menu-button"
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 1001,
        width: '48px',
        height: '48px',
        background: 'linear-gradient(135deg, #1890ff, #36cfc9)',
        border: 'none',
        boxShadow: '0 4px 16px rgba(24, 144, 255, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(24, 144, 255, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(24, 144, 255, 0.3)';
      }}
    />
  );
}