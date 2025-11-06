import { useNavigate } from 'react-router-dom'
import { Button, Card, Typography, Empty, Image, Tag, Avatar, Space } from 'antd'
import { 
  PictureOutlined, 
  FireOutlined, 
  ClockCircleOutlined, 
  UserOutlined,
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
  PlusOutlined
} from '@ant-design/icons'
import ResponsiveLayout from '../components/ResponsiveLayout'
import PageHeader from '../components/PageHeader'
import { useState } from 'react'

const { Text } = Typography;

function AppGallery() {
  const navigate = useNavigate();
  
  // 模拟公共画廊数据（用户分享的餐食）
  const [galleryItems, setGalleryItems] = useState([
    {
      id: 1,
      imageUrl: 'https://via.placeholder.com/400x300/52c41a/ffffff?text=健康早餐',
      foodName: '营养早餐套餐',
      calories: 520,
      protein: 25,
      carbs: 60,
      fat: 15,
      date: '2小时前',
      userName: '健康生活小达人',
      userAvatar: '',
      likes: 128,
      shares: 32,
      isLiked: false,
      tags: ['健康', '早餐', '高蛋白'],
      estimationBasis: '食物包含：燕麦粥（200g）、煮鸡蛋（2个）、全麦面包（2片）、牛奶（250ml）'
    },
    {
      id: 2,
      imageUrl: 'https://via.placeholder.com/400x300/1890ff/ffffff?text=减脂沙拉',
      foodName: '鸡胸肉蔬菜沙拉',
      calories: 380,
      protein: 35,
      carbs: 25,
      fat: 12,
      date: '5小时前',
      userName: '减脂达人',
      userAvatar: '',
      likes: 256,
      shares: 89,
      isLiked: true,
      tags: ['减脂', '沙拉', '低卡'],
      estimationBasis: '食物包含：烤鸡胸肉（150g）、生菜（100g）、番茄（50g）、黄瓜（50g）、橄榄油（10ml）'
    },
    {
      id: 3,
      imageUrl: 'https://via.placeholder.com/400x300/722ed1/ffffff?text=健身餐',
      foodName: '增肌健身餐',
      calories: 680,
      protein: 55,
      carbs: 75,
      fat: 18,
      date: '1天前',
      userName: '健身教练小李',
      userAvatar: '',
      likes: 432,
      shares: 156,
      isLiked: false,
      tags: ['增肌', '健身餐', '高蛋白'],
      estimationBasis: '食物包含：糙米饭（200g）、牛排（180g）、西兰花（150g）、胡萝卜（100g）'
    },
    {
      id: 4,
      imageUrl: 'https://via.placeholder.com/400x300/eb2f96/ffffff?text=轻食午餐',
      foodName: '轻食午餐便当',
      calories: 450,
      protein: 28,
      carbs: 48,
      fat: 14,
      date: '1天前',
      userName: '轻食爱好者',
      userAvatar: '',
      likes: 198,
      shares: 45,
      isLiked: true,
      tags: ['轻食', '午餐', '便当'],
      estimationBasis: '食物包含：藜麦饭（150g）、三文鱼（120g）、牛油果（半个）、混合蔬菜（100g）'
    },
  ]);

  const handleLike = (id: number) => {
    setGalleryItems(items =>
      items.map(item =>
        item.id === id
          ? {
              ...item,
              isLiked: !item.isLiked,
              likes: item.isLiked ? item.likes - 1 : item.likes + 1
            }
          : item
      )
    );
  };

  const handleShare = (item: typeof galleryItems[0]) => {
    // 未来实现分享功能
    console.log('分享:', item);
  };

  return (
    <ResponsiveLayout>
    <div style={{
      background: 'linear-gradient(180deg, #fff0f6 0%, #f5f5f5 100%)',
      padding: '0',
      minHeight: '100vh'
    }}>
      {/* 顶部标题栏 */}
      <PageHeader
        title={<><PictureOutlined style={{ marginRight: '8px' }} />公共画廊</>}
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
          分享我的餐食
        </Button>

        {galleryItems.length === 0 ? (
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
                立即分享
              </Button>
            </Empty>
          </Card>
        ) : (
          <>
            {/* 卡片列表 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {galleryItems.map(item => (
                <Card
                  key={item.id}
                  style={{
                    borderRadius: '20px',
                    border: 'none',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                    overflow: 'hidden'
                  }}
                  styles={{ body: { padding: '16px' } }}
                >
                  {/* 用户信息 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <Avatar
                      size={40}
                      icon={<UserOutlined />}
                      src={item.userAvatar}
                      style={{ background: '#eb2f96' }}
                    />
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: '14px', display: 'block', color: '#262626' }}>
                        {item.userName}
                      </Text>
                      <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                        <ClockCircleOutlined style={{ marginRight: '4px' }} />
                        {item.date}
                      </Text>
                    </div>
                  </div>

                  {/* 食物图片 */}
                  <div style={{
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    marginBottom: '12px'
                  }}>
                    <Image
                      alt={item.foodName}
                      src={item.imageUrl}
                      style={{
                        width: '100%',
                        height: '240px',
                        objectFit: 'cover'
                      }}
                      preview={{
                        mask: <div style={{ fontSize: '14px' }}>查看详情</div>
                      }}
                    />
                    {/* 热量标签 */}
                    <div style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'rgba(0, 0, 0, 0.7)',
                      backdropFilter: 'blur(8px)',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <FireOutlined style={{ color: '#ff4d4f' }} />
                      {item.calories} kcal
                    </div>
                  </div>

                  {/* 食物名称 */}
                  <Text strong style={{
                    fontSize: '16px',
                    display: 'block',
                    marginBottom: '8px',
                    color: '#262626'
                  }}>
                    {item.foodName}
                  </Text>

                  {/* 营养信息 */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    marginBottom: '12px',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
                    borderRadius: '10px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <Text style={{ fontSize: '16px', fontWeight: '700', color: '#1890ff', display: 'block' }}>
                        {item.protein}g
                      </Text>
                      <Text style={{ fontSize: '11px', color: '#8c8c8c' }}>蛋白质</Text>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Text style={{ fontSize: '16px', fontWeight: '700', color: '#52c41a', display: 'block' }}>
                        {item.carbs}g
                      </Text>
                      <Text style={{ fontSize: '11px', color: '#8c8c8c' }}>碳水</Text>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Text style={{ fontSize: '16px', fontWeight: '700', color: '#faad14', display: 'block' }}>
                        {item.fat}g
                      </Text>
                      <Text style={{ fontSize: '11px', color: '#8c8c8c' }}>脂肪</Text>
                    </div>
                  </div>

                  {/* 标签 */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {item.tags.map((tag, index) => (
                      <Tag
                        key={index}
                        color="magenta"
                        style={{
                          margin: 0,
                          fontSize: '12px',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          border: 'none'
                        }}
                      >
                        {tag}
                      </Tag>
                    ))}
                  </div>

                  {/* 互动按钮 */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '12px',
                    borderTop: '1px solid #f0f0f0'
                  }}>
                    <Space size="large">
                      <Button
                        type="text"
                        icon={item.isLiked ? <HeartFilled style={{ color: '#eb2f96' }} /> : <HeartOutlined />}
                        onClick={() => handleLike(item.id)}
                        style={{
                          padding: '4px 8px',
                          height: 'auto',
                          color: item.isLiked ? '#eb2f96' : '#595959'
                        }}
                      >
                        {item.likes}
                      </Button>
                      <Button
                        type="text"
                        icon={<ShareAltOutlined />}
                        onClick={() => handleShare(item)}
                        style={{
                          padding: '4px 8px',
                          height: 'auto',
                          color: '#595959'
                        }}
                      >
                        {item.shares}
                      </Button>
                    </Space>
                    <Button
                      type="link"
                      style={{
                        fontSize: '12px',
                        color: '#1890ff'
                      }}
                    >
                      查看详情
                    </Button>
                  </div>
                </Card>
              ))}
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
                已显示全部 {galleryItems.length} 条分享
              </Text>
            </div>
          </>
        )}
      </div>
    </div>
    </ResponsiveLayout>
  )
}

export default AppGallery