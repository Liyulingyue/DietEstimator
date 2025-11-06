// 测试 mobile-panel 页面的登录状态和数据获取功能
import { isLogin, getUserId } from '../utils/auth';

export const testMobilePanel = async () => {
  console.log('测试 mobile-panel 功能...');

  try {
    // 测试登录状态检查
    const loggedIn = await isLogin();
    console.log('登录状态:', loggedIn);

    if (loggedIn) {
      // 测试获取用户ID
      const userId = await getUserId();
      console.log('用户ID:', userId);

      if (userId) {
        // 测试获取今日记录
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}`;
        const response = await fetch(`${apiUrl}/api/v1/records/${userId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const records = await response.json();
          console.log('获取到记录数量:', records.length);

          // 过滤今日记录
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];
          const todayRecords = records.filter((record: any) => {
            const recordDate = new Date(record.created_at).toISOString().split('T')[0];
            return recordDate === todayStr;
          });

          console.log('今日记录数量:', todayRecords.length);
        } else {
          console.log('获取记录失败:', response.status);
        }
      }
    } else {
      console.log('用户未登录，将显示"未登录"界面');
    }
  } catch (error) {
    console.error('测试失败:', error);
  }
};