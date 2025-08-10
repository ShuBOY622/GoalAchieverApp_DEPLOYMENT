# 🚨 PROMPT FOR BACKEND KILO BOT

## Copy this entire prompt and give it to your backend Kilo bot:

---

**TASK: Fix notification system - Kafka messages are generated but not appearing in frontend UI**

**PROBLEM DESCRIPTION:**
My goal-app has a notification system using Kafka. The frontend is working correctly, but notifications are not appearing in the UI. I can see Kafka messages being generated correctly in the console, but the REST API endpoints return empty arrays.

**KAFKA MESSAGES (Working correctly):**
```json
{"userId":6,"type":"GOAL_ASSIGNED","message":"You have been assigned a new goal: pououi","timestamp":[2025,8,7,21,0,16,505067000],"relatedId":70}
{"userId":0,"type":"GOAL_COMPLETED_BY_FRIEND","message":"A friend completed the goal: pououi","timestamp":[2025,8,7,21,0,46,318708000],"relatedId":70}
{"userId":7,"type":"CHALLENGE_RECEIVED","message":"You received a challenge: 898989899","timestamp":[2025,8,7,21,1,7,900741000],"relatedId":0}
{"userId":0,"type":"GOAL_COMPLETED_BY_FRIEND","message":"A friend completed the goal: watch the 8 show","timestamp":[2025,8,7,21,3,11,614583000],"relatedId":69}
```

**FRONTEND EXPECTATIONS:**
The frontend expects these REST API endpoints to return notification data:
- `GET /api/notifications/user/{userId}` - Should return array of all notifications for user
- `GET /api/notifications/user/{userId}/unseen` - Should return array of unseen notifications
- `GET /api/notifications/user/{userId}/unseen-count` - Should return count of unseen notifications

**FRONTEND NOTIFICATION INTERFACE:**
```typescript
interface Notification {
  id: number;
  userId: number;
  type: 'CHALLENGE_ACCEPTED' | 'GOAL_ASSIGNED' | 'GOAL_COMPLETED_BY_FRIEND' | 'CHALLENGE_RECEIVED' | 'FRIEND_REQUEST' | 'GOAL_COMPLETED' | string;
  message: string;
  seen: boolean;
  createdAt: string;
  relatedId?: number; // For challenge ID, goal ID, etc.
  timestamp?: number[] | string; // Support both Kafka timestamp format and ISO string
}
```

**ISSUE DIAGNOSIS:**
1. ✅ Kafka is generating messages correctly (topic: notification-topic)
2. ❌ Notification service is not consuming Kafka messages
3. ❌ Messages are not being saved to database
4. ❌ REST API returns empty arrays because no data exists in database

**WHAT I NEED YOU TO FIX:**
1. Create/fix Kafka consumer in notification service to consume from 'notification-topic'
2. Parse Kafka messages and save them to notifications database table
3. Ensure REST API endpoints return the saved notifications
4. Handle the timestamp format conversion from Kafka array format to ISO string

**EXPECTED KAFKA MESSAGE TYPES:**
- `CHALLENGE_RECEIVED` - When user receives a challenge invitation
- `CHALLENGE_ACCEPTED` - When someone accepts your challenge
- `GOAL_ASSIGNED` - When a shared goal is created from accepted challenge
- `GOAL_COMPLETED_BY_FRIEND` - When friend completes a shared goal

**DATABASE SCHEMA NEEDED:**
```sql
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    related_id BIGINT,
    seen BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_seen (seen),
    INDEX idx_created_at (created_at)
);
```

**KAFKA CONSUMER EXAMPLE NEEDED:**
```java
@KafkaListener(topics = "notification-topic")
public void handleNotification(String message) {
    // Parse Kafka message
    // Convert timestamp array [2025,8,7,21,0,16,505067000] to LocalDateTime
    // Save to notifications table
    // Log success/failure
}
```

**REST ENDPOINTS NEEDED:**
```java
@GetMapping("/api/notifications/user/{userId}")
public List<Notification> getUserNotifications(@PathVariable Long userId)

@GetMapping("/api/notifications/user/{userId}/unseen")
public List<Notification> getUnseenNotifications(@PathVariable Long userId)

@GetMapping("/api/notifications/user/{userId}/unseen-count")
public Long getUnseenCount(@PathVariable Long userId)
```

**TESTING:**
After fixing, I should be able to:
1. Send a challenge → recipient gets CHALLENGE_RECEIVED notification
2. Accept challenge → challenger gets CHALLENGE_ACCEPTED notification
3. Complete shared goal → friend gets GOAL_COMPLETED_BY_FRIEND notification
4. All notifications appear immediately in frontend UI

