'use client';
import React, { useState, useEffect } from 'react';

interface Question {
  id: number;
  content: string;
  dimension: string;
}

const QuestionsPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({ content: '', dimension: 'depression' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8000/admin/questions');
      if (!response.ok) {
        throw new Error('获取题目列表失败');
      }
      const data = await response.json();
      setQuestions(data.questions);
      // 计算总页数
      setTotalPages(Math.ceil(data.questions.length / itemsPerPage));
    } catch (err) {
      setError('获取题目列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8000/admin/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('创建题目失败');
      }

      // 重置表单并重新获取题目列表
      setFormData({ content: '', dimension: 'depression' });
      setShowAddForm(false);
      fetchQuestions();
    } catch (err) {
      setError('创建题目失败');
    }
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    setError('');

    try {
      const response = await fetch(`http://localhost:8000/admin/questions/${editingQuestion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('更新题目失败');
      }

      // 重置编辑状态并重新获取题目列表
      setEditingQuestion(null);
      setFormData({ content: '', dimension: 'depression' });
      fetchQuestions();
    } catch (err) {
      setError('更新题目失败');
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('确定要删除这个题目吗？')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/admin/questions/${questionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除题目失败');
      }

      // 重新获取题目列表
      fetchQuestions();
    } catch (err) {
      setError('删除题目失败');
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setFormData({ content: question.content, dimension: question.dimension });
  };

  const cancelEdit = () => {
    setEditingQuestion(null);
    setFormData({ content: '', dimension: 'depression' });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">题目管理</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? '取消' : '添加题目'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* 添加/编辑表单 */}
      {(showAddForm || editingQuestion) && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-4">{editingQuestion ? '编辑题目' : '添加题目'}</h2>
          <form onSubmit={editingQuestion ? handleUpdateQuestion : handleAddQuestion}>
            <div className="mb-4">
              <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">
                题目内容
              </label>
              <textarea
                id="content"
                name="content"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                value={formData.content}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="mb-4">
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

            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingQuestion ? '更新' : '添加'}
              </button>
              {editingQuestion && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
              )}
            </div>
          </form>
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
                {questions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((question) => (
                  <tr key={question.id}>
                    <td className="py-4 px-4 text-sm text-gray-900">{question.id}</td>
                    <td className="py-4 px-4 text-sm text-gray-900">{question.content}</td>
                    <td className="py-4 px-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${question.dimension === 'depression' ? 'bg-blue-100 text-blue-800' : question.dimension === 'anxiety' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {question.dimension === 'depression' ? '抑郁' : question.dimension === 'anxiety' ? '焦虑' : '压力'}
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

export default QuestionsPage;
