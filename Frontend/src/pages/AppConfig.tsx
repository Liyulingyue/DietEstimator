import { Button, Card, Select, Space, Typography, Avatar, Input, Divider, message, Form, Modal } from 'antd'
import { UserOutlined, LogoutOutlined, RobotOutlined, KeyOutlined, SettingOutlined, ApiOutlined } from '@ant-design/icons'
import ResponsiveLayout from '../components/ResponsiveLayout'
import PageHeader from '../components/PageHeader'
import { logout, getUserInfo } from '../utils/auth'
import { useState, useEffect } from 'react'

const { Title, Text } = Typography;
const { Option } = Select;

function AppConfig() {
  const [loginForm] = Form.useForm();
  const [loginLoading, setLoginLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [testResult, setTestResult] = useState<{status: string, message: string, response?: string} | null>(null);

  // 登录状态管理
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<{user_id: string, username: string, is_logged_in: boolean, server_credits: number} | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // AI配置状态 - 从localStorage加载或使用默认值
  const [aiConfig, setAiConfig] = useState(() => {
    const savedConfig = localStorage.getItem('aiConfig');
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig);
      } catch (e) {
        console.error('Failed to parse saved AI config:', e);
      }
    }
    // 返回默认配置
    return {
      modelUrl: 'https://aistudio.baidu.com/llm/lmapi/v3',
      modelName: 'ERNIE-4.5-VL-28B-A3B',
      apiKey: '',
      preference: 'server' // 'custom' 或 'server'
    };
  });

  // 在组件挂载时检查登录状态
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userData = await getUserInfo();
        if (userData && userData.is_logged_in) {
          setIsLoggedIn(true);
          setUserInfo(userData);
        } else {
          setIsLoggedIn(false);
          setUserInfo(null);
        }
      } catch (error) {
        console.error('检查登录状态失败:', error);
        setIsLoggedIn(false);
        setUserInfo(null);
      } finally {
        setAuthLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  // 模拟用户数据（用于UI展示）
  const displayUserInfo = {
    name: userInfo?.username || '用户',
    email: `${userInfo?.username || 'user'}@example.com`,
    avatar: null,
    joinDate: '2024-01-15',
    totalAnalyses: 156,
    lastLogin: '2024-10-23',
    serverCredits: userInfo?.server_credits || 0
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      setUserInfo(null);
      
      // 清除localStorage中保存的session_id
      localStorage.removeItem('session_id');
      console.log('Session ID已从localStorage中清除');
      
      message.success('已退出登录');
    } catch (error) {
      console.error('登出失败:', error);
      message.error('登出失败，请重试');
    }
  };

  const handleLogin = async (values: { username?: string; password?: string }) => {
    setLoginLoading(true);
    try {
      const username = values.username ? String(values.username).trim() : '';
      const password = values.password ? String(values.password).trim() : '';

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 包含cookies
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        message.success('登录成功');
        
        // 保存session_id到localStorage，以便后续API调用使用
        if (result.session_id) {
          localStorage.setItem('session_id', result.session_id);
          console.log('Session ID已保存到localStorage');
        }
        
        // 重新检查登录状态
        const userData = await getUserInfo();
        if (userData && userData.is_logged_in) {
          setIsLoggedIn(true);
          setUserInfo(userData);
        }
      } else {
        message.error(result.message || '登录失败');
      }
    } catch (error) {
      console.error('登录失败:', error);
      message.error('登录失败，请检查网络连接');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAiConfigChange = (field: string, value: string) => {
    setAiConfig((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveAiConfig = () => {
    try {
      // 保存AI配置到本地存储
      localStorage.setItem('aiConfig', JSON.stringify(aiConfig));
      message.success('AI配置已保存');
      console.log('保存AI配置:', aiConfig);
    } catch (error) {
      console.error('保存AI配置失败:', error);
      message.error('保存AI配置失败');
    }
  };

  const handleResetAiConfig = () => {
    const defaultConfig = {
      modelUrl: 'https://aistudio.baidu.com/llm/lmapi/v3',
      modelName: 'ERNIE-4.5-VL-28B-A3B',
      apiKey: '',
      preference: 'server'
    };
    setAiConfig(defaultConfig);
    message.success('AI配置已重置');
    console.log('重置AI配置:', defaultConfig);
  };

  const handleTestConnection = async () => {
    if (!aiConfig.modelUrl.trim() || !aiConfig.modelName.trim() || !aiConfig.apiKey.trim()) {
      message.error('请先填写完整的AI配置信息');
      return;
    }

    setTestLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/ai/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_url: aiConfig.modelUrl,
          model_name: aiConfig.modelName,
          api_key: aiConfig.apiKey,
        }),
      });

      const result = await response.json();
      
      // 适配新的后端响应格式
      const adaptedResult = {
        status: result.success ? 'success' : 'error',
        response: result.response || undefined,
        message: result.error || result.message
      };
      
      setTestResult(adaptedResult);
      setTestModalVisible(true);
    } catch (error) {
      console.error('测试连接失败:', error);
      if (error instanceof SyntaxError) {
        message.error('服务器响应格式错误，请检查后端服务');
      } else {
        message.error('连接测试失败，请检查网络或配置');
      }
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <ResponsiveLayout>
      <div style={{
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
        {/* 根据登录状态显示不同内容 */}
        {authLoading ? (
          /* 加载状态 */
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
              justifyContent: 'center',
              gap: '12px',
              padding: '40px 0'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #1890ff, #36cfc9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <UserOutlined style={{ fontSize: '16px', color: 'white' }} />
              </div>
              <Text style={{ fontSize: '16px', color: '#8c8c8c' }}>
                正在检查登录状态...
              </Text>
            </div>
          </Card>
        ) : isLoggedIn ? (
          /* 已登录状态：显示用户信息卡片 */
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
                <Title level={4} style={{ margin: 0, marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>
                  {displayUserInfo.name}
                </Title>
                <Text style={{ fontSize: '12px', color: '#bfbfbf' }}>
                  加入时间: {displayUserInfo.joinDate}
                </Text>
              </div>
            </div>

            <Card
              style={{
                borderRadius: '12px',
                border: '1px solid #f0f0f0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
              }}
              bodyStyle={{ padding: '16px' }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: '14px', color: '#8c8c8c' }}>服务器调用点</Text>
                <Text style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#fa8c16'
                }}>
                  {displayUserInfo.serverCredits.toFixed(1)}
                </Text>
              </div>
            </Card>

            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Button
                type="primary"
                danger
                icon={<LogoutOutlined />}
                block
                style={{
                  borderRadius: '12px',
                  height: '44px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
                onClick={handleLogout}
              >
                退出登录
              </Button>
            </Space>
          </Card>
        ) : (
          /* 未登录状态：显示登录表单 */
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
                background: 'linear-gradient(135deg, #1890ff, #36cfc9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <UserOutlined style={{ fontSize: '20px', color: 'white' }} />
              </div>
              <Title level={4} style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                用户登录
              </Title>
            </div>

            <Form
              form={loginForm}
              name="login"
              onFinish={handleLogin}
              onFinishFailed={() => {
                message.error('表单校验失败，请检查输入');
              }}
            >
              <Form.Item name="username" rules={[{ required: true, whitespace: true, message: '请输入用户名' }]}>
                <Input placeholder="用户名" style={{ borderRadius: '8px' }} />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, whitespace: true, message: '请输入密码' }]}>
                <Input.Password placeholder="密码" style={{ borderRadius: '8px' }} />
              </Form.Item>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block 
                  loading={loginLoading}
                  style={{
                    borderRadius: '12px',
                    height: '44px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
          </Card>
        )}

        {/* AI配置 - 始终显示 */}
        <Card
          style={{
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            marginBottom: '16px'
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <>
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
                background: 'linear-gradient(135deg, #722ed1, #9c27b0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <RobotOutlined style={{ fontSize: '20px', color: 'white' }} />
              </div>
              <Title level={4} style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                AI配置
              </Title>
            </div>

            <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {/* 模型URL */}
          <div>
            <Text style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
              模型URL
            </Text>
            <Input
              placeholder="请输入模型API地址"
              value={aiConfig.modelUrl}
              onChange={(e) => handleAiConfigChange('modelUrl', e.target.value)}
              style={{ borderRadius: '8px' }}
            />
          </div>

          {/* 模型名称 */}
          <div>
            <Text style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
              模型名称
            </Text>
            <Input
              placeholder="请输入模型名称"
              value={aiConfig.modelName}
              onChange={(e) => handleAiConfigChange('modelName', e.target.value)}
              style={{ borderRadius: '8px' }}
            />
          </div>

          {/* API Key */}
          <div>
            <Text style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
              <KeyOutlined style={{ marginRight: '6px' }} />
              API Key
            </Text>
            <Input.Password
              placeholder="请输入API密钥"
              value={aiConfig.apiKey}
              onChange={(e) => handleAiConfigChange('apiKey', e.target.value)}
              style={{ borderRadius: '8px' }}
            />
            <Text style={{
              fontSize: '12px',
              color: '#8c8c8c',
              display: 'block',
              marginTop: '4px',
              fontStyle: 'italic'
            }}>
              💡 可从 <a
                href="https://aistudio.baidu.com/account/accessToken"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#1890ff',
                  textDecoration: 'underline'
                }}
              >
                星河社区
              </a> 获取API Key
            </Text>
          </div>

          {/* 调用偏好 */}
          <div>
            <Text style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
              <SettingOutlined style={{ marginRight: '6px' }} />
              调用偏好
            </Text>
            <Select
              value={aiConfig.preference}
              onChange={(value) => handleAiConfigChange('preference', value)}
              style={{ width: '100%', borderRadius: '8px' }}
            >
              <Option value="custom">自定义模型</Option>
              <Option value="server">服务器调用点</Option>
            </Select>
            <Text style={{
              fontSize: '12px',
              color: '#8c8c8c',
              display: 'block',
              marginTop: '4px',
              fontStyle: 'italic',
              lineHeight: '1.4'
            }}>
              💡 服务器调用点需要登录后生效，如服务器资源不足将自动使用自定义信息
            </Text>
          </div>

          {/* <Divider style={{ margin: '16px 0' }} /> */}

          {/* 操作按钮区域 */}
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Button
              type="default"
              icon={<ApiOutlined />}
              block
              loading={testLoading}
              style={{
                borderRadius: '12px',
                height: '44px',
                fontSize: '16px',
                fontWeight: '600',
                border: '2px solid #1890ff',
                color: '#1890ff'
              }}
              onClick={handleTestConnection}
            >
              测试自定义模型连通性
            </Button>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                block
                size="large"
                style={{
                  borderRadius: '12px',
                  height: '44px',
                  fontSize: '16px',
                  fontWeight: '600',
                  border: '2px solid #ff7875',
                  color: '#ff7875',
                  background: 'transparent'
                }}
                onClick={handleResetAiConfig}
              >
                重置
              </Button>
              <Button
                type="primary"
                block
                size="large"
                style={{
                  borderRadius: '12px',
                  height: '44px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #722ed1, #9c27b0)',
                  border: 'none'
                }}
                onClick={handleSaveAiConfig}
              >
                保存AI配置
              </Button>
            </div>
          </Space>
        </Space>
          </>

          {/* 测试连接结果弹窗 */}
          <Modal
            title={
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '18px',
                fontWeight: '600',
                color: '#1890ff'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1890ff, #36cfc9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <RobotOutlined style={{ fontSize: '16px', color: 'white' }} />
                </div>
                AI连接测试结果
              </div>
            }
            open={testModalVisible}
            onCancel={() => setTestModalVisible(false)}
            footer={[
              <Button
                key="close"
                onClick={() => setTestModalVisible(false)}
                style={{
                  borderRadius: '8px',
                  height: '36px',
                  fontWeight: '500'
                }}
              >
                关闭
              </Button>
            ]}
            width={650}
            centered
            styles={{
              body: {
                padding: '24px',
                background: 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%)'
              }
            }}
            style={{
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            {testResult && (
              <div style={{ minHeight: '200px' }}>
                {/* 状态展示区域 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  padding: '20px',
                  borderRadius: '12px',
                  background: testResult.status === 'success'
                    ? 'linear-gradient(135deg, #f6ffed 0%, #f0f9ea 100%)'
                    : 'linear-gradient(135deg, #fff2f0 0%, #fef2f1 100%)',
                  border: testResult.status === 'success'
                    ? '1px solid #b7eb8f'
                    : '1px solid #ffccc7',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '48px',
                      marginBottom: '8px'
                    }}>
                      {testResult.status === 'success' ? '🎉' : '⚠️'}
                    </div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: testResult.status === 'success' ? '#52c41a' : '#cf1322',
                      marginBottom: '4px'
                    }}>
                      {testResult.status === 'success' ? '连接测试成功' : '连接测试失败'}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: testResult.status === 'success' ? '#389e0d' : '#a8071a'
                    }}>
                      {testResult.status === 'success' ? 'AI模型响应正常' : '请检查配置信息'}
                    </div>
                  </div>
                </div>

                {/* 内容展示区域 */}
                {testResult.status === 'success' ? (
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1890ff'
                    }}>
                      <ApiOutlined />
                      AI回复内容
                    </div>
                    <Card
                      style={{
                        borderRadius: '12px',
                        border: '1px solid #d9d9d9',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                        background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)'
                      }}
                      bodyStyle={{
                        padding: '20px',
                        maxHeight: '300px',
                        overflow: 'auto'
                      }}
                    >
                      <div style={{
                        background: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        padding: '16px',
                        fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        color: '#212529',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {testResult.response || 'AI没有返回内容'}
                      </div>
                    </Card>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#cf1322'
                    }}>
                      <KeyOutlined />
                      错误详情
                    </div>
                    <Card
                      style={{
                        borderRadius: '12px',
                        border: '1px solid #ffccc7',
                        boxShadow: '0 2px 8px rgba(255, 0, 0, 0.08)',
                        background: 'linear-gradient(135deg, #fff2f0 0%, #fef2f1 100%)'
                      }}
                      bodyStyle={{
                        padding: '20px'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px'
                      }}>
                        <div style={{
                          fontSize: '20px',
                          color: '#cf1322',
                          marginTop: '2px'
                        }}>
                          ⚠️
                        </div>
                        <div>
                          <div style={{
                            fontSize: '15px',
                            fontWeight: '500',
                            color: '#cf1322',
                            marginBottom: '4px'
                          }}>
                            连接失败
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: '#8b4513',
                            lineHeight: '1.5'
                          }}>
                            {testResult.message}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* 底部提示 */}
                <div style={{
                  marginTop: '24px',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #f0f2ff 0%, #f8f9ff 100%)',
                  borderRadius: '8px',
                  border: '1px solid #d6e4ff',
                  textAlign: 'center'
                }}>
                  <Text style={{
                    fontSize: '13px',
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    💡 提示：测试结果仅用于验证配置有效性，不代表实际分析能力
                  </Text>
                </div>
              </div>
            )}
          </Modal>
      </Card>
      </div>
    </div>
    </ResponsiveLayout>
  )
}

export default AppConfig