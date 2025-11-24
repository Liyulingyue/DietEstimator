import { Card, Typography, Spin, message, Modal, Form, Input, InputNumber } from 'antd';
import Gallery from '../components/Gallery';
import ResponsiveLayout from '../components/ResponsiveLayout';
import PageHeader from '../components/PageHeader';
import { getApiUrl } from '../api';
import { isLogin, getSessionId } from '../utils/auth';
import { shareToGallery } from '../utils/api';
import type { ShareToGalleryRequest } from '../utils/api';
import { useState } from 'react';
import { LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface AnalysisResult {
  success: boolean;
  message: string;
  result?: {
    food_name?: string;
    calories?: string | number;
    reason?: string;
    result?: any;
  };
  session_id?: string;
  method?: string;
  error?: string;
}

export default function MobileAnalyse() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [editingFoodName, setEditingFoodName] = useState('');
  const [editingCalories, setEditingCalories] = useState<number | null>(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareForm] = Form.useForm();
  const [sharing, setSharing] = useState(false);
  const [form] = Form.useForm();

  const handleAnalysisStart = () => {
    setAnalyzing(true);
  };

  // 自动提取数字的函数
  const extractNumber = (input: string | number | null | undefined): number | null => {
    if (input === null || input === undefined) return null;
    if (typeof input === 'number') return input;
    
    const str = String(input);
    // 使用正则表达式匹配数字（包括小数）
    const match = str.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  };

  const handleCaloriesChange = (value: string | number | null) => {
    if (typeof value === 'string') {
      const extractedNumber = extractNumber(value);
      if (extractedNumber !== null && extractedNumber !== parseFloat(value)) {
        // 如果提取到了不同的数字，更新表单值
        form.setFieldsValue({ calories: extractedNumber });
      }
    }
  };

  const handleRecord = () => {
    if (!result) {
      message.warning('暂无分析结果可记录');
      return;
    }
    
    // 从分析结果中提取food_name和calories的默认值
    const resultData = result.result;
    const defaultFoodName = resultData?.food_name || '';
    const defaultCalories = resultData?.calories ? extractNumber(resultData.calories) : null;
    
    // 设置编辑状态
    setEditingFoodName(defaultFoodName);
    setEditingCalories(defaultCalories);
    
    // 重置表单
    form.setFieldsValue({
      food_name: defaultFoodName,
      calories: defaultCalories
    });
    
    // 打开弹窗
    setRecordModalVisible(true);
  };

  const handleShare = () => {
    if (!result) {
      message.warning('暂无分析结果可分享');
      return;
    }
    
    // 从分析结果中提取默认值
    const resultData = result.result;
    const defaultFoodName = resultData?.food_name || '';
    const defaultCalories = resultData?.calories ? extractNumber(resultData.calories) : null;
    
    // 设置分享表单的初始值
    shareForm.setFieldsValue({
      food_name: defaultFoodName,
      calories: defaultCalories
    });
    
    // 打开分享弹窗
    setShareModalVisible(true);
  };

  const handleSaveRecord = async () => {
    try {
      // 先检查登录状态
      const loggedIn = await isLogin();
      if (!loggedIn) {
        message.error('请先登录后再保存记录');
        return;
      }
      
      const values = await form.validateFields();
      
      // 准备要保存的数据
      const resultToSave = result?.result ? { ...result.result } : {};
      
      // 更新food_name和calories
      if (resultToSave) {
        resultToSave.food_name = values.food_name;
        resultToSave.calories = values.calories;
      }
      
      // 调用后端保存记录接口
      const sessionId = getSessionId();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (sessionId) {
        headers['X-Session-ID'] = sessionId;
      }
      const response = await fetch(getApiUrl('/api/v1/food_estimate/save_record'), {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          analysis_result: resultToSave, // 传递完整的分析结果作为JSON
          analysis_method: 'pure_llm', // 这里可以根据实际情况调整
          image_url: '' // 图片暂不记录
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        message.success({
          content: '📝 分析结果已记录！',
          duration: 3,
          style: {
            fontSize: '16px',
            fontWeight: '600',
          }
        });
        setRecordModalVisible(false);
      } else {
        message.error(`记录失败: ${data.message || '未知错误'}`);
      }
    } catch (error) {
      console.error('保存记录失败:', error);
      message.error('记录失败，请稍后重试');
    }
  };

  const handleShareConfirm = async () => {
    try {
      // 先检查登录状态
      const loggedIn = await isLogin();
      if (!loggedIn) {
        message.error('请先登录后再分享到画廊');
        return;
      }
      
      const values = await shareForm.validateFields();
      
      setSharing(true);
      
      // 准备分享数据，直接使用后端分析返回的结果作为基础
      const resultToShare = result?.result ? { ...result.result } : {};
      
      // 更新用户编辑的食物名称和热量
      if (resultToShare) {
        resultToShare.food_name = values.food_name;
        resultToShare.calories = values.calories;
      }
      
      // 获取第一张图片的base64数据
      const imageBase64 = images.length > 0 ? images[0] : '';
      
      // 构建分享请求数据，直接传递完整的分析结果作为JSON（参考记录功能）
      const shareData: ShareToGalleryRequest = {
        image_base64: imageBase64,
        analysis_result: JSON.stringify(resultToShare) // 直接记录后端的分析返回
      };

      console.log('分享数据:', shareData);
      
      const shareResponse = await shareToGallery(shareData);
      
      if (shareResponse.success) {
        message.success({
          content: '🎉 分享成功！已发布到画廊',
          duration: 3,
          style: {
            fontSize: '16px',
            fontWeight: '600',
          }
        });
        setShareModalVisible(false);
      } else {
        message.error(`分享失败: ${shareResponse.message || '未知错误'}`);
      }
    } catch (error) {
      console.error('分享失败:', error);
      message.error('分享过程中发生错误，请稍后重试');
    } finally {
      setSharing(false);
    }
  };

  const handleAnalysisComplete = (analysisResult: AnalysisResult, imageData?: string[]) => {
    console.log('分析完成，结果:', analysisResult);
    
    if (analysisResult && analysisResult.success) {
      // 显示成功弹窗
      message.success({
        content: '🎉 分析完成！',
        duration: 3,
        style: {
          fontSize: '16px',
          fontWeight: '600',
        }
      });
      
      // 设置分析结果和图片数据
      setResult(analysisResult);
      if (imageData && imageData.length > 0) {
        setImages(imageData);
      }
    } else {
      // 显示失败弹窗
      message.error({
        content: `分析失败: ${analysisResult?.message || '未知错误'}`,
        duration: 4,
      });
    }
    
    setAnalyzing(false);
  };

  return (
    <ResponsiveLayout>
    <div style={{
      background: 'linear-gradient(180deg, #f6ffed 0%, #f5f5f5 100%)',
      padding: '0',
      minHeight: '100vh'
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
        <Gallery 
          onAnalysisComplete={handleAnalysisComplete}
          onAnalysisStart={handleAnalysisStart}
        />

        {/* 分析结果区域 */}
        <Card style={{
          marginTop: '20px',
          background: 'white',
          border: 'none',
          borderRadius: '20px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden'
        }}
        styles={{ body: { padding: '24px' } }}
        >
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ color: '#262626', margin: 0 }}>
              分析结果
            </Title>
            
            {/* 分享和记录按钮 */}
            {result && result.success && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleShare}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #eb2f96, #f759ab)',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(235, 47, 150, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  📤 分享
                </button>
                <button
                  onClick={handleRecord}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #52c41a, #73d13d)',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(82, 196, 26, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  💾 记录
                </button>
              </div>
            )}
          </div>

          {/* 分析条目 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {analyzing ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
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
            ) : (
              <>
                {/* 食物名称 */}
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
                    🍽️ 食物名称
                  </Text>
                  <Paragraph style={{
                    color: '#595959',
                    fontSize: '14px',
                    lineHeight: '1.8',
                    margin: 0
                  }}>
                    {result?.result?.food_name || '暂无'}
                  </Paragraph>
                </div>

                {/* 热量信息 */}
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
                    🔥 热量
                  </Text>
                  <Paragraph style={{
                    color: '#595959',
                    fontSize: '14px',
                    lineHeight: '1.8',
                    margin: 0
                  }}>
                    {result?.result?.calories ? `${result.result.calories} kcal` : '暂无'}
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
                    {result?.result?.reason || '暂无'}
                  </Paragraph>
                </div>

                {/* 如果result.result存在且是对象，显示原始AI响应 */}
                {result?.result?.result && typeof result.result.result === 'object' && (
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
                      marginBottom: '12px'
                    }}>
                      🤖 AI原始响应
                    </Text>
                    <div style={{
                      background: '#f5f5f5',
                      padding: '8px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {JSON.stringify(result.result.result, null, 2)}
                    </div>
                  </div>
                )}

                {/* 只有当有分析结果时才显示成功状态 */}
                {result && result.success && (
                  <div style={{
                    marginTop: '8px',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #f6ffed, #d9f7be)',
                    borderRadius: '12px',
                    border: '1px solid #b7eb8f',
                    textAlign: 'center'
                  }}>
                    <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
                    <Text style={{ fontSize: '16px', color: '#262626', fontWeight: '500' }}>
                      分析完成！请根据以上结果合理控制饮食。
                    </Text>
                  </div>
                )}
              </>
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
      
      {/* 记录编辑弹窗 */}
      <Modal
        title={
          <div style={{ 
            textAlign: 'center', 
            fontSize: '16px', 
            fontWeight: '600',
            color: '#52c41a',
            marginBottom: '8px'
          }}>
            🍽️ 编辑记录信息
          </div>
        }
        open={recordModalVisible}
        onOk={handleSaveRecord}
        onCancel={() => setRecordModalVisible(false)}
        okText="保存记录"
        cancelText="取消"
        width={350}
        centered
        okButtonProps={{
          style: {
            background: 'linear-gradient(135deg, #52c41a, #73d13d)',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            height: '36px'
          }
        }}
        cancelButtonProps={{
          style: {
            borderRadius: '8px',
            height: '36px'
          }
        }}
        styles={{
          body: {
            background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ea 100%)',
            borderRadius: '12px',
            padding: '20px'
          }
        }}
        style={{
          borderRadius: '16px',
          overflow: 'hidden'
        }}
      >
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '12px',
          padding: '18px',
          border: '1px solid rgba(82, 196, 26, 0.2)',
          boxShadow: '0 4px 12px rgba(82, 196, 26, 0.1)'
        }}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              food_name: editingFoodName,
              calories: editingCalories
            }}
          >
            <Form.Item
              label={
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#262626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  🍽️ 食物名称
                </span>
              }
              name="food_name"
              rules={[{ required: true, message: '请输入食物名称' }]}
              style={{ marginBottom: '18px' }}
            >
              <Input 
                placeholder="请输入食物名称" 
                style={{
                  borderRadius: '8px',
                  border: '1px solid #d9d9d9',
                  height: '38px',
                  fontSize: '14px'
                }}
              />
            </Form.Item>
            
            <Form.Item
              label={
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#262626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  🔥 热量 (kcal)
                </span>
              }
              name="calories"
              rules={[{ required: true, message: '请输入热量值' }]}
              style={{ marginBottom: '0' }}
            >
              <InputNumber
                placeholder="请输入热量值"
                min={0}
                style={{ 
                  width: '100%',
                  borderRadius: '8px',
                  border: '1px solid #d9d9d9',
                  height: '38px'
                }}
                controls={{
                  upIcon: <span style={{ color: '#52c41a', fontSize: '12px' }}>▲</span>,
                  downIcon: <span style={{ color: '#52c41a', fontSize: '12px' }}>▼</span>
                }}
                onChange={handleCaloriesChange}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* 分享弹窗 */}
      <Modal
        title={
          <div style={{ 
            textAlign: 'center', 
            fontSize: '16px', 
            fontWeight: '600',
            color: '#eb2f96',
            marginBottom: '8px'
          }}>
            📤 分享到画廊
          </div>
        }
        open={shareModalVisible}
        onOk={handleShareConfirm}
        onCancel={() => setShareModalVisible(false)}
        okText="确认分享"
        cancelText="取消"
        width={350}
        centered
        confirmLoading={sharing}
        okButtonProps={{
          style: {
            background: 'linear-gradient(135deg, #eb2f96, #f759ab)',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            height: '36px'
          }
        }}
        cancelButtonProps={{
          style: {
            borderRadius: '8px',
            height: '36px'
          }
        }}
        styles={{
          body: {
            background: 'linear-gradient(135deg, #fff0f6 0%, #fef2f1 100%)',
            borderRadius: '12px',
            padding: '20px'
          }
        }}
        style={{
          borderRadius: '16px',
          overflow: 'hidden'
        }}
      >
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '12px',
          padding: '18px',
          border: '1px solid rgba(235, 47, 150, 0.2)',
          boxShadow: '0 4px 12px rgba(235, 47, 150, 0.1)'
        }}>
          <Form
            form={shareForm}
            layout="vertical"
          >
            <Form.Item
              label={
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#262626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  🍽️ 食物名称
                </span>
              }
              name="food_name"
              rules={[{ required: true, message: '请输入食物名称' }]}
              style={{ marginBottom: '18px' }}
            >
              <Input 
                placeholder="请输入食物名称" 
                style={{
                  borderRadius: '8px',
                  border: '1px solid #d9d9d9',
                  height: '38px',
                  fontSize: '14px'
                }}
              />
            </Form.Item>
            
            <Form.Item
              label={
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#262626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  🔥 热量 (kcal)
                </span>
              }
              name="calories"
              rules={[{ required: true, message: '请输入热量值' }]}
              style={{ marginBottom: '0' }}
            >
              <InputNumber
                placeholder="请输入热量值"
                min={0}
                style={{ 
                  width: '100%',
                  borderRadius: '8px',
                  border: '1px solid #d9d9d9',
                  height: '38px'
                }}
                controls={{
                  upIcon: <span style={{ color: '#eb2f96', fontSize: '12px' }}>▲</span>,
                  downIcon: <span style={{ color: '#eb2f96', fontSize: '12px' }}>▼</span>
                }}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
    </ResponsiveLayout>
  );
}