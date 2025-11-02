import { Typography } from 'antd';
import type { ReactNode } from 'react';

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string | ReactNode;
  description?: string;
  background?: string;
  titleSize?: number;
  descSize?: number;
  padding?: string;
  height?: string;
  marginBottom?: string;
}

export default function PageHeader({
  title,
  description,
  background = 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)',
  titleSize = 28,
  descSize = 15,
  padding = '24px 24px 36px',
  height,
  marginBottom = '24px'
}: PageHeaderProps) {
  return (
    <div style={{
      background,
      padding,
      borderRadius: '0 0 32px 32px',
      boxShadow: `0 8px 24px ${background.includes('#1890ff') ? 'rgba(24, 144, 255, 0.2)' :
                               background.includes('#52c41a') ? 'rgba(82, 196, 26, 0.2)' :
                               'rgba(24, 144, 255, 0.2)'}`,
      marginBottom,
      position: 'relative',
      overflow: 'hidden',
      minHeight: height
    }}>
      {/* 装饰性背景圆圈 */}
      <div style={{
        position: 'absolute',
        top: '-60px',
        right: '-60px',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '2px solid rgba(255, 255, 255, 0.2)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-40px',
        left: '-40px',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.08)'
      }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <Title level={2} style={{
          color: 'white',
          marginBottom: description ? '8px' : 0,
          fontSize: `${titleSize}px`,
          fontWeight: '700'
        }}>
          {title}
        </Title>
        {description && (
          <Text style={{
            fontSize: `${descSize}px`,
            color: 'rgba(255, 255, 255, 0.9)',
            display: 'block',
            lineHeight: '1.6'
          }}>
            {description}
          </Text>
        )}
      </div>
    </div>
  );
}