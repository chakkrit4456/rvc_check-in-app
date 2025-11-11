'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeActivities: 0,
    todayAttendance: 0,
    totalActivities: 0,
  })

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true)
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);

      try {
        const { count: totalStudents } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student')

        const { count: activeActivities } = await supabase
          .from('activities')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')

        const { count: totalActivities } = await supabase
          .from('activities')
          .select('*', { count: 'exact', head: true })

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
        toast.error('ไม่สามารถโหลดข้อมูลแดชบอร์ดได้');
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [router])


  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">แผงควบคุม</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">จำนวนนักเรียนทั้งหมด</h3>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">กิจกรรมที่กำลังเปิด</h3>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.activeActivities}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">การเข้าร่วมวันนี้</h3>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.todayAttendance}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">กิจกรรมทั้งหมด</h3>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalActivities}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">เมนูลัด</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">จัดการกิจกรรม</h3>
            <p className="text-gray-600 mb-4">สร้าง แก้ไข และดูรายละเอียดกิจกรรม</p>
            <button
              onClick={() => router.push('/activities')}
              className="font-semibold text-blue-600 hover:text-blue-800"
            >
              ไปที่หน้ากิจกรรม →
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">จัดการนักเรียน</h3>
            <p className="text-gray-600 mb-4">ค้นหา ดู และแก้ไขข้อมูลนักเรียน</p>
            <button
              onClick={() => router.push('/students')}
              className="font-semibold text-blue-600 hover:text-blue-800"
            >
              ไปที่หน้าจัดการนักเรียน →
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">จัดการประกาศ</h3>
            <p className="text-gray-600 mb-4">สร้างและส่งประกาศถึงนักเรียน</p>
            <button
              onClick={() => router.push('/announcements')}
              className="font-semibold text-blue-600 hover:text-blue-800"
            >
              ไปที่หน้าประกาศ →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
