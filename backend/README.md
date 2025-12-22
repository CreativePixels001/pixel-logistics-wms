# Pixel Logistics WMS - Backend API

## Overview
RESTful API backend for Pixel Logistics Warehouse Management System built with Node.js, Express, and PostgreSQL.

## Tech Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston, Morgan

## Project Structure
```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
├── database/
│   ├── migrations/      # DB migrations
│   └── seeds/           # Seed data
├── logs/                # Application logs
├── uploads/             # File uploads
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd "Pixel WMS/backend"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Create PostgreSQL database**
   ```bash
   createdb pixel_logistics_wms
   ```

5. **Run migrations**
   ```bash
   npm run migrate
   ```

6. **Seed database (optional)**
   ```bash
   npm run seed
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## API Documentation

Once the server is running, access the interactive API documentation at:
- **Swagger UI**: http://localhost:5000/api-docs

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm test` - Run tests
- `npm run lint` - Lint code

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user

### Inventory
- `GET /api/v1/inventory` - Get all inventory items
- `POST /api/v1/inventory` - Create inventory item
- `GET /api/v1/inventory/:id` - Get specific item
- `PUT /api/v1/inventory/:id` - Update item
- `DELETE /api/v1/inventory/:id` - Delete item

### Orders
- `GET /api/v1/orders` - Get all orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders/:id` - Get specific order
- `PUT /api/v1/orders/:id` - Update order
- `DELETE /api/v1/orders/:id` - Cancel order

### Receiving
- `GET /api/v1/receiving` - Get all receipts
- `POST /api/v1/receiving` - Create receipt
- `GET /api/v1/receiving/:id` - Get specific receipt
- `PUT /api/v1/receiving/:id` - Update receipt

### Shipping
- `GET /api/v1/shipping` - Get all shipments
- `POST /api/v1/shipping` - Create shipment
- `GET /api/v1/shipping/:id` - Get specific shipment
- `PUT /api/v1/shipping/:id` - Update shipment

### Yard Management
- `GET /api/v1/yard` - Get all trailers
- `POST /api/v1/yard/checkin` - Check-in trailer
- `POST /api/v1/yard/checkout` - Check-out trailer
- `PUT /api/v1/yard/:id/move` - Move trailer

### Users
- `GET /api/v1/users` - Get all users (admin)
- `POST /api/v1/users` - Create user (admin)
- `GET /api/v1/users/:id` - Get specific user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user (admin)

## WebSocket Events

### Connect to WebSocket
```javascript
const socket = io('http://localhost:5001');
```

### Events
- `inventory:update` - Inventory level changed
- `order:created` - New order created
- `shipment:update` - Shipment status updated
- `notification` - General notification
- `yard:update` - Yard status changed

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection prevention
- XSS protection

## Database Schema

See `database/migrations/` for complete schema definition.

## Environment Variables

See `.env.example` for all available configuration options.

## Development

### Code Style
- ESLint with Airbnb config
- Prettier for formatting
- Follow REST API best practices

### Testing
```bash
npm test
```

## Deployment

### Production Build
1. Set `NODE_ENV=production`
2. Update `.env` with production values
3. Run migrations on production DB
4. Start with `npm start`

### Docker (Optional)
```bash
docker build -t pixel-logistics-wms-api .
docker run -p 5000:5000 pixel-logistics-wms-api
```

## Monitoring

- Application logs: `logs/app.log`
- Error logs: `logs/error.log`
- Metrics endpoint: `http://localhost:9090/metrics`

## Support

For issues and questions, please open an issue in the repository.

## License

MIT License - see LICENSE file for details
