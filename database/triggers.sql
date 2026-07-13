-- CampusConnect Triggers
USE campus_connect;

DROP TRIGGER IF EXISTS after_claim_insert;
DROP TRIGGER IF EXISTS after_claim_update;
DROP TRIGGER IF EXISTS after_item_insert;

DELIMITER //

-- Trigger 1: Log when a new claim is inserted
CREATE TRIGGER after_claim_insert
AFTER INSERT ON Claims
FOR EACH ROW
BEGIN
    INSERT INTO ActivityLogs (user_type, user_id, action, details)
    VALUES ('student', NEW.user_id, 'CLAIM_SUBMITTED', CONCAT('Submitted claim for item ID: ', NEW.item_id, '. Claim ID: ', NEW.claim_id));
END//

-- Trigger 2: Log and notify when a claim is approved or rejected
CREATE TRIGGER after_claim_update
AFTER UPDATE ON Claims
FOR EACH ROW
BEGIN
    -- Only trigger actions when status actually changes
    IF OLD.status <> NEW.status THEN
        -- Log activity
        INSERT INTO ActivityLogs (user_type, user_id, action, details)
        VALUES (
            'admin', 
            NEW.admin_id, 
            CONCAT('CLAIM_', UPPER(NEW.status)), 
            CONCAT('Claim ID: ', NEW.claim_id, ' for Item ID: ', NEW.item_id, ' was ', NEW.status, '.')
        );
        
        -- Insert student notification
        INSERT INTO Notifications (user_id, title, message)
        VALUES (
            NEW.user_id,
            CONCAT('Claim ', CONCAT(UPPER(SUBSTRING(NEW.status, 1, 1)), SUBSTRING(NEW.status, 2))),
            CONCAT('Your claim for item "', (SELECT name FROM Items WHERE item_id = NEW.item_id), '" has been ', NEW.status, '.', 
                   IF(NEW.admin_remarks IS NOT NULL AND NEW.admin_remarks <> '', CONCAT(' Remarks: ', NEW.admin_remarks), ''))
        );
    END IF;
END//

-- Trigger 3: Log when a new item is reported
CREATE TRIGGER after_item_insert
AFTER INSERT ON Items
FOR EACH ROW
BEGIN
    IF NEW.user_id IS NOT NULL THEN
        INSERT INTO ActivityLogs (user_type, user_id, action, details)
        VALUES ('student', NEW.user_id, CONCAT('ITEM_REPORTED_', UPPER(NEW.type)), CONCAT('Reported ', NEW.type, ' item: "', NEW.name, '" (ID: ', NEW.item_id, ')'));
    ELSEIF NEW.admin_id IS NOT NULL THEN
        INSERT INTO ActivityLogs (user_type, user_id, action, details)
        VALUES ('admin', NEW.admin_id, CONCAT('ITEM_REPORTED_', UPPER(NEW.type)), CONCAT('Reported ', NEW.type, ' item: "', NEW.name, '" (ID: ', NEW.item_id, ')'));
    END IF;
END//

DELIMITER ;
