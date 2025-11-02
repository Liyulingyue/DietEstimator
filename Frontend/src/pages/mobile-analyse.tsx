import { Card, Typography } from 'antd';
import Gallery from '../components/Gallery';
import MobileTabBar from '../components/MobileTabBar';

const { Title, Text } = Typography;

export default function MobileAnalyse() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '20px',
      paddingBottom: '80px' // 为底部导航留空间
    }}>
      <MobileTabBar />

      <div style={{ marginTop: '20px' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: '20px', color: '#1890ff' }}>
          热量分析
        </Title>

        <Gallery />

        {/* 分析结果展示块 */}
        <Card style={{
          marginTop: '20px',
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          border: '2px solid rgba(33, 150, 243, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(33, 150, 243, 0.2)',
          padding: '16px'
        }}>
          <Title level={4} style={{ color: '#1565c0', marginBottom: '16px', marginTop: '8px' }}>
            分析结果
          </Title>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '8px',
            padding: '16px',
            minHeight: '120px',
            border: '1px solid rgba(33, 150, 243, 0.2)'
          }}>
            <Text style={{ color: '#424242', fontSize: '14px' }}>
              暂无分析结果，请先上传图片进行分析。
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
}