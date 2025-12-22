import OpenAI from 'openai';
import { config } from '../config/environment';
import { logger } from '../utils/logger';
import { govApiService } from './govApi.service';
import prisma from '../config/database';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

interface AIResponse {
  answer: string;
  intent: string;
  category: string;
  sources: Array<{
    apiName: string;
    url?: string;
    relevance: number;
  }>;
  confidence: number;
}

class AIService {
  /**
   * Process user query using AI
   */
  async processQuery(query: string, userId: string): Promise<AIResponse> {
    try {
      logger.info(`Processing query: ${query}`);

      // Step 1: Classify intent and extract entities
      const intent = await this.classifyIntent(query);
      logger.info(`Classified intent: ${JSON.stringify(intent)}`);

      // Step 2: In development, skip external API calls for faster responses
      let govData;
      if (config.nodeEnv === 'production') {
        govData = await govApiService.fetchRelevantData(
          query,
          intent.category
        );
      } else {
        // Development mode - use AI knowledge directly
        govData = {
          data: [],
          sources: [],
        };
      }

      // Step 3: Generate comprehensive answer using GPT-4
      const answer = await this.generateAnswer(query, govData, intent);

      return {
        answer: answer.text,
        intent: intent.intent,
        category: intent.category,
        sources: govData.sources,
        confidence: intent.confidence,
      };
    } catch (error) {
      logger.error('AI Service error:', error);
      throw error;
    }
  }

  /**
   * Classify user intent using GPT-4
   */
  private async classifyIntent(query: string): Promise<{
    intent: string;
    category: string;
    entities: string[];
    confidence: number;
  }> {
    const systemPrompt = `You are an intent classifier for an Indian Government Data Q&A system.
Analyze the user query and extract:
1. intent: The user's primary intention (e.g., "find_data", "compare_stats", "explain_scheme", "get_news")
2. category: Data category (e.g., "health", "education", "finance", "agriculture", "infrastructure", "policy", "law")
3. entities: Key entities mentioned (states, ministries, schemes, topics)
4. confidence: Your confidence score (0-1)

Respond in JSON format only.`;

    const response = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      intent: result.intent || 'unknown',
      category: result.category || 'general',
      entities: result.entities || [],
      confidence: result.confidence || 0.5,
    };
  }

  /**
   * Generate natural language answer
   */
  private async generateAnswer(
    query: string,
    govData: any,
    intent: any
  ): Promise<{ text: string }> {
    const systemPrompt = `You are an AI assistant specializing in Indian Government data and information.

Your responsibilities:
1. Answer questions accurately using ONLY the provided government data
2. Cite sources properly
3. If data is insufficient, clearly state limitations
4. Use simple, clear Hindi-English mix when appropriate
5. Format responses with bullet points, numbers for clarity
6. Always be factual and non-political

Context:
- User Intent: ${intent.intent}
- Category: ${intent.category}
- Available Government Data: ${JSON.stringify(govData.data, null, 2)}

Guidelines:
- Start with a direct answer
- Provide supporting details with proper citations
- End with source attribution
- If no relevant data found, suggest alternative sources`;

    const response = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      temperature: config.openai.temperature,
      max_tokens: config.openai.maxTokens,
    });

    return {
      text: response.choices[0].message.content || 'Unable to generate response',
    };
  }

  /**
   * Generate conversation title from first query
   */
  async generateTitle(query: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Generate a short, descriptive title (max 10 words) for this conversation based on the query.',
          },
          { role: 'user', content: query },
        ],
        temperature: 0.5,
        max_tokens: 50,
      });

      return (
        response.choices[0].message.content?.substring(0, 100) ||
        query.substring(0, 100)
      );
    } catch (error) {
      logger.error('Title generation error:', error);
      return query.substring(0, 100);
    }
  }
}

export const aiService = new AIService();
