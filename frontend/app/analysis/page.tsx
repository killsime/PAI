'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { assessmentApi } from '../services/api';
import Navbar from '../components/Navbar';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function AnalysisPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        // 从本地存储中获取历史记录
        const storedHistory = localStorage.getItem(`history_${user.user_id}`);
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        } else {
          setHistory([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取历史测评结果失败');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  // 准备图表数据
  const chartData = history
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map(item => ({
      date: new Date(item.created_at).toLocaleDateString('zh-CN'),
      depression: item.depression_score,
      anxiety: item.anxiety_score,
      stress: item.stress_score
    }));

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
            <p className="mt-4 text-gray-600">加载分析数据中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Navbar />
      <div className="py-12 px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">测评结果分析</h1>

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
          ) : (
            <div className="space-y-8">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 30]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="depression"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                      name="抑郁"
                    />
                    <Line
                      type="monotone"
                      dataKey="anxiety"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                      name="焦虑"
                    />
                    <Line
                      type="monotone"
                      dataKey="stress"
                      stroke="#10b981"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                      name="压力"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-blue-800 font-medium mb-2">抑郁维度</h3>
                  <p className="text-gray-700">
                    最近一次得分: {history[0]?.depression_score || 0}
                  </p>
                  <p className="text-gray-700">
                    严重程度: {history[0]?.depression_level || '未知'}
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-purple-800 font-medium mb-2">焦虑维度</h3>
                  <p className="text-gray-700">
                    最近一次得分: {history[0]?.anxiety_score || 0}
                  </p>
                  <p className="text-gray-700">
                    严重程度: {history[0]?.anxiety_level || '未知'}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-green-800 font-medium mb-2">压力维度</h3>
                  <p className="text-gray-700">
                    最近一次得分: {history[0]?.stress_score || 0}
                  </p>
                  <p className="text-gray-700">
                    严重程度: {history[0]?.stress_level || '未知'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-gray-800 font-medium mb-2">趋势分析</h3>
                <p className="text-gray-700">
                  基于您的历史测评结果，系统已生成折线图展示各维度的变化趋势。
                  您可以通过图表直观地了解自己的心理健康状况变化，及时发现潜在问题并采取相应措施。
                </p>
                <p className="text-gray-700 mt-2">
                  建议定期进行测评，以便持续关注心理健康状态的变化。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}