'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
}

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactElement;
};

type MenuCategory = {
  id: string;
  label: string;
  items: MenuItem[];
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const adminToken = localStorage.getItem('admin_token');
      const loggedIn = !!adminToken;
      setIsLoggedIn(loggedIn);

      if (pathname === '/admin/login' && loggedIn) {
        router.push('/admin');
        return;
      }

      if (pathname !== '/admin/login' && !loggedIn) {
        router.push('/admin/login');
        return;
      }

      setIsLoading(false);
    };

    if (typeof window !== 'undefined') {
      checkAuth();
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  const menuCategories: MenuCategory[] = [
    {
      id: 'dashboard', label: '仪表盘', items: [
        {
          id: 'stats', label: '统计数据', icon:
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 0 01-2-2z" />
            </svg>
        }
      ]
    },
    {
      id: 'users', label: '用户管理', items: [
        {
          id: 'users-list', label: '用户列表', icon:
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        }
      ]
    },
    {
      id: 'questions', label: '题目管理', items: [
        {
          id: 'questions-all', label: '全部', icon:
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
        },
        {
          id: 'questions-depression', label: '抑郁', icon:
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        },
        {
          id: 'questions-anxiety', label: '焦虑', icon:
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        },
        {
          id: 'questions-stress', label: '压力', icon:
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        }
      ]
    },
    {
      id: 'push', label: '推送管理', items: [
        {
          id: 'push-all', label: '全部', icon:
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
        },
        {
          id: 'push-normal', label: '正常', icon:
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        },
        {
          id: 'push-mild', label: '轻度', icon:
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        },
        {
          id: 'push-moderate', label: '中度', icon:
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
        },
        {
          id: 'push-severe', label: '重度', icon:
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        },
        {
          id: 'push-extremely_severe', label: '极重', icon:
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        }
      ]
    }
  ];

  const getMenuLink = (categoryId: string, itemId: string): string => {
    if (categoryId === 'dashboard') return '/admin';
    if (categoryId === 'users') {
      return `/admin/users`;
    }
    if (categoryId === 'questions') {
      const dimension = itemId.replace('questions-', '');
      return `/admin/questions?dimension=${dimension}`;
    }
    if (categoryId === 'push') {
      const level = itemId.replace('push-', '');
      return `/admin/push?level=${level}`;
    }
    return '/admin';
  };

  const isActive = (categoryId: string, itemId: string): boolean => {
    const currentPath = pathname;
    const link = getMenuLink(categoryId, itemId);
    if (categoryId === 'dashboard' && currentPath === '/admin') return true;
    const baseLink = link.split('?')[0];
    if (currentPath !== baseLink) return false;
    if (link.includes('?')) {
      const linkParams = new URLSearchParams(link.split('?')[1]);
      let isMatch = true;
      linkParams.forEach((value, key) => {
        if (searchParams.get(key) !== value) {
          isMatch = false;
        }
      });
      return isMatch;
    }
    return currentPath === baseLink;
  };

  if (pathname === '/admin/login') {
    return (
      <div className="min-h-screen bg-gray-100">
        {children}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c3 002 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
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
      </nav >

      <div className="flex">
        <div className="w-64 bg-white shadow-md min-h-[calc(100vh-64px)]">
          <div className="py-4">
            {menuCategories.map((category) => (
              <div key={category.id} className="mb-2">
                <button
                  onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                  className="w-full px-4 py-3 text-left text-gray-800 font-semibold hover:bg-gray-100 flex items-center justify-between"
                >
                  <span>{category.label}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transition-transform ${expandedCategory === category.id ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedCategory === category.id && (
                  <ul className="bg-gray-50">
                    {category.items.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={getMenuLink(category.id, item.id)}
                          className={`flex items-center space-x-2 px-8 py-2 text-sm ${isActive(category.id, item.id)
                            ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-600'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          <span className="text-gray-500">{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
