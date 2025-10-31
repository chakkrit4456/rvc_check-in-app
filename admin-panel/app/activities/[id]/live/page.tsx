'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

type Profile = {
  id: string
  student_id: string
  first_name: string
  last_name: string
  department_id: string
  classroom_id: string
  year_level: number
  department: {
    name: string
  }
  classroom: {
    name: string
  }
}

type Attendee = {
  id: string
  student_id: string
  profiles: Profile
}

type Activity = {
  id: string
  title: string
}

type Department = {
  id: string
  name: string
}

type Classroom = {
  id: string
  name: string
}

export default function LiveActivityPage() {
  const router = useRouter()
  const params = useParams()
  const activityId = params.id as string

  const [activity, setActivity] = useState<Activity | null>(null)
  const [allAttendees, setAllAttendees] = useState<Attendee[]>([])
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [filters, setFilters] = useState({ department: '', classroom: '', year: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    loadInitialData()

    const subscription = supabase
      .channel(`realtime:attendance:activity_id=eq.${activityId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'attendance', filter: `activity_id=eq.${activityId}` },
        async (payload) => {
          const newAttendeeId = payload.new.student_id
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*, department:departments(name), classroom:classrooms(name)')
            .eq('id', newAttendeeId)
            .single()

          if (error) {
            console.error('Error fetching new attendee profile:', error)
          } else {
            const newAttendee: Attendee = {
              id: payload.new.id,
              student_id: newAttendeeId,
              profiles: profile as any,
            }
            setAllAttendees(prev => [newAttendee, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [activityId])

  useEffect(() => {
    let filtered = allAttendees

    if (filters.department) {
      filtered = filtered.filter(a => a.profiles.department_id === filters.department)
    }
    if (filters.classroom) {
      filtered = filtered.filter(a => a.profiles.classroom_id === filters.classroom)
    }
    if (filters.year) {
      filtered = filtered.filter(a => a.profiles.year_level === parseInt(filters.year))
    }

    setAttendees(filtered)
  }, [filters, allAttendees])

  const checkAuth = async () => {
    const adminSession = localStorage.getItem('admin_session')
    if (!adminSession) {
      router.push('/login')
    }
  }

  const loadInitialData = async () => {
    setLoading(true)
    await Promise.all([
      loadActivityDetails(),
      loadInitialAttendees(),
      loadDepartmentsAndClassrooms(),
    ])
    setLoading(false)
  }

  const loadActivityDetails = async () => {
    const { data, error } = await supabase
      .from('activities')
      .select('id, title')
      .eq('id', activityId)
      .single()

    if (error) {
      toast.error('ไม่สามารถโหลดข้อมูลกิจกรรมได้')
      console.error(error)
    } else {
      setActivity(data)
    }
  }

  const loadInitialAttendees = async () => {
    const { data, error } = await supabase
      .from('attendance')
      .select('id, student_id, profiles:profiles(*, department:departments(name), classroom:classrooms(name))')
      .eq('activity_id', activityId)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('ไม่สามารถโหลดข้อมูลผู้เข้าร่วมได้')
      console.error(error)
    } else {
      setAllAttendees(data as any)
    }
  }

  const loadDepartmentsAndClassrooms = async () => {
    const { data: departmentsData, error: departmentsError } = await supabase.from('departments').select('*')
    const { data: classroomsData, error: classroomsError } = await supabase.from('classrooms').select('*')

    if (departmentsError) console.error(departmentsError)
    else setDepartments(departmentsData || [])

    if (classroomsError) console.error(classroomsError)
    else setClassrooms(classroomsData || [])
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!activity) {
    return <div className="min-h-screen flex items-center justify-center">ไม่พบกิจกรรม</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Live Attendance: {activity.title}</h1>
          <button onClick={() => router.back()} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            กลับ
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Total Attendees: {attendees.length}</h2>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select name="department" onChange={handleFilterChange} value={filters.department} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <select name="classroom" onChange={handleFilterChange} value={filters.classroom} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Classrooms</option>
              {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select name="year" onChange={handleFilterChange} value={filters.year} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Year Levels</option>
              {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>{`Year ${y}`}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classroom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendees.map(attendee => (
                <tr key={attendee.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{attendee.profiles.student_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{`${attendee.profiles.first_name} ${attendee.profiles.last_name}`}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendee.profiles.department.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendee.profiles.classroom.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendee.profiles.year_level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}