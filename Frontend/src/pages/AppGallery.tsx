import { useNavigate } from 'react-router-dom'
import { Button, Card, Typography, Empty, Image, Tag } from 'antd'
import { PictureOutlined, FireOutlined, ClockCircleOutlined } from '@ant-design/icons'
import ResponsiveLayout from '../components/ResponsiveLayout'
import PageHeader from '../components/PageHeader'
import { useState } from 'react'

const { Title, Text } = Typography;

function AppGallery() {
  const navigate = useNavigate();
  
  // 模拟画廊数据
  const [galleryItems] = useState([
    {
      id: 1,
      imageUrl: 'https://via.placeholder.com/300x300/52c41a/ffffff?text=食物1',
      title: '营养早餐',
      calories: 520,
      date: '2024-10-23',
      tags: ['健康', '早餐']
    },
    {
      id: 2,
      imageUrl: 'https://via.placeholder.com/300x300/1890ff/ffffff?text=食物2',
      title: '午餐便当',
      calories: 850,
      date: '2024-10-23',
      tags: ['午餐', '便当']
    },
    {
      id: 3,
      imageUrl: 'https://via.placeholder.com/300x300/722ed1/ffffff?text=食物3',
      title: '健康沙拉',
      calories: 380,
      date: '2024-10-22',
      tags: ['沙拉', '低卡']
    },
  ]);

  return (
    <ResponsiveLayout>
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #fff0f6 0%, #f5f5f5 100%)',
      padding: '0'
    }}>
      {/* 顶部标题栏 */}
      <PageHeader
        title={<><PictureOutlined style={{ marginRight: '8px' }} />图片画廊</>}
        description="查看您的食物记录和分析历史"
        background="linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)"
        titleSize={24}
        descSize={14}
        padding="24px 20px"
      />

      <div style={{ padding: '0 16px' }}>
        {galleryItems.length === 0 ? (
          <Card 
            style={{
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              marginTop: '40px'
            }}
            bodyStyle={{ padding: '60px 24px' }}
          >
            <Empty 
              image={<PictureOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
              description={
                <div>
                  <Text style={{ fontSize: '16px', color: '#595959', display: 'block', marginBottom: '8px' }}>
                    暂无图片记录
                  </Text>
                  <Text style={{ fontSize: '14px', color: '#bfbfbf' }}>
                    开始上传食物图片，记录您的饮食
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
                立即上传
              </Button>
            </Empty>
          </Card>
        ) : (
          <>
            {/* 统计信息 */}
            <Card 
              style={{
                borderRadius: '20px',
                border: 'none',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                marginBottom: '20px',
                background: 'linear-gradient(135deg, #fff 0%, #fff0f6 100%)'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '16px',
                textAlign: 'center'
              }}>
                <div>
                  <Text style={{ fontSize: '28px', fontWeight: '700', color: '#eb2f96', display: 'block' }}>
                    {galleryItems.length}
                  </Text>
                  <Text style={{ fontSize: '13px', color: '#8c8c8c' }}>总记录</Text>
                </div>
                <div>
                  <Text style={{ fontSize: '28px', fontWeight: '700', color: '#52c41a', display: 'block' }}>
                    {Math.round(galleryItems.reduce((sum, item) => sum + item.calories, 0) / galleryItems.length)}
                  </Text>
                  <Text style={{ fontSize: '13px', color: '#8c8c8c' }}>平均热量</Text>
                </div>
                <div>
                  <Text style={{ fontSize: '28px', fontWeight: '700', color: '#1890ff', display: 'block' }}>
                    7
                  </Text>
                  <Text style={{ fontSize: '13px', color: '#8c8c8c' }}>连续天数</Text>
                </div>
              </div>
            </Card>

            {/* 图片网格 */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '12px' 
            }}>
              {galleryItems.map(item => (
                <Card
                  key={item.id}
                  hoverable
                  style={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                    overflow: 'hidden'
                  }}
                  bodyStyle={{ padding: 0 }}
                  cover={
                    <div style={{ 
                      position: 'relative',
                      paddingTop: '100%',
                      background: '#f5f5f5'
                    }}>
                      <Image
                        alt={item.title}
                        src={item.imageUrl}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        preview={{
                          mask: <div style={{ fontSize: '14px' }}>查看</div>
                        }}
                      />
                      {/* 热量标签 */}
                      <div style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'rgba(0, 0, 0, 0.65)',
                        backdropFilter: 'blur(4px)',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <FireOutlined style={{ color: '#ff4d4f' }} />
                        {item.calories}
                      </div>
                    </div>
                  }
                >
                  <div style={{ padding: '12px' }}>
                    <Text strong style={{ 
                      fontSize: '14px', 
                      display: 'block',
                      marginBottom: '8px',
                      color: '#262626'
                    }}>
                      {item.title}
                    </Text>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '8px'
                    }}>
                      <ClockCircleOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                      <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                        {item.date}
                      </Text>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {item.tags.map((tag, index) => (
                        <Tag 
                          key={index}
                          color="magenta"
                          style={{ 
                            margin: 0,
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '6px'
                          }}
                        >
                          {tag}
                        </Tag>
                      ))}
                    </div>
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
                已显示全部 {galleryItems.length} 条记录
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