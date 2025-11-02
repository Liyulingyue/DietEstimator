import { Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FireOutlined, ExperimentOutlined, BarChartOutlined, SettingOutlined, InfoCircleOutlined, PictureOutlined, RightOutlined } from '@ant-design/icons';
import ResponsiveLayout from '../components/ResponsiveLayout';
import PageHeader from '../components/PageHeader';
import { useState } from 'react';

const { Title, Text } = Typography;

export default function MobileHome() {
  const navigate = useNavigate();
  const [pressedCard, setPressedCard] = useState<string | null>(null);

  const mainFeatures = [
    {
      key: 'analyse',
      title: '热量分析',
      description: '上传食物图片，快速分析热量',
      icon: FireOutlined,
      gradient: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
      color: '#52c41a',
      path: '/app/analyse'
    },
    {
      key: 'panel',
      title: '状态管理',
      description: '管理饮食记录，跟踪健康状态',
      icon: BarChartOutlined,
      gradient: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
      color: '#722ed1',
      path: '/app/panel'
    },
    {
      key: 'labs',
      title: '实验室',
      description: '探索实验性功能和最新技术',
      icon: ExperimentOutlined,
      gradient: 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
      color: '#fa8c16',
      path: '/app/labs'
    },
  ];

  const extraFeatures = [
    { icon: SettingOutlined, label: '用户管理与配置', path: '/app/config', color: '#1890ff' },
    { icon: InfoCircleOutlined, label: '使用说明', path: '/app/introduction', color: '#13c2c2' },
    { icon: PictureOutlined, label: '图片画廊', path: '/app/gallery', color: '#eb2f96' },
  ];

  const handleCardClick = (path: string, key: string) => {
    setPressedCard(key);
    setTimeout(() => {
      setPressedCard(null);
      navigate(path);
    }, 150);
  };

  return (
    <ResponsiveLayout>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f0f5ff 0%, #f5f5f5 100%)',
        padding: '0'
      }}>
        {/* 顶部头部区域 */}
        <PageHeader
          title="饮食评估助手"
          description="基于AI的食物热量分析助手"
        />

      <div style={{ 
        padding: '0 16px',
        maxWidth: '100%',
        margin: '0 auto'
      }}>
        {/* 主要功能卡片 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {mainFeatures.map(feature => {
            const Icon = feature.icon;
            const isPressed = pressedCard === feature.key;
            
            return (
              <Card
                key={feature.key}
                style={{
                  borderRadius: '20px',
                  border: 'none',
                  boxShadow: isPressed 
                    ? '0 2px 8px rgba(0, 0, 0, 0.08)' 
                    : '0 4px 16px rgba(0, 0, 0, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isPressed ? 'scale(0.98)' : 'scale(1)',
                  overflow: 'hidden',
                  position: 'relative',
                  background: 'white'
                }}
                onClick={() => handleCardClick(feature.path, feature.key)}
                onTouchStart={() => setPressedCard(feature.key)}
                onTouchEnd={() => setTimeout(() => setPressedCard(null), 150)}
                bodyStyle={{ padding: '20px' }}
              >
                {/* 背景装饰 */}
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  right: '-30px',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: `${feature.color}08`,
                  opacity: 0.5
                }} />

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: 1,
                  minHeight: '80px'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '18px',
                    background: feature.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 8px 16px ${feature.color}33`,
                    flexShrink: 0,
                    marginRight: '16px'
                  }}>
                    <Icon style={{ fontSize: '32px', color: 'white' }} />
                  </div>

                  <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    <Title level={4} style={{
                      margin: 0,
                      marginBottom: '4px',
                      color: '#262626',
                      fontSize: '18px',
                      fontWeight: '600'
                    }}>
                      {feature.title}
                    </Title>
                    <Text style={{
                      color: '#8c8c8c',
                      fontSize: '14px',
                      display: 'block',
                      lineHeight: '1.5'
                    }}>
                      {feature.description}
                    </Text>
                  </div>

                  <RightOutlined style={{
                    fontSize: '16px',
                    color: '#d9d9d9',
                    flexShrink: 0,
                    marginLeft: '16px'
                  }} />
                </div>
              </Card>
            );
          })}
        </div>

        {/* 更多功能 */}
        <div style={{ marginBottom: '16px' }}>
          <Text style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#262626',
            display: 'block',
            marginBottom: '12px',
            paddingLeft: '4px'
          }}>
            更多功能
          </Text>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '12px' 
          }}>
            {extraFeatures.map((item, index) => {
              const Icon = item.icon;
              const isPressed = pressedCard === `extra-${index}`;
              
              return (
                <Card
                  key={index}
                  style={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: isPressed 
                      ? '0 2px 6px rgba(0, 0, 0, 0.06)' 
                      : '0 2px 12px rgba(0, 0, 0, 0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isPressed ? 'scale(0.95)' : 'scale(1)',
                    background: 'white'
                  }}
                  onClick={() => handleCardClick(item.path, `extra-${index}`)}
                  onTouchStart={() => setPressedCard(`extra-${index}`)}
                  onTouchEnd={() => setTimeout(() => setPressedCard(null), 150)}
                  bodyStyle={{ 
                    padding: '20px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: `${item.color}10`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '4px'
                  }}>
                    <Icon style={{ fontSize: '24px', color: item.color }} />
                  </div>
                  <Text style={{ 
                    fontSize: '13px', 
                    color: '#595959',
                    fontWeight: '500',
                    textAlign: 'center',
                    lineHeight: '1.4'
                  }}>
                    {item.label}
                  </Text>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </ResponsiveLayout>
  );
}