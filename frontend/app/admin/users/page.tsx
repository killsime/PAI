'use client';
import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  is_admin: boolean;
  created_at: string;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8000/admin/users');
      if (!response.ok) {
        throw new Error('获取用户列表失败');
      }
      const data = await response.json();
      setUsers(data.users);
      // 计算总页数
      setTotalPages(Math.ceil(data.users.length / itemsPerPage));
    } catch (err) {
      setError('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('确定要删除这个用户吗？')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除用户失败');
      }

      // 重新获取用户列表
      fetchUsers();
    } catch (err) {
      setError('删除用户失败');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">用户管理</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">ID</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">用户名</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">角色</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">创建时间</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((user) => (
                  <tr key={user.id}>
                    <td className="py-4 px-4 text-sm text-gray-900">{user.id}</td>
                    <td className="py-4 px-4 text-sm text-gray-900">{user.username}</td>
                    <td className="py-4 px-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.is_admin ? '管理员' : '普通用户'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 mr-2"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="inline-flex rounded-md shadow">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 border-t border-b ${page === 1 ? 'border-l' : ''} ${page === totalPages ? 'border-r' : ''} border-gray-300 bg-${page === currentPage ? 'blue-500 text-white' : 'white text-gray-500'} hover:bg-${page === currentPage ? 'blue-600' : 'gray-50'}`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </nav>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UsersPage;
