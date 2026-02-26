import { Reading } from '../types';

/**
 * API 服务：负责与后端 Express 服务器通信
 */
export const apiService = {
  /**
   * 获取所有占卜记录
   */
  async getReadings(): Promise<Reading[]> {
    const response = await fetch('/api/readings');
    if (!response.ok) throw new Error('Failed to fetch readings');
    return response.json();
  },

  /**
   * 获取单条占卜记录
   */
  async getReadingById(id: string): Promise<Reading> {
    const response = await fetch(`/api/readings/${id}`);
    if (!response.ok) throw new Error('Failed to fetch reading details');
    return response.json();
  },

  /**
   * 保存新的占卜记录
   */
  async saveReading(reading: Omit<Reading, 'id'>): Promise<Reading> {
    const response = await fetch('/api/readings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
    });
    if (!response.ok) throw new Error('Failed to delete reading');
  }
};
