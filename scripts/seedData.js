const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('../models/Order');
const OrderStatus = require('../models/OrderStatus');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedData() {
  try {
    console.log('Starting data seeding...');

    // Clear existing data
    await Order.deleteMany({});
    await OrderStatus.deleteMany({});
    await User.deleteMany({});

    // Create a test user
    const testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'admin'
    });
    await testUser.save();
    console.log('Test user created');

    // Create dummy orders
    const orders = [];
    const orderStatuses = [];

    for (let i = 1; i <= 10; i++) {
      const order = new Order({
        school_id: process.env.SCHOOL_ID || '65b0e6293e9f76a9694d84b4',
        trustee_id: testUser._id.toString(),
        student_info: {
          name: `Student ${i}`,
          id: `STU00${i}`,
          email: `student${i}@school.com`
        },
        gateway_name: 'Edviron Payment Gateway'
      });

      await order.save();
      orders.push(order);

      // Create corresponding order status
      const orderStatus = new OrderStatus({
        collect_id: order._id,
        order_amount: 1000 + (i * 100),
        transaction_amount: 1000 + (i * 100),
        payment_mode: i % 2 === 0 ? 'upi' : 'netbanking',
        payment_details: i % 2 === 0 ? 'success@upi' : 'HDFC Bank',
        bank_reference: `REF${1000 + i}`,
        payment_message: i % 3 === 0 ? 'Payment failed' : 'Payment success',
        status: i % 3 === 0 ? 'failed' : 'success',
        error_message: i % 3 === 0 ? 'Insufficient balance' : '',
        payment_time: new Date(Date.now() - (i * 24 * 60 * 60 * 1000))
      });

      await orderStatus.save();
      orderStatuses.push(orderStatus);
    }

    console.log(`Created ${orders.length} orders and ${orderStatuses.length} order statuses`);
    console.log('Data seeding completed successfully!');
    
    console.log('\nTest credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedData();