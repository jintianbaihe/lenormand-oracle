import { Reading, User } from '../types';

// 认证令牌存储
let authToken: string | null = null;

/**
 * 获取认证头信息
 */
const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
};

/**
 * API 服务：负责与后端 Express 服务器通信
 */
export const apiService = {
  /**
   * 设置认证令牌
   */
  setAuthToken(token: string) {
    authToken = token;
  },

  /**
   * 清除认证令牌
   */
  clearAuthToken() {
    authToken = null;
  },

  /**
   * 发送验证码
   */
  async sendVerificationCode(phone: string): Promise<void> {
    const response = await fetch('/api/auth/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send verification code');
    }
  },

  /**
   * 用户登录/注册
   */
  async login(phone: string, code: string): Promise<{ user: User; token: string }> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    const data = await response.json();
    this.setAuthToken(data.token);
    return data;
  },

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User> {
    const response = await fetch('/api/auth/me', {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user info');
    }
    
    const data = await response.json();
    return data.user;
  },

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    this.clearAuthToken();
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Logout failed');
    }
  },

  /**
   * 更新用户资料
   */
  async updateProfile(updates: { username?: string; avatar?: string }): Promise<User> {
    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }
    
    const data = await response.json();
    return data.user;
  },

  /**
   * 获取所有占卜记录
   */
  async getReadings(): Promise<Reading[]> {
    const response = await fetch('/api/readings', {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to fetch readings');
    return response.json();
  },

  /**
   * 获取单条占卜记录
   */
  async getReadingById(id: string): Promise<Reading> {
    const response = await fetch(`/api/readings/${id}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to fetch reading details');
    return response.json();
  },

  /**
   * 保存新的占卜记录
   */
  async saveReading(reading: Omit<Reading, 'id'>): Promise<Reading> {
    const response = await fetch('/api/readings', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reading),
    });
    
    if (!response.ok) throw new Error('Failed to save reading');
    return response.json();
  },

  /**
   * 更新占卜记录（感悟）
   */
  async updateReading(id: string, reflection: string): Promise<Reading> {
    const response = await fetch(`/api/readings/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reflection }),
    });
    
    if (!response.ok) throw new Error('Failed to update reading');
    return response.json();
  },

  /**
   * 删除占卜记录
   */
  async deleteReading(id: string): Promise<void> {
    const response = await fetch(`/api/readings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to delete reading');
  }
};
