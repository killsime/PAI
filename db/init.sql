CREATE DATABASE IF NOT EXISTS PAI DEFAULT CHARSET utf8mb4;

USE PAI;

-- 用户表
CREATE TABLE user (
id INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(50) UNIQUE,
password VARCHAR(100),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 题目表
CREATE TABLE question (
id INT AUTO_INCREMENT PRIMARY KEY,
content TEXT NOT NULL,
dimension ENUM('depression', 'anxiety', 'stress') NOT NULL
);

-- 测评结果表（核心）
CREATE TABLE result (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT,

depression_score INT,
anxiety_score INT,
stress_score INT,

depression_level VARCHAR(20),
anxiety_level VARCHAR(20),
stress_level VARCHAR(20),

ai_analysis TEXT,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL

);
