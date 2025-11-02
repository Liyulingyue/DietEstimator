import { Card, Typography, Spin, Empty } from 'antd';
import Gallery from '../components/Gallery';
import ResponsiveLayout from '../components/ResponsiveLayout';
import PageHeader from '../components/PageHeader';
import { useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function MobileAnalyse() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  return (
    <ResponsiveLayout>
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f6ffed 0%, #f5f5f5 100%)',
      padding: '0'
    }}>
      {/* 顶部标题栏 */}
      <PageHeader
        title="🔥 热量分析"
        description="上传或拍摄食物照片，AI 为您分析热量"
        background="linear-gradient(135deg, #52c41a 0%, #73d13d 100%)"
        titleSize={24}
        descSize={14}
        padding="24px 20px"
      />

      <div style={{ padding: '0 16px' }}>
        {/* 图片上传区域 */}
        <Gallery />

        {/* 分析结果区域 */}
        <Card style={{
          marginTop: '20px',
          background: 'white',
          border: 'none',
          borderRadius: '20px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: '24px' }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '16px' 
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #52c41a15, #73d13d08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '20px' }}>📊</span>
            </div>
            <Title level={4} style={{ 
              color: '#262626', 
              margin: 0,
              fontSize: '18px',
              fontWeight: '600'
            }}>
              分析结果
            </Title>
          </div>

          <div style={{
            backgroundColor: '#fafafa',
            borderRadius: '16px',
            padding: '20px',
            minHeight: '180px',
            border: '1px solid #f0f0f0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {analyzing ? (
              <div style={{ textAlign: 'center' }}>
                <Spin 
                  indicator={<LoadingOutlined style={{ fontSize: 48, color: '#52c41a' }} spin />}
                />
                <Paragraph style={{ 
                  marginTop: '16px', 
                  color: '#8c8c8c',
                  fontSize: '15px'
                }}>
                  正在分析中，请稍候...
                </Paragraph>
              </div>
            ) : result ? (
              <div style={{ width: '100%' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #52c41a10, #73d13d05)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  borderLeft: '4px solid #52c41a'
                }}>
                  <Text strong style={{ fontSize: '16px', color: '#262626' }}>
                    总热量: 
                  </Text>
                  <Text style={{ 
                    fontSize: '28px', 
                    fontWeight: '700',
                    color: '#52c41a',
                    marginLeft: '8px'
                  }}>
                    850
                  </Text>
                  <Text style={{ fontSize: '16px', color: '#8c8c8c' }}> kcal</Text>
                </div>

                <Paragraph style={{ 
                  color: '#595959',
                  fontSize: '14px',
                  lineHeight: '1.8',
                  margin: 0
                }}>
                  {result}
                </Paragraph>
              </div>
            ) : (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <Text style={{ color: '#8c8c8c', fontSize: '15px' }}>
                      暂无分析结果
                    </Text>
                    <br />
                    <Text style={{ color: '#bfbfbf', fontSize: '13px' }}>
                      请先上传或拍摄食物图片
                    </Text>
                  </div>
                }
              />
            )}
          </div>

          {/* 提示信息 */}
          {!analyzing && !result && (
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #e6f7ff, #f0f9ff)',
              borderRadius: '12px',
              border: '1px solid #91d5ff33'
            }}>
              <Text style={{ fontSize: '13px', color: '#595959', lineHeight: '1.6' }}>
                💡 <strong>小提示：</strong>清晰的图片能获得更准确的分析结果
              </Text>
            </div>
          )}
        </Card>
      </div>
    </div>
    </ResponsiveLayout>
  );
}