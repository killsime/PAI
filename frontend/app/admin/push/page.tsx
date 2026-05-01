'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import { adminApi } from '@/app/services/api';

interface PushMessage {
  id: number;
  level: string;
  level_cn: string;
  content: string;
  created_at: string;
}

const PushPage = () => {
  const [messages, setMessages] = useState<PushMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const searchParams = useSearchParams();

  // 添加/编辑弹窗
  const [showModal, setShowModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState<PushMessage | null>(null);
  const [formData, setFormData] = useState({ level: 'normal', content: '' });

  // 获取当前等级
  const getLevel = () => {
    const level = searchParams.get('level') || 'all';
    return level;
  };

  // 监听搜索参数变化
  useEffect(() => {
    setCurrentPage(1);
  }, [searchParams]);

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getPushMessages();
      setMessages(data.data || []);
    } catch (err) {
      setError('获取推送消息列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const level = getLevel();

  const filteredMessages = messages.filter(msg => {
    if (level === 'all') return true;
    return msg.level === level;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMessage = () => {
    setEditingMessage(null);
    setFormData({ level: level !== 'all' ? level : 'normal', content: '' });
    setShowModal(true);
  };

  const handleEditMessage = (message: PushMessage) => {
    setEditingMessage(message);
    setFormData({ level: message.level, content: message.content });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingMessage) {
        await adminApi.updatePushMessage(editingMessage.id, formData);
      } else {
        await adminApi.createPushMessage(formData.level, formData.content);
      }

      setShowModal(false);
      fetchMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm('确定要删除这条推送消息吗？')) return;

    try {
      await adminApi.deletePushMessage(messageId);
      fetchMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除推送消息失败');
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const getLevelLabel = (lev: string) => {
    const labels: Record<string, string> = {
      'all': '全部',
      'normal': '正常',
      'mild': '轻度',
      'moderate': '中度',
      'severe': '重度',
      'extremely_severe': '极重'
    };
    return labels[lev] || lev;
  };

  const getLevelColor = (lev: string) => {
    const colors: Record<string, string> = {
      'normal': 'bg-green-100 text-green-800',
      'mild': 'bg-yellow-100 text-yellow-800',
      'moderate': 'bg-orange-100 text-orange-800',
      'severe': 'bg-red-100 text-red-800',
      'extremely_severe': 'bg-purple-100 text-purple-800'
    };
    return colors[lev] || 'bg-gray-100 text-gray-800';
  };

  const paginatedMessages = filteredMessages.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{getLevelLabel(level)}推送消息管理</h1>
        <button
          onClick={handleAddMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          添加推送消息
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* 消息列表 */}
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
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">等级</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">内容</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">创建时间</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedMessages.length > 0 ? (
                  paginatedMessages.map((message) => (
                    <tr key={message.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm text-gray-900">{message.id}</td>
                      <td className="py-4 px-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(message.level)}`}>
                          {message.level_cn}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900 max-w-md truncate">{message.content}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{new Date(message.created_at).toLocaleString()}</td>
                      <td className="py-4 px-4 text-sm">
                        <button
                          onClick={() => handleEditMessage(message)}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">暂无数据</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {filteredMessages.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredMessages.length / pageSize)}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </div>
      )}

      {/* 添加/编辑弹窗 */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingMessage ? '编辑推送消息' : '添加推送消息'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="level" className="block text-gray-700 text-sm font-bold mb-2">
              等级
            </label>
            <select
              id="level"
              name="level"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.level}
              onChange={handleInputChange}
              required
            >
              <option value="normal">正常</option>
              <option value="mild">轻度</option>
              <option value="moderate">中度</option>
              <option value="severe">重度</option>
              <option value="extremely_severe">极重</option>
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">
              推送内容
            </label>
            <textarea
              id="content"
              name="content"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.content}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {editingMessage ? '更新' : '添加'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PushPage;
