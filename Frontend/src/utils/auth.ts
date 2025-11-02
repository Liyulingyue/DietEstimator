// 检查是否已登录
export function isLogin() {
  return document.cookie.split(';').some(item => item.trim() === 'isLogin=true');
}

// 退出登录
export function logout() {
  // 删除登录cookie
  document.cookie = 'isLogin=true; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
}

// 获取当前登录用户 id（如果存在）
export function getUserId(): string | null {
  const cookie = document.cookie || '';
  const parts = cookie.split(';').map(p => p.trim());
  const pair = parts.find(p => p.startsWith('userId='));
  if (!pair) return null;
  const value = pair.split('=').slice(1).join('=');
  try {
    return decodeURIComponent(value);
  } catch (e) {
    return value || null;
  }
}
