-- Create databases for each microservice
CREATE DATABASE IF NOT EXISTS goalapp_user;
CREATE DATABASE IF NOT EXISTS goalapp_goal;
CREATE DATABASE IF NOT EXISTS goalapp_points;
CREATE DATABASE IF NOT EXISTS goalapp_notifications;
CREATE DATABASE IF NOT EXISTS goalapp_challenges;

-- Create user and grant permissions
CREATE USER IF NOT EXISTS 'D3_87069_Shubham'@'%' IDENTIFIED BY 'root';
GRANT ALL PRIVILEGES ON goalapp_user.* TO 'D3_87069_Shubham'@'%';
GRANT ALL PRIVILEGES ON goalapp_goal.* TO 'D3_87069_Shubham'@'%';
GRANT ALL PRIVILEGES ON goalapp_points.* TO 'D3_87069_Shubham'@'%';
GRANT ALL PRIVILEGES ON goalapp_notifications.* TO 'D3_87069_Shubham'@'%';
GRANT ALL PRIVILEGES ON goalapp_challenges.* TO 'D3_87069_Shubham'@'%';
FLUSH PRIVILEGES;