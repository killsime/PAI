// API服务，处理与后端的通信

const API_BASE_URL = 'http://localhost:8000';

// 类型定义
export interface User {
  user_id: number;
  username: string;
}

export interface Question {
  id: number;
  content: string;
  dimension: string;
}

export interface QuestionsResponse {
  questions: Question[];
}

export interface AssessmentResult {
  assessment_id: number;
  depression: number;
  anxiety: number;
  stress: number;
  depression_level: string;
  anxiety_level: string;
  stress_level: string;
  ai_analysis: string;
}

// 通用请求函数
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  console.log('API请求:', {
    url,
    options: mergedOptions
  });

  try {
    const response = await fetch(url, mergedOptions);

    console.log('API响应:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('API错误数据:', errorData);
      throw new Error(errorData.detail || `请求失败: ${response.status}`);
    }

    const data = await response.json();
    console.log('API响应数据:', data);
    return data;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
}

// 用户相关API
export const userApi = {
  // 注册
  register: (username: string, password: string) => {
    return request<User>('/user/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  // 登录
  login: (username: string, password: string) => {
    return request<User>('/user/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  // 创建测试用户
  createTestUser: () => {
    return request<any>('/user/create-test-user', {
      method: 'POST',
    });
  },
  // 获取用户信息
  getUserInfo: (user_id: number) => {
    return request<User>('/user/get-user-info', {
      method: 'POST',
      body: JSON.stringify({ user_id }),
    });
  },

};

// 题目相关API
export const questionApi = {
  // 获取随机题目
  getRandomQuestions: () => {
    return request<QuestionsResponse>('/questions/random');
  },

  // 获取DASS-21题目
  getDassQuestions: () => {
    return request<QuestionsResponse>('/questions/dass');
  },
};

// 测评相关API
export const assessmentApi = {
  // 提交测评结果
  submitAssessment: (depression: number, anxiety: number, stress: number, user_id?: number) => {
    return request<AssessmentResult>('/assessment/submit', {
      method: 'POST',
      body: JSON.stringify({ depression, anxiety, stress, user_id }),
    });
  },
  // 获取历史测评结果
  getHistory: (user_id: number) => {
    return request<{ history: any[] }>(`/assessment/history/${user_id}`, {
      method: 'GET',
    });
  },
};

// Admin 相关类型定义
export interface AdminUser {
  id: number;
  username: string;
  is_admin: number;
  created_at: string;
}

export interface AdminLoginResponse {
  user_id: number;
  username: string;
  is_admin: boolean;
}

export interface GetUsersResponse {
  users: AdminUser[];
}

// Admin 相关API
export const adminApi = {
  // 管理员登录
  login: (username: string, password: string) => {
    return request<AdminLoginResponse>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  // 获取所有用户
  getUsers: () => {
    return request<GetUsersResponse>('/admin/users');
  },
  // 创建用户
  createUser: (username: string, password: string, is_admin: number = 0) => {
    return request<{ message: string; user_id: number }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify({ username, password, is_admin }),
    });
  },
  // 更新用户
  updateUser: (user_id: number, data: { username?: string; password?: string; is_admin?: number }) => {
    return request<{ message: string }>(`/admin/users/${user_id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  // 删除用户
  deleteUser: (user_id: number) => {
    return request<{ message: string }>(`/admin/users/${user_id}`, {
      method: 'DELETE',
    });
  },
  // 获取题目管理
  getQuestions: () => {
    return request<{ questions: Question[] }>('/admin/questions');
  },
  createQuestion: (content: string, dimension: string) => {
    return request<{ message: string; question_id: number }>('/admin/questions', {
      method: 'POST',
      body: JSON.stringify({ content, dimension }),
    });
  },
  updateQuestion: (question_id: number, data: { content?: string; dimension?: string }) => {
    return request<{ message: string }>(`/admin/questions/${question_id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteQuestion: (question_id: number) => {
    return request<{ message: string }>(`/admin/questions/${question_id}`, {
      method: 'DELETE',
    });
  },
  // 推送管理
  getPushMessages: () => {
    return request<{ data: any[] }>('/api/push/messages');
  },
  createPushMessage: (level: string, content: string) => {
    return request<{ message: string; message_id: number }>('/api/push/message', {
      method: 'POST',
      body: JSON.stringify({ level, content }),
    });
  },
  updatePushMessage: (message_id: number, data: { level?: string; content?: string }) => {
    return request<{ message: string }>(`/api/push/message/${message_id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deletePushMessage: (message_id: number) => {
    return request<{ message: string }>(`/api/push/message/${message_id}`, {
      method: 'DELETE',
    });
  },
  // Dashboard
  getDashboardStats: () => {
    return request<{ success: boolean; data: any }>('/api/dashboard/stats');
  },
};