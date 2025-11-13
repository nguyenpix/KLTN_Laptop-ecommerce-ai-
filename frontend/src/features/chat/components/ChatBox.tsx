'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Loader2, MessageCircle, Sparkles, ExternalLink } from 'lucide-react';
import {
  useCreateConversation,
  useConversationDetail,
  useSendMessage,
} from '../api/useChatApi';
import { Message } from '../types';

export const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const createConversation = useCreateConversation();
  const { data: conversationData, isLoading: isLoadingConversation } =
    useConversationDetail(conversationId);
  const sendMessage = useSendMessage();

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  // Update local messages when conversation data loads
  useEffect(() => {
    if (conversationData?.data?.messages) {
      setLocalMessages(conversationData.data.messages);
    }
  }, [conversationData]);

  // Tạo conversation khi mở chatbox lần đầu
  const handleOpen = async () => {
    setIsOpen(true);

    if (!conversationId) {
      try {
        const result = await createConversation.mutateAsync('Hỗ trợ khách hàng');
        setConversationId(result.data._id);
      } catch (error) {
        console.error('Failed to create conversation:', error);
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || !conversationId) return;

    const userMessage: Message = {
      _id: Date.now().toString(),
      conversation_id: conversationId,
      role: 'user',
      content: inputMessage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add user message immediately
    setLocalMessages((prev) => [...prev, userMessage]);
    setInputMessage('');

    try {
      const response = await sendMessage.mutateAsync({
        conversationId,
        message: inputMessage,
      });

      // Add AI response
      if (response.data.message) {
        setLocalMessages((prev) => [...prev, response.data.message]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message
      const errorMessage: Message = {
        _id: Date.now().toString(),
        conversation_id: conversationId,
        role: 'assistant',
        content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLocalMessages((prev) => [...prev, errorMessage]);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
        aria-label="Mở chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[400px] flex-col rounded-2xl bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">Trợ lý AI</h3>
            <p className="text-xs text-white/80">Tư vấn laptop thông minh</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="rounded-full p-1 transition-colors hover:bg-white/20"
          aria-label="Đóng chat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingConversation && localMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : localMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 mb-4">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Xin chào! 👋</h4>
            <p className="text-sm text-gray-600">
              Tôi là trợ lý AI. Tôi có thể giúp bạn tìm laptop phù hợp với nhu cầu.
            </p>
            <div className="mt-4 space-y-2 w-full">
              <button
                onClick={() =>
                  setInputMessage('Tôi cần laptop gaming giá dưới 25 triệu')
                }
                className="w-full text-left text-sm p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                💻 Laptop gaming dưới 25 triệu
              </button>
              <button
                onClick={() => setInputMessage('Laptop nào có RTX 4050?')}
                className="w-full text-left text-sm p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                🎮 Laptop có RTX 4050
              </button>
              <button
                onClick={() => setInputMessage('Tư vấn laptop cho lập trình viên')}
                className="w-full text-left text-sm p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                👨‍💻 Laptop cho lập trình
              </button>
            </div>
          </div>
        ) : (
          <>
            {localMessages.map((message) => (
              <div
                key={message._id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100">
                    <Bot className="h-5 w-5 text-blue-600" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Show referenced products */}
                  {message.referenced_products &&
                    message.referenced_products.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.referenced_products
                          .filter((ref) => ref.product_id && ref.product_id._id)
                          .slice(0, 2)
                          .map((ref) => (
                            <a
                              key={ref.product_id._id}
                              href={`/products/${ref.product_id._id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex gap-2 rounded-lg bg-white p-2.5 shadow-sm hover:shadow-md transition-all border border-transparent hover:border-blue-200 cursor-pointer group"
                            >
                              {ref.product_id.images?.[0] && (
                                <img
                                  src={ref.product_id.images[0]}
                                  alt={ref.product_id.name}
                                  className="h-14 w-14 rounded object-cover flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                  {ref.product_id.name}
                                </p>
                                <p className="text-sm text-blue-600 font-bold mt-0.5">
                                  {ref.product_id.price?.toLocaleString('vi-VN') || '0'}đ
                                </p>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 group-hover:text-blue-600 transition-colors">
                                  <ExternalLink className="h-3 w-3" />
                                  <span>Xem chi tiết</span>
                                </div>
                              </div>
                            </a>
                          ))}
                      </div>
                    )}
                </div>

                {message.role === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {sendMessage.isPending && (
              <div className="flex gap-3 justify-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-gray-100 px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm text-gray-600">Đang suy nghĩ...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Nhập câu hỏi của bạn..."
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            disabled={sendMessage.isPending}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || sendMessage.isPending}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            aria-label="Gửi tin nhắn"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
