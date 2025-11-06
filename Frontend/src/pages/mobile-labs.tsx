import { Card, Typography, Button, Progress, Tag } from 'antd';
import { ExperimentOutlined, BulbOutlined, ApiOutlined, ThunderboltOutlined, StarOutlined, ScanOutlined } from '@ant-design/icons';
import ResponsiveLayout from '../components/ResponsiveLayout';
import PageHeader from '../components/PageHeader';
import { useState } from 'react';

const { Title, Text, Paragraph } = Typography;

export default function MobileLabs() {
  const [pressedCard, setPressedCard] = useState<string | null>(null);

  const experiments = [
    {
      key: 'weight',
      title: '智能重量估算',
      description: '基于AI技术自动估算食物重量，提高热量计算精度。无需手动称重，让分析更便捷。',
      icon: BulbOutlined,
      gradient: 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
      bgGradient: 'linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%)',
      color: '#fa8c16',
      tag: { text: 'Beta', color: 'orange' },
      progress: null,
      available: true
    },
    {
      key: 'package-scan',
      title: '包装袋营养成分与克重识别',
      description: '智能识别食品包装袋上的营养成分表和克重信息，快速获取准确的营养数据。',
      icon: ScanOutlined,
      gradient: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
      bgGradient: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
      color: '#52c41a',
      tag: { text: 'Coming Soon', color: 'green' },
      progress: 25,
      available: false
    },
    {
      key: 'nutrition',
      title: '营养成分分析',
      description: '深度分析食物营养成分，提供蛋白质、脂肪、碳水化合物等详细的营养报告。',
      icon: ApiOutlined,
      gradient: 'linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)',
      bgGradient: 'linear-gradient(135deg, #e6fffb 0%, #b5f5ec 100%)',
      color: '#13c2c2',
      tag: { text: 'Alpha', color: 'cyan' },
      progress: 75,
      available: false
    },
    {
      key: 'recommend',
      title: '个性化推荐',
      description: '根据您的饮食习惯、健康目标和身体状况，提供个性化饮食建议和健康方案。',
      icon: StarOutlined,
      gradient: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
      bgGradient: 'linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)',
      color: '#722ed1',
      tag: { text: 'Planned', color: 'purple' },
      progress: 35,
      available: false
    },
  ];

  const handleCardClick = (key: string, available: boolean) => {
    if (!available) return;
    setPressedCard(key);
    setTimeout(() => setPressedCard(null), 150);
    // TODO: 实现功能导航
  };

  return (
    <ResponsiveLayout>
    <div style={{
      background: 'linear-gradient(180deg, #fff7e6 0%, #f5f5f5 100%)',
      padding: '0'
    }}>
      {/* 顶部标题栏 */}
      <PageHeader
        title={<><ExperimentOutlined style={{ marginRight: '8px' }} />实验室</>}
        description="探索最新的实验性功能和技术"
        background="linear-gradient(135deg, #fa8c16 0%, #faad14 100%)"
        titleSize={24}
        descSize={14}
        padding="24px 20px"
      />

      <div style={{ padding: '0 16px' }}>
        {/* 提示信息 */}
        <div style={{
          marginBottom: '20px',
          padding: '16px',
          background: 'linear-gradient(135deg, #e6f7ff 0%, #d6f0ff 100%)',
          borderRadius: '16px',
          border: '1px solid #91d5ff40',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <ThunderboltOutlined style={{ 
            fontSize: '20px', 
            color: '#1890ff',
            marginTop: '2px',
            flexShrink: 0
          }} />
          <div>
            <Text strong style={{ fontSize: '14px', color: '#262626', display: 'block', marginBottom: '4px' }}>
              实验室功能说明
            </Text>
            <Text style={{ fontSize: '13px', color: '#595959', lineHeight: '1.6' }}>
              这里展示的是正在开发或测试中的功能，部分功能可能不稳定或尚未完成。
            </Text>
          </div>
        </div>

        {/* 实验功能卡片列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {experiments.map(exp => {
            const Icon = exp.icon;
            const isPressed = pressedCard === exp.key;
            
            return (
              <Card
                key={exp.key}
                style={{
                  borderRadius: '20px',
                  border: 'none',
                  boxShadow: isPressed 
                    ? '0 2px 8px rgba(0, 0, 0, 0.08)' 
                    : '0 4px 16px rgba(0, 0, 0, 0.08)',
                  background: exp.bgGradient,
                  cursor: exp.available ? 'pointer' : 'not-allowed',
                  opacity: exp.available ? 1 : 0.85,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isPressed ? 'scale(0.98)' : 'scale(1)',
                  overflow: 'hidden',
                  position: 'relative'
                }}
                onClick={() => handleCardClick(exp.key, exp.available)}
                onTouchStart={() => exp.available && setPressedCard(exp.key)}
                onTouchEnd={() => setTimeout(() => setPressedCard(null), 150)}
                styles={{ body: { padding: '24px' } }}
              >
                {/* 背景装饰圆圈 */}
                <div style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  width: '140px',
                  height: '140px',
                  borderRadius: '50%',
                  background: `${exp.color}10`,
                  opacity: 0.5
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  {/* 头部 */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    gap: '16px', 
                    marginBottom: '16px' 
                  }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      background: exp.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 8px 16px ${exp.color}33`,
                      flexShrink: 0
                    }}>
                      <Icon style={{ fontSize: '28px', color: 'white' }} />
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: '6px',
                        flexWrap: 'wrap'
                      }}>
                        <Title level={4} style={{ 
                          margin: 0, 
                          color: '#262626',
                          fontSize: '18px',
                          fontWeight: '600'
                        }}>
                          {exp.title}
                        </Title>
                        <Tag color={exp.tag.color} style={{ margin: 0 }}>
                          {exp.tag.text}
                        </Tag>
                      </div>
                    </div>
                  </div>

                  {/* 描述 */}
                  <Paragraph style={{ 
                    color: '#595959', 
                    marginBottom: exp.progress !== null ? '16px' : '20px',
                    fontSize: '14px',
                    lineHeight: '1.7'
                  }}>
                    {exp.description}
                  </Paragraph>

                  {/* 进度条 */}
                  {exp.progress !== null && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}>
                        <Text style={{ fontSize: '13px', color: '#8c8c8c' }}>
                          开发进度
                        </Text>
                        <Text strong style={{ fontSize: '13px', color: exp.color }}>
                          {exp.progress}%
                        </Text>
                      </div>
                      <Progress 
                        percent={exp.progress} 
                        strokeColor={{
                          '0%': exp.color,
                          '100%': exp.color + 'aa'
                        }}
                        trailColor="rgba(255, 255, 255, 0.6)"
                        size={8}
                        showInfo={false}
                      />
                    </div>
                  )}

                  {/* 按钮 */}
                  <Button 
                    type={exp.available ? 'primary' : 'default'}
                    disabled={!exp.available}
                    block
                    size="large"
                    style={{ 
                      borderRadius: '12px',
                      height: '44px',
                      fontWeight: '600',
                      fontSize: '15px',
                      ...(exp.available ? {
                        background: exp.gradient,
                        border: 'none',
                        boxShadow: `0 4px 12px ${exp.color}33`
                      } : {})
                    }}
                  >
                    {exp.available ? '立即体验' : '敬请期待'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
    </ResponsiveLayout>
  );
}