/**
 * Session 管理 - 使用 localStorage + HTTP Header 方式
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Session 信息存储键
const SESSION_STORAGE_KEY = 'sessionId';
const USERNAME_STORAGE_KEY = 'username';
const USER_ID_STORAGE_KEY = 'userId';

/**
 * 获取存储的 session ID
 */
export function getSessionId(): string | null {
  return localStorage.getItem(SESSION_STORAGE_KEY);
}

/**
 * 存储 session 信息
 */
export function setSessionInfo(sessionId: string, username: string, userId: string): void {
  localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  localStorage.setItem(USERNAME_STORAGE_KEY, username);
  localStorage.setItem(USER_ID_STORAGE_KEY, userId);
}

/**
 * 清除 session 信息
 */
export function clearSessionInfo(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(USERNAME_STORAGE_KEY);
  localStorage.removeItem(USER_ID_STORAGE_KEY);
}

/**
 * 创建带有 session header 的请求配置
 */
function createHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const sessionId = getSessionId();
  if (sessionId) {
    headers['X-Session-ID'] = sessionId;
  }
  
  return headers;
}

// 检查是否已登录
export async function isLogin(): Promise<boolean> {
  try {
    const sessionId = getSessionId();
    console.log('🔍 isLogin - 检查session_id:', sessionId);

    const headers = createHeaders();
    console.log('🔍 isLogin - 请求headers:', headers);

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      method: 'GET',
      headers: headers,
    });

    console.log('🔍 isLogin - 响应状态:', response.status);
    const data = await response.json();
    console.log('🔍 isLogin - 响应数据:', data);

    const isLoggedIn = data.is_logged_in || false;
    console.log('🔍 isLogin - 登录状态:', isLoggedIn);

    return isLoggedIn;
  } catch (error) {
    console.error('❌ 检查登录状态失败:', error);
    return false;
  }
}

// 退出登录
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: createHeaders(),
    });
    clearSessionInfo();
  } catch (error) {
    console.error('登出失败:', error);
  }
}

// 获取当前登录用户 id（如果存在）
export async function getUserId(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      method: 'GET',
      headers: createHeaders(),
    });
    const data = await response.json();
    return data.is_logged_in ? data.user_id : null;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
}

// 获取当前用户信息
export async function getUserInfo(): Promise<{user_id: string, username: string, is_logged_in: boolean, server_credits: number} | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      method: 'GET',
      headers: createHeaders(),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
}

// 获取服务器调用点信息
export async function getServerCredits(): Promise<{username: string, server_credits: number, created_at: string} | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/credits`, {
      method: 'GET',
      headers: createHeaders(),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取服务器调用点信息失败:', error);
    return null;
  }
}

// 消耗服务器调用点
export async function consumeCredits(credits: number): Promise<{success: boolean, message: string, remaining_credits: number} | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/consume-credits`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ credits_to_consume: credits }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('消耗服务器调用点失败:', error);
    return null;
  }
}

// 充值服务器调用点（增加20点）
export async function resetCredits(): Promise<{success: boolean, message: string, server_credits: number} | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-credits`, {
      method: 'POST',
      headers: createHeaders(),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('充值服务器调用点失败:', error);
    return null;
  }
}
