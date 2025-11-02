import { useNavigate } from 'react-router-dom'
import { Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import './AppIntroduction.css'

function AppIntroduction() {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/app/home')
  }

  return (
    <div className="app-intro-container">
      <div className="app-intro-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          className="back-button"
        >
          返回
        </Button>
        <h1 className="app-intro-title">📖 使用说明</h1>
      </div>
      <div className="app-intro-content">
        <div className="intro-section">
          <h2>欢迎使用饮食评估平台</h2>
          <p>基于大模型技术的智能饮食分析工具</p>
        </div>
        <div className="intro-section">
          <h3>主要功能</h3>
          <ul>
            <li>热量分析：上传食物图片，快速分析热量</li>
            <li>营养评估：提供详细的营养成分分析</li>
            <li>饮食记录：跟踪您的饮食习惯</li>
            <li>健康建议：基于分析结果提供个性化建议</li>
          </ul>
        </div>
        <div className="intro-section">
          <h3>使用步骤</h3>
          <ol>
            <li>注册登录账号</li>
            <li>上传食物图片</li>
            <li>等待AI分析结果</li>
            <li>查看详细报告</li>
          </ol>
        </div>
        {/* TODO: 添加更多详细说明 */}
      </div>
    </div>
  )
}

export default AppIntroduction