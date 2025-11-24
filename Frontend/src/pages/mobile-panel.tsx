import { Card, Typography, Button, List, Avatar, Progress, Spin, Modal, Form, Input, InputNumber, message, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import ResponsiveLayout from '../components/ResponsiveLayout';
import PageHeader from '../components/PageHeader';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLogin, getUserId, getSessionId } from '../utils/auth';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text } = Typography;

export default function MobilePanel() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [todayRecords, setTodayRecords] = useState<any[]>([]);
  
  // 从localStorage读取饮食目标，默认为3000
  const getDietGoal = () => {
    const savedGoal = localStorage.getItem('dietGoal');
    if (savedGoal) {
      try {
        return parseInt(savedGoal);
      } catch (e) {
        console.error('Failed to parse diet goal:', e);
      }
    }
    return 3000; // 默认值3000
  };

  const [todayData, setTodayData] = useState({
    consumed: 0,
    target: getDietGoal(),
    percentage: 0,
    actualPercentage: 0, // 实际百分比，可能超过100%
    meals: 0
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const [estimationModalVisible, setEstimationModalVisible] = useState(false);
  const [currentEstimationBasis, setCurrentEstimationBasis] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginAndFetchData = async () => {
      try {
        const loggedIn = await isLogin();
        setIsLoggedIn(loggedIn);

        if (loggedIn) {
          const userId = await getUserId();
          if (userId) {
            await fetchTodayRecords(userId);
          }
        }
      } catch (error) {
        console.error('检查登录状态失败:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginAndFetchData();
  }, []);

  // 监听localStorage变化，实时更新饮食目标
  useEffect(() => {
    const handleStorageChange = () => {
      const newGoal = getDietGoal();
      setTodayData(prev => ({
        ...prev,
        target: newGoal,
        percentage: Math.min(Math.round((prev.consumed / newGoal) * 100), 100)
      }));
    };

    // 监听storage事件（跨标签页同步）
    window.addEventListener('storage', handleStorageChange);
    
    // 自定义事件监听（同一标签页内的更新）
    window.addEventListener('dietGoalChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dietGoalChanged', handleStorageChange);
    };
  }, []);

  const fetchTodayRecords = async (userId: string, targetDate?: Date) => {
    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}`;
      const sessionId = getSessionId();
      const headers: HeadersInit = {};
      if (sessionId) {
        headers['X-Session-ID'] = sessionId;
      }
      
      const response = await fetch(`${apiUrl}/api/v1/records/${userId}`, {
        method: 'GET',
        headers: headers,
      });

      if (response.ok) {
        const records = await response.json();
        
        // 过滤指定日期的记录
        const dateToFilter = targetDate || new Date();
        const dateStr = dateToFilter.toISOString().split('T')[0];
        
        const filteredRecords = records.filter((record: any) => {
          const recordDate = new Date(record.created_at).toISOString().split('T')[0];
          return recordDate === dateStr;
        });

        setTodayRecords(filteredRecords);

        // 计算指定日期数据
        const totalCalories = filteredRecords.reduce((sum: number, record: any) => {
          try {
            const analysisResult = JSON.parse(record.analysis_result);
            return sum + (analysisResult.calories || 0);
          } catch {
            return sum;
          }
        }, 0);

        // 获取最新的饮食目标
        const currentTarget = getDietGoal();
        const actualPercentage = Math.round((totalCalories / currentTarget) * 100);
        const displayPercentage = Math.min(actualPercentage, 100); // 进度条最大显示100%
        
        setTodayData(prev => ({
          ...prev,
          consumed: totalCalories,
          target: currentTarget,
          percentage: displayPercentage,
          actualPercentage: actualPercentage, // 实际百分比，可以超过100%
          meals: filteredRecords.length
        }));
      }
    } catch (error) {
      console.error('获取记录失败:', error);
    }
  };

  const handleEstimationClick = (estimationBasis: string) => {
    setCurrentEstimationBasis(estimationBasis);
    setEstimationModalVisible(true);
  };

  const handleEdit = (record: any) => {
    let analysisResult;
    try {
      analysisResult = JSON.parse(record.analysis_result);
    } catch {
      analysisResult = { food_name: '未知食物', calories: 0 };
    }
    
    setEditingRecord(record);
    form.setFieldsValue({
      food_name: analysisResult.food_name || '',
      calories: analysisResult.calories || 0
    });
    setEditModalVisible(true);
  };

  const handleDelete = async (record: any) => {
    let analysisResult;
    try {
      analysisResult = JSON.parse(record.analysis_result);
    } catch {
      analysisResult = { food_name: '未知食物', calories: 0 };
    }

    const recordDate = new Date(record.created_at);
    const timeStr = recordDate.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });

    Modal.confirm({
      title: null, // 移除默认标题，我们会在content中自定义
      icon: null, // 移除默认图标
      content: (
        <div style={{
          padding: '0',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(255, 77, 79, 0.15)',
          border: '1px solid rgba(255, 77, 79, 0.1)'
        }}>
          {/* 头部区域 */}
          <div style={{
            background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 50%, #ffa39e 100%)',
            padding: '24px 20px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* 背景装饰 */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              filter: 'blur(20px)'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-30%',
              left: '-15%',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              filter: 'blur(15px)'
            }} />

            {/* 标题和图标 */}
            <div style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 24px rgba(255, 77, 79, 0.3)'
              }}>
                <span style={{ fontSize: '28px' }}>🗑️</span>
              </div>
              <div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '4px',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}>
                  删除饮食记录
                </div>
                <div style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: '400'
                }}>
                  此操作不可撤销
                </div>
              </div>
            </div>
          </div>

          {/* 内容区域 */}
          <div style={{
            background: 'white',
            padding: '24px 20px'
          }}>
            {/* 记录信息卡片 */}
            <div style={{
              background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
              border: '1px solid #f0f0f0',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* 装饰性背景 */}
              <div style={{
                position: 'absolute',
                top: '0',
                right: '0',
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, rgba(255, 77, 79, 0.05) 0%, rgba(255, 120, 117, 0.03) 100%)',
                borderRadius: '0 16px 0 60px',
                clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)'
              }} />

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '16px',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(255, 77, 79, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <span style={{ fontSize: '20px' }}>🍽️</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#262626',
                    marginBottom: '4px',
                    lineHeight: '1.2'
                  }}>
                    {analysisResult.food_name || '未知食物'}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#8c8c8c',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>🕐</span>
                    {timeStr} 记录
                  </div>
                </div>
              </div>

              {/* 热量信息 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'white',
                borderRadius: '10px',
                border: '1px solid rgba(255, 77, 79, 0.1)',
                boxShadow: '0 2px 8px rgba(255, 77, 79, 0.08)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '16px' }}>🔥</span>
                  <span style={{
                    fontSize: '14px',
                    color: '#595959',
                    fontWeight: '500'
                  }}>
                    热量值
                  </span>
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#ff4d4f',
                  textShadow: '0 1px 2px rgba(255, 77, 79, 0.2)'
                }}>
                  {analysisResult.calories || 0} kcal
                </div>
              </div>
            </div>

            {/* 警告提示 */}
            <div style={{
              background: 'linear-gradient(135deg, #fff2f0 0%, #ffebe9 100%)',
              border: '1px solid #ffccc7',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              boxShadow: 'inset 0 1px 3px rgba(255, 77, 79, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>⚠️</span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#d4380d'
                }}>
                  重要提醒
                </span>
              </div>
              <div style={{
                fontSize: '13px',
                color: '#d4380d',
                lineHeight: '1.5',
                fontWeight: '500'
              }}>
                删除后将无法恢复此记录，请确认是否继续
              </div>
            </div>
          </div>
        </div>
      ),
      okText: (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontWeight: '600',
          fontSize: '14px',
          color: 'white' // 改为白色文字
        }}>
          <span>🗑️</span>
          <span>确认删除</span>
        </div>
      ),
      cancelText: (
        <span style={{
          fontWeight: '500',
          fontSize: '14px'
        }}>
          取消
        </span>
      ),
      okType: 'danger',
      width: 380,
      centered: true,
      modalRender: (modal) => modal, // 自定义渲染
      okButtonProps: {
        style: {
          background: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
          border: 'none',
          borderRadius: '10px',
          fontWeight: '600',
          height: '40px',
          boxShadow: '0 4px 12px rgba(255, 77, 79, 0.3)',
          transition: 'all 0.3s ease'
        },
        onMouseEnter: (e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 77, 79, 0.4)';
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 77, 79, 0.3)';
        }
      },
      cancelButtonProps: {
        style: {
          borderRadius: '10px',
          height: '40px',
          fontWeight: '500',
          border: '1px solid #d9d9d9',
          transition: 'all 0.3s ease'
        },
        onMouseEnter: (e) => {
          e.currentTarget.style.borderColor = '#1890ff';
          e.currentTarget.style.color = '#1890ff';
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.borderColor = '#d9d9d9';
          e.currentTarget.style.color = 'rgba(0, 0, 0, 0.85)';
        }
      },
      onOk: async () => {
        try {
          const userId = await getUserId();
          if (!userId) {
            message.error('用户未登录');
            return;
          }

          const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}`;
      const sessionId = getSessionId();
      const headers: HeadersInit = {};
      if (sessionId) {
        headers['X-Session-ID'] = sessionId;
      }
      const response = await fetch(`${apiUrl}/api/v1/records/${userId}/${record.id}`, {
        method: 'DELETE',
        headers: headers,
      });          if (response.ok) {
            message.success({
              content: (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  <span>🗑️</span>
                  <span>记录删除成功</span>
                </div>
              ),
              duration: 2,
              style: {
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }
            });
            // 重新获取今日记录
            await fetchTodayRecords(userId);
          } else {
            const errorData = await response.json();
            message.error({
              content: `删除失败: ${errorData.detail || '未知错误'}`,
              style: {
                borderRadius: '8px'
              }
            });
          }
        } catch (error) {
          console.error('删除记录失败:', error);
          message.error({
            content: '删除失败，请稍后重试',
            style: {
              borderRadius: '8px'
            }
          });
        }
      }
    });
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      const userId = await getUserId();
      
      if (!userId || !editingRecord) {
        message.error('用户信息或记录信息缺失');
        return;
      }

      // 由于后端没有提供更新API，我们通过删除旧记录并添加新记录的方式来实现更新
      // 构造新的 analysis_result
      const newAnalysisResult = {
        ...JSON.parse(editingRecord.analysis_result),
        food_name: values.food_name,
        calories: values.calories
      };

      const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}`;

      // 先删除旧记录
      const sessionId = getSessionId();
      const headers: HeadersInit = {};
      if (sessionId) {
        headers['X-Session-ID'] = sessionId;
      }
      const deleteResponse = await fetch(`${apiUrl}/api/v1/records/${userId}/${editingRecord.id}`, {
        method: 'DELETE',
        headers: headers,
      });

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        message.error(`删除旧记录失败: ${errorData.detail || '未知错误'}`);
        return;
      }

      // 然后添加新记录
      const sessionId2 = getSessionId();
      const headers2: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (sessionId2) {
        headers2['X-Session-ID'] = sessionId2;
      }
      const addResponse = await fetch(`${apiUrl}/api/v1/food_estimate/save_record`, {
        method: 'POST',
        headers: headers2,
        body: JSON.stringify({
          analysis_result: newAnalysisResult,
          analysis_method: editingRecord.analysis_method || 'pure_llm',
          image_url: editingRecord.image_url || ''
        })
      });

      if (addResponse.ok) {
        message.success('记录更新成功');
        setEditModalVisible(false);
        setEditingRecord(null);
        form.resetFields();
        
        // 重新获取今日记录
        await fetchTodayRecords(userId);
      } else {
        const errorData = await addResponse.json();
        message.error(`添加新记录失败: ${errorData.message || '未知错误'}`);
      }
    } catch (error) {
      console.error('更新记录失败:', error);
      message.error('更新失败，请稍后重试');
    }
  };

  if (isLoading) {
    return (
      <ResponsiveLayout>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}>
          <Spin size="large" />
        </div>
      </ResponsiveLayout>
    );
  }

  if (!isLoggedIn) {
    return (
      <ResponsiveLayout>
        <div style={{
          background: 'linear-gradient(180deg, #f0f9ff 0%, #f5f5f5 100%)',
          padding: '0',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Card style={{
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            textAlign: 'center',
            padding: '40px 20px'
          }}>
            <Title level={2} style={{ color: '#722ed1', marginBottom: '16px' }}>
              未登录
            </Title>
            <Text style={{ fontSize: '16px', color: '#8c8c8c', marginBottom: '24px', display: 'block' }}>
              请先登录以查看您的饮食记录
            </Text>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/app/config')}
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #722ed1, #9254de)',
                border: 'none',
                whiteSpace: 'normal',
                lineHeight: '1.4',
                padding: '12px 16px',
                height: 'auto',
                width: '100%'
              }}
            >
              前往登录
            </Button>
          </Card>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
    <div style={{
      background: 'linear-gradient(180deg, #f0f9ff 0%, #f5f5f5 100%)',
      padding: '0',
      minHeight: '100vh'
    }}>
      {/* 顶部标题栏 */}
      <PageHeader
        title="📈 状态管理"
        description="跟踪您的饮食记录和健康目标"
        background="linear-gradient(135deg, #722ed1 0%, #9254de 100%)"
        titleSize={24}
        descSize={14}
        padding="24px 20px"
      />

      <div style={{ padding: '0 16px 20px 16px' }}>
        {/* 日期选择器 */}
        <div style={{ 
          marginBottom: '20px'
        }}>
          <DatePicker
            value={selectedDate}
            onChange={(date) => {
              if (date) {
                setSelectedDate(date);
                // 重新获取选中日期的记录
                const newDate = date.toDate();
                getUserId().then(userId => {
                  if (userId) {
                    fetchTodayRecords(userId, newDate);
                  }
                });
              }
            }}
            format="YYYY-MM-DD"
            placeholder="选择日期"
            style={{
              width: '100%',
              height: '44px',
              borderRadius: '12px',
              fontSize: '14px',
              background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              textAlign: 'center'
            }}
            suffixIcon={<CalendarOutlined style={{ color: '#722ed1', fontSize: '18px' }} />}
          />
        </div>

        {/* 摄入记录卡片 */}
        <Card style={{
          marginBottom: '20px',
          background: 'white',
          border: 'none',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden'
        }}
        styles={{ body: { padding: '16px' } }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '12px' 
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #722ed115, #9254de08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CalendarOutlined style={{ fontSize: '16px', color: '#722ed1' }} />
            </div>
            <Title level={4} style={{ 
              color: '#262626', 
              margin: 0,
              fontSize: '16px',
              fontWeight: '600'
            }}>
              摄入情况
            </Title>
          </div>

          {/* 简化的热量信息 */}
          <div style={{
            background: 'linear-gradient(135deg, #722ed108, #9254de05)',
            borderRadius: '12px',
            padding: '12px'
          }}>
            {/* <div style={{ marginBottom: '8px' }}>
              <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>热量摄入</Text>
            </div> */}
            
            <Progress 
              percent={todayData.percentage} 
              strokeColor={
                todayData.actualPercentage > 100 
                  ? {
                      '0%': '#ff4d4f',
                      '100%': '#ff7875',
                    }
                  : {
                      '0%': '#722ed1',
                      '100%': '#9254de',
                    }
              }
              trailColor="#f0f0f0"
              size={{ height: 10 }}
              showInfo={true}
              format={() => {
                const displayValue = todayData.actualPercentage;
                return (
                  <span style={{ color: displayValue > 100 ? '#ff4d4f' : '#722ed1' }}>
                    {displayValue}%
                  </span>
                );
              }}
              style={{ marginBottom: '12px' }}
            />

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: '13px', color: '#595959' }}>
                已摄入: <Text strong style={{ color: '#722ed1' }}>{todayData.consumed}</Text> kcal
              </Text>
              <Text style={{ fontSize: '13px', color: '#595959' }}>
                剩余: <Text strong style={{ color: '#ff9800' }}>{Math.max(0, todayData.target - todayData.consumed)}</Text> kcal
              </Text>
              <Text style={{ fontSize: '13px', color: '#595959' }}>
                目标: <Text strong style={{ color: '#52c41a' }}>{todayData.target}</Text> kcal
              </Text>
            </div>
          </div>
        </Card>

        {/* 饮食记录列表 */}
        <Card 
          title={
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              width: '100%'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px'
              }}>
                <span style={{ fontSize: '18px' }}>📝</span>
                <Text strong style={{ fontSize: '16px' }}>饮食记录</Text>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="small"
                onClick={() => navigate('/app/analyse')}
                style={{
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #722ed1, #9254de)',
                  border: 'none',
                  fontSize: '12px',
                  height: '28px',
                  padding: '0 12px'
                }}
              >
                添加
              </Button>
            </div>
          }
          style={{ 
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
          }}
          styles={{ body: { padding: '12px' } }}
        >
          <List
            dataSource={todayRecords}
            renderItem={(record, index) => {
              let analysisResult;
              try {
                analysisResult = JSON.parse(record.analysis_result);
              } catch {
                analysisResult = { food_name: '未知食物', calories: 0 };
              }

              const recordDate = new Date(record.created_at);
              const timeStr = recordDate.toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              });
              
              const statusColor = analysisResult.calories < 800 ? '#52c41a' : '#faad14';
              
              return (
                <div
                  style={{
                    marginBottom: index < todayRecords.length - 1 ? '12px' : 0,
                    borderRadius: '16px',
                    background: 'white',
                    border: '1px solid #f0f0f0',
                    padding: '16px',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <Avatar 
                      style={{ 
                        backgroundColor: `${statusColor}15`,
                        color: statusColor,
                        fontWeight: '600',
                        border: `2px solid ${statusColor}30`,
                        flexShrink: 0
                      }}
                      size={48}
                    >
                      {timeStr}
                    </Avatar>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <Text strong style={{ fontSize: '15px', color: '#262626' }}>
                          {timeStr} 记录
                        </Text>
                        <div style={{
                          background: `${statusColor}10`,
                          padding: '4px 12px',
                          borderRadius: '12px',
                          border: `1px solid ${statusColor}30`
                        }}>
                          <Text strong style={{ fontSize: '14px', color: statusColor }}>
                            {analysisResult.calories || 0} kcal
                          </Text>
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '12px' }}>
                        <div 
                          style={{ 
                            fontSize: '13px', 
                            color: '#595959',
                            lineHeight: '1.8',
                            paddingLeft: '8px',
                            borderLeft: '2px solid #f0f0f0',
                            marginBottom: '4px'
                          }}
                        >
                          {analysisResult.food_name || '未知食物'} ({analysisResult.calories || 0} kcal)
                        </div>
                        {analysisResult.estimation_basis && (
                          <div 
                            style={{ 
                              fontSize: '12px', 
                              color: '#1890ff',
                              lineHeight: '1.5',
                              paddingLeft: '8px',
                              borderLeft: '2px solid #f0f0f0',
                              marginTop: '4px',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              textDecorationStyle: 'dotted'
                            }}
                            onClick={() => handleEstimationClick(analysisResult.estimation_basis)}
                          >
                            📋 点击查看估算依据
                          </div>
                        )}
                      </div>

                      <div style={{ 
                        display: 'flex', 
                        gap: '8px',
                        justifyContent: 'flex-end'
                      }}>
                        <Button 
                          type="text" 
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(record)}
                          style={{ 
                            color: '#1890ff',
                            fontSize: '12px'
                          }}
                        >
                          编辑
                        </Button>
                        <Button 
                          type="text" 
                          size="small"
                          danger 
                          icon={<DeleteOutlined />}
                          onClick={() => handleDelete(record)}
                          style={{ fontSize: '12px' }}
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </Card>
      </div>

      {/* 编辑记录弹窗 */}
      <Modal
        title={
          <div style={{
            textAlign: 'center',
            fontSize: '16px',
            fontWeight: '600',
            color: '#1890ff',
            marginBottom: '8px'
          }}>
            ✏️ 编辑记录信息
          </div>
        }
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingRecord(null);
          form.resetFields();
        }}
        okText="保存修改"
        cancelText="取消"
        width={350}
        centered
        okButtonProps={{
          style: {
            background: 'linear-gradient(135deg, #1890ff, #40a9ff)',
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
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)',
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
          border: '1px solid rgba(24, 144, 255, 0.2)',
          boxShadow: '0 4px 12px rgba(24, 144, 255, 0.1)'
        }}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              food_name: '',
              calories: 0
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
                  upIcon: <span style={{ color: '#1890ff', fontSize: '12px' }}>▲</span>,
                  downIcon: <span style={{ color: '#1890ff', fontSize: '12px' }}>▼</span>
                }}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* 估算依据弹窗 */}
      <Modal
        title={
          <div style={{
            textAlign: 'center',
            fontSize: '16px',
            fontWeight: '600',
            color: '#1890ff',
            marginBottom: '8px'
          }}>
            📋 估算依据详情
          </div>
        }
        open={estimationModalVisible}
        onCancel={() => {
          setEstimationModalVisible(false);
          setCurrentEstimationBasis('');
        }}
        footer={null}
        width={400}
        centered
        styles={{
          body: {
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)',
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
          border: '1px solid rgba(24, 144, 255, 0.2)',
          boxShadow: '0 4px 12px rgba(24, 144, 255, 0.1)'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#262626',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {currentEstimationBasis}
          </div>
        </div>
      </Modal>
    </div>
    </ResponsiveLayout>
  );
}