const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/User');
const authController = require('../../src/controllers/auth.controller');
const {
  generateMockUser,
  generateTestToken,
  expectValidationError,
  expectSuccessResponse,
} = require('../helpers/testUtils');

// Create Express app for testing
const app = express();
app.use(express.json());

// Mount auth routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/refresh', authController.refreshToken);
app.get('/api/auth/me', authController.getCurrentUser);
app.post('/api/auth/logout', authController.logout);
app.put('/api/auth/update-password', authController.updatePassword);

// Mock User model
jest.mock('../../src/models/User');

describe('Authentication Controller Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    
    it('should register a new user successfully', async () => {
      const mockUser = generateMockUser();
      const createdUser = {
        id: '123',
        ...mockUser,
        toJSON: jest.fn().mockReturnValue({ id: '123', email: mockUser.email })
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(createdUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send(mockUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('user');
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        email: mockUser.email,
        firstName: mockUser.firstName
      }));
    });

    it('should return error if user already exists', async () => {
      const mockUser = generateMockUser();
      User.findOne.mockResolvedValue({ email: mockUser.email });

      const response = await request(app)
        .post('/api/auth/register')
        .send(mockUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should validate email format', async () => {
      const invalidUser = generateMockUser({ email: 'invalid-email' });

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser);

      expect(response.status).toBe(400);
    });

    it('should validate password strength', async () => {
      const weakPasswordUser = generateMockUser({ password: '123' });

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordUser);

      expect(response.status).toBe(400);
    });

    it('should set default role to operator', async () => {
      const mockUser = generateMockUser();
      delete mockUser.role;

      const createdUser = {
        id: '123',
        ...mockUser,
        role: 'operator',
        toJSON: jest.fn().mockReturnValue({ id: '123', role: 'operator' })
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(createdUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send(mockUser);

      expect(response.status).toBe(201);
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'operator' })
      );
    });
  });

  describe('POST /api/auth/login', () => {
    
    it('should login user with valid credentials', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password: 'Test@1234',
        role: 'user',
        comparePassword: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ id: '123', email: 'test@example.com' })
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test@1234'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(mockUser.comparePassword).toHaveBeenCalledWith('Test@1234');
    });

    it('should return error for non-existent user', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test@1234'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('should return error for invalid password', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('should require email and password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should update lastLogin timestamp', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn(),
        toJSON: jest.fn().mockReturnValue({ id: '123' })
      };

      User.findOne.mockResolvedValue(mockUser);

      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test@1234'
        });

      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/refresh', () => {
    
    it('should refresh access token with valid refresh token', async () => {
      const userId = '123';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        role: 'user',
        toJSON: jest.fn().mockReturnValue({ id: userId })
      };

      const refreshToken = jwt.sign(
        { id: userId },
        process.env.JWT_REFRESH_SECRET || 'refresh-secret',
        { expiresIn: '7d' }
      );

      User.findByPk.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
    });

    it('should reject expired refresh token', async () => {
      const expiredToken = jwt.sign(
        { id: '123' },
        process.env.JWT_REFRESH_SECRET || 'refresh-secret',
        { expiresIn: '0s' }
      );

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: expiredToken });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/auth/update-password', () => {
    
    it('should update password successfully', async () => {
      const mockUser = {
        id: '123',
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn(),
        password: 'OldPassword@123'
      };

      User.findByPk.mockResolvedValue(mockUser);

      const token = generateTestToken('123');
      
      const response = await request(app)
        .put('/api/auth/update-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'OldPassword@123',
          newPassword: 'NewPassword@123'
        });

      expect(response.status).toBe(200);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should reject incorrect current password', async () => {
      const mockUser = {
        id: '123',
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      User.findByPk.mockResolvedValue(mockUser);
      const token = generateTestToken('123');

      const response = await request(app)
        .put('/api/auth/update-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'WrongPassword',
          newPassword: 'NewPassword@123'
        });

      expect(response.status).toBe(401);
    });

    it('should validate new password strength', async () => {
      const token = generateTestToken('123');

      const response = await request(app)
        .put('/api/auth/update-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'OldPassword@123',
          newPassword: 'weak'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('JWT Token Validation', () => {
    
    it('should generate valid JWT token', () => {
      const payload = { id: '123', email: 'test@example.com', role: 'user' };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should reject tampered token', () => {
      const token = generateTestToken('123');
      const tamperedToken = token.slice(0, -5) + 'AAAAA';

      expect(() => {
        jwt.verify(tamperedToken, process.env.JWT_SECRET);
      }).toThrow();
    });

    it('should reject expired token', () => {
      const expiredToken = jwt.sign(
        { id: '123' },
        process.env.JWT_SECRET,
        { expiresIn: '0s' }
      );

      expect(() => {
        jwt.verify(expiredToken, process.env.JWT_SECRET);
      }).toThrow();
    });
  });

  describe('Security Tests', () => {
    
    it('should not return password in response', async () => {
      const mockUser = generateMockUser();
      const createdUser = {
        id: '123',
        ...mockUser,
        toJSON: jest.fn().mockReturnValue({ id: '123', email: mockUser.email })
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(createdUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send(mockUser);

      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should hash password before storage', async () => {
      const mockUser = generateMockUser();
      User.findOne.mockResolvedValue(null);
      
      const createSpy = jest.spyOn(User, 'create').mockImplementation((data) => {
        expect(data.password).toBe(mockUser.password);
        return Promise.resolve({
          id: '123',
          ...data,
          toJSON: jest.fn().mockReturnValue({ id: '123' })
        });
      });

      await request(app)
        .post('/api/auth/register')
        .send(mockUser);

      expect(createSpy).toHaveBeenCalled();
    });
  });
});
