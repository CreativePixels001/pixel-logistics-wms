import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

/**
 * Get available government data sources
 */
export const getDataSources = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sources = await prisma.govDataSource.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        category: true,
        metadata: true,
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: { sources },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get data categories
 */
export const getCategories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await prisma.govDataSource.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: { category: true },
    });

    res.status(200).json({
      success: true,
      data: {
        categories: categories.map((c) => ({
          name: c.category,
          count: c._count.category,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get query analytics (Admin only - simplified for now)
 */
export const getAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalQueries, avgResponseTime, topIntents, successRate] =
      await Promise.all([
        // Total queries
        prisma.queryAnalytics.count({
          where: {
            createdAt: { gte: startDate },
          },
        }),

        // Average response time
        prisma.queryAnalytics.aggregate({
          where: {
            createdAt: { gte: startDate },
          },
          _avg: { responseTime: true },
        }),

        // Top intents
        prisma.queryAnalytics.groupBy({
          by: ['intent'],
          where: {
            createdAt: { gte: startDate },
            intent: { not: null },
          },
          _count: { intent: true },
          orderBy: { _count: { intent: 'desc' } },
          take: 10,
        }),

        // Success rate
        prisma.queryAnalytics.groupBy({
          by: ['successful'],
          where: {
            createdAt: { gte: startDate },
          },
          _count: { successful: true },
        }),
      ]);

    const successCount =
      successRate.find((s) => s.successful)?._count.successful || 0;
    const totalCount = successRate.reduce(
      (sum, s) => sum + s._count.successful,
      0
    );

    res.status(200).json({
      success: true,
      data: {
        period: { days, startDate },
        metrics: {
          totalQueries,
          avgResponseTime: avgResponseTime._avg.responseTime || 0,
          successRate:
            totalCount > 0 ? (successCount / totalCount) * 100 : 0,
        },
        topIntents: topIntents.map((t) => ({
          intent: t.intent,
          count: t._count.intent,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
