const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const Joi = require('joi');
const Order = require('../models/Order');
const OrderStatus = require('../models/OrderStatus');
const WebhookLog = require('../models/WebhookLog');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Validation schema for create payment
const createPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  student_info: Joi.object({
    name: Joi.string().required(),
    id: Joi.string().required(),
    email: Joi.string().email().required()
  }).required(),
  callback_url: Joi.string().uri().optional().default('https://google.com')
});

// Create Payment
router.post('/create-payment', authMiddleware, async (req, res) => {
  try {
    const { error } = createPaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { amount, student_info, callback_url = 'https://google.com' } = req.body;

    // Create order in database
    const order = new Order({
      school_id: process.env.SCHOOL_ID,
      trustee_id: req.user._id.toString(),
      student_info,
      gateway_name: 'Edviron Payment Gateway'
    });

    await order.save();

    // Create order status entry
    const orderStatus = new OrderStatus({
      collect_id: order._id,
      order_amount: amount,
      transaction_amount: amount,
      status: 'pending'
    });

    await orderStatus.save();

    // Prepare JWT payload for payment API
    const paymentPayload = {
      school_id: process.env.SCHOOL_ID,
      amount: amount.toString(),
      callback_url
    };

    // Sign the payload with PG_KEY
    const signedPayload = jwt.sign(paymentPayload, process.env.PG_KEY, { algorithm: 'HS256' });

    // Prepare request for payment API
    const paymentRequest = {
      school_id: process.env.SCHOOL_ID,
      amount: amount.toString(),
      callback_url,
      sign: signedPayload
    };

    // Call payment API
    const response = await axios.post(
      `${process.env.PAYMENT_API_URL}/create-collect-request`,
      paymentRequest,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PAYMENT_API_KEY}`
        }
      }
    );

    res.json({
      message: 'Payment request created successfully',
      order_id: order._id,
      custom_order_id: order.custom_order_id,
      payment_data: response.data,
      redirect_url: response.data.Collect_request_url
    });

  } catch (error) {
    console.error('Payment creation error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Failed to create payment request', 
      error: error.response?.data || error.message 
    });
  }
});

// Webhook endpoint
router.post('/webhook', async (req, res) => {
  try {
    console.log('Webhook received:', req.body);

    // Log webhook data
    const webhookLog = new WebhookLog({
      status: req.body.status,
      order_info: req.body.order_info,
      raw_payload: req.body
    });

    await webhookLog.save();

    if (req.body.status === 200 && req.body.order_info) {
      const { order_info } = req.body;
      
      // Find order by collect_id (assuming order_id in webhook corresponds to our order ID)
      const order = await Order.findById(order_info.order_id);
      
      if (order) {
        // Update order status
        await OrderStatus.findOneAndUpdate(
          { collect_id: order._id },
          {
            order_amount: order_info.order_amount,
            transaction_amount: order_info.transaction_amount,
            payment_mode: order_info.payment_mode,
            payment_details: order_info.payemnt_details || order_info.payment_details,
            bank_reference: order_info.bank_reference,
            payment_message: order_info.Payment_message || order_info.payment_message,
            status: order_info.status,
            error_message: order_info.error_message,
            payment_time: new Date(order_info.payment_time)
          },
          { new: true }
        );

        // Mark webhook as processed
        webhookLog.processed = true;
        await webhookLog.save();

        console.log('Order status updated successfully');
      } else {
        console.log('Order not found for ID:', order_info.order_id);
      }
    }

    res.status(200).json({ message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ message: 'Webhook processing failed', error: error.message });
  }
});

module.exports = router;