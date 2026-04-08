'use client';
import { useState } from 'react';

export default function TestPage() {
  const [username, setUsername] = useState('test');
  const [password, setPassword] = useState('test123');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setError('');
    setResponse('');

    try {
      console.log('开始测试登录接口...');
      
      const res = await fetch('http://localhost:8000/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('响应状态:', res.status);
      console.log('响应状态文本:', res.statusText);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.log('错误数据:', errorData);
        throw new Error(errorData.detail || `请求失败: ${res.status}`);
      }

      const data = await res.json();
      console.log('响应数据:', data);
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('请求错误:', err);
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">API测试页面</h1>
          <p className="text-gray-600">测试直接调用后端接口</p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              用户名
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white text-gray-900"
            />
          </div>

          <button
            onClick={handleTest}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                测试中...
              </>
            ) : (
              '测试登录接口'
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg">
            <h3 className="font-medium mb-1">错误信息:</h3>
            <pre className="whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {response && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg">
            <h3 className="font-medium mb-1">响应数据:</h3>
            <pre className="whitespace-pre-wrap">{response}</pre>
          </div>
        )}

        <div className="text-center">
          <p className="text-gray-600">查看浏览器控制台获取详细日志</p>
        </div>
      </div>
    </div>
  );
}