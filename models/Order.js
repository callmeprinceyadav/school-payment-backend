const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  school_id: {
    type: String,
    required: true,
    index: true
  },
  trustee_id: {
    type: String,
    required: true
  },
  student_info: {
    name: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  gateway_name: {
    type: String,
    required: true
  },
  custom_order_id: {
    type: String,
    unique: true,
    index: true
  }
}, {
  timestamps: true
});

// Generate custom order id before saving
orderSchema.pre('save', function(next) {
  if (!this.custom_order_id) {
    this.custom_order_id = 'ORD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);