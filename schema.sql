DROP DATABASE IF EXISTS voicedata_app;
CREATE DATABASE voicedata_app;
USE voicedata_app;

CREATE TABLE voicedata (
    id integer PRIMARY KEY AUTO_INCREMENT,
    userID VARCHAR(255),
    totalHours VARCHAR(255),
    hoursJune int
);

INSERT INTO voicedata (userID, totalHours)
VALUES
('507908285714661388', '397'),
('869241242280669215', '31');
