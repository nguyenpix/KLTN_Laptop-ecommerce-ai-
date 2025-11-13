export interface Message {
  _id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  referenced_products?: ReferencedProduct[];
  metadata?: MessageMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface ReferencedProduct {
  product_id: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  relevance_score: number;
  chunks_used: number[];
}

export interface MessageMetadata {
  rag_results?: {
    total_chunks: number;
    top_scores: number[];
    search_time_ms: number;
  };
  llm_metadata?: {
    model: string;
    tokens_used: number;
    generation_time_ms: number;
  };
}

export interface Conversation {
  _id: string;
  user_id: string;
  title: string;
  status: 'active' | 'archived' | 'closed';
  context_summary?: {
    interested_products: Array<{
      product_id: string;
      mention_count: number;
    }>;
    topics: string[];
    last_intent: string;
  };
  last_message_at: string;
  createdAt: string;
  updatedAt: string;
  message_count?: number;
  last_message?: {
    content: string;
    role: string;
    createdAt: string;
  };
}

export interface SendMessageRequest {
  message: string;
}

export interface SendMessageResponse {
  success: boolean;
  data: {
    message: Message;
    suggested_products: SuggestedProduct[];
    response_time_ms: number;
  };
}

export interface SuggestedProduct {
  _id: string;
  name: string;
  price: number;
  brand_id?: string;
  images: string[];
  stock_quantity: number;
  similarity: number;
}

export interface CreateConversationResponse {
  success: boolean;
  data: Conversation;
}

export interface GetConversationsResponse {
  success: boolean;
  count: number;
  data: Conversation[];
}

export interface GetConversationDetailResponse {
  success: boolean;
  data: {
    conversation: Conversation;
    messages: Message[];
  };
}
