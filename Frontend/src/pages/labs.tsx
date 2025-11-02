import { useEffect } from 'react';
import TabBar from '../components/TabBar';
import { Card, Button, Typography, Upload, message } from 'antd';
import { UploadOutlined, ExperimentOutlined, CalculatorOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function Labs() {
  useEffect(() => {
    // 可以添加初始化逻辑
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleUpload = (info: any) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 上传成功`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`);
    }
  };

  return (
    <div style={{ 
      width: '100vw',
      minHeight: '100vh',
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
        paddingTop: '80px' // 增加顶部距离，避免被TabBar遮挡
      }}>
        <TabBar />

        {/* 导航点 */}
        <div style={{
          position: 'fixed',
          right: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 15,
          zIndex: 1000
        }}>
          <div
            onClick={() => scrollToSection('nutrition')}
            style={{
              width: 12,
              height: 12,
              backgroundColor: '#52c41a',
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#73d13d'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#52c41a'}
          ></div>
          <div
            onClick={() => scrollToSection('portion')}
            style={{
              width: 12,
              height: 12,
              backgroundColor: '#52c41a',
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#73d13d'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#52c41a'}
          ></div>
          <div
            onClick={() => scrollToSection('assessment')}
            style={{
              width: 12,
              height: 12,
              backgroundColor: '#52c41a',
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#73d13d'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#52c41a'}
          ></div>
        </div>

        {/* 识别营养成分表 */}
        <section id="nutrition" style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          padding: '20px'
        }}>
          <Card style={{
            width: '100%',
            maxWidth: '800px',
            background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
            border: '2px solid rgba(82, 196, 26, 0.3)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(82, 196, 26, 0.2)',
            padding: '24px'
          }}>
            <Title level={2} style={{ color: '#389e0d', textAlign: 'center', marginBottom: '24px' }}>
              <ExperimentOutlined style={{ marginRight: '12px' }} />
              识别营养成分表
            </Title>
            <Paragraph style={{ textAlign: 'center', marginBottom: '24px', color: '#666' }}>
              上传食物图片，AI将自动识别并分析营养成分
            </Paragraph>
            <div style={{ textAlign: 'center' }}>
              <Upload
                onChange={handleUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<UploadOutlined />}
                  style={{
                    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                    border: 'none',
                    height: '48px',
                    fontSize: '16px'
                  }}
                >
                  上传食物图片
                </Button>
              </Upload>
            </div>
            <div style={{
              marginTop: '24px',
              padding: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '8px',
              minHeight: '200px',
              border: '1px solid rgba(82, 196, 26, 0.2)'
            }}>
              <Text style={{ color: '#666' }}>
                分析结果将显示在这里...
              </Text>
            </div>
          </Card>
        </section>

        {/* 估算份量 */}
        <section id="portion" style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
          padding: '20px'
        }}>
          <Card style={{
            width: '100%',
            maxWidth: '800px',
            background: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
            border: '2px solid rgba(255, 152, 0, 0.3)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(255, 152, 0, 0.2)',
            padding: '24px'
          }}>
            <Title level={2} style={{ color: '#d32f2f', textAlign: 'center', marginBottom: '24px' }}>
              <CalculatorOutlined style={{ marginRight: '12px' }} />
              估算份量
            </Title>
            <Paragraph style={{ textAlign: 'center', marginBottom: '24px', color: '#666' }}>
              通过图片分析估算食物的份量和重量
            </Paragraph>
            <div style={{ textAlign: 'center' }}>
              <Upload
                onChange={handleUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<UploadOutlined />}
                  style={{
                    background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                    border: 'none',
                    height: '48px',
                    fontSize: '16px'
                  }}
                >
                  上传食物图片
                </Button>
              </Upload>
            </div>
            <div style={{
              marginTop: '24px',
              padding: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '8px',
              minHeight: '200px',
              border: '1px solid rgba(255, 152, 0, 0.2)'
            }}>
              <Text style={{ color: '#666' }}>
                份量估算结果将显示在这里...
              </Text>
            </div>
          </Card>
        </section>

        {/* 结合计划评估食物 */}
        <section id="assessment" style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)',
          padding: '20px'
        }}>
          <Card style={{
            width: '100%',
            maxWidth: '800px',
            background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)',
            border: '2px solid rgba(233, 30, 99, 0.3)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(233, 30, 99, 0.2)',
            padding: '24px'
          }}>
            <Title level={2} style={{ color: '#c2185b', textAlign: 'center', marginBottom: '24px' }}>
              <CheckCircleOutlined style={{ marginRight: '12px' }} />
              结合计划评估食物
            </Title>
            <Paragraph style={{ textAlign: 'center', marginBottom: '24px', color: '#666' }}>
              根据您的饮食计划综合评估食物营养价值
            </Paragraph>
            <div style={{ textAlign: 'center' }}>
              <Upload
                onChange={handleUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<UploadOutlined />}
                  style={{
                    background: 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)',
                    border: 'none',
                    height: '48px',
                    fontSize: '16px'
                  }}
                >
                  上传食物图片
                </Button>
              </Upload>
            </div>
            <div style={{
              marginTop: '24px',
              padding: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '8px',
              minHeight: '200px',
              border: '1px solid rgba(233, 30, 99, 0.2)'
            }}>
              <Text style={{ color: '#666' }}>
                综合评估结果将显示在这里...
              </Text>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
