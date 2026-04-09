'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();

  // 检查是否已登录
  useEffect(() => {
    const checkAuth = () => {
      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        router.push('/admin/login');
      }
    };

    if (typeof window !== 'undefined') {
      checkAuth();
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航栏 */}
      <nav className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-xl font-bold">PAI 管理系统</div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      </nav>

      {/* 侧边导航 */}
      <div className="flex">
        <div className="w-64 bg-white shadow-md min-h-screen">
          <div className="py-4">
            <ul>
              <li className="px-4 py-2">
                <Link href="/admin/users" className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 p-2 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>用户管理</span>
                </Link>
              </li>
              <li className="px-4 py-2">
                <Link href="/admin/questions" className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 p-2 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>题目管理</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
