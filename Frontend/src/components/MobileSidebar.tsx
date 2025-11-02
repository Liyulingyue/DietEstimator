import { Drawer, Typography } from 'antd';
import { HomeOutlined, FireOutlined, ExperimentOutlined, BarChartOutlined, SettingOutlined, InfoCircleOutlined, PictureOutlined, CloseOutlined, GithubOutlined, HeartOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Title, Text } = Typography;

interface MobileSidebarProps {
  visible: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ visible, onClose }: MobileSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/app/home',
      label: '首页',
      icon: HomeOutlined,
      color: '#1890ff',
      description: '返回主界面'
    },
    {
      key: '/app/analyse',
      label: '热量分析',
      icon: FireOutlined,
      color: '#52c41a',
      description: '分析食物热量'
    },
    {
      key: '/app/panel',
      label: '状态管理',
      icon: BarChartOutlined,
      color: '#722ed1',
      description: '查看饮食记录'
    },
    {
      key: '/app/labs',
      label: '实验室',
      icon: ExperimentOutlined,
      color: '#fa8c16',
      description: '探索新功能'
    },
  ];

  const extraItems = [
    {
      key: '/app/config',
      label: '用户管理与配置',
      icon: SettingOutlined,
      color: '#1890ff',
      description: '登录与配置AI'
    },
    {
      key: '/app/introduction',
      label: '使用说明',
      icon: InfoCircleOutlined,
      color: '#13c2c2',
      description: '帮助文档'
    },
    {
      key: '/app/gallery',
      label: '图片画廊',
      icon: PictureOutlined,
      color: '#eb2f96',
      description: '历史记录'
    },
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
    onClose(); // 点击后关闭侧边栏
  };

  // 渲染菜单内容的公共函数
  const renderMenuContent = () => {
    const currentYear = new Date().getFullYear();

    // 合并所有菜单项
    const allMenuItems = [...menuItems, ...extraItems];

    return (
      <>
        {/* 菜单项列表 */}
        <div style={{ padding: '0 16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allMenuItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.key;

              return (
                <div
                  key={item.key}
                  onClick={() => handleMenuClick(item.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: isActive
                      ? `linear-gradient(135deg, ${item.color}10, ${item.color}05)`
                      : 'white',
                    border: isActive ? `1px solid ${item.color}30` : '1px solid #f0f0f0',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'translateX(0)',
                    boxShadow: isActive ? `0 2px 8px ${item.color}20` : 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.boxShadow = `0 4px 12px ${item.color}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = isActive ? `0 2px 8px ${item.color}20` : 'none';
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: `linear-gradient(135deg, ${item.color}15, ${item.color}08)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon style={{
                      fontSize: '18px',
                      color: item.color
                    }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{
                      display: 'block',
                      fontSize: '15px',
                      color: '#262626',
                      marginBottom: '2px'
                    }}>
                      {item.label}
                    </Text>
                    <Text style={{
                      fontSize: '12px',
                      color: '#8c8c8c',
                      display: 'block'
                    }}>
                      {item.description}
                    </Text>
                  </div>

                  {isActive && (
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: item.color,
                      flexShrink: 0
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 版权信息 */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #e6f7ff',
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '0 0 12px 12px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}>
            {/* 主要版权信息 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Text style={{
                fontSize: '12px',
                color: '#595959',
                fontWeight: '500'
              }}>
                © {currentYear} Diet Estimator
              </Text>
              <Text style={{
                fontSize: '12px',
                color: '#ff4d4f'
              }}>
                <HeartOutlined style={{ marginRight: '4px' }} />
                Made with love
              </Text>
            </div>

            {/* GitHub链接和版本信息 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <a
                href="https://github.com/Liyulingyue/DietEstimator"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  color: '#1890ff',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#40a9ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#1890ff';
                }}
              >
                <GithubOutlined />
                GitHub
              </a>

              <Text style={{
                fontSize: '11px',
                color: '#bfbfbf'
              }}>
                •
              </Text>

              <Text style={{
                fontSize: '11px',
                color: '#bfbfbf',
                fontWeight: '500'
              }}>
                v1.0.0
              </Text>
            </div>
          </div>
        </div>
      </>
    );
  };

  // 使用 Drawer（移动端和桌面端统一）
  return (
    <Drawer
      title={
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 0 8px 20px'
        }}>
          {/* <Avatar
            size={40}
            style={{
              background: 'linear-gradient(135deg, #1890ff, #36cfc9)',
              fontSize: '18px',
              fontWeight: '600'
            }}
          >
            食
          </Avatar> */}
          <div>
            <Title level={5} style={{ margin: 0, color: '#262626' }}>
              Diet Estimator
            </Title>
            <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
              基于AI的食物热量分析助手
            </Text>
          </div>
        </div>
      }
      placement="left"
      open={visible}
      onClose={onClose}
      width={280}
      bodyStyle={{
        padding: '16px 0',
        background: 'linear-gradient(180deg, #f0f5ff 0%, #f5f5f5 100%)'
      }}
      headerStyle={{
        background: 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)',
        color: 'white',
        borderBottom: 'none',
        padding: '16px 20px'
      }}
      closeIcon={
        <CloseOutlined style={{
          color: 'white',
          fontSize: '16px'
        }} />
      }
      maskStyle={{
        background: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(4px)'
      }}
    >
      {/* 使用公共菜单渲染函数 */}
      {renderMenuContent()}
    </Drawer>
  );
}