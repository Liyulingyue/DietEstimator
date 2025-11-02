import { useNavigate } from 'react-router-dom'
import { Button } from 'antd'
import { PictureOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import './AppGallery.css'

function AppGallery() {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/app/home')
  }

  return (
    <div className="app-gallery-container">
      <div className="app-gallery-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          className="back-button"
        >
          返回
        </Button>
        <h1 className="app-gallery-title">🖼️ 画廊</h1>
      </div>
      <div className="app-gallery-content">
        <div className="gallery-placeholder">
          <PictureOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.5)' }} />
          <h2>画廊功能</h2>
          <p>这里将展示用户上传的食物图片和分析结果</p>
          <p>敬请期待完整实现</p>
        </div>
        {/* TODO: 实现画廊网格布局，显示图片和分析结果 */}
      </div>
    </div>
  )
}

export default AppGallery