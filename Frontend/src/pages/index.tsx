import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TabBar from '../components/TabBar';

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // 检测是否为移动设备
    const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      navigate('/app/home', { replace: true });
    }
  }, [navigate]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* 导航点 */}
      <div style={{
        position: 'fixed',
        right: 20,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 15,
        zIndex: 1000
      }}>
        <div
          onClick={() => scrollToSection('title')}
          style={{
            width: 12,
            height: 12,
            backgroundColor: '#1890ff',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#40a9ff'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1890ff'}
        ></div>
        <div
          onClick={() => scrollToSection('records')}
          style={{
            width: 12,
            height: 12,
            backgroundColor: '#1890ff',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#40a9ff'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1890ff'}
        ></div>
        <div
          onClick={() => scrollToSection('calories')}
          style={{
            width: 12,
            height: 12,
            backgroundColor: '#1890ff',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#40a9ff'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1890ff'}
        ></div>
        <div
          onClick={() => scrollToSection('labs')}
          style={{
            width: 12,
            height: 12,
            backgroundColor: '#1890ff',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#40a9ff'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1890ff'}
        ></div>
      </div>

      {/* 页面内容 */}
      <section id="title" style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f2f5',
        padding: '64px 20px 20px 20px'
      }}>
        <h1 style={{ fontSize: '3rem', color: '#1890ff', marginBottom: 20 }}>基于大模型的饮食评估</h1>
        <p style={{ fontSize: '1.2rem', textAlign: 'center', maxWidth: '600px' }}>
          利用先进的大模型技术，为您提供精准的饮食热量分析和营养评估。
        </p>
      </section>

      <section id="records" style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        padding: '64px 20px 20px 20px'
      }}>
        <h2 style={{ fontSize: '2.5rem', color: '#722ed1', marginBottom: 20 }}>状态管理与记录页面</h2>
        <p style={{ fontSize: '1.2rem', textAlign: 'center', maxWidth: '600px' }}>
          管理您的饮食记录，设计您的饮食目标，跟踪健康状态。提供全面的状态管理功能。
        </p>
      </section>

      <section id="labs" style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f2f5',
        padding: '64px 20px 20px 20px'
      }}>
        <h2 style={{ fontSize: '2.5rem', color: '#fa8c16', marginBottom: 20 }}>Labs (实验性方法)</h2>
        <p style={{ fontSize: '1.2rem', textAlign: 'center', maxWidth: '600px' }}>
          基于大模型进行食物重量评估、营养成分表获取。探索最新的实验性功能。
        </p>
      </section>

      <section id="calories" style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        padding: '64px 20px 20px 20px'
      }}>
        <h2 style={{ fontSize: '2.5rem', color: '#52c41a', marginBottom: 20 }}>热量分析</h2>
        <p style={{ fontSize: '1.2rem', textAlign: 'center', maxWidth: '600px' }}>
          基于大模型进行热量评估，快速分析您上传的食物图片，获取准确的热量信息。
        </p>
        {/* 这里可以添加Gallery组件或相关内容 */}
      </section>

      {/* 底部TabBar */}
      <TabBar />
    </div>
  );
}
