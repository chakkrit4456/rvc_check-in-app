'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

type ReportData = {
  totalStudents: number
  totalActivities: number
  totalAttendance: number
  attendanceRate: number
  departmentStats: Array<{
    department_name: string
    student_count: number
    attendance_count: number
    attendance_rate: number
  }>
  recentActivities: Array<{
    title: string
    start_time: string
    attendance_count: number
  }>
}

export default function ReportsPage() {
  const router = useRouter()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    checkAuth()
    loadReportData()
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
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/login')
    }
  }

  const loadReportData = async () => {
    try {
      setLoading(true)
      
      // Get total students
      const { count: totalStudents } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')

      // Get total activities
      const { count: totalActivities } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })

      // Get total attendance records
      const { count: totalAttendance } = await supabase
        .from('attendance_records')
        .select('*', { count: 'exact', head: true })

      // Get department statistics
      const { data: departmentStats } = await supabase
        .from('profiles')
        .select(`
          department:departments(name),
          attendance_records(count)
        `)
        .eq('role', 'student')

      // Get recent activities with attendance
      const { data: recentActivities } = await supabase
        .from('activities')
        .select(`
          title,
          start_time,
          attendance_records(count)
        `)
        .order('start_time', { ascending: false })
        .limit(5)

      const attendanceRate = totalStudents && totalAttendance 
        ? Math.round((totalAttendance / (totalStudents * totalActivities)) * 100) 
        : 0

      setReportData({
        totalStudents: totalStudents || 0,
        totalActivities: totalActivities || 0,
        totalAttendance: totalAttendance || 0,
        attendanceRate,
        departmentStats: departmentStats?.map(stat => ({
          department_name: stat.department?.name || 'ไม่ระบุ',
          student_count: 1,
          attendance_count: stat.attendance_records?.length || 0,
          attendance_rate: 0
        })) || [],
        recentActivities: recentActivities?.map(activity => ({
          title: activity.title,
          start_time: activity.start_time,
          attendance_count: activity.attendance_records?.length || 0
        })) || []
      })
    } catch (error) {
      console.error('Error loading report data:', error)
      toast.error('ไม่สามารถโหลดข้อมูลรายงานได้')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!reportData) return

    const csvData = [
      ['รายงานสถิติระบบจัดการกิจกรรม'],
      [''],
      ['ข้อมูลรวม'],
      [`จำนวนนักเรียนทั้งหมด,${reportData.totalStudents}`],
      [`จำนวนกิจกรรมทั้งหมด,${reportData.totalActivities}`],
      [`จำนวนการเข้าร่วมทั้งหมด,${reportData.totalAttendance}`],
      [`อัตราการเข้าร่วม,${reportData.attendanceRate}%`],
      [''],
      ['สถิติตามแผนก'],
      ['แผนก,จำนวนนักเรียน,จำนวนการเข้าร่วม,อัตราการเข้าร่วม'],
      ...reportData.departmentStats.map(stat => [
        stat.department_name,
        stat.student_count,
        stat.attendance_count,
        `${stat.attendance_rate}%`
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
              <h1 className="text-3xl font-bold text-gray-900">รายงานและสถิติ</h1>
              <p className="text-gray-600">ดูรายงานและสถิติการใช้งานระบบ</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                ส่งออก CSV
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                กลับไปหน้าแรก
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {reportData && (
          <>
            {/* Summary Stats */}
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
                      <dd className="text-lg font-medium text-gray-900">{reportData.totalStudents}</dd>
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
                      <dt className="text-sm font-medium text-gray-500 truncate">จำนวนกิจกรรมทั้งหมด</dt>
                      <dd className="text-lg font-medium text-gray-900">{reportData.totalActivities}</dd>
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
                      <dt className="text-sm font-medium text-gray-500 truncate">จำนวนการเข้าร่วมทั้งหมด</dt>
                      <dd className="text-lg font-medium text-gray-900">{reportData.totalAttendance}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">อัตราการเข้าร่วม</dt>
                      <dd className="text-lg font-medium text-gray-900">{reportData.attendanceRate}%</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Statistics */}
            <div className="card mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">สถิติตามแผนกวิชา</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        แผนกวิชา
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        จำนวนนักเรียน
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        จำนวนการเข้าร่วม
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        อัตราการเข้าร่วม
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.departmentStats.map((stat, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {stat.department_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stat.student_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stat.attendance_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stat.attendance_rate}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">กิจกรรมล่าสุด</h3>
              <div className="space-y-4">
                {reportData.recentActivities.map((activity, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{activity.title}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.start_time).toLocaleString('th-TH')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.attendance_count} คนเข้าร่วม
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}


