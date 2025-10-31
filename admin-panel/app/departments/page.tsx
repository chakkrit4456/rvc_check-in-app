'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Department {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface Classroom {
  id: string;
  name: string;
  department_id: string;
  year_level: number;
  created_at: string;
}

export default function DepartmentManagement() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [showAddClassroom, setShowAddClassroom] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedYearLevel, setSelectedYearLevel] = useState<number>(1);

  // Form states
  const [newDepartment, setNewDepartment] = useState({ name: '', description: '' });
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [newClassroom, setNewClassroom] = useState({ name: '', department_id: '', year_level: 1 });
  const [newStudent, setNewStudent] = useState({ student_id: '', first_name: '', last_name: '', email: '', password: '', department_id: '', classroom_id: '', year_level: 1 });

  useEffect(() => {
    checkAuth();
    loadDepartments();
    loadClassrooms();
  }, []);

  const checkAuth = async () => {
    try {
      const adminSession = localStorage.getItem('admin_session');
      
      if (!adminSession) {
        router.push('/login');
        return;
      }

      const sessionData = JSON.parse(adminSession);
      const now = Date.now();
      const sessionAge = now - sessionData.timestamp;
      
      if (sessionAge > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('admin_session');
        router.push('/login');
        return;
      }

      if (sessionData.user?.role !== 'admin') {
        toast.error('คุณไม่มีสิทธิ์เข้าถึงแผงควบคุม');
        router.push('/login');
        return;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    }
  };

  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error loading departments:', error);
        console.log('Using fallback departments data');
        
        // Set fallback data
        const fallbackDepartments = [
          { id: 'd001', name: 'คหกรรม', description: 'แผนกคหกรรม', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'd002', name: 'บริหารธุรกิจ', description: 'แผนกบริหารธุรกิจ', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'd003', name: 'เทคโนโลยีสารสนเทศฯ', description: 'แผนกเทคโนโลยีสารสนเทศและการสื่อสาร', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'd004', name: 'เทคโนโลยีบัณฑิต', description: 'แผนกเทคโนโลยีบัณฑิต', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'd005', name: 'ศิลปกรรม', description: 'แผนกศิลปกรรม', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'd006', name: 'อุตสาหกรรมการท่องเที่ยว', description: 'แผนกอุตสาหกรรมการท่องเที่ยว', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'd007', name: 'สามัญสัมพันธ์', description: 'แผนกสามัญสัมพันธ์', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ];
        
        setDepartments(fallbackDepartments);
        return;
      }
      
      setDepartments(data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
      console.log('Using fallback departments data');
      
      // Set fallback data
      const fallbackDepartments = [
        { id: 'd001', name: 'คหกรรม', description: 'แผนกคหกรรม', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'd002', name: 'บริหารธุรกิจ', description: 'แผนกบริหารธุรกิจ', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'd003', name: 'เทคโนโลยีสารสนเทศฯ', description: 'แผนกเทคโนโลยีสารสนเทศและการสื่อสาร', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'd004', name: 'เทคโนโลยีบัณฑิต', description: 'แผนกเทคโนโลยีบัณฑิต', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'd005', name: 'ศิลปกรรม', description: 'แผนกศิลปกรรม', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'd006', name: 'อุตสาหกรรมการท่องเที่ยว', description: 'แผนกอุตสาหกรรมการท่องเที่ยว', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'd007', name: 'สามัญสัมพันธ์', description: 'แผนกสามัญสัมพันธ์', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      ];
      
      setDepartments(fallbackDepartments);
    }
  };

  const loadClassrooms = async () => {
    try {
      const { data, error } = await supabase
        .from('classrooms')
        .select(`
          *,
          department:departments(name)
        `)
        .order('department_id')
        .order('year_level')
        .order('name');

      if (error) {
        console.error('Error loading classrooms:', error);
        console.log('Using fallback classrooms data');
        
        // Set fallback data
        const fallbackClassrooms = [
          { id: 'c001', name: 'ปวช.1/1', department_id: 'd001', year_level: 1, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'c002', name: 'ปวช.1/2', department_id: 'd001', year_level: 1, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'c003', name: 'ปวช.1/3', department_id: 'd001', year_level: 1, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'c004', name: 'ปวช.2/1', department_id: 'd001', year_level: 2, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'c005', name: 'ปวช.2/2', department_id: 'd001', year_level: 2, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'c006', name: 'ปวช.2/3', department_id: 'd001', year_level: 2, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'c007', name: 'ปวช.3/1', department_id: 'd001', year_level: 3, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'c008', name: 'ปวช.3/2', department_id: 'd001', year_level: 3, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'c009', name: 'ปวช.3/3', department_id: 'd001', year_level: 3, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'c010', name: 'ปวส.1/1', department_id: 'd001', year_level: 4, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'c011', name: 'ปวส.1/2', department_id: 'd001', year_level: 4, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'c012', name: 'ปวส.1/3', department_id: 'd001', year_level: 4, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'c013', name: 'ปวส.2/1', department_id: 'd001', year_level: 5, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'c014', name: 'ปวส.2/2', department_id: 'd001', year_level: 5, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'c015', name: 'ปวส.2/3', department_id: 'd001', year_level: 5, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ];
        
        setClassrooms(fallbackClassrooms);
        return;
      }
      
      setClassrooms(data || []);
    } catch (error) {
      console.error('Error loading classrooms:', error);
      console.log('Using fallback classrooms data');
      
      // Set fallback data
      const fallbackClassrooms = [
        { id: 'c001', name: 'ปวช.1/1', department_id: 'd001', year_level: 1, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'c002', name: 'ปวช.1/2', department_id: 'd001', year_level: 1, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'c003', name: 'ปวช.1/3', department_id: 'd001', year_level: 1, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'c004', name: 'ปวช.2/1', department_id: 'd001', year_level: 2, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'c005', name: 'ปวช.2/2', department_id: 'd001', year_level: 2, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'c006', name: 'ปวช.2/3', department_id: 'd001', year_level: 2, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'c007', name: 'ปวช.3/1', department_id: 'd001', year_level: 3, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'c008', name: 'ปวช.3/2', department_id: 'd001', year_level: 3, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'c009', name: 'ปวช.3/3', department_id: 'd001', year_level: 3, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'c010', name: 'ปวส.1/1', department_id: 'd001', year_level: 4, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'c011', name: 'ปวส.1/2', department_id: 'd001', year_level: 4, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'c012', name: 'ปวส.1/3', department_id: 'd001', year_level: 4, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'c013', name: 'ปวส.2/1', department_id: 'd001', year_level: 5, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'c014', name: 'ปวส.2/2', department_id: 'd001', year_level: 5, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'c015', name: 'ปวส.2/3', department_id: 'd001', year_level: 5, department: { name: 'คหกรรม' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      ];
      
      setClassrooms(fallbackClassrooms);
    }
  };

  const handleSaveDepartment = async () => {
    if (!newDepartment.name.trim()) {
      toast.error('กรุณากรอกชื่อแผนกวิชา');
      return;
    }

    try {
      let error;
      if (editingDepartment) {
        ({ error } = await supabase
          .from('departments')
          .update({ name: newDepartment.name, description: newDepartment.description })
          .eq('id', editingDepartment.id));
      } else {
        ({ error } = await supabase
          .from('departments')
          .insert([newDepartment]));
      }

      if (error) throw error;

      toast.success(editingDepartment ? 'แก้ไขแผนกวิชาสำเร็จ' : 'เพิ่มแผนกวิชาสำเร็จ');
      setNewDepartment({ name: '', description: '' });
      setEditingDepartment(null);
      setShowAddDepartment(false);
      loadDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error(editingDepartment ? 'ไม่สามารถแก้ไขแผนกวิชาได้' : 'ไม่สามารถเพิ่มแผนกวิชาได้');
    }
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setNewDepartment({ name: department.name, description: department.description });
    setShowAddDepartment(true);
  };

  const addClassroom = async () => {
    if (!newClassroom.name.trim() || !newClassroom.department_id) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      const { error } = await supabase
        .from('classrooms')
        .insert([newClassroom]);

      if (error) throw error;

      toast.success('เพิ่มห้องเรียนสำเร็จ');
      setNewClassroom({ name: '', department_id: '', year_level: 1 });
      setShowAddClassroom(false);
      loadClassrooms();
    } catch (error) {
      console.error('Error adding classroom:', error);
      toast.error('ไม่สามารถเพิ่มห้องเรียนได้');
    }
  };

  const deleteDepartment = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบแผนกนี้? การลบจะลบห้องเรียนทั้งหมดในแผนกนี้ด้วย')) return;

    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('ลบแผนกวิชาสำเร็จ');
      loadDepartments();
      loadClassrooms();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('ไม่สามารถลบแผนกวิชาได้');
    }
  };

  const deleteClassroom = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบห้องเรียนนี้?')) return;

    try {
      const { error } = await supabase
        .from('classrooms')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('ลบห้องเรียนสำเร็จ');
      loadClassrooms();
    } catch (error) {
      console.error('Error deleting classroom:', error);
  const addStudent = async () => {
    const { student_id, first_name, last_name, email, password, department_id, classroom_id, year_level } = newStudent;
    if (!student_id || !first_name || !last_name || !email || !password || !department_id || !classroom_id || !year_level) {
      toast.error('กรุณากรอกข้อมูลนักเรียนให้ครบถ้วน');
      return;
    }

    try {
      // Step 1: Sign up the new user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'student'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User not created');

      // Step 2: Insert the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          student_id,
          first_name,
          last_name,
          department_id,
          classroom_id,
          year_level,
          role: 'student'
        }]);

      if (profileError) throw profileError;

      toast.success('เพิ่มนักเรียนสำเร็จ');
      setNewStudent({ student_id: '', first_name: '', last_name: '', email: '', password: '', department_id: '', classroom_id: '', year_level: 1 });

    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('ไม่สามารถเพิ่มนักเรียนได้: ' + error.message);
    }
  };

  const getYearLevelLabel = (level: number) => {
    const labels = {
      1: 'ปวช.1',
      2: 'ปวช.2',
      3: 'ปวช.3',
      4: 'ปวส.1',
      5: 'ปวส.2'
    };
    return labels[level as keyof typeof labels] || `ระดับ ${level}`;
  };

  const getClassroomsByDepartmentAndYear = (departmentId: string, yearLevel: number) => {
    return classrooms.filter(c => c.department_id === departmentId && c.year_level === yearLevel);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">จัดการแผนกวิชาและห้องเรียน</h1>
              <p className="text-gray-600">เพิ่ม แก้ไข และลบแผนกวิชาและห้องเรียน</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              กลับไปหน้าแรก
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

      {/* Departments Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">แผนกวิชา</h2>
          <button
            onClick={() => setShowAddDepartment(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            เพิ่มแผนกวิชา
          </button>
        </div>

        {/* Add Department Form */}
        {showAddDepartment && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-medium mb-4">{editingDepartment ? 'แก้ไขแผนกวิชา' : 'เพิ่มแผนกวิชาใหม่'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อแผนกวิชา *
                </label>
                <input
                  type="text"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="กรอกชื่อแผนกวิชา"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  คำอธิบาย
                </label>
                <input
                  type="text"
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="กรอกคำอธิบาย"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSaveDepartment}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                {editingDepartment ? 'อัปเดต' : 'บันทึก'}
              </button>
              <button
                onClick={() => {
                  setShowAddDepartment(false);
                  setNewDepartment({ name: '', description: '' });
                  setEditingDepartment(null);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}

        {/* Departments List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((department) => (
            <div key={department.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900">{department.name}</h3>
                <button
                  onClick={() => deleteDepartment(department.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  ลบ
                </button>
                <button
                  onClick={() => handleEditDepartment(department)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  แก้ไข
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-3">{department.description}</p>
              <div className="text-xs text-gray-500">
                สร้างเมื่อ: {new Date(department.created_at).toLocaleDateString('th-TH')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Classrooms Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">ห้องเรียน</h2>
          <button
            onClick={() => setShowAddClassroom(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            เพิ่มห้องเรียน
          </button>
        </div>

        {/* Add Classroom Form */}
        {showAddClassroom && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-medium mb-4">เพิ่มห้องเรียนใหม่</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อห้องเรียน *
                </label>
                <input
                  type="text"
                  value={newClassroom.name}
                  onChange={(e) => setNewClassroom({ ...newClassroom, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="เช่น ปวช.1/1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  แผนกวิชา *
                </label>
                <select
                  value={newClassroom.department_id}
                  onChange={(e) => setNewClassroom({ ...newClassroom, department_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">เลือกแผนกวิชา</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชั้นปี *
                </label>
                <select
                  value={newClassroom.year_level}
                  onChange={(e) => setNewClassroom({ ...newClassroom, year_level: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>ปวช.1</option>
                  <option value={2}>ปวช.2</option>
                  <option value={3}>ปวช.3</option>
                  <option value={4}>ปวส.1</option>
                  <option value={5}>ปวส.2</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={addClassroom}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                บันทึก
              </button>
              <button
                onClick={() => {
                  setShowAddClassroom(false);
                  setNewClassroom({ name: '', department_id: '', year_level: 1 });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}

        {/* Classrooms by Department */}
        <div className="space-y-6">
          {departments.map((department) => (
            <div key={department.id} className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{department.name}</h3>
              
              {/* Year Levels */}
              {[1, 2, 3, 4, 5].map((yearLevel) => {
                const yearClassrooms = getClassroomsByDepartmentAndYear(department.id, yearLevel);
                if (yearClassrooms.length === 0) return null;

                return (
                  <div key={yearLevel} className="mb-4">
                    <h4 className="text-md font-medium text-gray-700 mb-2">
                      {getYearLevelLabel(yearLevel)}
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {yearClassrooms.map((classroom) => (
                        <div key={classroom.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                          <span className="text-sm">{classroom.name}</span>
                          <button
                            onClick={() => deleteClassroom(classroom.id)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            ลบ
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Student Management Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">เพิ่มนักเรียนใหม่</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input type="text" placeholder="รหัสนักศึกษา" value={newStudent.student_id} onChange={(e) => setNewStudent({ ...newStudent, student_id: e.target.value })} className="input-field" />
          <input type="text" placeholder="ชื่อจริง" value={newStudent.first_name} onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })} className="input-field" />
          <input type="text" placeholder="นามสกุล" value={newStudent.last_name} onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })} className="input-field" />
          <input type="email" placeholder="อีเมล" value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} className="input-field" />
          <input type="password" placeholder="รหัสผ่าน" value={newStudent.password} onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })} className="input-field" />
          <select value={newStudent.department_id} onChange={(e) => setNewStudent({ ...newStudent, department_id: e.target.value, classroom_id: '' })} className="input-field">
            <option value="">เลือกแผนกวิชา</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={newStudent.year_level} onChange={(e) => setNewStudent({ ...newStudent, year_level: parseInt(e.target.value), classroom_id: '' })} className="input-field">
            <option value={1}>ปวช.1</option>
            <option value={2}>ปวช.2</option>
            <option value={3}>ปวช.3</option>
            <option value={4}>ปวส.1</option>
            <option value={5}>ปวส.2</option>
          </select>
          <select value={newStudent.classroom_id} onChange={(e) => setNewStudent({ ...newStudent, classroom_id: e.target.value })} className="input-field">
            <option value="">เลือกห้องเรียน</option>
            {getClassroomsByDepartmentAndYear(newStudent.department_id, newStudent.year_level).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="mt-4">
          <button onClick={addStudent} className="btn-primary">เพิ่มนักเรียน</button>
        </div>
      </div>
      </main>
    </div>
  );
}




