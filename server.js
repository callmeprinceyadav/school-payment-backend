const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const transactionRoutes = require('./routes/transactions');


const app = express();

//  CORS setup (simple + secure)
app.use(cors({
  origin: [
    'http://localhost:5173',          
    'https://school-payment-frontend-beryl.vercel.app',
    'https://*.vercel.app',
    'https://school-payment-dashboard.vercel.app',
    'https://school-payment-4ikhwwinw-prince-yadavs-projects-5c61385e.vercel.app',
    'https://school-payment-1rpvostq5-prince-yadavs-projects-5c61385e.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Connect to MongoDB with optimized settings for Vercel
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // 5 seconds
  socketTimeoutMS: 45000, // 45 seconds
  maxPoolSize: 10, // Maintain up to 10 socket connections
  bufferCommands: false, // Disable mongoose buffering
  bufferMaxEntries: 0 // Disable mongoose buffering
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Create indexes for better performance
mongoose.connection.on('connected', async () => {
  try {
    const db = mongoose.connection.db;
    
    await db.collection('orders').createIndex({ school_id: 1 });
    await db.collection('orders').createIndex({ custom_order_id: 1 });
    await db.collection('orderstatuses').createIndex({ collect_id: 1 });
    await db.collection('orderstatuses').createIndex({ status: 1 });
    await db.collection('users').createIndex({ email: 1 });
    await db.collection('users').createIndex({ username: 1 });
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', paymentRoutes);
app.use('/api', transactionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'School Payment API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to School Payment API',
    version: '1.0.0',
    endpoints: {
      'Health Check': 'GET /health',
      'Register': 'POST /api/auth/register',
      'Login': 'POST /api/auth/login',
      'Create Payment': 'POST /api/create-payment',
      'Webhook': 'POST /api/webhook',
      'All Transactions': 'GET /api/transactions',
      'School Transactions': 'GET /api/transactions/school/:schoolId',
      'Transaction Status': 'GET /api/transaction-status/:custom_order_id'
    }
  });
});

// Error handling 
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});


app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API Documentation available at: http://localhost:${PORT}/`);
});

module.exports = app;
