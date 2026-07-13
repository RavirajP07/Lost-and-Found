-- CampusConnect Sample Data
USE campus_connect;

-- Insert Categories
INSERT INTO Categories (name, description) VALUES
('Electronics', 'Phones, Laptops, Chargers, Headphones, and other electronic devices'),
('Books & Stationery', 'Textbooks, notebooks, binders, pens, pencil cases'),
('Clothing & Accessories', 'Jackets, hoodies, caps, bags, wallets, sunglasses'),
('Keys & Cards', 'ID cards, room keys, car keys, bus passes'),
('Others', 'Water bottles, umbrellas, sports equipment, and miscellaneous items')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- Insert Sample Admins (password is 'password123')
INSERT INTO Admins (username, email, password_hash) VALUES
('admin', 'admin@campusconnect.com', '$2a$10$uA39mG1f24mX9L.wN7Z4de1hQv9gG58/N8l3QvC06hG5t.Ew59gJ.')
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- Insert Sample Students (password is 'password123')
INSERT INTO Users (username, email, password_hash, roll_number, phone_number) VALUES
('alice_smith', 'alice@student.campus.edu', '$2a$10$uA39mG1f24mX9L.wN7Z4de1hQv9gG58/N8l3QvC06hG5t.Ew59gJ.', 'CS2023001', '9876543210'),
('bob_jones', 'bob@student.campus.edu', '$2a$10$uA39mG1f24mX9L.wN7Z4de1hQv9gG58/N8l3QvC06hG5t.Ew59gJ.', 'EC2023045', '8765432109'),
('charlie_brown', 'charlie@student.campus.edu', '$2a$10$uA39mG1f24mX9L.wN7Z4de1hQv9gG58/N8l3QvC06hG5t.Ew59gJ.', 'ME2023089', '7654321098')
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- Insert Sample Items
-- Reporter: Alice reports a lost key, Bob reports a found charger, Admin reports a found notebook
INSERT INTO Items (name, description, category_id, type, location, date_reported, status, user_id, admin_id) VALUES
('Keychain with 3 keys', 'A silver keyring with two house keys and a gym fob, attached to a red lanyard.', 4, 'lost', 'Central Library, 2nd Floor', '2026-07-01', 'active', 1, NULL),
('Dell Laptop Charger', 'Found a 65W Dell USB-C laptop charger plugged into the wall near the window.', 1, 'found', 'Science Block, Lab 102', '2026-07-05', 'active', 2, NULL),
('Calculus Textbook', 'A thick hardbound Stewart Calculus 8th edition textbook found left on the bench.', 2, 'found', 'Student Center Lounge', '2026-07-06', 'active', NULL, 1);

-- Insert Sample ItemImages
INSERT INTO ItemImages (item_id, image_path) VALUES
(2, 'uploads/dell_charger.jpg'),
(3, 'uploads/calculus_book.jpg');

-- Insert a Claim (Alice claims the calculus textbook reported by Admin)
INSERT INTO Claims (item_id, user_id, description, status) VALUES
(3, 1, 'This is my calculus textbook. It has a blue sticker on the back cover and my name written on the third page.', 'pending');
