import { useNavigate } from 'react-router-dom'
import { Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import './AppConfig.css'

function AppConfig() {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/app/home')
  }

  return (
    <div className="app-config-container">
      <div className="app-config-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          className="back-button"
        >
          返回
        </Button>
        <h1 className="app-config-title">⚙️ 配置管理</h1>
      </div>
      <div className="app-config-content">
        <div className="config-section">
          <h2>AI 配置</h2>
          <p>这里将包含AI模型配置选项</p>
          {/* TODO: 实现配置表单 */}
        </div>
        <div className="config-section">
          <h2>用户设置</h2>
          <p>这里将包含用户偏好设置</p>
          {/* TODO: 实现用户设置 */}
        </div>
      </div>
    </div>
  )
}

export default AppConfig