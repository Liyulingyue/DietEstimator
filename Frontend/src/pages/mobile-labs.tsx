import { Card, Typography, Button, Progress, Tag } from 'antd';
import { ExperimentOutlined, BulbOutlined, ApiOutlined } from '@ant-design/icons';
import MobileTabBar from '../components/MobileTabBar';

const { Title, Text, Paragraph } = Typography;

export default function MobileLabs() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '20px',
      paddingBottom: '80px'
    }}>
      <MobileTabBar />

      <div style={{ marginTop: '20px' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: '20px', color: '#fa8c16' }}>
          <ExperimentOutlined style={{ marginRight: '8px' }} />
          实验室
        </Title>

        <Text style={{ display: 'block', textAlign: 'center', marginBottom: '30px', color: '#666' }}>
          探索最新的实验性功能和技术
        </Text>

        {/* 实验功能卡片 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fa8c16, #faad14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BulbOutlined style={{ fontSize: '24px', color: 'white' }} />
              </div>
              <div>
                <Title level={4} style={{ margin: 0, color: '#fa8c16' }}>智能重量估算</Title>
                <Tag color="orange" style={{ marginTop: '4px' }}>Beta</Tag>
              </div>
            </div>
            <Paragraph style={{ color: '#666', marginBottom: '16px' }}>
              基于AI技术自动估算食物重量，提高热量计算精度。
            </Paragraph>
            <Button type="primary" style={{ width: '100%' }}>
              立即体验
            </Button>
          </Card>

          <Card
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #e6fffb 0%, #87e8de 100%)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #13c2c2, #36cfc9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ApiOutlined style={{ fontSize: '24px', color: 'white' }} />
              </div>
              <div>
                <Title level={4} style={{ margin: 0, color: '#13c2c2' }}>营养成分分析</Title>
                <Tag color="cyan" style={{ marginTop: '4px' }}>Alpha</Tag>
              </div>
            </div>
            <Paragraph style={{ color: '#666', marginBottom: '16px' }}>
              深度分析食物营养成分，提供详细的营养报告。
            </Paragraph>
            <Progress percent={75} status="active" strokeColor="#13c2c2" />
            <Text style={{ fontSize: '12px', color: '#666', marginTop: '8px', display: 'block' }}>
              开发进度: 75%
            </Text>
          </Card>

          <Card
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #f9f0ff 0%, #d3adf7 100%)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #722ed1, #9254de)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ExperimentOutlined style={{ fontSize: '24px', color: 'white' }} />
              </div>
              <div>
                <Title level={4} style={{ margin: 0, color: '#722ed1' }}>个性化推荐</Title>
                <Tag color="purple" style={{ marginTop: '4px' }}>Coming Soon</Tag>
              </div>
            </div>
            <Paragraph style={{ color: '#666', marginBottom: '16px' }}>
              根据您的饮食习惯和健康目标，提供个性化饮食建议。
            </Paragraph>
            <Button disabled style={{ width: '100%' }}>
              敬请期待
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}