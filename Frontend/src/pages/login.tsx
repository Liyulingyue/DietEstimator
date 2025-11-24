import { useState } from 'react';
import { Button, Input, Form, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { setSessionInfo } from '../utils/auth';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: { username?: string; password?: string }) => {
    setLoading(true);
    try {
      const username = values.username ? String(values.username).trim() : '';
      const password = values.password ? String(values.password).trim() : '';
      
      console.log('DEBUG login - 调用后端登录API:', {
        url: `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/login`,
        username,
        password
      });

      // 调用后端登录API
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      console.log('DEBUG login - 后端响应状态:', response.status);
      const result = await response.json();
      console.log('DEBUG login - 后端响应数据:', result);

      if (result.success) {
        // 保存session信息到localStorage
        if (result.session_id && result.username && result.user_id) {
          setSessionInfo(result.session_id, result.username, result.user_id);
          console.log('✅ Session信息已保存到localStorage:', {
            sessionId: result.session_id,
            username: result.username,
            userId: result.user_id
          });
        } else {
          console.warn('⚠️  后端响应中缺少必要字段');
        }
        
        message.success('登录成功');
        navigate('/');
      } else {
        message.error(result.message || '登录失败');
      }
    } catch (error) {
      console.error('登录失败:', error);
      message.error('登录失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw', padding: '0 16px' }}>
      <Form
        form={form}
        name="login"
        style={{ width: 320, padding: 32, border: '1px solid #eee', borderRadius: 8, background: '#fff', margin: '0 auto' }}
        onFinish={onFinish}
        onFinishFailed={(errorInfo) => {
          console.log(errorInfo);
          message.error('表单校验失败，请检查输入');
        }}
      >
        <Form.Item name="username" rules={[{ required: true, whitespace: true, message: '请输入用户名' }]}>
          <Input placeholder="用户名" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, whitespace: true, message: '请输入密码' }]}>
          <Input.Password placeholder="密码" />
        </Form.Item>
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            loading={loading}
          >
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
