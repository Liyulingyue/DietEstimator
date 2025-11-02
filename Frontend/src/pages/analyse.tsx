import TabBar from '../components/TabBar';
import Gallery from '../components/Gallery';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

export default function Analyse() {
  return (
    <div style={{ 
      width: '100vw',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      display: 'flex',
      justifyContent: 'center',
      padding: '20px 0'
    }}>
      <div style={{ 
        width: '95%', 
        maxWidth: '1400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        paddingTop: '80px' // 增加顶部距离，避免被TabBar遮挡
      }}>
        <TabBar />
        <Gallery />
        
        {/* 分析结果展示块 */}
        <Card style={{
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          border: '2px solid rgba(33, 150, 243, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(33, 150, 243, 0.2)',
          padding: '16px'
        }}>
          <Title level={4} style={{ color: '#1565c0', marginBottom: '16px', marginTop: '8px' }}>分析结果</Title>
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
