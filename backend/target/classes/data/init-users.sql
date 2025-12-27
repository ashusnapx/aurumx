-- Default CES Users for AurumX
-- Password for both users: "password123"
-- Plain text for temporary dev access (matching NoOpPasswordEncoder)

-- Insert Admin CES User
INSERT IGNORE INTO ces_user (username, password, role, active, created_at) VALUES
('admin', 'password123', 'ROLE_ADMIN_CES', true, NOW());

-- Insert Regular CES User
INSERT IGNORE INTO ces_user (username, password, role, active, created_at) VALUES
('cesuser', 'password123', 'ROLE_CES_USER', true, NOW());
