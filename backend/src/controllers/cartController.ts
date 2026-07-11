import { Request, Response } from 'express';
import { getPool } from '../config/database';

// Add item to cart
export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { restaurantId, menuItemId, quantity, specialInstructions } = req.body;

    // Check if item exists
    const [menuItems]: any = await getPool().query(
      'SELECT * FROM menu_items WHERE id = ? AND is_available = true',
      [menuItemId]
    );

    if (menuItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found or unavailable'
      });
    }

    // Check if item already in cart
    const [existing]: any = await getPool().query(
      'SELECT * FROM cart WHERE user_id = ? AND menu_item_id = ?',
      [userId, menuItemId]
    );

    if (existing.length > 0) {
      await getPool().query(
        'UPDATE cart SET quantity = quantity + ? WHERE id = ?',
        [quantity || 1, existing[0].id]
      );
    } else {
      await getPool().query(
        `INSERT INTO cart (user_id, restaurant_id, menu_item_id, quantity, special_instructions)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, restaurantId, menuItemId, quantity || 1, specialInstructions || null]
      );
    }

    res.json({
      success: true,
      message: 'Item added to cart'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get cart with vendor grouping
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const [items]: any = await getPool().query(
      `SELECT c.*, mi.name, mi.price, mi.image_url, r.name as restaurant_name
       FROM cart c
       JOIN menu_items mi ON c.menu_item_id = mi.id
       JOIN restaurants r ON c.restaurant_id = r.id
       WHERE c.user_id = ?`,
      [userId]
    );

    // Group by restaurant
    const grouped = items.reduce((acc: any, item: any) => {
      if (!acc[item.restaurant_id]) {
        acc[item.restaurant_id] = {
          restaurant_id: item.restaurant_id,
          restaurant_name: item.restaurant_name,
          items: [],
          subtotal: 0
        };
      }
      acc[item.restaurant_id].items.push(item);
      acc[item.restaurant_id].subtotal += item.price * item.quantity;
      return acc;
    }, {});

    const totalAmount = Object.values(grouped).reduce((sum: number, group: any) => sum + group.subtotal, 0);

    res.json({
      success: true,
      data: {
        items: Object.values(grouped),
        total_amount: totalAmount,
        item_count: items.reduce((sum: number, item: any) => sum + item.quantity, 0)
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update cart item quantity
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      await getPool().query(
        'DELETE FROM cart WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return res.json({
        success: true,
        message: 'Item removed from cart'
      });
    }

    await getPool().query(
      'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, id, userId]
    );

    res.json({
      success: true,
      message: 'Cart updated'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Remove item from cart
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    await getPool().query(
      'DELETE FROM cart WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Clear cart
export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    await getPool().query(
      'DELETE FROM cart WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};