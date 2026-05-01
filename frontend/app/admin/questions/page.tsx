'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import { adminApi, Question } from '@/app/services/api';

const QuestionsPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const searchParams = useSearchParams();

  // 添加/编辑弹窗
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({ content: '', dimension: 'depression' });

  // 获取当前维度
  const getDimension = () => {
    const dimension = searchParams.get('dimension') || 'all';
    return dimension;
  };

  // 监听搜索参数变化
  useEffect(() => {
    setCurrentPage(1);
  }, [searchParams]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getQuestions();
      setQuestions(data.questions || []);
    } catch (err) {
      setError('获取题目列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const dimension = getDimension();

  const filteredQuestions = questions.filter(q => {
    if (dimension === 'all') return true;
    return q.dimension === dimension;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setFormData({ content: '', dimension: dimension !== 'all' ? dimension : 'depression' });
    setShowModal(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setFormData({ content: question.content, dimension: question.dimension });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingQuestion) {
        await adminApi.updateQuestion(editingQuestion.id, formData);
      } else {
        await adminApi.createQuestion(formData.content, formData.dimension);
      }

      setShowModal(false);
      fetchQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('确定要删除这个题目吗？')) return;

    try {
      await adminApi.deleteQuestion(questionId);
      fetchQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除题目失败');
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const getDimensionLabel = (dim: string) => {
    const labels: Record<string, string> = {
      'all': '全部',
      'depression': '抑郁',
      'anxiety': '焦虑',
      'stress': '压力'
    };
    return labels[dim] || dim;
  };

  const getDimensionColor = (dim: string) => {
    const colors: Record<string, string> = {
      'depression': 'bg-blue-100 text-blue-800',
      'anxiety': 'bg-green-100 text-green-800',
      'stress': 'bg-yellow-100 text-yellow-800'
    };
    return colors[dim] || 'bg-gray-100 text-gray-800';
  };

  const paginatedQuestions = filteredQuestions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{getDimensionLabel(dimension)}题目管理</h1>
        <button
          onClick={handleAddQuestion}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          添加题目
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* 题目列表 */}
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
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">题目内容</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">维度</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedQuestions.length > 0 ? (
                  paginatedQuestions.map((question) => (
                    <tr key={question.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm text-gray-900">{question.id}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{question.content}</td>
                      <td className="py-4 px-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDimensionColor(question.dimension)}`}>
                          {getDimensionLabel(question.dimension)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <button
                          onClick={() => handleEditQuestion(question)}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">暂无数据</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {filteredQuestions.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredQuestions.length / pageSize)}
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
        title={editingQuestion ? '编辑题目' : '添加题目'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">
              题目内容
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

          <div className="mb-6">
            <label htmlFor="dimension" className="block text-gray-700 text-sm font-bold mb-2">
              维度
            </label>
            <select
              id="dimension"
              name="dimension"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.dimension}
              onChange={handleInputChange}
              required
            >
              <option value="depression">抑郁</option>
              <option value="anxiety">焦虑</option>
              <option value="stress">压力</option>
            </select>
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
              {editingQuestion ? '更新' : '添加'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QuestionsPage;
