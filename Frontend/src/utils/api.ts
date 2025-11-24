import { getSessionId, getUserInfo } from './auth';

// Re-export for convenience
export { getSessionId } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * 创建带有 session header 的请求配置
 */
function createHeaders(contentType: string = 'application/json'): HeadersInit {
  const headers: HeadersInit = {};
  
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  
  const sessionId = getSessionId();
  if (sessionId) {
    headers['X-Session-ID'] = sessionId;
  }
  
  return headers;
}

/**
 * AI分析配置接口
 */
export interface AIConfig {
  modelUrl?: string;
  modelName?: string;
  apiKey?: string;
  method?: string; // 分析方法: pure_llm, llm_ocr_hybrid, nutrition_table, food_portion
  preference?: string; // 调用偏好，默认为server
}

/**
 * 分析结果接口
 */
export interface AnalysisResult {
  success: boolean;
  message: string;
  result?: any;
  session_id?: string;
  method?: string;
  error?: string;
  food_name?: string;
  calories?: string;
  estimation_basis?: string;
}

/**
 * 将canvas转换为File对象
 */
function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * 调用分析接口
 * @param images - base64格式的图片数组
 * @param aiConfig - AI配置，目前不做处理
 * @returns 分析结果
 */
export async function analyzeFood(
  images: string[],
  aiConfig?: AIConfig
): Promise<AnalysisResult> {
  if (!images || images.length === 0) {
    return {
      success: false,
      message: '未提供任何图片',
      error: '请先上传或拍摄食物图片',
    };
  }

  try {
    // 获取用户信息和session_id
    const userInfo = await getUserInfo();
    const isLoggedIn = !!userInfo?.is_logged_in;
    const sessionId = isLoggedIn ? (getSessionId() || '') : '';
    const userId = userInfo?.user_id || 'guest';
    const callPreference = aiConfig?.preference || 'server';

    // 构建FormData
    const formData = new FormData();
    
    // 添加session和配置信息
    formData.append('session_id', sessionId);
    formData.append('user_id', userId);

    const method = aiConfig?.method || 'pure_llm';
    formData.append('method', method);
    
    // 添加AI配置信息
    if (aiConfig?.modelUrl) {
      formData.append('model_url', aiConfig.modelUrl);
    }
    if (aiConfig?.modelName) {
      formData.append('model_name', aiConfig.modelName);
    }
    if (aiConfig?.apiKey) {
      formData.append('api_key', aiConfig.apiKey);
    }
    formData.append('call_preference', callPreference);

    // 添加图片文件
    images.forEach((image, index) => {
      const file = dataURLtoFile(image, `food_image_${index}.png`);
      formData.append('files', file);
    });

    // 创建headers（FormData时不设置Content-Type，让浏览器自动设置）
    const headers: HeadersInit = {};
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }

    // 调用后端API
    const response = await fetch(`${API_BASE_URL}/api/v1/food_estimate/analyze`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.detail || '分析请求失败',
        error: `HTTP ${response.status}`,
      };
    }

    const result: AnalysisResult = await response.json();
    return result;
  } catch (error) {
    console.error('分析请求异常:', error);
    return {
      success: false,
      message: '分析过程中发生错误',
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 获取可用的分析方法
 */
export async function getAvailableMethods(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/methods`, {
      headers: createHeaders(),
    });

    if (!response.ok) {
      console.error('获取分析方法失败');
      return [];
    }

    const data = await response.json();
    return data.methods || [];
  } catch (error) {
    console.error('获取分析方法异常:', error);
    return [];
  }
}

/**
 * 画廊分享接口
 */
export interface GalleryShare {
  id: number;
  user_name: string | null;
  is_current_user: boolean;
  image_base64: string;
  analysis_result: string;
  created_at: string;
}

/**
 * 画廊分享列表响应接口
 */
export interface GalleryShareListResponse {
  shares: GalleryShare[];
  total: number;
}

/**
 * 分享到画廊的请求接口
 */
export interface ShareToGalleryRequest {
  image_base64: string;
  analysis_result: string;
}

/**
 * 获取画廊分享列表
 * @param skip - 跳过的记录数（分页）
 * @param limit - 返回的记录数限制
 * @returns 画廊分享列表
 */
export async function getGalleryShares(
  skip: number = 0,
  limit: number = 20
): Promise<GalleryShareListResponse> {
  try {
    const sessionId = getSessionId();
    const headers: HeadersInit = {};
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }
    
    const response = await fetch(
      `${API_BASE_URL}/api/v1/gallery/list?skip=${skip}&limit=${limit}`,
      {
        headers: headers,
      }
    );

    if (!response.ok) {
      console.error('获取画廊分享列表失败');
      return { shares: [], total: 0 };
    }

    const data: GalleryShareListResponse = await response.json();
    return data;
  } catch (error) {
    console.error('获取画廊分享列表异常:', error);
    return { shares: [], total: 0 };
  }
}

/**
 * 分享餐食到画廊
 * @param shareData - 分享数据
 * @returns 分享结果
 */
export async function shareToGallery(
  shareData: ShareToGalleryRequest
): Promise<{ success: boolean; message: string; share?: GalleryShare }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/gallery/share`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(shareData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.detail || '分享失败',
      };
    }

    const result: GalleryShare = await response.json();
    return {
      success: true,
      message: '分享成功',
      share: result,
    };
  } catch (error) {
    console.error('分享到画廊异常:', error);
    return {
      success: false,
      message: '分享过程中发生错误',
    };
  }
}

/**
 * 删除画廊分享
 * @param shareId - 分享ID
 * @returns 删除结果
 */
export async function deleteGalleryShare(
  shareId: number
): Promise<{ success: boolean; message: string }> {
  try {
    const sessionId = getSessionId();
    const headers: HeadersInit = {};
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/v1/gallery/share/${shareId}`, {
      method: 'DELETE',
      headers: headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.detail || '删除失败',
      };
    }

    return {
      success: true,
      message: '分享已删除',
    };
  } catch (error) {
    console.error('删除画廊分享异常:', error);
    return {
      success: false,
      message: '删除过程中发生错误',
    };
  }
}
