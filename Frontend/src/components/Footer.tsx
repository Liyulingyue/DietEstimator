import { Typography } from 'antd';
import { GithubOutlined, HeartOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f0f2f5 0%, #fafafa 100%)',
      borderTop: '1px solid #f0f0f0',
      padding: '24px 16px',
      textAlign: 'center',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}>
        {/* 主要版权信息 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Text style={{
            fontSize: '14px',
            color: '#8c8c8c',
            fontWeight: '500'
          }}>
            © {currentYear} Diet Estimator
          </Text>
          <Text style={{
            fontSize: '14px',
            color: '#ff4d4f'
          }}>
            <HeartOutlined style={{ marginRight: '4px' }} />
            Made with love
          </Text>
        </div>

        {/* 技术栈、GitHub链接和版本信息 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Text style={{
            fontSize: '12px',
            color: '#bfbfbf'
          }}>
            Powered by React & Ant Design
          </Text>

          <Text style={{
            fontSize: '12px',
            color: '#bfbfbf'
          }}>
            •
          </Text>

          <a
            href="https://github.com/Liyulingyue/DietEstimator"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              color: '#1890ff',
              textDecoration: 'none',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#40a9ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#1890ff';
            }}
          >
            <GithubOutlined />
            GitHub
          </a>

          <Text style={{
            fontSize: '12px',
            color: '#bfbfbf'
          }}>
            •
          </Text>

          <Text style={{
            fontSize: '12px',
            color: '#bfbfbf'
          }}>
            v1.0.0
          </Text>
        </div>
      </div>
    </div>
  );
}