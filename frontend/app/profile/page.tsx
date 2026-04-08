'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '../services/api';
import Navbar from '../components/Navbar';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');

  // 检查用户是否已登录
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        router.push('/login');
      }
    }
  }, [router]);

  // 获取用户信息
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await userApi.getUserInfo(user.user_id);
        setUser(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取用户信息失败');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [user]);

  // 处理修改密码
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError('');
    setChangePasswordSuccess('');

    // 验证密码
    if (!oldPassword || !newPassword || !confirmPassword) {
      setChangePasswordError('请填写所有密码字段');
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangePasswordError('新密码和确认密码不一致');
      return;
    }

    try {
      setChangingPassword(true);
      await userApi.changePassword(user.user_id, oldPassword, newPassword);
      setChangePasswordSuccess('密码修改成功');
      // 清空表单
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // 3秒后隐藏成功消息
      setTimeout(() => {
        setChangePasswordSuccess('');
      }, 3000);
    } catch (err) {
      setChangePasswordError(err instanceof Error ? err.message : '修改密码失败');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-indigo-600 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-gray-600">加载用户信息中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Navbar />
      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">个人中心</h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-8">
            {/* 用户信息 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">用户信息</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">用户名:</span>
                  <span className="font-medium">{user.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">用户ID:</span>
                  <span className="font-medium">{user.id}</span>
                </div>
              </div>
            </div>

            {/* 修改密码 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">修改密码</h2>
                <button
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  className="text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  {showChangePassword ? '收起' : '展开'}
                </button>
              </div>

              {showChangePassword && (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {changePasswordError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg">
                      {changePasswordError}
                    </div>
                  )}
                  {changePasswordSuccess && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-lg">
                      {changePasswordSuccess}
                    </div>
                  )}

                  <div>
                    <label htmlFor="oldPassword" className="block text-gray-700 mb-2">原密码</label>
                    <input
                      type="password"
                      id="oldPassword"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="请输入原密码"
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-gray-700 mb-2">新密码</label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="请输入新密码"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">确认密码</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="请确认新密码"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {changingPassword ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        修改中...
                      </>
                    ) : (
                      '修改密码'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
