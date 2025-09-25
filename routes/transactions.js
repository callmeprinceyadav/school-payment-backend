const express = require('express');
const Order = require('../models/Order');
const OrderStatus = require('../models/OrderStatus');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all transactions with pagination and sorting
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Sorting parameters
    const sortField = req.query.sort || 'payment_time';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const sortObj = {};
    sortObj[sortField] = sortOrder;

    // MongoDB aggregation pipeline to join Order and OrderStatus
    const pipeline = [
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'status_info'
        }
      },
      {
        $unwind: {
          path: '$status_info',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          collect_id: '$_id',
          school_id: '$school_id',
          gateway: '$gateway_name',
          custom_order_id: '$custom_order_id',
          student_name: '$student_info.name',
          student_email: '$student_info.email',
          order_amount: '$status_info.order_amount',
          transaction_amount: '$status_info.transaction_amount',
          status: '$status_info.status',
          payment_mode: '$status_info.payment_mode',
          payment_time: '$status_info.payment_time',
          bank_reference: '$status_info.bank_reference'
        }
      },
      { $sort: sortObj },
      { $skip: skip },
      { $limit: limit }
    ];

    const transactions = await Order.aggregate(pipeline);
    
    // Get total count for pagination
    const totalPipeline = [
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'status_info'
        }
      },
      { $count: 'total' }
    ];
    
    const totalResult = await Order.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    res.json({
      transactions,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_records: total,
        limit
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
});

// Get transactions by school
router.get('/transactions/school/:schoolId', authMiddleware, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: { school_id: schoolId } },
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'status_info'
        }
      },
      {
        $unwind: {
          path: '$status_info',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          collect_id: '$_id',
          school_id: '$school_id',
          gateway: '$gateway_name',
          custom_order_id: '$custom_order_id',
          student_name: '$student_info.name',
          student_email: '$student_info.email',
          order_amount: '$status_info.order_amount',
          transaction_amount: '$status_info.transaction_amount',
          status: '$status_info.status',
          payment_mode: '$status_info.payment_mode',
          payment_time: '$status_info.payment_time'
        }
      },
      { $sort: { payment_time: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    const transactions = await Order.aggregate(pipeline);
    
    // Get total count
    const total = await Order.countDocuments({ school_id: schoolId });

    res.json({
      school_id: schoolId,
      transactions,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_records: total,
        limit
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching school transactions', error: error.message });
  }
});

// Get transaction status by custom order ID
router.get('/transaction-status/:custom_order_id', authMiddleware, async (req, res) => {
  try {
    const { custom_order_id } = req.params;

    const pipeline = [
      { $match: { custom_order_id } },
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'status_info'
        }
      },
      {
        $unwind: {
          path: '$status_info',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          collect_id: '$_id',
          custom_order_id: '$custom_order_id',
          school_id: '$school_id',
          student_info: '$student_info',
          gateway: '$gateway_name',
          order_amount: '$status_info.order_amount',
          transaction_amount: '$status_info.transaction_amount',
          status: '$status_info.status',
          payment_mode: '$status_info.payment_mode',
          payment_details: '$status_info.payment_details',
          bank_reference: '$status_info.bank_reference',
          payment_message: '$status_info.payment_message',
          error_message: '$status_info.error_message',
          payment_time: '$status_info.payment_time'
        }
      }
    ];

    const transaction = await Order.aggregate(pipeline);

    if (!transaction || transaction.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({
      message: 'Transaction status retrieved successfully',
      transaction: transaction[0]
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching transaction status', error: error.message });
  }
});

module.exports = router;