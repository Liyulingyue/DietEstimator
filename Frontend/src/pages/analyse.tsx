import { useState } from 'react';
import TabBar from '../components/TabBar';
import Gallery from '../components/Gallery';
import { Card, Typography, Empty, Spin, Divider, Button, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function Analyse() {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalysisStart = () => {
    setLoading(true);
  };

  const handleAnalysisComplete = (result: any) => {
    console.log('分析完成，收到结果:', result);
    
    if (result && result.success) {
      // 显示成功弹窗
      message.success({
        content: '🎉 分析完成！',
        duration: 3,
        style: {
          fontSize: '16px',
          fontWeight: '600',
        }
      });
      
      // 设置分析结果
      setTimeout(() => {
        setAnalysisResult(result);
        setLoading(false);
        console.log('分析结果已设置:', result);
      }, 500);
    } else {
      // 显示失败弹窗
      message.error({
        content: `分析失败: ${result?.message || '未知错误'}`,
        duration: 4,
      });
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // 显示复制成功的反馈
    });
  };

  const renderAnalysisResult = () => {
    if (!analysisResult || !analysisResult.result) {
      return (
        <Empty 
          description="暂无分析结果"
          style={{ marginTop: '40px' }}
        />
      );
    }

    const result = analysisResult.result;

    // 根据不同类型的结果进行渲染
    return (
      <div style={{ marginTop: '16px' }}>
        {/* 食物描述 */}
        {result.food_description && (
          <div style={{ marginBottom: '16px' }}>
            <Title level={5} style={{ color: '#1565c0', marginBottom: '8px' }}>
              📋 食物描述
            </Title>
            <Text style={{ color: '#424242', display: 'block', lineHeight: '1.6' }}>
              {result.food_description}
            </Text>
          </div>
        )}

        {/* 热量信息 */}
        {(result.calories || result.calorie_estimate) && (
          <div style={{ marginBottom: '16px' }}>
            <Title level={5} style={{ color: '#d32f2f', marginBottom: '8px' }}>
              🔥 热量估算
            </Title>
            <div style={{
              background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #ffb74d',
            }}>
              <Text strong style={{ fontSize: '18px', color: '#e65100' }}>
                {result.calories || result.calorie_estimate} kcal
              </Text>
            </div>
          </div>
        )}

        {/* 营养成分 */}
        {result.nutrition_info && (
          <div style={{ marginBottom: '16px' }}>
            <Title level={5} style={{ color: '#1565c0', marginBottom: '8px' }}>
              📊 营养成分
            </Title>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '12px',
            }}>
              {Object.entries(result.nutrition_info).map(([key, value]: [string, any]) => (
                <div 
                  key={key}
                  style={{
                    background: '#e3f2fd',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #90caf9',
                    textAlign: 'center',
                  }}
                >
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                    {key}
                  </Text>
                  <Text strong style={{ fontSize: '14px', color: '#1565c0' }}>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 原始JSON数据 */}
        {result.raw_response && (
          <div style={{ marginTop: '20px' }}>
            <Divider />
            <Title level={5} style={{ color: '#1565c0', marginBottom: '8px' }}>
              📄 原始数据
            </Title>
            <div style={{
              background: '#f5f5f5',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              maxHeight: '300px',
              overflowY: 'auto',
              position: 'relative',
              fontFamily: 'monospace',
              fontSize: '12px',
              wordBreak: 'break-all',
              whiteSpace: 'pre-wrap',
            }}>
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(result.raw_response)}
                style={{ position: 'absolute', right: '8px', top: '8px' }}
              >
                复制
              </Button>
              {typeof result.raw_response === 'string' 
                ? result.raw_response 
                : JSON.stringify(result.raw_response, null, 2)}
            </div>
          </div>
        )}

        {/* 完整JSON响应 */}
        <div style={{ marginTop: '20px' }}>
          <Divider />
          <Title level={5} style={{ color: '#1565c0', marginBottom: '8px' }}>
            🔍 完整响应
          </Title>
          <div style={{
            background: '#f5f5f5',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            maxHeight: '300px',
            overflowY: 'auto',
            position: 'relative',
            fontFamily: 'monospace',
            fontSize: '12px',
            wordBreak: 'break-all',
            whiteSpace: 'pre-wrap',
          }}>
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => copyToClipboard(JSON.stringify(analysisResult, null, 2))}
              style={{ position: 'absolute', right: '8px', top: '8px' }}
            >
              复制
            </Button>
            {JSON.stringify(analysisResult, null, 2)}
          </div>
        </div>
      </div>
    );
  };
  return (
    <div style={{ 
      width: '100vw',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      display: 'flex',
      justifyContent: 'center',
      padding: '20px 0'
    }}>
      <div style={{ 
        width: '95%', 
        maxWidth: '1400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        paddingTop: '80px'
      }}>
        <TabBar />
        <Gallery 
          onAnalysisComplete={handleAnalysisComplete}
          onAnalysisStart={handleAnalysisStart}
        />
        
        {/* 分析结果展示块 */}
        <Card style={{
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          border: '2px solid rgba(33, 150, 243, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(33, 150, 243, 0.2)',
          padding: '16px'
        }}>
          <Title level={4} style={{ color: '#1565c0', marginBottom: '16px', marginTop: '8px' }}>分析结果</Title>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '8px',
            padding: '16px',
            minHeight: '120px',
            border: '1px solid rgba(33, 150, 243, 0.2)'
          }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin tip="处理中..." />
              </div>
            ) : analysisResult ? (
              renderAnalysisResult()
            ) : (
              <Text style={{ color: '#424242', fontSize: '14px' }}>
                暂无分析结果，请先上传图片进行分析。
              </Text>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
