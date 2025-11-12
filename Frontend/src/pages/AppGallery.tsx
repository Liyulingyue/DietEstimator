import { Button, Card, Typography, Empty, Image, Tag, Avatar, Space, Modal, message, Spin, Row, Col } from 'antd'
import { 
  PictureOutlined, 
  FireOutlined, 
  ClockCircleOutlined, 
  UserOutlined,
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
  PlusOutlined,
  LoadingOutlined,
  EyeOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import ResponsiveLayout from '../components/ResponsiveLayout'
import PageHeader from '../components/PageHeader'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGalleryShares, deleteGalleryShare } from '../utils/api'
import type { GalleryShare } from '../utils/api'

const { Text } = Typography;

function AppGallery() {
  const navigate = useNavigate();
  const [galleryShares, setGalleryShares] = useState<GalleryShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedShare, setSelectedShare] = useState<GalleryShare | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // 获取画廊数据
  const fetchGalleryShares = async () => {
    try {
      setLoading(true);
      const response = await getGalleryShares(0, 50); // 获取前50条分享
      setGalleryShares(response.shares);
    } catch (error) {
      console.error('获取画廊数据失败:', error);
      message.error('获取画廊数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchGalleryShares();
  }, []);

  // 将后端数据转换为前端显示格式
  const formatGalleryItem = (share: GalleryShare) => {
    try {
      const analysisData = JSON.parse(share.analysis_result);
      
      // 直接使用后端分析返回的数据结构
      const foodName = analysisData.food_name || '未知食物';
      let calories = analysisData.calories || 0;
      const reason = analysisData.reason || '';
      
      // 解析卡路里数值
      if (typeof analysisData.calories === 'string') {
        const match = analysisData.calories.match(/(\d+)/);
        calories = match ? parseInt(match[1], 10) : calories;
      } else if (typeof analysisData.calories === 'number') {
        calories = analysisData.calories;
      }
      
      return {
        id: share.id,
        imageUrl: share.image_base64,
        foodName: foodName,
        calories: calories,
        caloriesDisplay: analysisData.calories || '',
        protein: analysisData.protein || 0,
        carbs: analysisData.carbs || 0,
        fat: analysisData.fat || 0,
        reason: reason,
        date: new Date(share.created_at).toLocaleString('zh-CN', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        userName: share.user_name ? share.user_name : '匿名用户',
        userAvatar: '',
        likes: 0, // 暂时不支持点赞功能
        shares: 0, // 暂时不支持分享计数
        isLiked: false,
        tags: analysisData.tags || ['健康饮食'],
        estimationBasis: analysisData.estimation_basis || '基于AI分析估算',
        fullAnalysis: analysisData
      };
    } catch (error) {
      console.error('解析分析结果失败:', error);
      return {
        id: share.id,
        imageUrl: share.image_base64,
        foodName: '未知食物',
        calories: 0,
        caloriesDisplay: '0 kcal',
        protein: 0,
        carbs: 0,
        fat: 0,
        reason: '',
        date: new Date(share.created_at).toLocaleString('zh-CN'),
        userName: share.user_name ? share.user_name : '匿名用户',
        userAvatar: '',
        likes: 0,
        shares: 0,
        isLiked: false,
        tags: ['健康饮食'],
        estimationBasis: '基于AI分析估算',
        fullAnalysis: null
      };
    }
  };
  
  const handleImageClick = (share: GalleryShare) => {
    setSelectedShare(share);
    setDetailModalVisible(true);
  };

  const handleCloseDetail = () => {
    setDetailModalVisible(false);
    setSelectedShare(null);
  };

  // 处理删除分享
  const handleDeleteShare = async (shareId: number, shareName: string) => {
    Modal.confirm({
      title: null,
      icon: null,
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
                  删除画廊分享
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
            {/* 分享信息卡片 */}
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
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(235, 47, 150, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <span style={{ fontSize: '20px' }}>🍽️</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#262626',
                    lineHeight: '1.2'
                  }}>
                    {shareName}
                  </div>
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
                删除后将无法恢复此分享，请确认是否继续
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
          color: 'white'
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
      okButtonProps: {
        style: {
          background: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
          border: 'none',
          borderRadius: '10px',
          fontWeight: '600',
          height: '40px',
          boxShadow: '0 4px 12px rgba(255, 77, 79, 0.3)',
          transition: 'all 0.3s ease'
        }
      },
      cancelButtonProps: {
        style: {
          borderRadius: '10px',
          height: '40px',
          fontWeight: '500',
          border: '1px solid #d9d9d9',
          transition: 'all 0.3s ease'
        }
      },
      onOk: async () => {
        try {
          setDeleting(true);
          const result = await deleteGalleryShare(shareId);
          
          if (result.success) {
            message.success('分享已删除');
            setDetailModalVisible(false);
            setSelectedShare(null);
            // 重新获取画廊数据
            fetchGalleryShares();
          } else {
            message.error(result.message || '删除失败');
          }
        } catch (error) {
          console.error('删除分享失败:', error);
          message.error('删除过程中发生错误');
        } finally {
          setDeleting(false);
        }
      }
    });
  };

  return (
    <ResponsiveLayout>
    <div style={{
      background: 'linear-gradient(180deg, #fff0f6 0%, #f5f5f5 100%)',
      padding: '0',
      minHeight: '100vh'
    }}>
      {/* 添加CSS样式 */}
      <style>
        {`
          .image-overlay:hover {
            opacity: 1 !important;
          }
        `}
      </style>
      {/* 顶部标题栏 */}
      <PageHeader
        title={<><PictureOutlined style={{ marginRight: '8px' }} />画廊</>}
        description="发现和分享健康美食，交流饮食心得"
        background="linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)"
        titleSize={24}
        descSize={14}
        padding="24px 20px"
      />

      <div style={{ padding: '0 16px 20px 16px' }}>
        {/* 分享按钮 */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          block
          onClick={() => navigate('/app/analyse')}
          style={{
            marginBottom: '20px',
            height: '52px',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #eb2f96, #f759ab)',
            border: 'none',
            boxShadow: '0 4px 16px rgba(235, 47, 150, 0.3)'
          }}
        >
          分析并分享我的餐食
        </Button>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px', color: '#8c8c8c' }}>加载中...</div>
          </div>
        ) : galleryShares.length === 0 ? (
          <Card
            style={{
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              marginTop: '40px'
            }}
            styles={{ body: { padding: '60px 24px' } }}
          >
            <Empty
              image={<PictureOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
              description={
                <div>
                  <Text style={{ fontSize: '16px', color: '#595959', display: 'block', marginBottom: '8px' }}>
                    暂无分享内容
                  </Text>
                  <Text style={{ fontSize: '14px', color: '#bfbfbf' }}>
                    成为第一个分享健康美食的用户
                  </Text>
                </div>
              }
            >
              <Button
                type="primary"
                onClick={() => navigate('/app/analyse')}
                style={{
                  marginTop: '16px',
                  borderRadius: '12px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #eb2f96, #f759ab)',
                  border: 'none'
                }}
              >
                立即分析并分享
              </Button>
            </Empty>
          </Card>
        ) : (
          <>
            {/* 图片网格 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px',
              padding: '0 4px'
            }}>
              {galleryShares.map(share => {
                const item = formatGalleryItem(share);
                return (
                  <Card
                    key={item.id}
                    style={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    styles={{ body: { padding: '0' } }}
                    onClick={() => handleImageClick(share)}
                    hoverable
                  >
                    <div style={{ position: 'relative' }}>
                      <Image
                        alt={item.foodName}
                        src={item.imageUrl}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                        preview={false}
                      />
                      {/* 遮罩层 */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      }}
                      className="image-overlay">
                        <EyeOutlined style={{ fontSize: '24px', color: 'white' }} />
                      </div>
                      {/* 热量标签 */}
                      {item.calories > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'rgba(0, 0, 0, 0.7)',
                          backdropFilter: 'blur(8px)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}>
                          <FireOutlined style={{ color: '#ff4d4f' }} />
                          {item.calories} kcal
                        </div>
                      )}
                    </div>
                    {/* 食物名称和操作区域 */}
                    <div style={{ padding: '12px', position: 'relative' }}>
                      <Text strong style={{
                        fontSize: '14px',
                        display: 'block',
                        color: '#262626',
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.foodName}
                      </Text>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <Text style={{
                          fontSize: '12px',
                          color: '#8c8c8c'
                        }}>
                          <ClockCircleOutlined style={{ marginRight: '4px' }} />
                          {item.date}
                        </Text>
                        {/* 删除按钮 - 只有当前用户发布的分享才能删除 */}
                        {share.is_current_user && (
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                              e.stopPropagation(); // 阻止事件冒泡
                              const item = formatGalleryItem(share);
                              handleDeleteShare(share.id, item.foodName);
                            }}
                            loading={deleting}
                            style={{
                              color: '#ff4d4f',
                              fontSize: '12px',
                              padding: '4px 8px',
                              height: 'auto',
                              borderRadius: '6px',
                              fontWeight: '500',
                              transition: 'all 0.3s ease',
                              background: 'transparent',
                              border: '1px solid transparent'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 77, 79, 0.1)';
                              e.currentTarget.style.borderColor = '#ff4d4f';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.borderColor = 'transparent';
                            }}
                          >
                            删除
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* 加载更多提示 */}
            <div style={{
              textAlign: 'center',
              marginTop: '24px',
              padding: '20px',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
            }}>
              <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
                已显示全部 {galleryShares.length} 条分享
              </Text>
            </div>
          </>
        )}
      </div>

      {/* 详情模态框 */}
      <Modal
        title={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '18px',
            fontWeight: '600',
            color: '#eb2f96'
          }}>
            <PictureOutlined />
            餐食详情
          </div>
        }
        open={detailModalVisible}
        onCancel={handleCloseDetail}
        footer={null}
        width="90%"
        centered
        styles={{
          body: {
            padding: '24px',
            background: 'linear-gradient(135deg, #fff0f6 0%, #fef2f1 100%)'
          }
        }}
        style={{
          borderRadius: '20px',
          overflow: 'hidden',
          maxWidth: '800px'
        }}
      >
        {selectedShare && (() => {
          const item = formatGalleryItem(selectedShare);

          return (
            <div>
              {/* 大图显示 */}
              <div style={{
                textAlign: 'center',
                marginBottom: '24px',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
              }}>
                <Image
                  alt={item.foodName}
                  src={item.imageUrl}
                  style={{
                    width: '100%',
                    maxHeight: '400px',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  preview={false}
                />
              </div>

              {/* 基本信息 */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
              }}>
                <Text strong style={{
                  fontSize: '20px',
                  display: 'block',
                  marginBottom: '8px',
                  color: '#262626'
                }}>
                  {item.foodName}
                </Text>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <Avatar
                    size={32}
                    icon={<UserOutlined />}
                    src={item.userAvatar}
                    style={{ background: '#eb2f96' }}
                  />
                  <div>
                    <Text style={{ fontSize: '14px', color: '#262626', display: 'block' }}>
                      {item.userName}
                    </Text>
                    <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                      <ClockCircleOutlined style={{ marginRight: '4px' }} />
                      {item.date}
                    </Text>
                  </div>
                </div>

                {/* 热量显示 */}
                {item.calories > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #fff0f6, #fef2f1)',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <Text style={{
                        fontSize: '32px',
                        fontWeight: '700',
                        color: '#eb2f96',
                        display: 'block',
                        marginBottom: '4px'
                      }}>
                        {item.calories}
                      </Text>
                      <Text style={{ fontSize: '14px', color: '#8c8c8c' }}>
                        <FireOutlined style={{ marginRight: '4px', color: '#ff4d4f' }} />
                        千卡 (kcal)
                      </Text>
                    </div>
                  </div>
                )}
              </div>

              {/* 营养信息 */}
              {(item.protein > 0 || item.carbs > 0 || item.fat > 0) && (
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '16px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                }}>
                  <Text strong style={{
                    fontSize: '16px',
                    display: 'block',
                    marginBottom: '16px',
                    color: '#262626'
                  }}>
                    营养成分
                  </Text>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '16px'
                  }}>
                    {item.protein > 0 && (
                      <div style={{ textAlign: 'center', padding: '16px', background: '#f0f9ff', borderRadius: '12px' }}>
                        <Text style={{ fontSize: '24px', fontWeight: '700', color: '#1890ff', display: 'block' }}>
                          {item.protein}g
                        </Text>
                        <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>蛋白质</Text>
                      </div>
                    )}
                    {item.carbs > 0 && (
                      <div style={{ textAlign: 'center', padding: '16px', background: '#f6ffed', borderRadius: '12px' }}>
                        <Text style={{ fontSize: '24px', fontWeight: '700', color: '#52c41a', display: 'block' }}>
                          {item.carbs}g
                        </Text>
                        <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>碳水化合物</Text>
                      </div>
                    )}
                    {item.fat > 0 && (
                      <div style={{ textAlign: 'center', padding: '16px', background: '#fffbe6', borderRadius: '12px' }}>
                        <Text style={{ fontSize: '24px', fontWeight: '700', color: '#faad14', display: 'block' }}>
                          {item.fat}g
                        </Text>
                        <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>脂肪</Text>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AI分析结果 */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
              }}>
                <Text strong style={{
                  fontSize: '16px',
                  display: 'block',
                  marginBottom: '16px',
                  color: '#262626'
                }}>
                  🤖 AI分析结果
                </Text>
                
                {/* 原因 */}
                {item.reason && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      background: '#f9f9f9',
                      borderRadius: '12px',
                      padding: '16px',
                      fontSize: '14px',
                      color: '#595959',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {item.reason}
                    </div>
                  </div>
                )}
                
                {/* 其他分析信息 - 仅在没有原因时显示 */}
                {!item.reason && (
                  <div style={{
                    background: '#f9f9f9',
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '14px',
                    color: '#595959',
                    lineHeight: '1.6'
                  }}>
                    {item.estimationBasis && item.estimationBasis !== '基于AI分析估算' ? (
                      <div style={{ whiteSpace: 'pre-line' }}>
                        {item.estimationBasis}
                      </div>
                    ) : (
                      '暂无详细分析结果'
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
    </ResponsiveLayout>
  )
}

export default AppGallery