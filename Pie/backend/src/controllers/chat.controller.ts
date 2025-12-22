import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { aiService } from '../services/ai.service';

// Validation schemas
const querySchema = z.object({
  query: z.string().min(3).max(1000),
  conversationId: z.string().uuid().optional(),
});

const feedbackSchema = z.object({
  messageId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
});

/**
 * Send a query and get AI response
 */
export const sendQuery = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate input
    const validated = querySchema.parse(req.body);

    // For anonymous users, skip conversation tracking
    if (!req.user) {
      // Process query with AI service (anonymous mode)
      const startTime = Date.now();
      const aiResponse = await aiService.processQuery(validated.query, 'anonymous');
      const responseTime = Date.now() - startTime;

      // Log analytics for anonymous queries
      await prisma.queryAnalytics.create({
        data: {
          userId: null,
          query: validated.query,
          intent: aiResponse.intent,
          apisUsed: aiResponse.sources.map(s => s.apiName),
          responseTime,
          successful: true,
        },
      });

      return res.json({
        success: true,
        data: {
          conversationId: null,
          message: {
            id: Date.now().toString(),
            content: aiResponse.answer,
            sources: aiResponse.sources,
            confidence: aiResponse.confidence,
          },
          responseTime,
        },
      });
    }

    // Get or create conversation for authenticated users
    let conversation;
    if (validated.conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: validated.conversationId,
          userId: req.user.id,
        },
      });

      if (!conversation) {
        throw new AppError('Conversation not found', 404);
      }
    } else {
      // Create new conversation
      conversation = await prisma.conversation.create({
        data: {
          userId: req.user.id,
          title: validated.query.substring(0, 100), // Use first 100 chars as title
        },
      });
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: validated.query,
      },
    });

    // Process query with AI service
    const startTime = Date.now();
    const aiResponse = await aiService.processQuery(validated.query, req.user.id);
    const responseTime = Date.now() - startTime;

    // Save assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: aiResponse.answer,
        metadata: {
          intent: aiResponse.intent,
          sources: aiResponse.sources,
          confidence: aiResponse.confidence,
        },
      },
    });

    // Log query analytics
    await prisma.queryAnalytics.create({
      data: {
        query: validated.query,
        intent: aiResponse.intent,
        category: aiResponse.category,
        responseTime,
        apisUsed: aiResponse.sources.map((s: any) => s.apiName),
        successful: true,
        userId: req.user.id,
      },
    });

    logger.info(`Query processed for user ${req.user.id} in ${responseTime}ms`);

    res.status(200).json({
      success: true,
      data: {
        conversationId: conversation.id,
        message: {
          id: assistantMessage.id,
          content: aiResponse.answer,
          sources: aiResponse.sources,
          confidence: aiResponse.confidence,
        },
        responseTime,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.errors[0].message, 400));
    } else {
      next(error);
    }
  }
};

/**
 * Get user's conversations
 */
export const getConversations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where: { userId: req.user.id },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              content: true,
              createdAt: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.conversation.count({
        where: { userId: req.user.id },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        conversations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get conversation by ID
 */
export const getConversationById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            content: true,
            metadata: true,
            createdAt: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { conversation },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete conversation
 */
export const deleteConversation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;

    // Verify ownership
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    // Delete conversation (cascade will delete messages)
    await prisma.conversation.delete({
      where: { id },
    });

    logger.info(`Conversation ${id} deleted by user ${req.user.id}`);

    res.status(200).json({
      success: true,
      data: {
        message: 'Conversation deleted successfully',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit feedback for a message
 */
export const submitFeedback = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    // Validate input
    const validated = feedbackSchema.parse(req.body);

    // Verify message exists
    const message = await prisma.message.findUnique({
      where: { id: validated.messageId },
    });

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    // Create feedback
    const feedback = await prisma.userFeedback.create({
      data: {
        messageId: validated.messageId,
        userId: req.user.id,
        rating: validated.rating,
        comment: validated.comment,
      },
    });

    logger.info(`Feedback submitted for message ${validated.messageId}`);

    res.status(201).json({
      success: true,
      data: { feedback },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.errors[0].message, 400));
    } else {
      next(error);
    }
  }
};
