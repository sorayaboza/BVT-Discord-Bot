DROP DATABASE IF EXISTS voicedata_app;
CREATE DATABASE voicedata_app;
USE voicedata_app;

CREATE TABLE voicedata (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userID VARCHAR(255),
    totalHours VARCHAR(255)
);
