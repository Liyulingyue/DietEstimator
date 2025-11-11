// API 配置
export const API_CONFIG = {
  // 后端基础 URL
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',

  // API 端点
  ENDPOINTS: {
    SAVE_RECORD: '/api/v1/food_estimate/save_record',
    // 可以在这里添加其他端点
  }
};

// 获取完整的 API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};