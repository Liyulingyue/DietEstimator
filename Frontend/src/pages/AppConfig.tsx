import { useNavigate } from 'react-router-dom'
import { Button, Card, Switch, Select, Space, Typography, Avatar } from 'antd'
import { UserOutlined, LogoutOutlined, EditOutlined, HistoryOutlined } from '@ant-design/icons'
import ResponsiveLayout from '../components/ResponsiveLayout'
import PageHeader from '../components/PageHeader'
import { useState } from 'react'

const { Title, Text } = Typography;
const { Option } = Select;

function AppConfig() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(14);

  // 模拟用户数据
  const userInfo = {
    name: '用户',
    email: 'user@example.com',
    avatar: null,
    joinDate: '2024-01-15',
    totalAnalyses: 156,
    lastLogin: '2024-10-23'
  };

  const handleLogout = () => {
    // TODO: 实现登出逻辑
    navigate('/');
  };

  return (
    <ResponsiveLayout>
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #e6f7ff 0%, #f5f5f5 100%)',
      padding: '0'
    }}>
      {/* 顶部标题栏 */}
      <PageHeader
        title={<><UserOutlined style={{ marginRight: '8px' }} />用户管理与配置</>}
        background="linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)"
        titleSize={24}
        padding="24px 20px"
      />

      <div style={{ padding: '0 16px' }}>
        {/* 用户信息卡片 */}
        <Card
          style={{
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            marginBottom: '16px'
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <Avatar
              size={64}
              icon={<UserOutlined />}
              style={{
                background: 'linear-gradient(135deg, #1890ff, #36cfc9)',
                fontSize: '28px'
              }}
            />
            <div style={{ flex: 1 }}>
              <Title level={4} style={{ margin: 0, marginBottom: '4px', fontSize: '18px', fontWeight: '600' }}>
                {userInfo.name}
              </Title>
              <Text style={{ fontSize: '14px', color: '#8c8c8c' }}>
                {userInfo.email}
              </Text>
              <br />
              <Text style={{ fontSize: '12px', color: '#bfbfbf' }}>
                加入时间: {userInfo.joinDate}
              </Text>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #f0f9ff, #e6f7ff)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <Text style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1890ff',
                display: 'block'
              }}>
                {userInfo.totalAnalyses}
              </Text>
              <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>总分析次数</Text>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #f6ffed, #f0f9ff)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <Text style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#52c41a',
                display: 'block'
              }}>
                {userInfo.lastLogin}
              </Text>
              <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>最后登录</Text>
            </div>
          </div>

          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Button
              type="default"
              icon={<EditOutlined />}
              block
              style={{
                borderRadius: '12px',
                height: '44px',
                border: '1px solid #d9d9d9'
              }}
            >
              编辑个人资料
            </Button>
            <Button
              type="default"
              icon={<HistoryOutlined />}
              block
              style={{
                borderRadius: '12px',
                height: '44px',
                border: '1px solid #d9d9d9'
              }}
            >
              查看历史记录
            </Button>
          </Space>
        </Card>

        {/* 应用设置 */}
        <Card
          style={{
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            marginBottom: '16px'
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
              background: 'linear-gradient(135deg, #faad14, #fa8c16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '20px' }}>⚙️</span>
            </div>
            <Title level={4} style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              应用设置
            </Title>
          </div>

          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <Text style={{ fontSize: '16px' }}>推送通知</Text>
              <Switch
                checked={notifications}
                onChange={setNotifications}
                style={{ background: notifications ? '#1890ff' : '#d9d9d9' }}
              />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <Text style={{ fontSize: '16px' }}>深色模式</Text>
              <Switch
                checked={darkMode}
                onChange={setDarkMode}
                style={{ background: darkMode ? '#1890ff' : '#d9d9d9' }}
              />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0'
            }}>
              <Text style={{ fontSize: '16px' }}>字体大小</Text>
              <Select
                value={fontSize}
                onChange={setFontSize}
                style={{ width: '80px' }}
                size="small"
              >
                <Option value={12}>小</Option>
                <Option value={14}>中</Option>
                <Option value={16}>大</Option>
              </Select>
            </div>
          </Space>
        </Card>

        {/* 登出按钮 */}
        <div style={{ padding: '0 16px 32px 16px' }}>
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            block
            size="large"
            style={{
              borderRadius: '12px',
              height: '48px',
              fontSize: '16px',
              fontWeight: '600'
            }}
            onClick={handleLogout}
          >
            退出登录
          </Button>
        </div>
      </div>
    </div>
    </ResponsiveLayout>
  )
}

export default AppConfig