import { Reading, User } from '../types';

/**
 * API 服务：负责与后端 Express 服务器通信
 */
export const apiService = {
  /**
   * 发送验证码
   */
  async sendCode(phone: string): Promise<any> {
    const response = await fetch('/api/auth/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    if (!response.ok) throw new Error('Failed to send code');
    return response.json();
  },

  /**
   * 登录
   */
  async login(phone: string, code: string): Promise<User> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to login');
    }
    return response.json();
  },

  /**
   * 更新个人资料
   */
  async updateProfile(id: string, username: string, avatar: string): Promise<User> {
    const response = await fetch('/api/auth/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, username, avatar }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update profile');
    }
    return response.json();
  },

  /**
   * 获取所有占卜记录
   */
  async getReadings(userId?: string): Promise<Reading[]> {
    const url = userId ? `/api/readings?userId=${userId}` : '/api/readings';
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch readings');
    }
    return response.json();
  },

  /**
   * 获取单条占卜记录
   */
  async getReadingById(id: string): Promise<Reading> {
    const response = await fetch(`/api/readings/${id}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch reading details');
    }
    return response.json();
  },

  /**
   * 保存新的占卜记录
   */
  async saveReading(reading: Omit<Reading, 'id'> & { userId?: string }): Promise<Reading> {
    const response = await fetch('/api/readings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reading),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to save reading');
    }
    return response.json();
  },

  /**
   * 更新占卜记录（感悟）
   */
  async updateReading(id: string, reflection: string): Promise<Reading> {
    const response = await fetch(`/api/readings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reflection }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update reading');
    }
    return response.json();
  },

  /**
   * 删除占卜记录
   */
  async deleteReading(id: string): Promise<void> {
    const response = await fetch(`/api/readings/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete reading');
    }
  }
};
