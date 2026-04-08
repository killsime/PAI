import mysql.connector
from dotenv import load_dotenv
import os

# 加载环境变量
load_dotenv()

# 数据库连接配置
db_config = {
    'user': 'root',
    'password': 'root',
    'host': 'localhost',
    'database': 'PAI',
    'auth_plugin': 'mysql_native_password'
}

class Database:
    """数据库连接和操作类"""
    
    @staticmethod
    def get_connection():
        """获取数据库连接"""
        try:
            conn = mysql.connector.connect(**db_config)
            return conn
        except Exception as e:
            raise Exception(f"数据库连接失败: {str(e)}")
    
    @staticmethod
    def execute_query(query, params=None):
        """执行查询并返回结果"""
        conn = None
        cursor = None
        try:
            conn = Database.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(query, params)
            result = cursor.fetchall()
            return result
        except Exception as e:
            raise Exception(f"数据库查询失败: {str(e)}")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
    
    @staticmethod
    def execute_update(query, params=None):
        """执行更新操作并返回受影响的行数"""
        conn = None
        cursor = None
        try:
            conn = Database.get_connection()
            cursor = conn.cursor()
            cursor.execute(query, params)
            conn.commit()
            return cursor.rowcount
        except Exception as e:
            if conn:
                conn.rollback()
            raise Exception(f"数据库更新失败: {str(e)}")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
    
    @staticmethod
    def execute_insert(query, params=None):
        """执行插入操作并返回插入的ID"""
        conn = None
        cursor = None
        try:
            conn = Database.get_connection()
            cursor = conn.cursor()
            cursor.execute(query, params)
            conn.commit()
            return cursor.lastrowid
        except Exception as e:
            if conn:
                conn.rollback()
            raise Exception(f"数据库插入失败: {str(e)}")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
