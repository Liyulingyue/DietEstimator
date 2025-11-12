// API 配置
export const API_CONFIG = {
  // 后端基础 URL
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',

  // API 端点
  ENDPOINTS: {
    SAVE_RECORD: '/api/v1/food_estimate/save_record',
    BOWEL_ANALYZE: '/api/v1/bowel_estimate/analyze',
    // 可以在这里添加其他端点
  }
};

// 获取完整的 API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// 粪便分析接口
export interface BowelAnalysisRequest {
  files: File[];
  session_id?: string;
  user_id?: string;
  method?: string;
  model_url?: string;
  model_name?: string;
  api_key?: string;
  call_preference?: string;
}

export interface BowelAnalysisResponse {
  success: boolean;
  message: string;
  result?: {
    color: string;
    quantity: string;
    shape: string;
    health_comment: string;
    analysis_basis: string;
  };
  session_id?: string;
  method: string;
  error?: string;
  color?: string;
  quantity?: string;
  shape?: string;
  health_comment?: string;
  analysis_basis?: string;
}

// 粪便分析API调用
export const analyzeBowel = async (request: BowelAnalysisRequest): Promise<BowelAnalysisResponse> => {
  const formData = new FormData();

  // 添加文件
  request.files.forEach((file) => {
    formData.append('files', file);
  });

  // 添加其他参数
  if (request.session_id) formData.append('session_id', request.session_id);
  if (request.user_id) formData.append('user_id', request.user_id);
  if (request.method) formData.append('method', request.method);
  if (request.model_url) formData.append('model_url', request.model_url);
  if (request.model_name) formData.append('model_name', request.model_name);
  if (request.api_key) formData.append('api_key', request.api_key);
  if (request.call_preference) formData.append('call_preference', request.call_preference);

  const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.BOWEL_ANALYZE), {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};