import { Card, Button, Empty, Row, Col, Space, Tag, Alert } from 'antd';
import { ReloadOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

export default function Debug() {
  const [data, setData] = useState<any>({});
  const [apiTest, setApiTest] = useState<any>(null);

  const refreshData = () => {
    setData({
      timestamp: new Date().toLocaleString('zh-CN'),
      localStorage: {
        session_id: localStorage.getItem('session_id'),
        aiConfig: localStorage.getItem('aiConfig'),
        isLogin: localStorage.getItem('isLogin'),
        userId: localStorage.getItem('userId'),
      },
      cookies: document.cookie,
      userAgent: navigator.userAgent,
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    });
  };

  useEffect(() => {
    refreshData();
  }, []);

  const testBackendConnection = async () => {
    try {
      setApiTest({ loading: true, status: '测试中...' });
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: 'debug_test',
          password: 'debug_test',
        }),
      });

      const result = await response.json();
      setApiTest({
        loading: false,
        status: response.ok ? '✅ 成功' : '❌ 失败',
        statusCode: response.status,
        response: result,
      });
    } catch (error) {
      setApiTest({
        loading: false,
        status: '❌ 连接失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  };

  const clearLocalStorage = () => {
    localStorage.clear();
    refreshData();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card
        title="🔍 调试信息"
        extra={<Button icon={<ReloadOutlined />} onClick={refreshData}>刷新</Button>}
        style={{ marginBottom: '20px' }}
      >
        <Alert
          message="这是调试页面，用于诊断登录和会话问题"
          type="info"
          showIcon
          style={{ marginBottom: '20px' }}
        />

        <Row gutter={[16, 16]}>
          {/* localStorage 部分 */}
          <Col xs={24} lg={12}>
            <Card size="small" title="📦 Local Storage">
              {data.localStorage ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  {Object.entries(data.localStorage).map(([key, value]: any) => (
                    <div
                      key={key}
                      style={{
                        padding: '8px',
                        background: '#fafafa',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <strong>{key}:</strong>
                        <br />
                        <code
                          style={{
                            fontSize: '12px',
                            color: value ? '#1890ff' : '#999',
                            wordBreak: 'break-all',
                          }}
                        >
                          {value || '(空)'}
                        </code>
                      </div>
                      {value && (
                        <Button
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={() => copyToClipboard(value)}
                        />
                      )}
                    </div>
                  ))}
                </Space>
              ) : (
                <Empty />
              )}
            </Card>
          </Col>

          {/* Cookie 部分 */}
          <Col xs={24} lg={12}>
            <Card size="small" title="🍪 Cookies">
              {data.cookies ? (
                <code
                  style={{
                    fontSize: '12px',
                    wordBreak: 'break-all',
                    display: 'block',
                    padding: '8px',
                    background: '#fafafa',
                    borderRadius: '4px',
                  }}
                >
                  {data.cookies || '(无)'}
                </code>
              ) : (
                <Empty />
              )}
            </Card>
          </Col>

          {/* 系统信息 */}
          <Col xs={24}>
            <Card size="small" title="ℹ️  系统信息">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <strong>API Base URL:</strong>
                  <code style={{ marginLeft: '8px', color: '#1890ff' }}>
                    {data.apiBaseUrl}
                  </code>
                </div>
                <div>
                  <strong>当前时间:</strong>
                  <span style={{ marginLeft: '8px' }}>{data.timestamp}</span>
                </div>
                <div>
                  <strong>User Agent:</strong>
                  <code style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    {data.userAgent}
                  </code>
                </div>
              </Space>
            </Card>
          </Col>

          {/* API 连接测试 */}
          <Col xs={24}>
            <Card
              size="small"
              title="🌐 后端连接测试"
              extra={
                <Button loading={apiTest?.loading} onClick={testBackendConnection}>
                  {apiTest?.loading ? '测试中...' : '开始测试'}
                </Button>
              }
            >
              {apiTest ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <strong>状态:</strong>
                    <Tag color={apiTest.status.includes('✅') ? 'green' : 'red'} style={{ marginLeft: '8px' }}>
                      {apiTest.status}
                    </Tag>
                  </div>
                  {apiTest.statusCode && (
                    <div>
                      <strong>HTTP 状态码:</strong>
                      <Tag style={{ marginLeft: '8px' }}>{apiTest.statusCode}</Tag>
                    </div>
                  )}
                  {apiTest.response && (
                    <div>
                      <strong>响应数据:</strong>
                      <pre
                        style={{
                          background: '#fafafa',
                          padding: '8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          overflow: 'auto',
                          maxHeight: '200px',
                        }}
                      >
                        {JSON.stringify(apiTest.response, null, 2)}
                      </pre>
                    </div>
                  )}
                  {apiTest.error && (
                    <Alert message={`错误: ${apiTest.error}`} type="error" />
                  )}
                </Space>
              ) : (
                <Empty />
              )}
            </Card>
          </Col>

          {/* 操作按钮 */}
          <Col xs={24}>
            <Card size="small" title="⚙️  操作">
              <Space wrap>
                <Button danger icon={<DeleteOutlined />} onClick={clearLocalStorage}>
                  清除 Local Storage
                </Button>
                <Button onClick={refreshData}>刷新所有数据</Button>
              </Space>
            </Card>
          </Col>

          {/* 故障排查步骤 */}
          <Col xs={24}>
            <Card size="small" title="📋 故障排查步骤">
              <ol style={{ paddingLeft: '20px' }}>
                <li>检查上面的 "session_id" 是否有值</li>
                <li>如果没有值，点击 "API Base URL" 后的登录按钮重新登录</li>
                <li>登录成功后，刷新此页面检查 session_id 是否出现</li>
                <li>使用 "后端连接测试" 确保后端可以正常响应</li>
                <li>如果后端连接正常但登录后仍无 session_id，检查浏览器控制台的错误信息</li>
                <li>尝试清除 Local Storage 并重新登录</li>
              </ol>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
