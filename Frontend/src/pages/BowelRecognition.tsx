import { useEffect, useRef, useState } from 'react';
import { Upload, Button, Modal, Image, message, Card, Typography } from 'antd';
import { UploadOutlined, CameraOutlined, DeleteOutlined, MedicineBoxOutlined, CheckCircleOutlined } from '@ant-design/icons';
import ResponsiveLayout from '../components/ResponsiveLayout';
import PageHeader from '../components/PageHeader';
import { analyzeBowel } from '../api';
import type { BowelAnalysisResponse } from '../api';
import { getSessionId } from '../utils/api';

const { Title, Text, Paragraph } = Typography;

export default function BowelRecognition() {
  const [images, setImages] = useState<string[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<BowelAnalysisResponse | null>(null);
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
      videoRef.current.srcObject = null;
    }
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
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
      // 将base64图片转换为File对象
      const files: File[] = [];
      for (let i = 0; i < images.length; i++) {
        const imageData = images[i];
        // 从base64字符串创建File对象
        const response = await fetch(imageData);
        const blob = await response.blob();
        const file = new File([blob], `bowel-image-${i + 1}.jpg`, { type: 'image/jpeg' });
        files.push(file);
      }

      // 调用API进行分析
      const result = await analyzeBowel({
        files: files,
        session_id: getSessionId(),
        method: 'pure_llm',
        call_preference: 'server' // 优先使用服务器配置
      });

      setAnalysisResult(result);
      hide();

      if (result.success) {
        message.success('✅ 分析完成！');
      } else {
        message.error(`❌ 分析失败: ${result.error || result.message}`);
      }

    } catch (error) {
      hide();
      console.error('分析异常:', error);
      message.error(`分析过程中发生错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setAnalyzing(false);
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
          description="智能分析排便情况，提供健康建议，照片仅用于AI分析，不会存储在服务器上"
          background="linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)"
          titleSize={24}
          descSize={14}
          padding="24px 20px"
        />

        <div style={{ padding: '0 16px 20px 16px' }}>
          {/* 说明卡片 */}
          {/* <Card
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
          </Card> */}

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
          <Card
            style={{
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              marginBottom: '20px'
            }}
            styles={{ body: { padding: '24px' } }}
          >
            <div style={{ marginBottom: '24px' }}>
              <Title level={3} style={{ color: '#262626', marginBottom: '8px' }}>
                分析结果
              </Title>
            </div>

            {/* 分析条目 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 颜色 */}
              <div style={{
                background: 'white',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #f0f0f0'
              }}>
                <Text strong style={{
                  fontSize: '14px',
                  color: '#262626',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  🎨 颜色
                </Text>
                <Paragraph style={{
                  color: '#595959',
                  fontSize: '14px',
                  lineHeight: '1.8',
                  margin: 0
                }}>
                  {analysisResult?.color || '暂无'}
                </Paragraph>
              </div>

              {/* 份量 */}
              <div style={{
                background: 'white',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #f0f0f0'
              }}>
                <Text strong style={{
                  fontSize: '14px',
                  color: '#262626',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  📏 份量
                </Text>
                <Paragraph style={{
                  color: '#595959',
                  fontSize: '14px',
                  lineHeight: '1.8',
                  margin: 0
                }}>
                  {analysisResult?.quantity || '暂无'}
                </Paragraph>
              </div>

              {/* 形态 */}
              <div style={{
                background: 'white',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #f0f0f0'
              }}>
                <Text strong style={{
                  fontSize: '14px',
                  color: '#262626',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  🔷 形态
                </Text>
                <Paragraph style={{
                  color: '#595959',
                  fontSize: '14px',
                  lineHeight: '1.8',
                  margin: 0
                }}>
                  {analysisResult?.shape || '暂无'}
                </Paragraph>
              </div>

              {/* 健康点评 */}
              <div style={{
                background: 'white',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #f0f0f0'
              }}>
                <Text strong style={{
                  fontSize: '14px',
                  color: '#262626',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  💬 健康点评
                </Text>
                <Paragraph style={{
                  color: '#595959',
                  fontSize: '14px',
                  lineHeight: '1.8',
                  margin: 0
                }}>
                  {analysisResult?.health_comment || '暂无'}
                </Paragraph>
              </div>

              {/* 分析依据 */}
              <div style={{
                background: 'white',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #f0f0f0'
              }}>
                <Text strong style={{
                  fontSize: '14px',
                  color: '#262626',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  📋 分析依据
                </Text>
                <Paragraph style={{
                  color: '#595959',
                  fontSize: '14px',
                  lineHeight: '1.8',
                  margin: 0,
                  whiteSpace: 'pre-wrap'
                }}>
                  {analysisResult?.analysis_basis || '暂无'}
                </Paragraph>
              </div>
            </div>

            {/* 只有当有分析结果时才显示成功状态 */}
            {analysisResult && analysisResult.success && (
              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: 'linear-gradient(135deg, #f6ffed, #d9f7be)',
                borderRadius: '12px',
                border: '1px solid #b7eb8f',
                textAlign: 'center'
              }}>
                <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
                <Text style={{ fontSize: '16px', color: '#262626', fontWeight: '500' }}>
                  分析完成！请根据以上结果关注肠道健康。
                </Text>
              </div>
            )}
          </Card>
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