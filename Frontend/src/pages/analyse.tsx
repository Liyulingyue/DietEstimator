import { useState } from 'react';
import TabBar from '../components/TabBar';
import Gallery from '../components/Gallery';
import { Card, Typography, Empty, Spin, Divider, Button, message, Modal, Form, Input, InputNumber } from 'antd';
import { CopyOutlined, SaveOutlined } from '@ant-design/icons';
import { getApiUrl } from '../api';
import { isLogin } from '../utils/auth';

const { Title, Text } = Typography;

export default function Analyse() {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [editingFoodName, setEditingFoodName] = useState('');
  const [editingCalories, setEditingCalories] = useState<any>(null);
  const [form] = Form.useForm();

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
    if (!analysisResult) {
      message.warning('暂无分析结果可记录');
      return;
    }
    
    // 从分析结果中提取food_name和calories的默认值
    const result = analysisResult.result;
    const defaultFoodName = result?.food_name || '';
    const defaultCalories = result?.calories ? extractNumber(result.calories) : null;
    
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
      const resultToSave = { ...analysisResult.result };
      
      // 更新food_name和calories
      if (resultToSave) {
        resultToSave.food_name = values.food_name;
        resultToSave.calories = values.calories;
      }      // 调用后端保存记录接口
      const response = await fetch(getApiUrl('/api/v1/food_estimate/save_record'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 包含cookies以进行认证
        body: JSON.stringify({
          analysis_result: resultToSave, // 传递完整的分析结果作为JSON
          analysis_method: analysisResult.method || 'pure_llm',
          image_url: '' // 图片暂不记录
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
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
        message.error(`记录失败: ${result.message || '未知错误'}`);
      }
    } catch (error) {
      console.error('保存记录失败:', error);
      message.error('记录失败，请稍后重试');
    }
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
        {/* 食物名称 */}
        {result.food_name && (
          <div style={{ marginBottom: '16px' }}>
            <Title level={5} style={{ color: '#1565c0', marginBottom: '8px' }}>
              🍽️ 食物名称
            </Title>
            <Text style={{ color: '#424242', display: 'block', lineHeight: '1.6' }}>
              {result.food_name}
            </Text>
          </div>
        )}

        {/* 热量信息 */}
        {result.calories && (
          <div style={{ marginBottom: '16px' }}>
            <Title level={5} style={{ color: '#1565c0', marginBottom: '8px' }}>
              🔥 热量
            </Title>
            <Text style={{ color: '#424242', display: 'block', lineHeight: '1.6' }}>
              {result.calories} kcal
            </Text>
          </div>
        )}

        {/* 原因 */}
        {result.reason && (
          <div style={{ marginBottom: '16px' }}>
            <Title level={5} style={{ color: '#1565c0', marginBottom: '8px' }}>
              📝 原因
            </Title>
            <Text style={{ color: '#424242', display: 'block', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {result.reason}
            </Text>
          </div>
        )}

        {/* 如果result.result存在且是对象，显示原始AI响应 */}
        {result.result && typeof result.result === 'object' && (
          <div style={{ marginTop: '20px' }}>
            <Divider />
            <Title level={5} style={{ color: '#1565c0', marginBottom: '8px' }}>
              🤖 AI原始响应
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
                onClick={() => copyToClipboard(JSON.stringify(result.result, null, 2))}
                style={{ position: 'absolute', right: '8px', top: '8px' }}
              >
                复制
              </Button>
              {JSON.stringify(result.result, null, 2)}
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
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '16px',
            marginTop: '8px'
          }}>
            <Title level={4} style={{ color: '#1565c0', margin: 0 }}>分析结果</Title>
            {analysisResult && (
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleRecord}
                style={{
                  background: 'linear-gradient(135deg, #52c41a, #73d13d)',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600'
                }}
              >
                记录
              </Button>
            )}
          </div>
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
        
        {/* 记录编辑弹窗 */}
        <Modal
          title={
            <div style={{ 
              textAlign: 'center', 
              fontSize: '18px', 
              fontWeight: '600',
              color: '#1565c0',
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
          width={450}
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
              padding: '24px'
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
            padding: '20px',
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
                    fontSize: '15px', 
                    fontWeight: '600', 
                    color: '#262626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    🍽️ 食物名称
                  </span>
                }
                name="food_name"
                rules={[{ required: true, message: '请输入食物名称' }]}
                style={{ marginBottom: '20px' }}
              >
                <Input 
                  placeholder="请输入食物名称" 
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #d9d9d9',
                    height: '40px',
                    fontSize: '14px'
                  }}
                />
              </Form.Item>
              
              <Form.Item
                label={
                  <span style={{ 
                    fontSize: '15px', 
                    fontWeight: '600', 
                    color: '#262626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
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
                    height: '40px'
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
      </div>
    </div>
  );
}
