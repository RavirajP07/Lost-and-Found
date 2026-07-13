-- CampusConnect Database Schema
-- Normalization: 3NF

CREATE DATABASE IF NOT EXISTS campus_connect;
USE campus_connect;

-- 1. Users Table (Students)
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    roll_number VARCHAR(20) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Admins Table
CREATE TABLE IF NOT EXISTS Admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS Categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Items Table
CREATE TABLE IF NOT EXISTS Items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category_id INT NOT NULL,
    type ENUM('lost', 'found') NOT NULL,
    location VARCHAR(100) NOT NULL,
    date_reported DATE NOT NULL,
    status ENUM('active', 'claimed', 'resolved') NOT NULL DEFAULT 'active',
    user_id INT NULL,
    admin_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (admin_id) REFERENCES Admins(admin_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. ItemImages Table
CREATE TABLE IF NOT EXISTS ItemImages (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Claims Table
CREATE TABLE IF NOT EXISTS Claims (
    claim_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    user_id INT NOT NULL,
    description TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    admin_id INT NULL,
    admin_remarks TEXT NULL,
    claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES Admins(admin_id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_item_claim (user_id, item_id)
) ENGINE=InnoDB;

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS Notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    admin_id INT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES Admins(admin_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. ActivityLogs Table
CREATE TABLE IF NOT EXISTS ActivityLogs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_type ENUM('student', 'admin', 'system') NOT NULL,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Indexes for performance optimization
CREATE INDEX idx_items_name ON Items(name);
CREATE INDEX idx_items_status ON Items(status);
CREATE INDEX idx_items_type ON Items(type);
CREATE INDEX idx_claims_status ON Claims(status);

-- ----------------------------------------------------------------------
-- VIEWS
-- ----------------------------------------------------------------------

-- View for detailed Item view
CREATE OR REPLACE VIEW vw_item_details AS
SELECT 
    i.item_id,
    i.name AS item_name,
    i.description,
    i.type,
    i.location,
    i.date_reported,
    i.status AS item_status,
    i.created_at,
    c.category_id,
    c.name AS category_name,
    i.user_id AS reporter_user_id,
    u.username AS reporter_username,
    u.email AS reporter_email,
    i.admin_id AS reporter_admin_id,
    a.username AS reporter_admin_username,
    (SELECT img.image_path FROM ItemImages img WHERE img.item_id = i.item_id LIMIT 1) AS primary_image_path
FROM Items i
JOIN Categories c ON i.category_id = c.category_id
LEFT JOIN Users u ON i.user_id = u.user_id
LEFT JOIN Admins a ON i.admin_id = a.admin_id;

-- View for detailed Claim view
CREATE OR REPLACE VIEW vw_claim_details AS
SELECT
    cl.claim_id,
    cl.item_id,
    i.name AS item_name,
    i.status AS item_status,
    cl.user_id AS claimant_user_id,
    u.username AS claimant_username,
    u.email AS claimant_email,
    cl.description AS claim_proof,
    cl.status AS claim_status,
    cl.admin_id AS reviewer_admin_id,
    a.username AS reviewer_username,
    cl.admin_remarks,
    cl.claimed_at,
    cl.updated_at
FROM Claims cl
JOIN Items i ON cl.item_id = i.item_id
JOIN Users u ON cl.user_id = u.user_id
LEFT JOIN Admins a ON cl.admin_id = a.admin_id;
