import { useEffect, useRef, useState } from 'react';
import { Upload, Button, Modal, Image, message } from 'antd';
import { UploadOutlined, CameraOutlined, DeleteOutlined, FireOutlined, PictureOutlined } from '@ant-design/icons';

export default function Gallery() {
  const [images, setImages] = useState<string[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
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
    message.success('📸 拍照已添加');
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

  const handleParseCalories = () => {
    if (images.length === 0) {
      message.warning('请先上传或拍摄食物图片');
      return;
    }
    // TODO: 实现解析热量逻辑
    message.loading('正在分析中...', 2);
    console.log('解析热量');
  };

  return (
    <div style={{ 
      width: '100%', 
      boxSizing: 'border-box',
      background: 'white',
      border: 'none',
      borderRadius: '20px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      overflow: 'hidden'
    }}>
      {/* 图片展示区域 */}
      <div style={{ 
        position: 'relative', 
        minHeight: '280px',
        background: images.length === 0 
          ? 'linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%)' 
          : 'white',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px'
      }}>
        {images.length === 0 ? (
          <div style={{ 
            textAlign: 'center',
            color: '#bfbfbf'
          }}>
            <PictureOutlined style={{ fontSize: '48px', marginBottom: '12px', display: 'block' }} />
            <div style={{ fontSize: '15px', color: '#8c8c8c' }}>还没有图片</div>
            <div style={{ fontSize: '13px', color: '#bfbfbf', marginTop: '4px' }}>
              上传或拍摄食物照片开始分析
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
                  alt={`img-${idx}`} 
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
                {/* 图片序号标签 */}
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

      {/* 操作按钮区域 */}
      <div style={{
        padding: '20px',
        background: '#fafafa',
        borderTop: '1px solid #f0f0f0'
      }}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: images.length > 0 ? '12px' : 0
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
            icon={<FireOutlined />} 
            onClick={handleParseCalories}
            type="primary"
            block
            style={{
              height: '48px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #52c41a, #73d13d)',
              border: 'none',
              boxShadow: '0 2px 8px rgba(82, 196, 26, 0.3)'
            }}
          >
            分析
          </Button>
        </div>

        {images.length > 0 && (
          <div style={{
            padding: '12px',
            background: 'linear-gradient(135deg, #e6f7ff, #f0f9ff)',
            borderRadius: '8px',
            border: '1px solid #91d5ff33',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '13px', color: '#595959' }}>
              已选择 <span style={{ 
                fontWeight: '700', 
                color: '#52c41a',
                fontSize: '15px'
              }}>{images.length}</span> 张图片
            </span>
          </div>
        )}
      </div>

      {/* 相机模态框 */}
      <Modal
        title={
          <div style={{ fontSize: '16px', fontWeight: '600' }}>
            📷 拍摄食物照片
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
            background: 'linear-gradient(135deg, #52c41a, #73d13d)',
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
  );
}
