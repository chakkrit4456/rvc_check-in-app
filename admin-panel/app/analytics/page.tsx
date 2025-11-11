'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

type AnalyticsData = {
  totalStudents: number
  activeStudents: number
  totalActivities: number
  activeActivities: number
  totalAttendance: number
  todayAttendance: number
  attendanceRate: number
  departmentStats: Array<{
    department_name: string
    student_count: number
    attendance_count: number
    attendance_rate: number
  }>
  classroomStats: Array<{
    classroom_name: string
    department_name: string
    student_count: number
    attendance_count: number
    attendance_rate: number
  }>
  activityStats: Array<{
    activity_title: string
    attendance_count: number
    unique_students: number
  }>
  dailyAttendance: Array<{
    date: string
    attendance_count: number
  }>
  recentActivities: Array<{
    title: string
    start_time: string
    attendance_count: number
  }>
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    checkAuth()
    loadAnalyticsData()
  }, [dateRange])

  const checkAuth = () => {
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

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)

      // Overview Stats
      const { count: totalStudents } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student')
      const { count: activeStudents } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student').eq('is_active', true)
      const { count: totalActivities } = await supabase.from('activities').select('id', { count: 'exact', head: true })
      const { count: activeActivities } = await supabase.from('activities').select('id', { count: 'exact', head: true }).eq('status', 'active')
      const { count: totalAttendance } = await supabase.from('attendance_records').select('id', { count: 'exact', head: true }).gte('check_in_time', `${dateRange.start}T00:00:00`).lte('check_in_time', `${dateRange.end}T23:59:59`)

      // Department & Classroom Stats (less efficient, but keeps UI working)
      const { data: departmentsData } = await supabase.from('departments').select('*')
      const { data: classroomsData } = await supabase.from('classrooms').select('id, name, department_id')
      const { data: profilesData } = await supabase.from('profiles').select('id, department_id, classroom_id').eq('role', 'student')
      const { data: attendanceData } = await supabase.from('attendance_records').select('*').gte('check_in_time', `${dateRange.start}T00:00:00`).lte('check_in_time', `${dateRange.end}T23:59:59`)

      const studentDeptMap = new Map(profilesData?.map(p => [p.id, p.department_id]))
      const studentClassroomMap = new Map(profilesData?.map(p => [p.id, p.classroom_id]))

      const departmentStats = departmentsData?.map(dept => {
        const studentsInDept = profilesData?.filter(p => p.department_id === dept.id).length || 0
        const attendanceInDept = attendanceData?.filter(a => studentDeptMap.get(a.student_id) === dept.id).length || 0
        return {
          department_name: dept.name,
          student_count: studentsInDept,
          attendance_count: attendanceInDept,
          attendance_rate: studentsInDept > 0 ? (attendanceInDept / studentsInDept) * 100 : 0
        }
      }) || []

      const classroomStats = classroomsData?.map(classroom => {
        const studentsInClassroom = profilesData?.filter(p => p.classroom_id === classroom.id).length || 0
        const attendanceInClassroom = attendanceData?.filter(a => studentClassroomMap.get(a.student_id) === classroom.id).length || 0
        const department = departmentsData?.find(d => d.id === classroom.department_id)
        return {
          classroom_name: classroom.name,
          department_name: department?.name || 'ไม่ระบุ',
          student_count: studentsInClassroom,
          attendance_count: attendanceInClassroom,
          attendance_rate: studentsInClassroom > 0 ? (attendanceInClassroom / studentsInClassroom) * 100 : 0
        }
      }) || []

      // Activity Stats
      const { data: activityStatsData } = await supabase.from('activities').select('title, attendance(count)')
      const activityStats = activityStatsData?.map(a => ({ activity_title: a.title, attendance_count: a.attendance[0]?.count || 0, unique_students: 0 })) || []

      // Daily Attendance
      const { data: dailyAttendanceData } = await supabase.rpc('get_daily_attendance', { start_date: dateRange.start, end_date: dateRange.end })
      const dailyAttendance = dailyAttendanceData || []

      // Recent Activities
      const { data: recentActivitiesData } = await supabase.from('activities').select('title, start_time, attendance(count)').order('start_time', { ascending: false }).limit(5)
      const recentActivities = recentActivitiesData?.map(a => ({ title: a.title, start_time: a.start_time, attendance_count: a.attendance[0]?.count || 0 })) || []

      const analytics: AnalyticsData = {
        totalStudents: totalStudents || 0,
        activeStudents: activeStudents || 0,
        totalActivities: totalActivities || 0,
        activeActivities: activeActivities || 0,
        totalAttendance: totalAttendance || 0,
        todayAttendance: dailyAttendance.find(d => d.date === new Date().toISOString().split('T')[0])?.attendance_count || 0,
        attendanceRate: totalStudents && totalAttendance ? (totalAttendance / totalStudents) * 100 : 0,
        departmentStats,
        classroomStats,
        activityStats,
        dailyAttendance,
        recentActivities
      }

      setAnalyticsData(analytics)
    } catch (error) {
      console.error('Error loading analytics data:', error)
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลวิเคราะห์')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!analyticsData) return;

    const csvData = [
      ['รายงานสถิติระบบจัดการกิจกรรม'],
      [''],
      ['ข้อมูลรวม'],
      [`จำนวนนักเรียนทั้งหมด,${analyticsData.totalStudents}`],
      [`จำนวนกิจกรรมทั้งหมด,${analyticsData.totalActivities}`],
      [`จำนวนการเข้าร่วมทั้งหมด,${analyticsData.totalAttendance}`],
      [`อัตราการเข้าร่วม,${analyticsData.attendanceRate.toFixed(1)}%`],
      [''],
      ['สถิติตามแผนก'],
      ['แผนก,จำนวนนักเรียน,จำนวนการเข้าร่วม,อัตราการเข้าร่วม'],
      ...analyticsData.departmentStats.map(stat => [
        stat.department_name,
        stat.student_count,
        stat.attendance_count,
        `${stat.attendance_rate.toFixed(1)}%`
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `analytics_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบข้อมูล</h3>
          <p className="text-gray-500">ไม่สามารถโหลดข้อมูลวิเคราะห์ได้</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ภาพรวมและรายงาน</h1>
          <p className="text-gray-600">สถิติและข้อมูลวิเคราะห์ของระบบ</p>
        </div>
        <button onClick={exportToCSV} className="btn-success">
          ส่งออก CSV
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">ช่วงวันที่:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="input-field"
          />
          <span className="text-gray-500">ถึง</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="input-field"
          />
          <button
            onClick={loadAnalyticsData}
            className="btn-primary"
          >
            อัปเดต
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">นักเรียนทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">กิจกรรมทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalActivities}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">การเช็คชื่อทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalAttendance}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">อัตราการเข้าร่วม</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.attendanceRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Department Stats */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">สถิติตามแผนกวิชา</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">แผนกวิชา</th>
                <th className="table-header">จำนวนนักเรียน</th>
                <th className="table-header">การเช็คชื่อ</th>
                <th className="table-header">อัตราการเข้าร่วม</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.departmentStats.map((dept, index) => (
                <tr key={index}>
                  <td className="table-cell">{dept.department_name}</td>
                  <td className="table-cell">{dept.student_count}</td>
                  <td className="table-cell">{dept.attendance_count}</td>
                  <td className="table-cell">{dept.attendance_rate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">สถิติตามกิจกรรม</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">กิจกรรม</th>
                <th className="table-header">การเช็คชื่อ</th>
                <th className="table-header">นักเรียนที่เข้าร่วม</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.activityStats.map((activity, index) => (
                <tr key={index}>
                  <td className="table-cell">{activity.activity_title}</td>
                  <td className="table-cell">{activity.attendance_count}</td>
                  <td className="table-cell">{activity.unique_students}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Attendance Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">การเช็คชื่อรายวัน</h3>
        <div className="space-y-2">
          {analyticsData.dailyAttendance.map((day, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                {new Date(day.date).toLocaleDateString('th-TH')}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((day.attendance_count / 10) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{day.attendance_count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">กิจกรรมล่าสุด</h3>
        <div className="space-y-4">
          {analyticsData.recentActivities.map((activity, index) => (
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
    </div>
  )
}
