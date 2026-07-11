USE multi_vendor_food_delivery;
UPDATE restaurants SET rating = 4.5 WHERE id = 1;
UPDATE restaurants SET rating = 4.3 WHERE id = 2;
SELECT id, name, rating FROM restaurants;