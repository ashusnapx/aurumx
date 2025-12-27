-- Seed Data for AurumX Reward Catalog
-- This script initializes the reward categories and reward items
-- All values are configurable - modify points cost as needed without code changes

-- Clear existing data (for development/testing)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE redemption_item;
TRUNCATE TABLE redemption_history;
TRUNCATE TABLE cart_item;
TRUNCATE TABLE reward_item;
TRUNCATE TABLE reward_category;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert Reward Categories
INSERT INTO reward_category (name, description, display_order) VALUES
('Gift Cards', 'Digital and physical gift cards for popular services', 1),
('Travel & Holidays', 'Exciting travel packages and holiday destinations', 2),
('Shopping & Electronics', 'Latest gadgets and electronic accessories', 3),
('Dining & Lifestyle', 'Dining experiences and lifestyle vouchers', 4),
('Health & Fitness', 'Health, fitness, and wellness rewards', 5),
('Learning & Subscriptions', 'Online courses, subscriptions, and learning platforms', 6);

-- Insert Reward Items

-- Category 1: Gift Cards
INSERT INTO reward_item (category_id, name, description, points_cost, available) VALUES
((SELECT id FROM reward_category WHERE name = 'Gift Cards'), 'Google Play', 'Google Play gift card worth ₹1000', 5000, true),
((SELECT id FROM reward_category WHERE name = 'Gift Cards'), 'Apple', 'Apple App Store & iTunes gift card worth ₹1200', 6000, true),
((SELECT id FROM reward_category WHERE name = 'Gift Cards'), 'Amazon', 'Amazon shopping voucher worth ₹900', 4500, true),
((SELECT id FROM reward_category WHERE name = 'Gift Cards'), 'Flipkart', 'Flipkart e-gift voucher worth ₹900', 4500, true),
((SELECT id FROM reward_category WHERE name = 'Gift Cards'), 'Swiggy', 'Swiggy food delivery voucher worth ₹700', 3500, true),
((SELECT id FROM reward_category WHERE name = 'Gift Cards'), 'Zomato', 'Zomato dining and delivery voucher worth ₹700', 3500, true);

-- Category 2: Travel & Holidays
INSERT INTO reward_item (category_id, name, description, points_cost, available) VALUES
((SELECT id FROM reward_category WHERE name = 'Travel & Holidays'), 'Manali', '3 nights 4 days Manali holiday package for 2', 40000, true),
((SELECT id FROM reward_category WHERE name = 'Travel & Holidays'), 'Kanyakumari', '2 nights 3 days Kanyakumari temple tour for 2', 30000, true),
((SELECT id FROM reward_category WHERE name = 'Travel & Holidays'), 'Goa', '4 nights 5 days Goa beach resort package for 2', 45000, true),
((SELECT id FROM reward_category WHERE name = 'Travel & Holidays'), 'Jaipur', '2 nights 3 days Jaipur heritage tour for 2', 28000, true),
((SELECT id FROM reward_category WHERE name = 'Travel & Holidays'), 'Ooty', '3 nights 4 days Ooty hill station package for 2', 38000, true);

-- Category 3: Shopping & Electronics
INSERT INTO reward_item (category_id, name, description, points_cost, available) VALUES
((SELECT id FROM reward_category WHERE name = 'Shopping & Electronics'), 'Bluetooth Headphones', 'Premium wireless Bluetooth headphones', 12000, true),
((SELECT id FROM reward_category WHERE name = 'Shopping & Electronics'), 'Smart Watch', 'Fitness tracking smart watch with heart rate monitor', 18000, true),
((SELECT id FROM reward_category WHERE name = 'Shopping & Electronics'), 'Wireless Earbuds', 'True wireless earbuds with noise cancellation', 15000, true),
((SELECT id FROM reward_category WHERE name = 'Shopping & Electronics'), 'Smartphone Voucher', 'Voucher worth ₹4400 towards smartphone purchase', 22000, true),
((SELECT id FROM reward_category WHERE name = 'Shopping & Electronics'), 'Laptop Bag', 'Premium laptop backpack with multiple compartments', 6000, true);

-- Category 4: Dining & Lifestyle
INSERT INTO reward_item (category_id, name, description, points_cost, available) VALUES
((SELECT id FROM reward_category WHERE name = 'Dining & Lifestyle'), 'Dinner for Two', 'Fine dining experience for two at premium restaurant', 8000, true),
((SELECT id FROM reward_category WHERE name = 'Dining & Lifestyle'), 'Café Voucher', 'Coffee shop voucher worth ₹800', 4000, true),
((SELECT id FROM reward_category WHERE name = 'Dining & Lifestyle'), 'Movie Tickets', 'Premium cinema tickets for 2 with popcorn combo', 5000, true),
((SELECT id FROM reward_category WHERE name = 'Dining & Lifestyle'), 'Spa Voucher', 'Relaxing spa session with massage therapy', 10000, true);

-- Category 5: Health & Fitness
INSERT INTO reward_item (category_id, name, description, points_cost, available) VALUES
((SELECT id FROM reward_category WHERE name = 'Health & Fitness'), 'Gym Membership', '3-month gym membership at premium fitness center', 20000, true),
((SELECT id FROM reward_category WHERE name = 'Health & Fitness'), 'Yoga Classes', '1-month unlimited yoga classes', 7000, true),
((SELECT id FROM reward_category WHERE name = 'Health & Fitness'), 'Fitness Band', 'Activity tracker fitness band with step counter', 9000, true),
((SELECT id FROM reward_category WHERE name = 'Health & Fitness'), 'Nutrition Consultation', 'Personalized diet plan with nutritionist consultation', 6000, true);

-- Category 6: Learning & Subscriptions
INSERT INTO reward_item (category_id, name, description, points_cost, available) VALUES
((SELECT id FROM reward_category WHERE name = 'Learning & Subscriptions'), 'Online Course', 'Access to premium online course on any platform', 10000, true),
((SELECT id FROM reward_category WHERE name = 'Learning & Subscriptions'), 'E-Book', 'E-book voucher for any book of your choice', 5000, true),
((SELECT id FROM reward_category WHERE name = 'Learning & Subscriptions'), 'Coding Platform', '6-month subscription to coding learning platform', 12000, true),
((SELECT id FROM reward_category WHERE name = 'Learning & Subscriptions'), 'Music Subscription', '6-month premium music streaming subscription', 4000, true);

-- Verification query to check inserted data
SELECT 
    rc.name AS category, 
    COUNT(ri.id) AS item_count
FROM reward_category rc
LEFT JOIN reward_item ri ON rc.id = ri.category_id
GROUP BY rc.name
ORDER BY rc.display_order;
