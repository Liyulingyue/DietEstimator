import { Button } from 'antd';
import { GithubOutlined } from '@ant-design/icons';

interface GitHubButtonProps {
  visible?: boolean;
}

export default function GitHubButton({ visible = true }: GitHubButtonProps) {
  if (!visible) return null;

  return (
    <Button
      type="text"
      shape="circle"
      size="large"
      icon={<GithubOutlined style={{ color: '#262626' }} />}
      onClick={() => window.open('https://github.com/Liyulingyue/DietEstimator', '_blank')}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1001,
        width: '48px',
        height: '48px',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
      }}
    />
  );
}