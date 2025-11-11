'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

type Student = {
  id: string
  student_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  gender: string
  year_level: number
  classroom: {
    name: string
  } | null
  department: {
    name: string
  } | null
  is_active: boolean
  created_at: string
}

export default function StudentsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [departments, setDepartments] = useState<any[]>([])

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          classroom:classrooms(name),
          department:departments(name)
        `)
        .eq('role', 'student')
        .order('student_id', { ascending: false });

      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,student_id.ilike.%${searchTerm}%`);
      }

      if (filterDepartment) {
        query = query.eq('department_id', filterDepartment);
      }

      if (filterYear) {
        query = query.eq('year_level', parseInt(filterYear));
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }
      setStudents(data || []);
    } catch (error: any) {
      console.error('Error loading students:', error);
      toast.error(`ไม่สามารถโหลดข้อมูลนักเรียนได้: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterDepartment, filterYear]);

  useEffect(() => {
    const loadInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      await Promise.all([
        loadStudents(),
        loadDepartments()
      ]);
    }
    loadInitialData();
  }, [router, loadStudents]);

  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name')

      if (error) {
        throw error;
      }
      setDepartments(data || [])
    } catch (error: any) {
      console.error('Error loading departments:', error)
      toast.error(`ไม่สามารถโหลดข้อมูลแผนกได้: ${error.message}`);
    }
  }

  const toggleStudentStatus = async (studentId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', studentId)

      if (error) {
        throw error;
      }

      toast.success('อัปเดตสถานะสำเร็จ')
      await loadStudents()
    } catch (error: any) {
      console.error('Error updating student status:', error)
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadStudents();
  }

  if (loading && students.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">จัดการนักเรียน</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="ค้นหา..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ทุกแผนก</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ทุกชั้นปี</option>
            <option value="1">ปวช.1</option>
            <option value="2">ปวช.2</option>
            <option value="3">ปวช.3</option>
            <option value="4">ปวส.1</option>
            <option value="5">ปวส.2</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white rounded-md hover:bg-blue-700">ค้นหา</button>
        </form>
      </div>

      {/* Students Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสนักศึกษา</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">แผนกวิชา</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.student_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.first_name} {student.last_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.department?.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${student.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {student.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => toggleStudentStatus(student.id, student.is_active)} className={`${student.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}>
                    {student.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">ไม่พบข้อมูลนักเรียนที่ตรงกับเงื่อนไข</p>
          </div>
        )}
      </div>
    </div>
  )
}


