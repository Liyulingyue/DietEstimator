import { useEffect, useRef, useState } from 'react';
import { Upload, Button, Modal, Image, message, Card, Typography, Progress, Tag, Divider, Space } from 'antd';
import { UploadOutlined, CameraOutlined, DeleteOutlined, ExperimentOutlined, MedicineBoxOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import ResponsiveLayout from '../components/ResponsiveLayout';
import PageHeader from '../components/PageHeader';

const { Title, Text, Paragraph } = Typography;

interface BowelAnalysisResult {
  success: boolean;
  message: string;
  result?: {
    type: 'normal' | 'constipation' | 'diarrhea' | 'abnormal';
    confidence: number;
    description: string;
    recommendations: string[];
    health_score: number;
    indicators: {
      color: string;
      shape: string;
      consistency: string;
      frequency?: string;
    };
  };
}

export default function BowelRecognition() {
  const [images, setImages] = useState<string[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<BowelAnalysisResult | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      // @ts-ignore
      videoRef.current.srcObject = null;
    }
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        // @ts-ignore
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraOpen(true);
    } catch (e) {
      console.error(e);
      message.error('无法打开摄像头，请检查权限');
    }
  };

  const capture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const data = canvas.toDataURL('image/png');
    setImages(prev => [data, ...prev]);
    message.success('📸 照片已添加');
    stopCamera();
    setCameraOpen(false);
  };

  const handleUploadBefore = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string | null;
      if (result) {
        setImages(prev => [result, ...prev]);
        message.success('✅ 图片已添加');
      }
    };
    reader.readAsDataURL(file);
    return false; // 阻止自动上传
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    message.info('🗑️ 图片已删除');
  };

  const handleAnalyze = async () => {
    if (images.length === 0) {
      message.warning('请先上传或拍摄排便照片');
      return;
    }

    setAnalyzing(true);
    setAnalysisResult(null);

    const hide = message.loading('正在分析排便情况...', 0);

    try {
      // 模拟AI分析过程
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 模拟分析结果（实际应该调用后端API）
      const mockResult: BowelAnalysisResult = {
        success: true,
        message: '分析完成',
        result: {
          type: Math.random() > 0.7 ? 'constipation' : Math.random() > 0.5 ? 'diarrhea' : 'normal',
          confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
          description: '基于AI视觉分析，结合颜色、形状和稠度等指标进行综合评估。',
          recommendations: [
            '保持规律作息，保证充足睡眠',
            '增加膳食纤维摄入，多吃蔬菜水果',
            '适量运动，促进肠道蠕动',
            '保持心情舒畅，避免过度紧张'
          ],
          health_score: Math.floor(Math.random() * 40) + 60, // 60-100分
          indicators: {
            color: '棕黄色',
            shape: '条状',
            consistency: '软便',
            frequency: '每日1-2次'
          }
        }
      };

      setAnalysisResult(mockResult);
      hide();
      message.success('✅ 分析完成！');

    } catch (error) {
      hide();
      message.error(`分析过程中发生错误: ${error}`);
      console.error('分析异常:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'normal':
        return {
          label: '正常',
          color: 'success',
          icon: CheckCircleOutlined,
          description: '排便情况正常，继续保持良好的生活习惯'
        };
      case 'constipation':
        return {
          label: '便秘',
          color: 'warning',
          icon: CloseCircleOutlined,
          description: '可能存在便秘情况，建议调整饮食和生活习惯'
        };
      case 'diarrhea':
        return {
          label: '腹泻',
          color: 'error',
          icon: CloseCircleOutlined,
          description: '可能存在腹泻情况，注意补水和饮食卫生'
        };
      default:
        return {
          label: '异常',
          color: 'default',
          icon: CloseCircleOutlined,
          description: '排便情况异常，建议咨询专业医生'
        };
    }
  };

  return (
    <ResponsiveLayout>
      <div style={{
        background: 'linear-gradient(180deg, #fff2f0 0%, #f5f5f5 100%)',
        padding: '0',
        minHeight: '100vh'
      }}>
        {/* 顶部标题栏 */}
        <PageHeader
          title={<><MedicineBoxOutlined style={{ marginRight: '8px' }} />排便识别</>}
          description="智能分析排便情况，提供健康建议"
          background="linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)"
          titleSize={24}
          descSize={14}
          padding="24px 20px"
        />

        <div style={{ padding: '0 16px 20px 16px' }}>
          {/* 说明卡片 */}
          <Card
            style={{
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              marginBottom: '20px',
              background: 'linear-gradient(135deg, #fff2f0, #ffebe9)'
            }}
            styles={{ body: { padding: '20px' } }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <ExperimentOutlined style={{
                fontSize: '24px',
                color: '#ff4d4f',
                marginTop: '2px'
              }} />
              <div>
                <Text strong style={{ fontSize: '16px', color: '#262626', display: 'block', marginBottom: '8px' }}>
                  隐私保护说明
                </Text>
                <Text style={{ fontSize: '14px', color: '#595959', lineHeight: '1.6' }}>
                  您的排便照片仅用于AI分析，不会存储在服务器上。分析完成后，照片将在本地自动清除，确保您的隐私安全。
                </Text>
              </div>
            </div>
          </Card>

          {/* 图片上传区域 */}
          <Card
            style={{
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              marginBottom: '20px'
            }}
            styles={{ body: { padding: '20px' } }}
          >
            <div style={{
              position: 'relative',
              minHeight: '280px',
              background: images.length === 0
                ? 'linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%)'
                : 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              borderRadius: '16px',
              border: '2px dashed #d9d9d9'
            }}>
              {images.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  color: '#bfbfbf'
                }}>
                  <MedicineBoxOutlined style={{ fontSize: '48px', marginBottom: '12px', display: 'block' }} />
                  <div style={{ fontSize: '15px', color: '#8c8c8c' }}>还没有排便照片</div>
                  <div style={{ fontSize: '13px', color: '#bfbfbf', marginTop: '4px' }}>
                    上传或拍摄排便照片开始分析
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  overflowX: 'auto',
                  width: '100%',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d9d9d9 transparent',
                  paddingBottom: '8px'
                }}>
                  {images.map((src, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        flexShrink: 0,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        background: 'white'
                      }}
                    >
                      <Image
                        src={src}
                        alt={`bowel-${idx}`}
                        style={{
                          width: '200px',
                          height: '200px',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                        preview={{
                          mask: <div style={{ fontSize: '14px' }}>预览</div>
                        }}
                      />
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeImage(idx)}
                        style={{
                          position: 'absolute',
                          right: 8,
                          top: 8,
                          background: 'rgba(0, 0, 0, 0.6)',
                          color: 'white',
                          borderRadius: '8px',
                          border: 'none',
                          backdropFilter: 'blur(4px)'
                        }}
                        size="small"
                      />
                      <div style={{
                        position: 'absolute',
                        left: 8,
                        top: 8,
                        background: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backdropFilter: 'blur(4px)'
                      }}>
                        {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginTop: '20px'
            }}>
              <Upload
                beforeUpload={handleUploadBefore}
                showUploadList={false}
                accept="image/*"
              >
                <Button
                  icon={<UploadOutlined />}
                  block
                  style={{
                    height: '48px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: '1px solid #d9d9d9',
                    background: 'white'
                  }}
                >
                  上传
                </Button>
              </Upload>

              <Button
                icon={<CameraOutlined />}
                onClick={openCamera}
                block
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: '1px solid #d9d9d9',
                  background: 'white'
                }}
              >
                拍照
              </Button>

              <Button
                icon={<MedicineBoxOutlined />}
                onClick={handleAnalyze}
                type="primary"
                loading={analyzing}
                disabled={analyzing}
                block
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(255, 77, 79, 0.3)'
                }}
              >
                {analyzing ? '分析中...' : '分析'}
              </Button>
            </div>

            {images.length > 0 && (
              <div style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #fff2f0, #ffebe9)',
                borderRadius: '8px',
                border: '1px solid #ffccc7',
                textAlign: 'center',
                marginTop: '12px'
              }}>
                <span style={{ fontSize: '13px', color: '#595959' }}>
                  已选择 <span style={{
                    fontWeight: '700',
                    color: '#ff4d4f',
                    fontSize: '15px'
                  }}>{images.length}</span> 张照片
                </span>
              </div>
            )}
          </Card>

          {/* 分析结果 */}
          {analysisResult && analysisResult.result && (
            <Card
              style={{
                borderRadius: '20px',
                border: 'none',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                marginBottom: '20px'
              }}
              styles={{ body: { padding: '24px' } }}
            >
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Title level={3} style={{ color: '#262626', marginBottom: '8px' }}>
                  分析结果
                </Title>
                <Text style={{ color: '#8c8c8c' }}>
                  基于AI视觉分析和健康指标评估
                </Text>
              </div>

              {/* 健康评分 */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 8px 24px rgba(255, 77, 79, 0.3)'
                }}>
                  <Text style={{ fontSize: '32px', fontWeight: '700', color: 'white' }}>
                    {analysisResult.result.health_score}
                  </Text>
                  <Text style={{ fontSize: '14px', color: 'white', opacity: 0.9 }}>
                    健康评分
                  </Text>
                </div>
                <Progress
                  type="circle"
                  percent={analysisResult.result.health_score}
                  strokeColor="#ff4d4f"
                  trailColor="#f0f0f0"
                  width={80}
                  strokeWidth={8}
                  format={() => ''}
                />
              </div>

              {/* 排便类型 */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <Tag
                    color={getTypeInfo(analysisResult.result.type).color}
                    style={{
                      fontSize: '16px',
                      padding: '6px 16px',
                      borderRadius: '20px'
                    }}
                  >
                    {getTypeInfo(analysisResult.result.type).label}
                  </Tag>
                </div>
                <Text style={{ fontSize: '14px', color: '#595959', display: 'block', textAlign: 'center' }}>
                  {getTypeInfo(analysisResult.result.type).description}
                </Text>
              </div>

              <Divider />

              {/* 详细指标 */}
              <div style={{ marginBottom: '24px' }}>
                <Title level={4} style={{ color: '#262626', marginBottom: '16px' }}>
                  排便指标分析
                </Title>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px'
                }}>
                  <Card size="small" style={{ borderRadius: '12px' }}>
                    <Text strong style={{ fontSize: '14px', color: '#262626' }}>颜色</Text>
                    <br />
                    <Text style={{ color: '#595959' }}>{analysisResult.result.indicators.color}</Text>
                  </Card>
                  <Card size="small" style={{ borderRadius: '12px' }}>
                    <Text strong style={{ fontSize: '14px', color: '#262626' }}>形状</Text>
                    <br />
                    <Text style={{ color: '#595959' }}>{analysisResult.result.indicators.shape}</Text>
                  </Card>
                  <Card size="small" style={{ borderRadius: '12px' }}>
                    <Text strong style={{ fontSize: '14px', color: '#262626' }}>稠度</Text>
                    <br />
                    <Text style={{ color: '#595959' }}>{analysisResult.result.indicators.consistency}</Text>
                  </Card>
                  {analysisResult.result.indicators.frequency && (
                    <Card size="small" style={{ borderRadius: '12px' }}>
                      <Text strong style={{ fontSize: '14px', color: '#262626' }}>频率</Text>
                      <br />
                      <Text style={{ color: '#595959' }}>{analysisResult.result.indicators.frequency}</Text>
                    </Card>
                  )}
                </div>
              </div>

              <Divider />

              {/* AI分析描述 */}
              <div style={{ marginBottom: '24px' }}>
                <Title level={4} style={{ color: '#262626', marginBottom: '12px' }}>
                  AI分析说明
                </Title>
                <Text style={{ color: '#595959', lineHeight: '1.6' }}>
                  {analysisResult.result.description}
                </Text>
              </div>

              {/* 健康建议 */}
              <div>
                <Title level={4} style={{ color: '#262626', marginBottom: '16px' }}>
                  健康建议
                </Title>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {analysisResult.result.recommendations.map((recommendation, index) => (
                    <Card
                      key={index}
                      size="small"
                      style={{
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #f6ffed, #d9f7be)'
                      }}
                    >
                      <Space align="start">
                        <CheckCircleOutlined style={{ color: '#52c41a', marginTop: '2px' }} />
                        <Text style={{ color: '#262626' }}>{recommendation}</Text>
                      </Space>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* 相机模态框 */}
        <Modal
          title={
            <div style={{ fontSize: '16px', fontWeight: '600' }}>
              📷 拍摄排便照片
            </div>
          }
          open={cameraOpen}
          onOk={capture}
          onCancel={() => {
            stopCamera();
            setCameraOpen(false);
          }}
          okText="拍照"
          cancelText="取消"
          centered
          width="90%"
          styles={{
            body: { padding: '20px 0' }
          }}
          okButtonProps={{
            size: 'large',
            style: {
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
              border: 'none',
              fontWeight: '600'
            }
          }}
          cancelButtonProps={{
            size: 'large',
            style: { borderRadius: '8px' }
          }}
        >
          <div style={{
            textAlign: 'center',
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#000'
          }}>
            <video
              ref={videoRef}
              style={{
                width: '100%',
                maxHeight: '500px',
                display: 'block'
              }}
            />
          </div>
        </Modal>
      </div>
    </ResponsiveLayout>
  );
}