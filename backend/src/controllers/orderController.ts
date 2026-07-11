import { Request, Response } from 'express';
import { getPool } from '../config/database';

// Generate order number
const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

// Create order from cart (Multi-Vendor)
export const createOrder = async (req: Request, res: Response) => {
  const connection = await getPool().getConnection();
  
  try {
    await connection.beginTransaction();

    const userId = (req as any).user.id;
    const { deliveryAddress, paymentMethod = 'cash', deliveryInstructions } = req.body;

    // Get cart items grouped by restaurant
    const [cartItems]: any = await connection.query(
      `SELECT c.*, mi.price, mi.name, r.name as restaurant_name, r.delivery_fee
       FROM cart c
       JOIN menu_items mi ON c.menu_item_id = mi.id
       JOIN restaurants r ON c.restaurant_id = r.id
       WHERE c.user_id = ?`,
      [userId]
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Group items by restaurant
    const vendorGroups = cartItems.reduce((acc: any, item: any) => {
      if (!acc[item.restaurant_id]) {
        acc[item.restaurant_id] = {
          restaurant_id: item.restaurant_id,
          restaurant_name: item.restaurant_name,
          delivery_fee: item.delivery_fee || 0,
          items: [],
          subtotal: 0
        };
      }
      acc[item.restaurant_id].items.push(item);
      acc[item.restaurant_id].subtotal += item.price * item.quantity;
      return acc;
    }, {});

    // Calculate totals
    let subtotal = 0;
    let deliveryFeeTotal = 0;
    let taxAmount = 0;

    for (const vendorId in vendorGroups) {
      const group = vendorGroups[vendorId];
      subtotal += group.subtotal;
      deliveryFeeTotal += group.delivery_fee || 0;
    }

    taxAmount = subtotal * 0.08; // 8% tax
    const totalAmount = subtotal + taxAmount + deliveryFeeTotal;
    const finalAmount = totalAmount; // After discounts (none for now)

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create master order
    const [orderResult]: any = await connection.query(
      `INSERT INTO orders (
        order_number, user_id, total_amount, subtotal_amount, tax_amount,
        delivery_fee_total, discount_amount, final_amount, delivery_address,
        payment_method, delivery_instructions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber, userId, totalAmount, subtotal, taxAmount,
        deliveryFeeTotal, 0, finalAmount, deliveryAddress,
        paymentMethod, deliveryInstructions || null
      ]
    );

    const orderId = orderResult.insertId;

    // Create order items for each restaurant
    const orderItems = [];
    for (const vendorId in vendorGroups) {
      const group = vendorGroups[vendorId];
      
      for (const item of group.items) {
        const itemSubtotal = item.price * item.quantity;
        const itemTax = itemSubtotal * 0.08;
        const itemTotal = itemSubtotal + itemTax;

        const [itemResult]: any = await connection.query(
          `INSERT INTO order_items (
            order_id, restaurant_id, menu_item_id, menu_item_name,
            quantity, price_per_item, subtotal, tax_amount,
            total_amount, special_instructions
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId, item.restaurant_id, item.menu_item_id, item.name,
            item.quantity, item.price, itemSubtotal, itemTax,
            itemTotal, item.special_instructions || null
          ]
        );

        orderItems.push({
          id: itemResult.insertId,
          restaurant_id: item.restaurant_id,
          restaurant_name: item.restaurant_name,
          menu_item_id: item.menu_item_id,
          item_name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: itemSubtotal,
          total: itemTotal
        });
      }
    }

    // Clear the cart
    await connection.query('DELETE FROM cart WHERE user_id = ?', [userId]);

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Order created successfully with multiple vendors!',
      data: {
        order_id: orderId,
        order_number: orderNumber,
        total_amount: totalAmount,
        subtotal: subtotal,
        tax: taxAmount,
        delivery_fee: deliveryFeeTotal,
        final_amount: finalAmount,
        vendor_count: Object.keys(vendorGroups).length,
        vendors: vendorGroups,
        items: orderItems
      }
    });

  } catch (error: any) {
    await connection.rollback();
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Get user orders
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const [orders]: any = await getPool().query(
      `SELECT o.*, 
              COUNT(DISTINCT oi.restaurant_id) as vendor_count,
              GROUP_CONCAT(DISTINCT r.name) as vendor_names
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN restaurants r ON oi.restaurant_id = r.id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: orders
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get order details with vendor breakdown
export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // Get order
    const [orders]: any = await getPool().query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Get order items grouped by restaurant
    const [items]: any = await getPool().query(
      `SELECT oi.*, r.name as restaurant_name
       FROM order_items oi
       JOIN restaurants r ON oi.restaurant_id = r.id
       WHERE oi.order_id = ?`,
      [id]
    );

    // Group by restaurant
    const groupedItems = items.reduce((acc: any, item: any) => {
      if (!acc[item.restaurant_id]) {
        acc[item.restaurant_id] = {
          restaurant_id: item.restaurant_id,
          restaurant_name: item.restaurant_name,
          items: [],
          total: 0
        };
      }
      acc[item.restaurant_id].items.push(item);
      acc[item.restaurant_id].total += item.total_amount;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        order: orders[0],
        vendors: Object.values(groupedItems)
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await getPool().query(
      'UPDATE orders SET order_status = ? WHERE id = ?',
      [status, id]
    );

    res.json({
      success: true,
      message: 'Order status updated successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get vendor orders (for vendor dashboard)
export const getVendorOrders = async (req: Request, res: Response) => {
  try {
    const vendorId = (req as any).user.id;

    // Get vendor's restaurant
    const [restaurants]: any = await getPool().query(
      'SELECT id FROM restaurants WHERE vendor_id = ?',
      [vendorId]
    );

    if (restaurants.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    const restaurantIds = restaurants.map((r: any) => r.id);

    const [orders]: any = await getPool().query(
      `SELECT oi.*, o.order_number, o.user_id, o.delivery_address, o.created_at,
              u.full_name as customer_name
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       JOIN users u ON o.user_id = u.id
       WHERE oi.restaurant_id IN (?)
       ORDER BY o.created_at DESC`,
      [restaurantIds]
    );

    res.json({
      success: true,
      data: orders
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};