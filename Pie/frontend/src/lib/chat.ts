import apiClient from './api-client'

export interface Message {
  id: string
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'
  content: string
  metadata?: any
  createdAt: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

export interface QueryRequest {
  query: string
  conversationId?: string
}

export interface QueryResponse {
  conversationId: string
  message: {
    id: string
    content: string
    sources: Array<{
      apiName: string
      url?: string
      relevance: number
    }>
    confidence: number
  }
  responseTime: number
}

export interface FeedbackData {
  messageId: string
  rating: number
  comment?: string
}

export const chatService = {
  async sendQuery(data: QueryRequest): Promise<QueryResponse> {
    const response = await apiClient.post('/chat/query', data)
    return response.data.data
  },

  async getConversations(page = 1, limit = 20) {
    const response = await apiClient.get('/chat/conversations', {
      params: { page, limit },
    })
    return response.data.data
  },

  async getConversationById(id: string): Promise<Conversation> {
    const response = await apiClient.get(`/chat/conversations/${id}`)
    return response.data.data.conversation
  },

  async deleteConversation(id: string): Promise<void> {
    await apiClient.delete(`/chat/conversations/${id}`)
  },

  async submitFeedback(data: FeedbackData): Promise<void> {
    await apiClient.post('/chat/feedback', data)
  },
}
