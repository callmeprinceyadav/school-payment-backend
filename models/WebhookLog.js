const mongoose = require('mongoose');

const webhookLogSchema = new mongoose.Schema({
  webhook_id: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: Number,
    required: true
  },
  order_info: {
    order_id: String,
    order_amount: Number,
    transaction_amount: Number,
    gateway: String,
    bank_reference: String,
    status: String,
    payment_mode: String,
    payment_details: String,
    payment_message: String,
    payment_time: Date,
    error_message: String
  },
  processed: {
    type: Boolean,
    default: false
  },
  raw_payload: {
    type: Object,
    required: true
  }
}, {
  timestamps: true
});

// Generate webhook id before saving
webhookLogSchema.pre('save', function(next) {
  if (!this.webhook_id) {
    this.webhook_id = 'WH_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  }
  next();
});

module.exports = mongoose.model('WebhookLog', webhookLogSchema);