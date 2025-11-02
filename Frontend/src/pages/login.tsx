import { useState } from 'react';
import { Button, Input, Form, message } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = (values: { username?: string; password?: string }) => {
    // 调试输出，方便在控制台查看实际提交的数据
    // console.log('login onFinish values:', values);
    setLoading(true);
    // 简单模拟登录，实际可替换为接口请求
    setTimeout(() => {
      setLoading(false);
      const username = values.username ? String(values.username).trim() : '';
      const password = values.password ? String(values.password).trim() : '';
      if (username && password) {
        // 登录成功：写入登录标记和用户 id（这里用 username 作为示例 userId）
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString(); // 7 天过期
        document.cookie = `isLogin=true; path=/; expires=${expires}`;
        document.cookie = `userId=${encodeURIComponent(username + password)}; path=/; expires=${expires}`;
        message.success('登录成功');
        navigate('/');
      } else {
        // 如果只输入了空格也会被认为为空，提示更准确
        message.error('请输入用户名和密码');
      }
    }, 800);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw', padding: '0 16px' }}>
      <Form
        form={form}
        name="login"
        style={{ width: 320, padding: 32, border: '1px solid #eee', borderRadius: 8, background: '#fff', margin: '0 auto' }}
        onFinish={onFinish}
        onFinishFailed={(errorInfo) => {
          // 当表单校验失败时打印详细信息，方便定位为何未触发 onFinish
          console.log(errorInfo);
          // 额外的用户提示（可选），保持与现有 message 交互一致
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
