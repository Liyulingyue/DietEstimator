import { useLocation, useNavigate } from 'react-router-dom';
import { HomeOutlined, FireOutlined, ExperimentOutlined, BarChartOutlined } from '@ant-design/icons';

export default function MobileTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { key: '/app/home', label: '首页', icon: HomeOutlined },
    { key: '/app/analyse', label: '分析', icon: FireOutlined },
    { key: '/app/panel', label: '记录', icon: BarChartOutlined },
    { key: '/app/labs', label: '实验室', icon: ExperimentOutlined },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'white',
      borderTop: '1px solid #e8e8e8',
      padding: '8px 0',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 1000,
      boxShadow: '0 -2px 8px rgba(0,0,0,0.1)'
    }}>
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.key;
        return (
          <div
            key={tab.key}
            onClick={() => navigate(tab.key)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px',
              cursor: 'pointer',
              color: isActive ? '#1890ff' : '#666',
              fontSize: '12px'
            }}
          >
            <Icon style={{ fontSize: '20px', marginBottom: '4px' }} />
            <span>{tab.label}</span>
          </div>
        );
      })}
    </div>
  );
}