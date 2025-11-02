import { Card, Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FireOutlined, ExperimentOutlined, BarChartOutlined, SettingOutlined, InfoCircleOutlined, PictureOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function MobileHome() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '20px',
      paddingBottom: '80px' // 为底部导航留空间
    }}>
      {/* 标题区域 */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        padding: '20px',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <Title level={2} style={{ color: '#1890ff', marginBottom: '10px' }}>
          基于大模型的饮食评估
        </Title>
        <Text style={{ fontSize: '16px', color: '#666' }}>
          利用先进的大模型技术，为您提供精准的饮食热量分析和营养评估。
        </Text>
      </div>

      {/* 功能卡片 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Card
          style={{
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/app/analyse')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #52c41a, #73d13d)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FireOutlined style={{ fontSize: '24px', color: 'white' }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#52c41a' }}>热量分析</Title>
              <Text style={{ color: '#666' }}>上传食物图片，快速分析热量</Text>
            </div>
          </div>
        </Card>

        <Card
          style={{
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/app/panel')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #722ed1, #9254de)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BarChartOutlined style={{ fontSize: '24px', color: 'white' }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#722ed1' }}>状态管理与记录</Title>
              <Text style={{ color: '#666' }}>管理饮食记录，跟踪健康状态</Text>
            </div>
          </div>
        </Card>

        <Card
          style={{
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/app/labs')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fa8c16, #faad14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ExperimentOutlined style={{ fontSize: '24px', color: 'white' }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#fa8c16' }}>实验室</Title>
              <Text style={{ color: '#666' }}>探索实验性功能和最新技术</Text>
            </div>
          </div>
        </Card>
      </div>

      {/* 额外功能按钮 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <Button
          type="default"
          size="large"
          icon={<SettingOutlined />}
          onClick={() => navigate('/app/config')}
          style={{
            height: '50px',
            borderRadius: '12px',
            background: 'white',
            border: '2px solid #1890ff',
            color: '#1890ff'
          }}
        >
          配置管理
        </Button>
        <Button
          type="default"
          size="large"
          icon={<InfoCircleOutlined />}
          onClick={() => navigate('/app/introduction')}
          style={{
            height: '50px',
            borderRadius: '12px',
            background: 'white',
            border: '2px solid #52c41a',
            color: '#52c41a'
          }}
        >
          使用说明
        </Button>
        <Button
          type="default"
          size="large"
          icon={<PictureOutlined />}
          onClick={() => navigate('/app/gallery')}
          style={{
            height: '50px',
            borderRadius: '12px',
            background: 'white',
            border: '2px solid #fa8c16',
            color: '#fa8c16'
          }}
        >
          画廊
        </Button>
      </div>
    </div>
  );
}