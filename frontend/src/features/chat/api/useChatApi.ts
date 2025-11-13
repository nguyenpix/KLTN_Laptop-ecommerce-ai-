import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi } from './chatApi';
import { SendMessageRequest } from '../types';

export const CHAT_KEYS = {
  all: ['chat'] as const,
  conversations: () => [...CHAT_KEYS.all, 'conversations'] as const,
  conversation: (id: string) => [...CHAT_KEYS.all, 'conversation', id] as const,
};

/**
 * Hook tạo conversation mới
 */
export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title?: string) => chatApi.createConversation(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.conversations() });
    },
  });
};

/**
 * Hook lấy danh sách conversations
 */
export const useConversations = (params?: {
  status?: 'active' | 'archived' | 'closed';
  limit?: number;
  skip?: number;
}) => {
  return useQuery({
    queryKey: [...CHAT_KEYS.conversations(), params],
    queryFn: () => chatApi.getConversations(params),
  });
};

/**
 * Hook lấy chi tiết conversation
 */
export const useConversationDetail = (conversationId: string | null) => {
  return useQuery({
    queryKey: CHAT_KEYS.conversation(conversationId || ''),
    queryFn: () => chatApi.getConversationDetail(conversationId!),
    enabled: !!conversationId,
  });
};

/**
 * Hook gửi message
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      message,
    }: {
      conversationId: string;
      message: string;
    }) => chatApi.sendMessage(conversationId, { message }),
    onSuccess: (_, variables) => {
      // Invalidate conversation detail để reload messages
      queryClient.invalidateQueries({
        queryKey: CHAT_KEYS.conversation(variables.conversationId),
      });
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.conversations() });
    },
  });
};

/**
 * Hook update conversation status
 */
export const useUpdateConversationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      status,
    }: {
      conversationId: string;
      status: 'active' | 'archived' | 'closed';
    }) => chatApi.updateConversationStatus(conversationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.conversations() });
    },
  });
};

/**
 * Hook delete conversation
 */
export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => chatApi.deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.conversations() });
    },
  });
};
