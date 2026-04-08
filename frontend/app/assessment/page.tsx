'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { questionApi, assessmentApi, Question, AssessmentResult } from '../services/api';
import Navbar from '../components/Navbar';

// 选项类型定义
interface Option {
  label: string;
  value: number;
}

const options: Option[] = [
  { label: '完全不符合', value: 0 },
  { label: '有时符合', value: 1 },
  { label: '经常符合', value: 2 },
  { label: '非常符合', value: 3 },
];

// 解析查询参数
function getQueryParam(url: string, param: string): string | null {
  const urlObj = new URL(url, window.location.origin);
  return urlObj.searchParams.get(param);
}

export default function AssessmentPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [assessmentType, setAssessmentType] = useState('random');

  // 初始化时获取查询参数
  useEffect(() => {
    const url = window.location.href;
    const type = getQueryParam(url, 'type');
    setAssessmentType(type || 'random');
  }, []);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [scores, setScores] = useState({
    depression: 0,
    anxiety: 0,
    stress: 0
  });

  // 获取题目
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = assessmentType === 'random'
          ? await questionApi.getRandomQuestions()
          : await questionApi.getDassQuestions();
        setQuestions(response.questions);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取题目失败');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [assessmentType]); // 当assessmentType变化时重新获取题目

  // 处理选项选择
  const handleOptionChange = (questionId: number, value: number) => {
    // 立即更新答案
    const newAnswers = {
      ...answers,
      [questionId]: value
    };
    setAnswers(newAnswers);

    // 计算最新得分
    const currentQuestion = questions[currentQuestionIndex];
    let latestScores = scores;
    if (currentQuestion) {
      // 先减去之前的得分（如果有的话）
      const oldValue = answers[questionId] || 0;
      latestScores = {
        ...scores
      };
      latestScores[currentQuestion.dimension as keyof typeof latestScores] -= oldValue;
      // 加上新的得分
      latestScores[currentQuestion.dimension as keyof typeof latestScores] += value;
      // 更新状态
      setScores(latestScores);
    }

    // 延迟0.3秒后跳转，让用户可以看到自己的选择
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        // 下一题
        setCurrentQuestionIndex(prev => {
          // 确保索引不超出范围
          const newIndex = prev + 1;
          return Math.min(newIndex, questions.length - 1);
        });
      } else {
        // 最后一题，自动提交测评
        handleSubmit(latestScores);
      }
    }, 300);
  };

  // 处理下一题
  const handleNextQuestion = async () => {
    if (currentQuestionIndex === questions.length - 1) {
      // 最后一题，提交测评
      await handleSubmit();
    } else {
      // 下一题
      setCurrentQuestionIndex(prev => {
        // 确保索引不超出范围
        const newIndex = prev + 1;
        return Math.min(newIndex, questions.length - 1);
      });
    }
  };

  // 计算各维度得分
  const calculateScores = () => {
    const scores = {
      depression: 0,
      anxiety: 0,
      stress: 0
    };

    questions.forEach(question => {
      const answer = answers[question.id];
      if (answer !== undefined) {
        scores[question.dimension as keyof typeof scores] += answer;
      }
    });

    return scores;
  };

  // 提交测评
  const handleSubmit = async (submitScores?: typeof scores) => {
    setSubmitting(true);
    setError('');

    try {
      // 使用传入的scores或当前状态
      const currentScores = submitScores || scores;
      // 实际得分应该为加起来*2
      const finalScores = {
        depression: currentScores.depression * 2,
        anxiety: currentScores.anxiety * 2,
        stress: currentScores.stress * 2
      };

      // 从云端获取用户信息
      const response = await assessmentApi.submitAssessment(
        finalScores.depression,
        finalScores.anxiety,
        finalScores.stress
      );

      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交测评失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 重置测评
  const handleReset = () => {
    setAnswers({});
    setResult(null);
    setError('');
  };

  // 检查用户是否已登录（只在客户端执行）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      if (!user) {
        router.push('/login');
      }
    }
  }, [router]);

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
            <p className="mt-4 text-gray-600">加载题目中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Navbar />
        <div className="py-12 px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">测评结果</h1>

            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold text-blue-800 mb-2">抑郁维度</h2>
                <p className="text-gray-700">得分: {result.depression}</p>
                <p className="text-gray-700">严重程度: {result.depression_level}</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold text-purple-800 mb-2">焦虑维度</h2>
                <p className="text-gray-700">得分: {result.anxiety}</p>
                <p className="text-gray-700">严重程度: {result.anxiety_level}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold text-green-800 mb-2">压力维度</h2>
                <p className="text-gray-700">得分: {result.stress}</p>
                <p className="text-gray-700">严重程度: {result.stress_level}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">AI分析</h2>
                <p className="text-gray-700 whitespace-pre-line">{result.ai_analysis}</p>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => router.push('/')}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Navbar />
      <div className="py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            {assessmentType === 'random' ? '随机测评' : 'DASS-21标准测评'}
          </h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">题目 {Math.min(currentQuestionIndex + 1, questions.length)} / {questions.length}</span>
              <span className="text-gray-600">
                {Math.min(100, Math.round(((currentQuestionIndex + 1) / questions.length) * 100))}% 完成
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full"
                style={{ width: `${Math.min(100, ((currentQuestionIndex + 1) / questions.length) * 100)}%` }}
              ></div>
            </div>
          </div>

          {questions.length > 0 && currentQuestionIndex >= 0 && currentQuestionIndex < questions.length && questions[currentQuestionIndex] && (
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                <div className="flex items-start">
                  <span className="bg-indigo-100 text-indigo-800 font-medium rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0">
                    {currentQuestionIndex + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-xl font-semibold text-gray-800 mb-6">{questions[currentQuestionIndex].content}</p>
                    <div className="space-y-4">
                      {options.map((option) => (
                        <div key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            id={`q${questions[currentQuestionIndex].id}_${option.value}`}
                            name={`q${questions[currentQuestionIndex].id}`}
                            checked={answers[questions[currentQuestionIndex].id] === option.value}
                            onChange={() => handleOptionChange(questions[currentQuestionIndex].id, option.value)}
                            className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300"
                          />
                          <label
                            htmlFor={`q${questions[currentQuestionIndex].id}_${option.value}`}
                            className={`ml-3 cursor-pointer py-2 px-3 rounded w-full transition-colors duration-100 ${answers[questions[currentQuestionIndex].id] === option.value ? 'bg-green-100 text-green-800 font-medium' : 'text-gray-700 hover:bg-green-50 hover:text-green-700'}`}
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center text-gray-500 text-sm">
                选择选项后将自动跳转到下一题
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

}
