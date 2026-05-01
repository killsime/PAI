'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './components/Navbar';

interface PushMessage {
  content: string;
  level: string;
  level_cn: string;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [pushMessage, setPushMessage] = useState<PushMessage | null>(null);

  // 检查用户是否已登录（只在客户端执行）
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    setUser(storedUser);

    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserId(userData.user_id);
        console.log('用户数据:', userData, 'userId:', userData.user_id);
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  }, []);

  // 获取推送消息
  useEffect(() => {
    if (userId) {
      fetchPushMessage(userId);
    }
  }, [userId]);

  const fetchPushMessage = async (uid: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/push/message/${uid}`);
      const data = await res.json();
      console.log('推送消息响应:', data);
      if (data.success && data.data) {
        setPushMessage(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch push message:', err);
    }
  };

  const handleAssessment = () => {
    if (user) {
      router.push('/assessment');
    } else {
      router.push('/login');
    }
  };

  // 根据等级返回颜色
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'normal':
        return 'from-green-400 to-blue-400';
      case 'mild':
        return 'from-yellow-400 to-orange-400';
      case 'moderate':
        return 'from-orange-400 to-red-400';
      case 'severe':
      case 'extremely_severe':
        return 'from-red-400 to-pink-500';
      default:
        return 'from-blue-400 to-purple-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-16 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">心理健康测评</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            定期进行心理健康测评，了解自己的心理状态，及时发现问题并采取措施
          </p>
        </div>

        {/* 推送消息卡片 */}
        {pushMessage && (
          <div className="mb-8">
            <div className={`bg-gradient-to-r ${getLevelColor(pushMessage.level)} rounded-2xl shadow-lg p-6`}>
              <div className="flex items-start">
                <div className="text-4xl mr-4">💡</div>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium mb-2 opacity-90">{pushMessage.level_cn}</div>
                  <div className="text-white text-lg">{pushMessage.content}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">随机测评</h2>
              <p className="text-gray-600 mt-2">从每个维度随机抽取7题，快速了解心理状态</p>
            </div>
            <button
              onClick={() => {
                if (user) {
                  router.push('/assessment?type=random');
                } else {
                  router.push('/login');
                }
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              开始测评
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">DASS-21标准测评</h2>
              <p className="text-gray-600 mt-2">使用标准的DASS-21量表，全面评估心理状态</p>
            </div>
            <button
              onClick={() => {
                if (user) {
                  router.push('/assessment?type=dass');
                } else {
                  router.push('/login');
                }
              }}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              开始测评
            </button>
          </div>
        </div>

        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">关于心理健康</h2>
          <p className="text-gray-600 mb-4">
            心理健康是整体健康的重要组成部分，影响着我们的情绪、思维和行为。定期进行心理健康测评可以帮助我们：
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>了解自己的心理状态</li>
            <li>及时发现潜在的心理问题</li>
            <li>采取适当的措施改善心理健康</li>
            <li>跟踪心理健康的变化</li>
          </ul>
        </div>
      </main>

      <footer className="bg-white py-6 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600">
          <p>© 2026 心理测评系统. 保留所有权利.</p>
        </div>
      </footer>
    </div>
  );
}