**CURRENT PROJECT STRUCTURE:**
- Spring Boot backend with Kafka
- notification-service (separate service or part of main app?)
- MySQL/PostgreSQL database
- Frontend polling every 10 seconds for new notifications

Please implement the Kafka consumer and fix the notification storage system so that Kafka messages get saved to database and served via REST API.

---

## Additional Technical Details for Backend Bot

### Problem Diagnosis

Based on your Kafka logs, the issue is **NOT with the frontend**. The problem is that:

1. ✅ **Kafka is working correctly** - Messages are being generated
2. ❌ **Notification Service is not consuming Kafka messages** - Messages aren't being saved to database
3. ❌ **REST API returns empty results** - Because no notifications exist in database

## Kafka Messages Analysis

 Kafka messages show the correct structure:
```json
{"userId":6,"type":"GOAL_ASSIGNED","message":"You have been assigned a new goal: pououi","timestamp":[2025,8,7,21,0,16,505067000],"relatedId":70}
{"userId":0,"type":"GOAL_COMPLETED_BY_FRIEND","message":"A friend completed the goal: pououi","timestamp":[2025,8,7,21,0,46,318708000],"relatedId":70}
{"userId":7,"type":"CHALLENGE_RECEIVED","message":"You received a challenge: 898989899","timestamp":[2025,8,7,21,1,7,900741000],"relatedId":0}
```

## Backend Issues to Fix

### 1. Notification Service Kafka Consumer

**Check if your notification service has a Kafka consumer like this:**

```java
@KafkaListener(topics = "notification-topic")
public void handleNotification(String message) {
    try {
        // Parse the Kafka message
        ObjectMapper mapper = new ObjectMapper();
        NotificationMessage kafkaMessage = mapper.readValue(message, NotificationMessage.class);
        
        // Convert to database entity
        Notification notification = new Notification();
        notification.setUserId(kafkaMessage.getUserId());
        notification.setType(kafkaMessage.getType());
        notification.setMessage(kafkaMessage.getMessage());
        notification.setRelatedId(kafkaMessage.getRelatedId());
        notification.setSeen(false);
        notification.setCreatedAt(LocalDateTime.now());
        
        // Save to database
        notificationRepository.save(notification);
        
        log.info("Saved notification: {} for user: {}", kafkaMessage.getType(), kafkaMessage.getUserId());
    } catch (Exception e) {
        log.error("Failed to process notification: {}", message, e);
    }
}
```

### 2. Database Schema

**Ensure your notification table has these columns:**

```sql
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    related_id BIGINT,
    seen BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_seen (seen),
    INDEX idx_created_at (created_at)
);
```

### 3. REST API Endpoints

**Verify these endpoints exist and work:**

```java
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    
    @GetMapping("/user/{userId}")
    public List<Notification> getUserNotifications(@PathVariable Long userId) {
        return notificationService.getNotificationsByUserId(userId);
    }
    
    @GetMapping("/user/{userId}/unseen")
    public List<Notification> getUnseenNotifications(@PathVariable Long userId) {
        return notificationService.getUnseenNotificationsByUserId(userId);
    }
    
    @GetMapping("/user/{userId}/unseen-count")
    public Long getUnseenCount(@PathVariable Long userId) {
        return notificationService.getUnseenCountByUserId(userId);
    }
}
```

## Quick Debugging Steps

### 1. Check Kafka Consumer Status
```bash
# Check if notification service is consuming
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group notification-service-group
```

### 2. Check Database
```sql
-- Check if notifications table exists
SHOW TABLES LIKE 'notifications';

-- Check notification count
SELECT COUNT(*) FROM notifications;

-- Check recent notifications
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;
```

### 3. Check Service Logs
```bash
# Check notification service logs for errors
tail -f /path/to/notification-service.log

# Look for:
# - Kafka connection errors
# - Database connection errors  
# - JSON parsing errors
# - Consumer group errors
```

## Frontend Testing

Use the **API Test Panel** on your Dashboard to verify:

1. **Run Tests** button will test all notification endpoints
2. If endpoints return empty arrays → Backend issue confirmed
3. If endpoints return data → Frontend issue (but we've fixed that)

## Expected Fix Results

After fixing the backend:

1. ✅ Kafka messages will be saved to database
2. ✅ REST API will return notifications
3. ✅ Frontend will display notifications immediately
4. ✅ Challenge buttons will appear automatically
5. ✅ Real-time updates will work

## Common Backend Issues

1. **Kafka Consumer Not Running** - Service not listening to topic
2. **Database Connection Issues** - Can't save notifications
3. **JSON Parsing Errors** - Timestamp format issues
4. **Wrong Topic Name** - Consumer listening to wrong topic
5. **Consumer Group Issues** - Multiple consumers competing

The frontend is now fully prepared to handle notifications correctly once your backend starts saving them to the database.