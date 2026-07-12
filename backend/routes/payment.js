const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Create payment order (Cash on Delivery only for now)
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount } = req.body;

    res.json({
      success: true,
      message: 'Order ready for cash on delivery',
      amount: amount,
      currency: 'INR'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;