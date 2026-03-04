import { Reading, User } from '../types';

// 统一处理 fetch 响应，抛出带错误信息的异常
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any).error || `Request failed: ${response.status}`);
  }
  return response.json();
}

// 统一的 JSON POST 请求头
const JSON_HEADERS = { 'Content-Type': 'application/json' };

/** API 服务：负责与后端 Express 服务器通信 */
export const apiService = {
  async sendCode(phone: string): Promise<any> {
    const res = await fetch('/api/auth/send-code', {
      method: 'POST', headers: JSON_HEADERS, body: JSON.stringify({ phone }),
    });
    return handleResponse(res);
  },

  async login(phone: string, code: string): Promise<User> {
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: JSON_HEADERS, body: JSON.stringify({ phone, code }),
    });
    return handleResponse(res);
  },

  async updateProfile(id: string, username: string, avatar: string): Promise<User> {
    const res = await fetch('/api/auth/update-profile', {
      method: 'POST', headers: JSON_HEADERS, body: JSON.stringify({ id, username, avatar }),
    });
    return handleResponse(res);
  },

  async getReadings(userId?: string): Promise<Reading[]> {
    const url = userId ? `/api/readings?userId=${userId}` : '/api/readings';
    return handleResponse(await fetch(url));
  },

  async getReadingById(id: string): Promise<Reading> {
    return handleResponse(await fetch(`/api/readings/${id}`));
  },

  async saveReading(reading: Omit<Reading, 'id'> & { userId?: string }): Promise<Reading> {
    const res = await fetch('/api/readings', {
      method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(reading),
    });
    return handleResponse(res);
  },

  async updateReading(id: string, reflection: string): Promise<Reading> {
    const res = await fetch(`/api/readings/${id}`, {
      method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify({ reflection }),
    });
    return handleResponse(res);
  },

  async deleteReading(id: string): Promise<void> {
    const res = await fetch(`/api/readings/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },
};
