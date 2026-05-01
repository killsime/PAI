'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/app/services/api'

const DashboardPage = () => {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
      if (!adminToken) {
        router.push('/admin/login')
        return
      }
    }
    checkAuth()
    fetchStats()
  }, [router])

  const fetchStats = async () => {
    try {
      const data = await adminApi.getDashboardStats()
      if (data.success) {
        setStats(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">管理面板</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-4xl mb-2">👥</div>
          <div className="text-3xl font-bold text-gray-800">{stats?.user_count || 0}</div>
          <div className="text-gray-500">用户总数</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-3xl font-bold text-gray-800">{stats?.assessment_count || 0}</div>
          <div className="text-gray-500">测评次数</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-4xl mb-2">❓</div>
          <div className="text-3xl font-bold text-gray-800">{stats?.question_count || 0}</div>
          <div className="text-gray-500">题库数量</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">用户状态分布</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(stats?.level_distribution || {}).map(([level, count]) => (
            <div key={level} className="bg-gray-50 rounded p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{count as number}</div>
              <div className="text-gray-600">{level}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/users" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div className="text-4xl mb-2">👤</div>
          <div className="text-xl font-semibold">用户管理</div>
          <div className="text-gray-500">管理系统用户</div>
        </Link>

        <Link href="/admin/questions" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div className="text-4xl mb-2">❓</div>
          <div className="text-xl font-semibold">题目管理</div>
          <div className="text-gray-500">管理测评题目</div>
        </Link>

        <Link href="/admin/push" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div className="text-4xl mb-2">📢</div>
          <div className="text-xl font-semibold">推送消息管理</div>
          <div className="text-gray-500">管理推送语录</div>
        </Link>
      </div>
    </div>
  )
}

export default DashboardPage
