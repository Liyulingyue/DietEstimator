// 检查是否已登录
export async function isLogin(): Promise<boolean> {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/me`, {
      method: 'GET',
      credentials: 'include', // 包含cookies
    });
    const data = await response.json();
    return data.is_logged_in || false;
  } catch (error) {
    console.error('检查登录状态失败:', error);
    return false;
  }
}

// 退出登录
export async function logout(): Promise<void> {
  try {
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('登出失败:', error);
  }
}

// 获取当前登录用户 id（如果存在）
export async function getUserId(): Promise<string | null> {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/me`, {
      method: 'GET',
      credentials: 'include',
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
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/me`, {
      method: 'GET',
      credentials: 'include',
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
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/credits`, {
      method: 'GET',
      credentials: 'include',
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
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/consume-credits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ credits_to_consume: credits }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('消耗服务器调用点失败:', error);
    return null;
  }
}
