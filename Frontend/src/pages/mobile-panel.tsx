import { Card, Typography, Button, List, Avatar, Progress, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FireOutlined, TrophyOutlined, CalendarOutlined } from '@ant-design/icons';
import ResponsiveLayout from '../components/ResponsiveLayout';
import PageHeader from '../components/PageHeader';
import { useState } from 'react';

const { Title, Text } = Typography;

export default function MobilePanel() {
  const [pressedItem, setPressedItem] = useState<number | null>(null);

  // 模拟数据
  const todayData = {
    consumed: 1850,
    target: 2150,
    percentage: 86,
    meals: 3
  };

  const records = [
    { 
      id: 1, 
      date: '2024-10-23', 
      calories: 1850, 
      items: ['早餐: 牛奶+面包 (350 kcal)', '午餐: 米饭+蔬菜 (680 kcal)', '晚餐: 沙拉 (420 kcal)'],
      status: 'good'
    },
    { 
      id: 2, 
      date: '2024-10-22', 
      calories: 2100, 
      items: ['早餐: 粥+鸡蛋 (280 kcal)', '午餐: 面条+肉 (820 kcal)', '晚餐: 汤+主食 (1000 kcal)'],
      status: 'normal'
    },
    { 
      id: 3, 
      date: '2024-10-21', 
      calories: 1920, 
      items: ['早餐: 三明治 (400 kcal)', '午餐: 炒饭 (720 kcal)'],
      status: 'good'
    },
  ];

  return (
    <ResponsiveLayout>
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f9f0ff 0%, #f5f5f5 100%)',
      padding: '0'
    }}>
      {/* 顶部标题栏 */}
      <PageHeader
        title="📈 状态管理"
        description="跟踪您的饮食记录和健康目标"
        background="linear-gradient(135deg, #722ed1 0%, #9254de 100%)"
        titleSize={24}
        descSize={14}
        padding="24px 20px"
      />

      <div style={{ padding: '0 16px' }}>
        {/* 添加记录按钮 */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          block
          style={{ 
            marginBottom: '20px', 
            height: '52px', 
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #722ed1, #9254de)',
            border: 'none',
            boxShadow: '0 4px 16px rgba(114, 46, 209, 0.3)'
          }}
        >
          添加新记录
        </Button>

        {/* 今日概览卡片 */}
        <Card style={{
          marginBottom: '20px',
          background: 'white',
          border: 'none',
          borderRadius: '20px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: '24px' }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '20px' 
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #722ed115, #9254de08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CalendarOutlined style={{ fontSize: '20px', color: '#722ed1' }} />
            </div>
            <Title level={4} style={{ 
              color: '#262626', 
              margin: 0,
              fontSize: '18px',
              fontWeight: '600'
            }}>
              今日概览
            </Title>
          </div>

          {/* 热量进度 */}
          <div style={{
            background: 'linear-gradient(135deg, #722ed108, #9254de05)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <Text style={{ fontSize: '14px', color: '#8c8c8c' }}>今日热量摄入</Text>
            </div>
            
            <Progress 
              percent={todayData.percentage} 
              strokeColor={{
                '0%': '#722ed1',
                '100%': '#9254de',
              }}
              trailColor="#f0f0f0"
              strokeWidth={12}
              format={() => `${todayData.percentage}%`}
              style={{ marginBottom: '16px' }}
            />

            <Row gutter={16}>
              <Col span={12}>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <FireOutlined style={{ fontSize: '24px', color: '#ff4d4f', marginBottom: '8px' }} />
                  <div>
                    <Text style={{ 
                      display: 'block',
                      fontSize: '24px', 
                      fontWeight: '700',
                      color: '#262626',
                      lineHeight: '1.2'
                    }}>
                      {todayData.consumed}
                    </Text>
                    <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>已摄入 (kcal)</Text>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <TrophyOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
                  <div>
                    <Text style={{ 
                      display: 'block',
                      fontSize: '24px', 
                      fontWeight: '700',
                      color: '#262626',
                      lineHeight: '1.2'
                    }}>
                      {todayData.target}
                    </Text>
                    <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>目标 (kcal)</Text>
                  </div>
                </div>
              </Col>
            </Row>

            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <Text style={{ fontSize: '13px', color: '#595959' }}>
                还剩 <Text strong style={{ color: '#722ed1', fontSize: '16px' }}>{todayData.target - todayData.consumed}</Text> kcal 可摄入
              </Text>
            </div>
          </div>
        </Card>

        {/* 饮食记录列表 */}
        <Card 
          title={
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px'
            }}>
              <span style={{ fontSize: '18px' }}>📝</span>
              <Text strong style={{ fontSize: '16px' }}>饮食记录</Text>
            </div>
          }
          style={{ 
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
          }}
          bodyStyle={{ padding: '12px' }}
        >
          <List
            dataSource={records}
            renderItem={(item, index) => {
              const isPressed = pressedItem === item.id;
              const statusColor = item.status === 'good' ? '#52c41a' : '#faad14';
              
              return (
                <div
                  style={{
                    marginBottom: index < records.length - 1 ? '12px' : 0,
                    borderRadius: '16px',
                    background: isPressed ? '#fafafa' : 'white',
                    border: '1px solid #f0f0f0',
                    padding: '16px',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onTouchStart={() => setPressedItem(item.id)}
                  onTouchEnd={() => setTimeout(() => setPressedItem(null), 150)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <Avatar 
                      style={{ 
                        backgroundColor: `${statusColor}15`,
                        color: statusColor,
                        fontWeight: '600',
                        border: `2px solid ${statusColor}30`,
                        flexShrink: 0
                      }}
                      size={48}
                    >
                      {item.date.slice(-2)}
                    </Avatar>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <Text strong style={{ fontSize: '15px', color: '#262626' }}>
                          {item.date}
                        </Text>
                        <div style={{
                          background: `${statusColor}10`,
                          padding: '4px 12px',
                          borderRadius: '12px',
                          border: `1px solid ${statusColor}30`
                        }}>
                          <Text strong style={{ fontSize: '14px', color: statusColor }}>
                            {item.calories} kcal
                          </Text>
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '12px' }}>
                        {item.items.map((food, idx) => (
                          <div 
                            key={idx} 
                            style={{ 
                              fontSize: '13px', 
                              color: '#595959',
                              lineHeight: '1.8',
                              paddingLeft: '8px',
                              borderLeft: '2px solid #f0f0f0',
                              marginBottom: '4px'
                            }}
                          >
                            {food}
                          </div>
                        ))}
                      </div>

                      <div style={{ 
                        display: 'flex', 
                        gap: '8px',
                        justifyContent: 'flex-end'
                      }}>
                        <Button 
                          type="text" 
                          size="small"
                          icon={<EditOutlined />}
                          style={{ 
                            color: '#1890ff',
                            fontSize: '12px'
                          }}
                        >
                          编辑
                        </Button>
                        <Button 
                          type="text" 
                          size="small"
                          danger 
                          icon={<DeleteOutlined />}
                          style={{ fontSize: '12px' }}
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </Card>
      </div>
    </div>
    </ResponsiveLayout>
  );
}