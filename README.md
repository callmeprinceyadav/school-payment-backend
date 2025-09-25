# School Payment API

A microservice for managing school payments and transactions with integrated payment gateway support.

## Features :-

- JWT-based authentication system
- Payment gateway integration with Edviron
- Webhook handling for payment status updates
- Transaction management and reporting
- MongoDB with aggregation pipelines
- Pagination and sorting support
- Comprehensive error handling
- API logging and monitoring

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Gateway**: Edviron Payment API
- **Validation**: Joi
- **Security**: CORS, bcryptjs

## Project Structure

```
school-payment-api/
├── models/
│   ├── User.js           # User authentication model
│   ├── Order.js          # Order information model
│   ├── OrderStatus.js    # Payment transaction status
│   └── WebhookLog.js     # Webhook logging model
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── payment.js        # Payment creation and webhook
│   └── transactions.js   # Transaction management
├── middleware/
│   └── auth.js           # JWT authentication middleware
├── scripts/
│   └── seedData.js       # Database seeding script
├── server.js             # Main application file
├── package.json          # Dependencies and scripts
├── .env                  # Environment configuration
└── README.md             # Project documentation
```

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd school-payment-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.mongodb.net/school-payment-db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Payment Gateway Configuration
PAYMENT_API_URL=https://dev-vanilla.edviron.com/erp
PAYMENT_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVlSWQiOiI2NWIwZTU1MmRkMzE5NTBhOWI0MWM1YmEiLCJJbmRleE9mQXBpS2V5Ijo2fQ.IJWTYCOurGCFdRM2xyKtw6TEcuwXxGnmINrXFfsAdt0
PG_KEY=edvtest01
SCHOOL_ID=65b0e6293e9f76a9694d84b4

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. Database Setup

Replace the MongoDB URI with your MongoDB Atlas connection string:

1. Go to MongoDB Atlas
2. Create a new cluster (if not exists)
3. Get the connection string
4. Replace `your-username` and `your-password` with your credentials

### 5. Seed Database (Optional)

To populate the database with test data:

```bash
node scripts/seedData.js
```

This creates a test user:
- **Email**: test@example.com
- **Password**: password123

### 6. Start the Server

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### 1. Authentication

##### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

##### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### 2. Payment Management

##### Create Payment
```http
POST /api/create-payment
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "amount": 1500,
  "student_info": {
    "name": "John Doe",
    "id": "STU001",
    "email": "student@example.com"
  },
  "callback_url": "https://yoursite.com/callback"
}
```

**Response:**
```json
{
  "message": "Payment request created successfully",
  "order_id": "order-id",
  "custom_order_id": "ORD_1234567890_abc12",
  "payment_data": {
    "collect_request_id": "6808bc4888e4e3c149e757f1",
    "Collect_request_url": "payment-url",
    "sign": "jwt-token"
  },
  "redirect_url": "payment-gateway-url"
}
```

##### Webhook (Payment Status Update)
```http
POST /api/webhook
Content-Type: application/json

{
  "status": 200,
  "order_info": {
    "order_id": "order-id",
    "order_amount": 2000,
    "transaction_amount": 2200,
    "gateway": "PhonePe",
    "bank_reference": "YESBNK222",
    "status": "success",
    "payment_mode": "upi",
    "payemnt_details": "success@ybl",
    "Payment_message": "payment success",
    "payment_time": "2025-04-23T08:14:21.945+00:00",
    "error_message": "NA"
  }
}
```

#### 3. Transaction Management

##### Get All Transactions
```http
GET /api/transactions?page=1&limit=10&sort=payment_time&order=desc
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Records per page (default: 10)
- `sort`: Sort field (default: payment_time)
- `order`: Sort order - asc/desc (default: desc)

##### Get Transactions by School
```http
GET /api/transactions/school/{schoolId}?page=1&limit=10
Authorization: Bearer <jwt-token>
```

##### Get Transaction Status
```http
GET /api/transaction-status/{custom_order_id}
Authorization: Bearer <jwt-token>
```

**Response Example:**
```json
{
  "message": "Transaction status retrieved successfully",
  "transaction": {
    "collect_id": "order-id",
    "custom_order_id": "ORD_1234567890_abc12",
    "school_id": "65b0e6293e9f76a9694d84b4",
    "student_info": {
      "name": "John Doe",
      "id": "STU001",
      "email": "student@example.com"
    },
    "gateway": "Edviron Payment Gateway",
    "order_amount": 1500,
    "transaction_amount": 1500,
    "status": "success",
    "payment_mode": "upi",
    "payment_details": "success@upi",
    "bank_reference": "REF12345",
    "payment_message": "Payment success",
    "error_message": "",
    "payment_time": "2025-09-24T05:30:00.000Z"
  }
}
```

### Health Check
```http
GET /health
```

## Database Schema

### User Schema
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['admin', 'user'])
}
```

### Order Schema
```javascript
{
  school_id: String (required, indexed),
  trustee_id: String (required),
  student_info: {
    name: String (required),
    id: String (required),
    email: String (required)
  },
  gateway_name: String (required),
  custom_order_id: String (unique, auto-generated, indexed)
}
```

### OrderStatus Schema
```javascript
{
  collect_id: ObjectId (ref: Order, required, indexed),
  order_amount: Number (required),
  transaction_amount: Number (required),
  payment_mode: String,
  payment_details: String,
  bank_reference: String,
  payment_message: String,
  status: String (enum: ['pending', 'success', 'failed', 'cancelled'], indexed),
  error_message: String,
  payment_time: Date (default: now)
}
```

### WebhookLog Schema
```javascript
{
  webhook_id: String (unique, auto-generated),
  status: Number (required),
  order_info: Object,
  processed: Boolean (default: false),
  raw_payload: Object (required)
}
```

## Testing with Postman

### 1. Import Environment Variables
Create a Postman environment with:
- `base_url`: `http://localhost:3000/api`
- `jwt_token`: (will be set after login)

### 2. Test Flow

1. **Register/Login** → Get JWT token
2. **Create Payment** → Get payment URL and order details
3. **Simulate Webhook** → Test payment status update
4. **Get Transactions** → Verify data aggregation
5. **Check Transaction Status** → Verify specific transaction

### Sample Webhook Test Data
```json
{
  "status": 200,
  "order_info": {
    "order_id": "your-order-id-here",
    "order_amount": 1500,
    "transaction_amount": 1500,
    "gateway": "Test Gateway",
    "bank_reference": "TEST123",
    "status": "success",
    "payment_mode": "upi",
    "payemnt_details": "test@upi",
    "Payment_message": "Payment successful",
    "payment_time": "2025-09-24T05:30:00.000Z",
    "error_message": ""
  }
}
```

## Payment Gateway Integration

The API integrates with Edviron's payment gateway using JWT-signed requests. The flow is:

1. Client requests payment creation
2. Server creates order in database
3. Server signs payment data with PG_KEY
4. Server calls Edviron API to get payment URL
5. Client is redirected to payment gateway
6. Gateway sends webhook on payment completion
7. Server updates order status based on webhook

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Request validation with Joi
- MongoDB injection prevention
- Environment variable security

## Performance Optimizations

- Database indexing on frequently queried fields
- MongoDB aggregation pipelines for efficient joins
- Pagination for large datasets
- Connection pooling with Mongoose

## Error Handling

The API provides consistent error responses:

```json
{
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request / Validation Error
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

## Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
```

### Deployment Platforms
- Heroku
- AWS EC2
- DigitalOcean
- Railway
- Render

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation

---

**Note**: This is a test environment. Use the provided test credentials for Cashfree payment gateway testing.#