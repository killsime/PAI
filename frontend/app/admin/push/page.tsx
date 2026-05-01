'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface PushMessage {
  id: number
  level: string
  level_cn: string
  content: string
  created_at: string
}

const levelOptions = [
  { value: 'normal', label: '正常' },
  { value: 'mild', label: '轻度' },
  { value: 'moderate', label: '中度' },
  { value: 'severe', label: '重度' },
  { value: 'extremely_severe', label: '极重' },
]

const PushMessagesPage = () => {
  const router = useRouter()
  const [messages, setMessages] = useState<PushMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set(['normal', 'mild', 'moderate', 'severe', 'extremely_severe']))
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ level: 'normal', content: '' })

  useEffect(() => {
    const checkAuth = () => {
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
      if (!adminToken) {
        router.push('/admin/login')
        return
      }
    }
    checkAuth()
    fetchMessages()
  }, [router])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/push/messages')
      const data = await res.json()
      if (data.success) {
        setMessages(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (level: string) => {
    const newExpanded = new Set(expandedLevels)
    if (newExpanded.has(level)) {
      newExpanded.delete(level)
    } else {
      newExpanded.add(level)
    }
    setExpandedLevels(newExpanded)
  }

  const handleAdd = async () => {
    if (!formData.content.trim()) return
    
    try {
      const res = await fetch('http://localhost:8000/api/push/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success) {
        setShowAddModal(false)
        setFormData({ level: 'normal', content: '' })
        fetchMessages()
      }
    } catch (err) {
      console.error('Failed to add message:', err)
    }
  }

  const handleEdit = async () => {
    if (!editingId || !formData.content.trim()) return
    
    try {
      const res = await fetch(`http://localhost:8000/api/push/message/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success) {
        setEditingId(null)
        setFormData({ level: 'normal', content: '' })
        fetchMessages()
      }
    } catch (err) {
      console.error('Failed to update message:', err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条消息吗？')) return
    
    try {
      const res = await fetch(`http://localhost:8000/api/push/message/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        fetchMessages()
      }
    } catch (err) {
      console.error('Failed to delete message:', err)
    }
  }

  const getMessagesByLevel = () => {
    const grouped: Record<string, PushMessage[]> = {}
    levelOptions.forEach(opt => {
      grouped[opt.value] = []
    })
    messages.forEach(msg => {
      if (grouped[msg.level]) {
        grouped[msg.level].push(msg)
      }
    })
    return grouped
  }

  const groupedMessages = getMessagesByLevel()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">推送消息管理</h1>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({ level: 'normal', content: '' })
            setShowAddModal(true)
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          添加消息
        </button>
      </div>

      <div className="space-y-4">
        {levelOptions.map(levelOpt => (
          <div key={levelOpt.value} className="bg-white rounded-lg shadow">
            <div 
              className="p-4 flex justify-between items-center cursor-pointer border-b"
              onClick={() => toggleExpand(levelOpt.value)}
            >
              <h2 className="text-xl font-semibold">{levelOpt.label} ({groupedMessages[levelOpt.value]?.length || 0}条)</h2>
              <div className="text-gray-500 text-xl">{expandedLevels.has(levelOpt.value) ? '▼' : '▶'}</div>
            </div>
            {expandedLevels.has(levelOpt.value) && (
              <div className="p-4">
                {groupedMessages[levelOpt.value]?.length === 0 ? (
                  <div className="text-gray-500 text-center py-4">暂无消息</div>
                ) : (
                  <div className="space-y-2">
                    {groupedMessages[levelOpt.value].map(msg => (
                      <div key={msg.id} className="bg-gray-50 rounded p-3 flex justify-between items-start">
                        <div className="flex-1">{msg.content}</div>
                        <div className="ml-4 space-x-2">
                          <button
                            onClick={() => {
                              setEditingId(msg.id)
                              setFormData({ level: msg.level, content: msg.content })
                              setShowAddModal(true)
                            }}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDelete(msg.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          ))}
      </div>

      {/* 添加/编辑模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{editingId ? '编辑消息' : '添加消息'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">等级</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full border rounded p-2"
                >
                  {levelOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2">内容</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border rounded p-2 h-32"
                  placeholder="请输入推送内容..."
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingId(null)
                    setFormData({ level: 'normal', content: '' })
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                >
                  取消
                </button>
                <button
                  onClick={editingId ? handleEdit : handleAdd}
                  className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  {editingId ? '更新' : '添加'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PushMessagesPage
