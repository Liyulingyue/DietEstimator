import { Card, Typography, Button, List, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import MobileTabBar from '../components/MobileTabBar';

const { Title, Text } = Typography;

export default function MobilePanel() {
  // 模拟数据
  const records = [
    { id: 1, date: '2024-10-23', calories: 1850, items: ['早餐: 牛奶+面包', '午餐: 米饭+蔬菜'] },
    { id: 2, date: '2024-10-22', calories: 2100, items: ['早餐: 粥+鸡蛋', '午餐: 面条+肉'] },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '20px',
      paddingBottom: '80px'
    }}>
      <MobileTabBar />

      <div style={{ marginTop: '20px' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: '20px', color: '#722ed1' }}>
          状态管理与记录
        </Title>

        {/* 添加记录按钮 */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          block
          style={{ marginBottom: '20px', height: '48px', fontSize: '16px' }}
        >
          添加新记录
        </Button>

        {/* 今日概览 */}
        <Card style={{
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)',
          border: '2px solid rgba(82, 196, 26, 0.3)',
          borderRadius: '12px'
        }}>
          <Title level={4} style={{ color: '#52c41a', marginBottom: '10px' }}>今日概览</Title>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text style={{ fontSize: '18px', fontWeight: 'bold' }}>1850 kcal</Text>
              <br />
              <Text style={{ color: '#666' }}>已摄入热量</Text>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Text style={{ fontSize: '18px', fontWeight: 'bold' }}>2150 kcal</Text>
              <br />
              <Text style={{ color: '#666' }}>目标热量</Text>
            </div>
          </div>
        </Card>

        {/* 记录列表 */}
        <Card title="饮食记录" style={{ borderRadius: '12px' }}>
          <List
            dataSource={records}
            renderItem={item => (
              <List.Item
                actions={[
                  <Button key="edit" type="text" icon={<EditOutlined />} />,
                  <Button key="delete" type="text" danger icon={<DeleteOutlined />} />
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar style={{ backgroundColor: '#722ed1' }}>{item.date.slice(-2)}</Avatar>}
                  title={<Text strong>{item.date} - {item.calories} kcal</Text>}
                  description={
                    <div>
                      {item.items.map((food, index) => (
                        <div key={index} style={{ fontSize: '14px', color: '#666' }}>
                          {food}
                        </div>
                      ))}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </div>
    </div>
  );
}