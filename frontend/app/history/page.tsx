'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { assessmentApi } from '../services/api';
import Navbar from '../components/Navbar';

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

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

  // 获取历史测评结果
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      try {
        setLoading(true);
        // 从后端接口获取历史记录
        const response = await assessmentApi.getHistory(user.user_id);
        setHistory(response.history);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取历史测评结果失败');
        // 发生错误时使用空数组
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

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
            <p className="mt-4 text-gray-600">加载历史记录中...</p>
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
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">历史测评记录</h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {history.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">暂无测评记录</p>
              <button
                onClick={() => router.push('/assessment')}
                className="mt-4 bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                开始测评
              </button>
            </div>
          ) : selectedRecord ? (
            <div className="space-y-6">
              <button
                onClick={() => setSelectedRecord(null)}
                className="mb-4 text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                ← 返回列表
              </button>

              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">测评 #{selectedRecord.id}</h2>
                  <span className="text-gray-500 text-sm">
                    {new Date(selectedRecord.created_at).toLocaleString('zh-CN')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-blue-800 font-medium mb-2">抑郁维度</h3>
                    <p className="text-gray-700">得分: {selectedRecord.depression_score}</p>
                    <p className="text-gray-700">严重程度: {selectedRecord.depression_level}</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-purple-800 font-medium mb-2">焦虑维度</h3>
                    <p className="text-gray-700">得分: {selectedRecord.anxiety_score}</p>
                    <p className="text-gray-700">严重程度: {selectedRecord.anxiety_level}</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-green-800 font-medium mb-2">压力维度</h3>
                    <p className="text-gray-700">得分: {selectedRecord.stress_score}</p>
                    <p className="text-gray-700">严重程度: {selectedRecord.stress_level}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-gray-800 font-medium mb-2">AI分析</h3>
                  <p className="text-gray-700 whitespace-pre-line">{selectedRecord.ai_analysis}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item, index) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => setSelectedRecord(item)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">测评 #{item.id}</h2>
                      <span className="text-gray-500 text-sm">
                        {new Date(item.created_at).toLocaleString('zh-CN')}
                      </span>
                    </div>
                    <div className="flex space-x-4">
                      <span className="text-blue-600 font-medium">抑郁: {item.depression_score}</span>
                      <span className="text-purple-600 font-medium">焦虑: {item.anxiety_score}</span>
                      <span className="text-green-600 font-medium">压力: {item.stress_score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}