-- Default CES Users for AurumX
-- Password for both users: "password123"
-- BCrypt encrypted with strength 10

-- Insert Admin CES User
-- Username: admin, Password: password123
INSERT INTO ces_user (username, password, role, active, created_at) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZq2Le5v972GrdeNGXN6q0zLnB3Bm1xDdGBqm', 'ROLE_ADMIN_CES', true, NOW());

-- Insert Regular CES User
-- Username: cesuser, Password: password123
INSERT INTO ces_user (username, password, role, active, created_at) VALUES
('cesuser', '$2a$10$N9qo8uLOickgx2ZMRZq2Le5v972GrdeNGXN6q0zLnB3Bm1xDdGBqm', 'ROLE_CES_USER', true, NOW());
