import { useNavigate } from 'react-router-dom'
import { Button, Card, Typography, Steps, Collapse } from 'antd'
import { CheckCircleOutlined, RocketOutlined, FireOutlined, BarChartOutlined, BulbOutlined, SafetyOutlined } from '@ant-design/icons'
import ResponsiveLayout from '../components/ResponsiveLayout'
import PageHeader from '../components/PageHeader'

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

function AppIntroduction() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FireOutlined style={{ fontSize: '32px', color: '#52c41a' }} />,
      title: '热量分析',
      description: '上传食物图片，AI 快速识别并分析热量',
      color: '#52c41a'
    },
    {
      icon: <BarChartOutlined style={{ fontSize: '32px', color: '#722ed1' }} />,
      title: '营养评估',
      description: '提供蛋白质、脂肪、碳水等详细营养成分分析',
      color: '#722ed1'
    },
    {
      icon: <BulbOutlined style={{ fontSize: '32px', color: '#1890ff' }} />,
      title: '智能建议',
      description: '基于分析结果提供个性化健康饮食建议',
      color: '#1890ff'
    },
    {
      icon: <SafetyOutlined style={{ fontSize: '32px', color: '#fa8c16' }} />,
      title: '数据安全',
      description: '您的数据经过加密处理，保证隐私安全',
      color: '#fa8c16'
    },
  ];

  const faqs = [
    {
      q: '如何获得最准确的分析结果？',
      a: '建议拍摄清晰的食物照片，确保光线充足，食物完整可见。可以在照片中放置参照物（如手机、硬币）帮助 AI 更准确地估算份量。'
    },
    {
      q: '支持哪些类型的食物？',
      a: '我们的 AI 模型支持识别大部分常见食物，包括中餐、西餐、日料、快餐等。对于复杂的混合菜品，系统会尽可能分解并分析各个成分。'
    },
    {
      q: '分析需要多长时间？',
      a: '通常情况下，分析会在几秒钟内完成。复杂的食物可能需要稍长时间，但一般不会超过 10 秒。'
    },
    {
      q: '数据会被如何使用？',
      a: '您的数据仅用于提供个性化服务和改进 AI 模型。我们不会将您的个人数据分享给第三方，所有数据都经过加密存储。'
    },
  ];

  return (
    <ResponsiveLayout>
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f0f9ff 0%, #f5f5f5 100%)',
      padding: '0'
    }}>
      {/* 顶部标题栏 */}
      <PageHeader
        title={<>📖 使用说明</>}
        background="linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)"
        titleSize={24}
        padding="24px 20px"
      />

      <div style={{ padding: '0 16px' }}>
        {/* 欢迎卡片 */}
        <Card 
          style={{
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #fff 0%, #f0f9ff 100%)'
          }}
          bodyStyle={{ padding: '32px 24px' }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <Title level={3} style={{ marginBottom: '8px', color: '#262626' }}>
              欢迎使用饮食评估平台
            </Title>
            <Text style={{ fontSize: '15px', color: '#595959', lineHeight: '1.6' }}>
              基于先进 AI 技术的智能饮食分析工具
            </Text>
          </div>
        </Card>

        {/* 主要功能 */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RocketOutlined style={{ color: '#1890ff' }} />
              <Text strong style={{ fontSize: '16px' }}>主要功能</Text>
            </div>
          }
          style={{
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            marginBottom: '16px'
          }}
          bodyStyle={{ padding: '20px' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  padding: '20px 16px',
                  borderRadius: '16px',
                  background: `${feature.color}08`,
                  border: `1px solid ${feature.color}15`,
                  textAlign: 'center'
                }}
              >
                <div style={{ marginBottom: '12px' }}>{feature.icon}</div>
                <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '15px' }}>
                  {feature.title}
                </Text>
                <Text style={{ fontSize: '13px', color: '#595959', lineHeight: '1.5' }}>
                  {feature.description}
                </Text>
              </div>
            ))}
          </div>
        </Card>

        {/* 使用步骤 */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <Text strong style={{ fontSize: '16px' }}>使用步骤</Text>
            </div>
          }
          style={{
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            marginBottom: '16px'
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <Steps
            direction="vertical"
            current={-1}
            items={[
              {
                title: <Text strong>注册登录</Text>,
                description: '创建您的个人账号，开始使用服务',
                icon: <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: '#1890ff',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600'
                }}>1</div>
              },
              {
                title: <Text strong>上传食物图片</Text>,
                description: '拍摄或上传食物照片，支持多种格式',
                icon: <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: '#52c41a',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600'
                }}>2</div>
              },
              {
                title: <Text strong>AI 智能分析</Text>,
                description: '等待几秒钟，AI 将自动识别并分析',
                icon: <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: '#722ed1',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600'
                }}>3</div>
              },
              {
                title: <Text strong>查看详细报告</Text>,
                description: '获取热量、营养成分和健康建议',
                icon: <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: '#fa8c16',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600'
                }}>4</div>
              }
            ]}
          />
        </Card>

        {/* 常见问题 */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>💬</span>
              <Text strong style={{ fontSize: '16px' }}>常见问题</Text>
            </div>
          }
          style={{
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            marginBottom: '16px'
          }}
          bodyStyle={{ padding: '20px 12px' }}
        >
          <Collapse 
            bordered={false}
            expandIconPosition="end"
            style={{ background: 'transparent' }}
          >
            {faqs.map((faq, index) => (
              <Panel 
                header={<Text strong style={{ fontSize: '14px' }}>{faq.q}</Text>}
                key={index}
                style={{
                  marginBottom: '12px',
                  background: '#fafafa',
                  borderRadius: '12px',
                  border: 'none'
                }}
              >
                <Paragraph style={{ 
                  margin: 0, 
                  color: '#595959',
                  fontSize: '14px',
                  lineHeight: '1.7'
                }}>
                  {faq.a}
                </Paragraph>
              </Panel>
            ))}
          </Collapse>
        </Card>

        {/* 开始使用按钮 */}
        <Button
          type="primary"
          size="large"
          block
          onClick={() => navigate('/app/analyse')}
          style={{
            height: '52px',
            borderRadius: '16px',
            fontSize: '16px',
            fontWeight: '600',
            background: 'linear-gradient(135deg, #52c41a, #73d13d)',
            border: 'none',
            boxShadow: '0 4px 16px rgba(82, 196, 26, 0.3)'
          }}
        >
          开始使用 →
        </Button>
      </div>
    </div>
    </ResponsiveLayout>
  )
}

export default AppIntroduction