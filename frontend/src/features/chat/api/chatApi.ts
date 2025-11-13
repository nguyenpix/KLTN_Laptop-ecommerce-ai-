import { API_URL } from '@/constants/api-url';
import {
  CreateConversationResponse,
  GetConversationsResponse,
  GetConversationDetailResponse,
  SendMessageRequest,
  SendMessageResponse,
} from '../types';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const chatApi = {
  /**
   * Tạo conversation mới
   */
  createConversation: async (title?: string): Promise<CreateConversationResponse> => {
    const response = await fetch(`${API_URL}/chat/conversations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Không thể tạo cuộc hội thoại');
    }

    return data;
  },

  /**
   * Lấy danh sách conversations
   */
  getConversations: async (params?: {
    status?: 'active' | 'archived' | 'closed';
    limit?: number;
    skip?: number;
  }): Promise<GetConversationsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.skip) queryParams.append('skip', params.skip.toString());

    const response = await fetch(
      `${API_URL}/chat/conversations?${queryParams.toString()}`,
      {
        headers: getAuthHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Không thể tải danh sách hội thoại');
    }

    return data;
  },

  /**
   * Lấy chi tiết conversation với messages
   */
  getConversationDetail: async (
    conversationId: string
  ): Promise<GetConversationDetailResponse> => {
    const response = await fetch(`${API_URL}/chat/conversations/${conversationId}`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Không thể tải chi tiết hội thoại');
    }

    return data;
  },

  /**
   * Gửi message và nhận response từ AI
   */
  sendMessage: async (
    conversationId: string,
    request: SendMessageRequest
  ): Promise<SendMessageResponse> => {
    const response = await fetch(
      `${API_URL}/chat/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Không thể gửi tin nhắn');
    }

    return data;
  },

  /**
   * Update conversation status
   */
  updateConversationStatus: async (
    conversationId: string,
    status: 'active' | 'archived' | 'closed'
  ): Promise<{ success: boolean; data: any }> => {
    const response = await fetch(
      `${API_URL}/chat/conversations/${conversationId}/status`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Không thể cập nhật trạng thái');
    }

    return data;
  },

  /**
   * Delete conversation
   */
  deleteConversation: async (conversationId: string): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_URL}/chat/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Không thể xóa hội thoại');
    }

    return data;
  },
};
