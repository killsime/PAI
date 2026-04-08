'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState<any>(null);

  // 检查用户是否已登录
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  // 处理退出登录
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-sm py-4 px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-xl font-bold text-indigo-600">
          <a href="/" className="hover:text-indigo-800 transition-colors">
            心理测评系统
          </a>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors"
              >
                <span>欢迎, {user.username}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <a
                    href="/history"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    历史记录
                  </a>
                  <a
                    href="/analysis"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    数据分析
                  </a>
                  <div className="border-t border-gray-100"></div>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }}
                  >
                    退出登录
                  </a>
                </div>
              )}
            </div>
          ) : (
            <a
              href="/login"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              登录
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}