'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'
import toast from 'react-hot-toast'

type Profile = Database['public']['Tables']['profiles']['Row']
type Activity = Database['public']['Tables']['activities']['Row']
type AttendanceRecord = Database['public']['Tables']['attendance']['Row']

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeActivities: 0,
    todayAttendance: 0,
    totalActivities: 0,
  })

  useEffect(() => {
    checkAuth()
    loadDashboardData()
  }, [])

  const checkAuth = async () => {
    try {
      const adminSession = localStorage.getItem('admin_session')
      
      if (!adminSession) {
        router.push('/login')
        return
      }

      const sessionData = JSON.parse(adminSession)
      const now = Date.now()
      const sessionAge = now - sessionData.timestamp
      
      // Check if session is older than 24 hours
      if (sessionAge > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('admin_session')
        router.push('/login')
        return
      }

      if (sessionData.user?.role !== 'admin') {
        toast.error('คุณไม่มีสิทธิ์เข้าถึงแผงควบคุม')
        router.push('/login')
        return
      }

      setUser(sessionData.user)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/login')
    }
  }

  const loadDashboardData = async () => {
    try {
      // Get total students
      const { count: totalStudents } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')

      // Get active activities
      const { count: activeActivities } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      // Get total activities
      const { count: totalActivities } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })

      // Get today's attendance
      const today = new Date().toISOString().split('T')[0]
      const { count: todayAttendance } = await supabase
        .from('attendance_records')
        .select('*', { count: 'exact', head: true })
        .gte('check_in_time', `${today}T00:00:00`)
        .lte('check_in_time', `${today}T23:59:59`)

      setStats({
        totalStudents: totalStudents || 0,
        activeActivities: activeActivities || 0,
        todayAttendance: todayAttendance || 0,
        totalActivities: totalActivities || 0,
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      console.log('Using fallback data for dashboard')
      
      // Set fallback data when database is not available
      setStats({
        totalStudents: 3,
        activeActivities: 4,
        todayAttendance: 2,
        totalActivities: 4,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    localStorage.removeItem('admin_session')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">แผงควบคุมแอดมิน</h1>
              <p className="text-gray-600">ระบบจัดการกิจกรรมนักเรียน</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                สวัสดี, {user?.first_name} {user?.last_name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">จำนวนนักเรียนทั้งหมด</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalStudents}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">กิจกรรมที่กำลังเปิด</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.activeActivities}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">การเข้าร่วมวันนี้</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.todayAttendance}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">กิจกรรมทั้งหมด</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalActivities}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">จัดการกิจกรรม</h3>
            <p className="text-gray-600 mb-4">สร้าง แก้ไข และจัดการกิจกรรมต่างๆ</p>
            <button
              onClick={() => router.push('/activities')}
              className="btn-primary w-full"
            >
              ไปยังหน้าจัดการกิจกรรม
            </button>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">จัดการนักเรียน</h3>
            <p className="text-gray-600 mb-4">ดูข้อมูลและจัดการนักเรียนทั้งหมด</p>
            <button
              onClick={() => router.push('/students')}
              className="btn-primary w-full"
            >
              ไปยังหน้าจัดการนักเรียน
            </button>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">ข่าวสาร</h3>
            <p className="text-gray-600 mb-4">สร้างและจัดการข่าวสารประกาศ</p>
            <button
              onClick={() => router.push('/announcements')}
              className="btn-primary w-full"
            >
              ไปยังหน้าข่าวสาร
            </button>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">รายงาน</h3>
            <p className="text-gray-600 mb-4">ดูรายงานและสถิติต่างๆ</p>
            <button
              onClick={() => router.push('/reports')}
              className="btn-primary w-full"
            >
              ไปยังหน้ารายงาน
            </button>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">ภาพยืนยัน</h3>
            <p className="text-gray-600 mb-4">ดูภาพยืนยันการเข้าร่วมกิจกรรม</p>
            <button
              onClick={() => router.push('/attendance-photos')}
              className="btn-primary w-full"
            >
              ดูภาพยืนยัน
            </button>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">จัดการแผนกวิชา</h3>
            <p className="text-gray-600 mb-4">เพิ่ม แก้ไข และลบแผนกวิชาและห้องเรียน</p>
            <button
              onClick={() => router.push('/departments')}
              className="btn-primary w-full"
            >
              ไปยังหน้าจัดการแผนกวิชา
            </button>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">การตั้งค่า</h3>
            <p className="text-gray-600 mb-4">จัดการการตั้งค่าระบบ</p>
            <button
              onClick={() => router.push('/settings')}
              className="btn-primary w-full"
            >
              ไปยังการตั้งค่า
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
