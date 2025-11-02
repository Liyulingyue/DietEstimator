import { Tabs, Button, message } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogoutOutlined } from '@ant-design/icons';
import { logout } from '../utils/auth';
import './tab.css';

const items = [
  { key: '/', label: '首页' },
  { key: '/panel', label: '状态管理与记录' },
  { key: '/analyse', label: '分析' },
  { key: '/labs', label: '实验室' },
];

export default function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => {
    logout();
    message.success('已退出登录');
    navigate('/login');
  };

  return (
    <div className="center-tabs">
      <Button
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        style={{
          position: 'absolute',
          right: 24,
          top: 12,
          zIndex: 1
        }}
      >
        退出
      </Button>
      
      <Tabs
        activeKey={location.pathname}
        items={items}
        onChange={key => navigate(key)}
        centered
      />
    </div>
  );
}
