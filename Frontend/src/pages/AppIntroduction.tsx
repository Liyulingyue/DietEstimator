import { useNavigate } from 'react-router-dom'
import { Button, Card, Typography, Steps, Collapse } from 'antd'
import { CheckCircleOutlined, RocketOutlined, FireOutlined, BulbOutlined, SafetyOutlined, PictureOutlined, SettingOutlined } from '@ant-design/icons'
import ResponsiveLayout from '../components/ResponsiveLayout'
import PageHeader from '../components/PageHeader'

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

function AppIntroduction() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FireOutlined style={{ fontSize: '32px', color: '#52c41a' }} />,
      title: '热量与营养分析',
      description: '上传食物或包装照片，AI 自动识别并分析热量与常见营养成分（蛋白质/脂肪/碳水）',
      color: '#52c41a'
    },
    {
      icon: <PictureOutlined style={{ fontSize: '32px', color: '#eb2f96' }} />,
      title: '画廊与分享',
      description: '将您的餐食分享到社区画廊，查看别人分享的健康餐与做法',
      color: '#eb2f96'
    },
    {
      icon: <SettingOutlined style={{ fontSize: '32px', color: '#1890ff' }} />,
      title: '本地配置与饮食目标',
      description: '在“用户管理与配置”中设置每日热量目标（本地保存，支持实时同步到状态页）',
      color: '#1890ff'
    },
    {
      icon: <BulbOutlined style={{ fontSize: '32px', color: '#fa8c16' }} />,
      title: '包装袋识别（实验功能）',
      description: '实验室功能：识别包装袋上的营养成分表与克重信息，便于快速导入营养数据',
      color: '#fa8c16'
    },
    {
      icon: <SafetyOutlined style={{ fontSize: '32px', color: '#722ed1' }} />,
      title: '数据与隐私',
      description: '用户数据默认本地优先，敏感信息不会随意外泄；登录后可选择同步到服务器',
      color: '#722ed1'
    },
  ];

  const faqs = [
    {
      q: '如何获得最准确的分析结果？',
      a: '拍摄清晰、光线充足、食物完整可见的照片；若拍摄包装袋，请确保营养成分表和净含量文字清晰可读。放置参照物（如信用卡、硬币）能提升重量及尺寸估算准确度。'
    },
    {
      q: '饮食目标如何设置与同步？',
      a: '在“用户管理与配置”页面设置每日热量目标（默认 3000 kcal）。该配置保存在浏览器 localStorage，不依赖登录；状态管理页面会实时同步并更新进度。'
    },
    {
      q: '包装袋识别准确吗？',
      a: '包装袋识别为实验功能。对于清晰印刷的营养成分表与克重信息，识别效果较好；手写、模糊或遮挡文本的识别准确性会下降。该功能目前仍在完善中。'
    },
    {
      q: '我的数据会被上传到服务器吗？',
      a: '默认情况下，关键配置（如饮食目标）保存在本地；若登录并授权，部分分析数据可同步到服务器用于跨设备查看和模型改进，上传前会提示并征得授权。'
    },
  ];

  return (
    <ResponsiveLayout>
    <div style={{
      background: 'linear-gradient(180deg, #e6f7ff 0%, #f5f5f5 100%)',
      padding: '0',
      minHeight: '100vh'
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
          styles={{ body: { padding: '32px 24px' } }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <Title level={3} style={{ marginBottom: '8px', color: '#262626' }}>
              欢迎使用饮食评估平台
            </Title>
            <Text style={{ fontSize: '15px', color: '#595959', lineHeight: '1.6' }}>
              基于多模块 AI 的智能饮食分析平台 — 支持图片分析、包装识别、本地配置与社区共享。
            </Text>
          </div>
        </Card>

        {/* 主要功能 */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RocketOutlined style={{ color: '#1890ff' }} />
              <Text strong style={{ fontSize: '16px' }}>主要功能（更新）</Text>
            </div>
          }
          style={{
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            marginBottom: '16px'
          }}
          styles={{ body: { padding: '20px' } }}
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
              <Text strong style={{ fontSize: '16px' }}>使用步骤（推荐）</Text>
            </div>
          }
          style={{
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            marginBottom: '16px'
          }}
          styles={{ body: { padding: '24px' } }}
        >
          <Steps
            direction="vertical"
            current={-1}
            items={[
              {
                title: <Text strong>（可选）登录或使用本地模式</Text>,
                description: '您可以选择登录以跨设备同步数据；也可以以本地模式使用，部分配置会保存在本地浏览器中',
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
                title: <Text strong>上传食物或包装照片</Text>,
                description: '拍摄或上传食物照片；若要识别营养成分表，请上传清晰的包装袋照片',
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
                description: 'AI 会识别食物及包装信息，返回热量、营养成分和（如适用）包装净重信息',
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
                title: <Text strong>查看与保存</Text>,
                description: '查看详细报告，可将结果保存为记录或分享到画廊（匿名/登录两种模式）',
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
          styles={{ body: { padding: '20px 12px' } }}
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
              立即开始分析 →
            </Button>
      </div>
    </div>
    </ResponsiveLayout>
  )
}

export default AppIntroduction