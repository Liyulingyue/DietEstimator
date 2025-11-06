import { Card, Typography, Spin, Empty, message, Button, Modal, Form, Input, InputNumber } from 'antd';
import Gallery from '../components/Gallery';
import ResponsiveLayout from '../components/ResponsiveLayout';
import PageHeader from '../components/PageHeader';
import { getApiUrl } from '../api';
import { isLogin } from '../utils/auth';
import { useState } from 'react';
import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function MobileAnalyse() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [editingFoodName, setEditingFoodName] = useState('');
  const [editingCalories, setEditingCalories] = useState<any>(null);
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
    const resultData = result.result?.result || result.result || {};
    let defaultFoodName = '';
    let defaultCalories = null;
    
    // 查找food_name
    for (const [key, value] of Object.entries(resultData)) {
      if (key === 'food_name' || (key.toLowerCase().includes('food') && key.toLowerCase().includes('name'))) {
        defaultFoodName = String(value);
        break;
      }
    }
    
    // 查找calories
    for (const [key, value] of Object.entries(resultData)) {
      if (key === 'calories' || key.toLowerCase().includes('calorie')) {
        defaultCalories = extractNumber(value as string | number | null | undefined);
        break;
      }
    }
    
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
      const resultToSave = { ...result.result.result };
      
      // 更新food_name和calories到结构化数据中
      if (resultToSave && typeof resultToSave === 'object') {
        // 更新结构化数据中的food_name和calories
        for (const [key, value] of Object.entries(resultToSave)) {
          if (key === 'food_name' || (key.toLowerCase().includes('food') && key.toLowerCase().includes('name'))) {
            resultToSave[key] = values.food_name;
          } else if (key === 'calories' || key.toLowerCase().includes('calorie')) {
            resultToSave[key] = values.calories;
          }
        }
      }
      
      // 调用后端保存记录接口
      const response = await fetch(getApiUrl('/api/v1/ai/save_record'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 包含cookies以进行认证
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

  const handleAnalysisComplete = (analysisResult: any) => {
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
      
      // 设置分析结果
      setResult(analysisResult);
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
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '16px' 
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px'
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
            {result && (
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleRecord}
                size="small"
                style={{
                  background: 'linear-gradient(135deg, #52c41a, #73d13d)',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600'
                }}
              >
                保存记录
              </Button>
            )}
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
            ) : result && result.result ? (
              <div style={{ width: '100%' }}>
                {/* 检查是否是结构化数据（dict） */}
                {typeof result.result.result === 'object' && result.result.result !== null ? (
                  // 动态构造结构化数据显示
                  <div>
                    {Object.entries(result.result.result).map(([key, value]: [string, any]) => {
                      // 根据key类型决定显示方式
                      if (key === 'calories' || key.toLowerCase().includes('calorie')) {
                        // 热量信息 - 通用样式
                        return (
                          <div key={key} style={{
                            background: 'white',
                            padding: '16px',
                            borderRadius: '12px',
                            marginBottom: '12px',
                            border: '1px solid #f0f0f0'
                          }}>
                            <Text strong style={{
                              fontSize: '14px',
                              color: '#262626',
                              display: 'block',
                              marginBottom: '8px'
                            }}>
                              {key}
                            </Text>
                            <Paragraph style={{
                              color: '#595959',
                              fontSize: '14px',
                              lineHeight: '1.8',
                              margin: 0
                            }}>
                              {String(value)} kcal
                            </Paragraph>
                          </div>
                        );
                      } else if (key === 'food_name' || key.toLowerCase().includes('food') && key.toLowerCase().includes('name')) {
                        // 食物名称 - 通用样式
                        return (
                          <div key={key} style={{
                            background: 'white',
                            padding: '16px',
                            borderRadius: '12px',
                            marginBottom: '12px',
                            border: '1px solid #f0f0f0'
                          }}>
                            <Text strong style={{
                              fontSize: '14px',
                              color: '#262626',
                              display: 'block',
                              marginBottom: '8px'
                            }}>
                              {key}
                            </Text>
                            <Paragraph style={{
                              color: '#595959',
                              fontSize: '14px',
                              lineHeight: '1.8',
                              margin: 0
                            }}>
                              {String(value)}
                            </Paragraph>
                          </div>
                        );
                      } else if (key === 'estimation_basis' || key.toLowerCase().includes('basis') || key.toLowerCase().includes('reason')) {
                        // 估算依据 - 文本样式
                        return (
                          <div key={key} style={{
                            background: 'white',
                            padding: '16px',
                            borderRadius: '12px',
                            marginBottom: '12px',
                            border: '1px solid #f0f0f0'
                          }}>
                            <Text strong style={{
                              fontSize: '14px',
                              color: '#262626',
                              display: 'block',
                              marginBottom: '8px'
                            }}>
                              {key}
                            </Text>
                            <Paragraph style={{
                              color: '#595959',
                              fontSize: '14px',
                              lineHeight: '1.8',
                              margin: 0,
                              whiteSpace: 'pre-wrap'
                            }}>
                              {String(value)}
                            </Paragraph>
                          </div>
                        );
                      } else if (key === 'nutrition_info' || key.toLowerCase().includes('nutrition')) {
                        // 营养成分 - 网格样式
                        return (
                          <div key={key} style={{
                            background: 'white',
                            padding: '16px',
                            borderRadius: '12px',
                            marginBottom: '12px',
                            border: '1px solid #f0f0f0'
                          }}>
                            <Text strong style={{
                              fontSize: '14px',
                              color: '#262626',
                              display: 'block',
                              marginBottom: '12px'
                            }}>
                              {key}
                            </Text>
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(2, 1fr)',
                              gap: '8px',
                            }}>
                              {typeof value === 'object' && value !== null ?
                                Object.entries(value).map(([nutrientKey, nutrientValue]: [string, any]) => (
                                  <div
                                    key={nutrientKey}
                                    style={{
                                      background: '#fafafa',
                                      padding: '10px',
                                      borderRadius: '8px',
                                      textAlign: 'center',
                                    }}
                                  >
                                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                                      {nutrientKey}
                                    </Text>
                                    <Text strong style={{ fontSize: '14px', color: '#52c41a' }}>
                                      {String(nutrientValue)}
                                    </Text>
                                  </div>
                                )) : (
                                  <div style={{
                                    background: '#fafafa',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    gridColumn: 'span 2',
                                    textAlign: 'center',
                                  }}>
                                    <Text strong style={{ fontSize: '14px', color: '#52c41a' }}>
                                      {String(value)}
                                    </Text>
                                  </div>
                                )
                              }
                            </div>
                          </div>
                        );
                      } else if (key === 'food_description' || key.toLowerCase().includes('description')) {
                        // 食物描述 - 文本样式
                        return (
                          <div key={key} style={{
                            background: 'white',
                            padding: '16px',
                            borderRadius: '12px',
                            marginBottom: '12px',
                            border: '1px solid #f0f0f0'
                          }}>
                            <Text strong style={{
                              fontSize: '14px',
                              color: '#262626',
                              display: 'block',
                              marginBottom: '8px'
                            }}>
                              {key}
                            </Text>
                            <Paragraph style={{
                              color: '#595959',
                              fontSize: '14px',
                              lineHeight: '1.8',
                              margin: 0
                            }}>
                              {String(value)}
                            </Paragraph>
                          </div>
                        );
                      } else {
                        // 其他字段 - 通用样式
                        return (
                          <div key={key} style={{
                            background: 'white',
                            padding: '16px',
                            borderRadius: '12px',
                            marginBottom: '12px',
                            border: '1px solid #f0f0f0'
                          }}>
                            <Text strong style={{
                              fontSize: '14px',
                              color: '#262626',
                              display: 'block',
                              marginBottom: '8px'
                            }}>
                              {key}
                            </Text>
                            {typeof value === 'object' && value !== null ? (
                              <div style={{
                                background: '#f5f5f5',
                                padding: '8px',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                fontSize: '12px'
                              }}>
                                {JSON.stringify(value, null, 2)}
                              </div>
                            ) : (
                              <Paragraph style={{
                                color: '#595959',
                                fontSize: '14px',
                                lineHeight: '1.8',
                                margin: 0
                              }}>
                                {String(value)}
                              </Paragraph>
                            )}
                          </div>
                        );
                      }
                    })}
                  </div>
                ) : typeof result.result === 'string' ? (
                  // 如果是字符串，直接显示文本内容
                  <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #f0f0f0',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.8'
                  }}>
                    <Text style={{
                      color: '#262626',
                      fontSize: '15px',
                    }}>
                      {result.result}
                    </Text>
                  </div>
                ) : (
                  // 其他结构化数据，按原来的方式显示
                  <>
                    {/* 热量估算 */}
                    {(result.result.calories || result.result.calorie_estimate) && (
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
                          {result.result.calories || result.result.calorie_estimate}
                        </Text>
                        <Text style={{ fontSize: '16px', color: '#8c8c8c' }}> kcal</Text>
                      </div>
                    )}

                    {/* 食物描述 */}
                    {result.result.food_description && (
                      <div style={{
                        background: 'white',
                        padding: '16px',
                        borderRadius: '12px',
                        marginBottom: '12px',
                        border: '1px solid #f0f0f0'
                      }}>
                        <Text strong style={{
                          fontSize: '14px',
                          color: '#262626',
                          display: 'block',
                          marginBottom: '8px'
                        }}>
                          📋 食物描述
                        </Text>
                        <Paragraph style={{
                          color: '#595959',
                          fontSize: '14px',
                          lineHeight: '1.8',
                          margin: 0
                        }}>
                          {result.result.food_description}
                        </Paragraph>
                      </div>
                    )}

                    {/* 营养成分 */}
                    {result.result.nutrition_info && (
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
                          📊 营养成分
                        </Text>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '8px',
                        }}>
                          {Object.entries(result.result.nutrition_info).map(([key, value]: [string, any]) => (
                            <div
                              key={key}
                              style={{
                                background: '#fafafa',
                                padding: '10px',
                                borderRadius: '8px',
                                textAlign: 'center',
                              }}
                            >
                              <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                                {key}
                              </Text>
                              <Text strong style={{ fontSize: '14px', color: '#52c41a' }}>
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </Text>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
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
    </div>
    </ResponsiveLayout>
  );
}