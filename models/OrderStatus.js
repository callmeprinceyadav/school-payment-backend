const mongoose = require('mongoose');

const orderStatusSchema = new mongoose.Schema({
  collect_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  order_amount: {
    type: Number,
    required: true
  },
  transaction_amount: {
    type: Number,
    required: true
  },
  payment_mode: {
    type: String,
    default: ''
  },
  payment_details: {
    type: String,
    default: ''
  },
  bank_reference: {
    type: String,
    default: ''
  },
  payment_message: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  error_message: {
    type: String,
    default: ''
  },
  payment_time: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('OrderStatus', orderStatusSchema);