-- CampusConnect Stored Procedures
USE campus_connect;

DROP PROCEDURE IF EXISTS sp_submit_claim;
DROP PROCEDURE IF EXISTS sp_process_claim;
DROP PROCEDURE IF EXISTS sp_get_admin_stats;

DELIMITER //

-- Procedure 1: Submit Claim
CREATE PROCEDURE sp_submit_claim(
    IN p_item_id INT,
    IN p_user_id INT,
    IN p_description TEXT
)
BEGIN
    DECLARE v_item_status VARCHAR(20);
    DECLARE v_item_type VARCHAR(20);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transaction failed: Could not submit claim.';
    END;

    START TRANSACTION;
    
    -- Check item status and type
    SELECT status, type INTO v_item_status, v_item_type FROM Items WHERE item_id = p_item_id;
    
    IF v_item_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Item not found.';
    ELSEIF v_item_status <> 'active' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Item is no longer active (already claimed or resolved).';
    ELSEIF v_item_type <> 'found' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Claims can only be submitted for found items.';
    END IF;

    -- Check if user already claimed this item
    IF EXISTS (SELECT 1 FROM Claims WHERE item_id = p_item_id AND user_id = p_user_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'You have already submitted a claim for this item.';
    END IF;

    -- Insert claim
    INSERT INTO Claims (item_id, user_id, description, status)
    VALUES (p_item_id, p_user_id, p_description, 'pending');

    COMMIT;
END//

-- Procedure 2: Process Claim (Transactional)
CREATE PROCEDURE sp_process_claim(
    IN p_claim_id INT,
    IN p_admin_id INT,
    IN p_status ENUM('approved', 'rejected'),
    IN p_remarks TEXT
)
BEGIN
    DECLARE v_item_id INT;
    DECLARE v_claim_status VARCHAR(20);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transaction failed: Could not process claim.';
    END;

    START TRANSACTION;

    -- Fetch claim status and item_id
    SELECT item_id, status INTO v_item_id, v_claim_status FROM Claims WHERE claim_id = p_claim_id;

    IF v_item_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Claim not found.';
    ELSEIF v_claim_status <> 'pending' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Claim has already been processed.';
    END IF;

    -- Update targeted claim
    UPDATE Claims 
    SET status = p_status, 
        admin_id = p_admin_id, 
        admin_remarks = p_remarks,
        updated_at = CURRENT_TIMESTAMP
    WHERE claim_id = p_claim_id;

    IF p_status = 'approved' THEN
        -- Mark item as claimed
        UPDATE Items 
        SET status = 'claimed' 
        WHERE item_id = v_item_id;

        -- Reject other pending claims for this item
        UPDATE Claims
        SET status = 'rejected',
            admin_id = p_admin_id,
            admin_remarks = 'Another claim for this item has been approved.',
            updated_at = CURRENT_TIMESTAMP
        WHERE item_id = v_item_id AND claim_id <> p_claim_id AND status = 'pending';
    END IF;

    COMMIT;
END//

-- Procedure 3: Get Category-wise and Claim Stats
CREATE PROCEDURE sp_get_admin_stats()
BEGIN
    -- Category wise item count (GROUP BY & HAVING example)
    SELECT c.name AS category_name, 
           COUNT(i.item_id) AS total_items,
           SUM(CASE WHEN i.type = 'lost' THEN 1 ELSE 0 END) AS lost_count,
           SUM(CASE WHEN i.type = 'found' THEN 1 ELSE 0 END) AS found_count
    FROM Categories c
    LEFT JOIN Items i ON c.category_id = i.category_id
    GROUP BY c.category_id, c.name
    HAVING total_items >= 0;

    -- Claim status counts
    SELECT status AS claim_status, COUNT(*) AS count
    FROM Claims
    GROUP BY status;

    -- General statistics counts
    SELECT 
        (SELECT COUNT(*) FROM Users) AS total_students,
        (SELECT COUNT(*) FROM Items WHERE status = 'active') AS active_items,
        (SELECT COUNT(*) FROM Items WHERE status = 'claimed') AS claimed_items;
END//

DELIMITER ;
