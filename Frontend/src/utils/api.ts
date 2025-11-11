import { getUserInfo } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
 * 从cookie或localStorage中获取session_id
 */
function getSessionId(): string {
  // 首先尝试从cookie中获取（用于httponly cookie的自动传递）
  // 但由于httponly属性，JavaScript无法直接访问
  // 所以主要依赖于credentials: 'include'来自动传递cookie
  
  // 作为备选方案，从localStorage获取session_id用于API调用
  const sessionIdFromStorage = localStorage.getItem('session_id');
  console.log('DEBUG getSessionId - sessionIdFromStorage:', sessionIdFromStorage);
  if (sessionIdFromStorage) {
    console.log('DEBUG getSessionId - 从localStorage返回:', sessionIdFromStorage);
    return sessionIdFromStorage;
  }
  
  // 如果都没有，尝试从document.cookie获取（非httponly的情况）
  const name = 'session_id=';
  try {
    const decodedCookie = decodeURIComponent(document.cookie);
    console.log('DEBUG getSessionId - document.cookie:', decodedCookie);
    const cookieArray = decodedCookie.split(';');
    
    for (let cookie of cookieArray) {
      cookie = cookie.trim();
      if (cookie.indexOf(name) === 0) {
        const sessionId = cookie.substring(name.length);
        console.log('DEBUG getSessionId - 从cookie返回:', sessionId);
        return sessionId;
      }
    }
  } catch (e) {
    console.warn('无法从cookie读取session_id:', e);
  }
  
  console.log('DEBUG getSessionId - 返回空字符串');
  return '';
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

    // 调用后端API
    const response = await fetch(`${API_BASE_URL}/api/v1/food_estimate/analyze`, {
      method: 'POST',
      credentials: 'include',
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
      credentials: 'include',
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
  user_id: number | null;
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
    const response = await fetch(
      `${API_BASE_URL}/api/v1/gallery/list?skip=${skip}&limit=${limit}`,
      {
        credentials: 'include',
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
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
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
