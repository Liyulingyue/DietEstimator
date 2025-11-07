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
  EyeOutlined
} from '@ant-design/icons'
import ResponsiveLayout from '../components/ResponsiveLayout'
import PageHeader from '../components/PageHeader'
import Gallery from '../components/Gallery'
import { useState, useEffect } from 'react'
import { getGalleryShares, shareToGallery } from '../utils/api'
import type { GalleryShare, ShareToGalleryRequest } from '../utils/api'

const { Text } = Typography;

function AppGallery() {
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [galleryShares, setGalleryShares] = useState<GalleryShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedShare, setSelectedShare] = useState<GalleryShare | null>(null);
  
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
      
      // 优先从 full_analysis 中提取数据
      const fullAnalysis = analysisData.full_analysis;
      let foodName = analysisData.food_name || '未知食物';
      let calories = analysisData.calories || 0;
      let caloriesDisplay = analysisData.calories_display || '';
      let estimationBasis = analysisData.estimation_basis || '基于AI分析估算';
      
      // 如果有 full_analysis，优先使用其中的数据
      if (fullAnalysis && fullAnalysis.result) {
        const result = fullAnalysis.result;
        foodName = result.food_name || foodName;
        caloriesDisplay = result.calories || caloriesDisplay;
        estimationBasis = result.estimation_basis || estimationBasis;
        
        // 重新解析卡路里数值
        if (typeof result.calories === 'string') {
          const match = result.calories.match(/(\d+)/);
          calories = match ? parseInt(match[1], 10) : calories;
        } else if (typeof result.calories === 'number') {
          calories = result.calories;
        }
      }
      
      return {
        id: share.id,
        imageUrl: share.image_base64,
        foodName: foodName,
        calories: calories,
        caloriesDisplay: caloriesDisplay,
        protein: analysisData.protein || 0,
        carbs: analysisData.carbs || 0,
        fat: analysisData.fat || 0,
        date: new Date(share.created_at).toLocaleString('zh-CN', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        userName: share.user_id ? `用户${share.user_id}` : '匿名用户',
        userAvatar: '',
        likes: 0, // 暂时不支持点赞功能
        shares: 0, // 暂时不支持分享计数
        isLiked: false,
        tags: analysisData.tags || ['健康饮食'],
        estimationBasis: estimationBasis,
        fullAnalysis: analysisData.full_analysis || null
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
        date: new Date(share.created_at).toLocaleString('zh-CN'),
        userName: share.user_id ? `用户${share.user_id}` : '匿名用户',
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

  // 处理分享完成
  const handleShareComplete = async (analysisResult: any, images?: string[]) => {
    try {
      setSharing(true);
      
      // 从Gallery组件的结果中提取数据
      const result = analysisResult.result || {};
      
      // 解析卡路里数值，从字符串中提取数字
      const parseCalories = (caloriesStr: any): number => {
        if (typeof caloriesStr === 'number') return caloriesStr;
        if (typeof caloriesStr === 'string') {
          // 提取数字，例如从"约1200大卡（估算值...）"中提取1200
          const match = caloriesStr.match(/(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        }
        return 0;
      };
      
      // 获取第一张图片的base64数据
      const imageBase64 = images && images.length > 0 ? images[0] : '';
      
      // 构建分享请求数据，确保传递完整的分析结果
      const shareData: ShareToGalleryRequest = {
        image_base64: imageBase64,
        analysis_result: JSON.stringify({
          food_name: result.food_name || '未知食物',
          calories: parseCalories(result.calories),
          protein: result.protein || 0,
          carbs: result.carbs || 0,
          fat: result.fat || 0,
          tags: result.tags || ['健康饮食'],
          estimation_basis: result.estimation_basis || '基于AI分析估算',
          // 保存原始的卡路里字符串用于显示
          calories_display: typeof result.calories === 'string' ? result.calories : '',
          // 保存完整的分析结果
          full_analysis: analysisResult
        })
      };

      console.log('分享数据:', shareData);
      
      const shareResponse = await shareToGallery(shareData);
      
      if (shareResponse.success) {
        message.success('分享成功！');
        setShareModalVisible(false);
        // 重新获取画廊数据
        fetchGalleryShares();
      } else {
        message.error(shareResponse.message || '分享失败');
      }
    } catch (error) {
      console.error('分享失败:', error);
      message.error('分享过程中发生错误');
    } finally {
      setSharing(false);
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
          onClick={() => setShareModalVisible(true)}
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
          分享我的餐食
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
                onClick={() => setShareModalVisible(true)}
                style={{
                  marginTop: '16px',
                  borderRadius: '12px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #eb2f96, #f759ab)',
                  border: 'none'
                }}
              >
                立即分享
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
                    {/* 食物名称 */}
                    <div style={{ padding: '12px' }}>
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
                      <Text style={{
                        fontSize: '12px',
                        color: '#8c8c8c',
                        display: 'block'
                      }}>
                        <ClockCircleOutlined style={{ marginRight: '4px' }} />
                        {item.date}
                      </Text>
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

      {/* 分享模态框 */}
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
            分享我的餐食
          </div>
        }
        open={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        footer={null}
        width="95%"
        centered
        styles={{
          body: {
            padding: '20px',
            background: 'linear-gradient(135deg, #fff0f6 0%, #fef2f1 100%)'
          }
        }}
        style={{
          borderRadius: '20px',
          overflow: 'hidden'
        }}
      >
        <Gallery
          onAnalysisComplete={handleShareComplete}
          onAnalysisStart={() => {
            console.log('画廊分享分析开始');
          }}
        />
      </Modal>

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
                      {item.caloriesDisplay && item.caloriesDisplay !== `${item.calories} kcal` && (
                        <Text style={{ 
                          fontSize: '12px', 
                          color: '#bfbfbf',
                          display: 'block',
                          marginTop: '4px'
                        }}>
                          {item.caloriesDisplay}
                        </Text>
                      )}
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
                  AI分析结果
                </Text>
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