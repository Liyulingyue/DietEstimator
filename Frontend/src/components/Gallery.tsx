import { useEffect, useRef, useState } from 'react';
import { Upload, Button, Modal, Image, message } from 'antd';
import { UploadOutlined, CameraOutlined, DeleteOutlined, FireOutlined } from '@ant-design/icons';

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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
    message.success('拍照已添加');
  };

  const handleUploadBefore = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string | null;
      if (result) setImages(prev => [result, ...prev]);
    };
    reader.readAsDataURL(file);
    return false; // 阻止自动上传
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleParseCalories = () => {
    // TODO: 实现解析热量逻辑
    console.log('解析热量');
  };

  return (
    <div style={{ 
      padding: '24px', 
      width: '100%', 
      boxSizing: 'border-box', 
      marginTop: 0,
      background: 'linear-gradient(135deg, #fff5e6 0%, #ffe4d6 100%)',
      border: '2px solid rgba(252, 182, 159, 0.3)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(252, 182, 159, 0.2)'
    }}>
      <div style={{ marginTop: 12, overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', height: '350px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {images.length === 0 && (
            <div style={{ color: '#888', textAlign: 'center' }}>
              还没有图片
            </div>
          )}
          {images.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'row', gap: 32, alignItems: 'center', height: '100%', justifyContent: 'center', minWidth: 0, width: '100%' }}>
              {images.map((src, idx) => (
                <div key={idx} style={{ position: 'relative', height: '100%', flex: '0 0 auto', display: 'flex', alignItems: 'center' }}>
                  <Image src={src} alt={`img-${idx}`} style={{ width: 'auto', height: '100%', borderRadius: 4, objectFit: 'contain', maxWidth: '400px' }} />
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => removeImage(idx)}
                    style={{ position: 'absolute', right: 8, top: 8, color: '#fff', background: 'rgba(0,0,0,0.45)', borderRadius: 4 }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 48, marginTop: 20, marginBottom: 16, justifyContent: 'center', alignItems: 'center' }}>
        <Upload beforeUpload={handleUploadBefore} showUploadList={false} accept="image/*">
          <Button icon={<UploadOutlined />}>上传图片</Button>
        </Upload>
        <Button icon={<CameraOutlined />} onClick={openCamera}>拍照</Button>
        <Button icon={<FireOutlined />} onClick={handleParseCalories}>解析热量</Button>
      </div>

      <Modal
        title="拍照"
        open={cameraOpen}
        onOk={() => {
          capture();
        }}
        onCancel={() => {
          stopCamera();
          setCameraOpen(false);
        }}
        okText="拍照"
      >
        <div style={{ textAlign: 'center' }}>
          <video ref={videoRef} style={{ width: '100%', maxHeight: 480 }} />
        </div>
      </Modal>
    </div>
  );
}
