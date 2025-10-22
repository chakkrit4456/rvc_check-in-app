'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [showAddClassroom, setShowAddClassroom] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedYearLevel, setSelectedYearLevel] = useState<number>(1);

  // Form states
  const [newDepartment, setNewDepartment] = useState({ name: '', description: '' });
  const [newClassroom, setNewClassroom] = useState({ name: '', department_id: '', year_level: 1 });

  useEffect(() => {
    loadDepartments();
    loadClassrooms();
  }, []);

  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
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

      if (error) throw error;
      setClassrooms(data || []);
    } catch (error) {
      console.error('Error loading classrooms:', error);
    }
  };

  const addDepartment = async () => {
    if (!newDepartment.name.trim()) return;

    try {
      const { error } = await supabase
        .from('departments')
        .insert([newDepartment]);

      if (error) throw error;

      setNewDepartment({ name: '', description: '' });
      setShowAddDepartment(false);
      loadDepartments();
    } catch (error) {
      console.error('Error adding department:', error);
    }
  };

  const addClassroom = async () => {
    if (!newClassroom.name.trim() || !newClassroom.department_id) return;

    try {
      const { error } = await supabase
        .from('classrooms')
        .insert([newClassroom]);

      if (error) throw error;

      setNewClassroom({ name: '', department_id: '', year_level: 1 });
      setShowAddClassroom(false);
      loadClassrooms();
    } catch (error) {
      console.error('Error adding classroom:', error);
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

      loadDepartments();
      loadClassrooms();
    } catch (error) {
      console.error('Error deleting department:', error);
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

      loadClassrooms();
    } catch (error) {
      console.error('Error deleting classroom:', error);
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
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">จัดการแผนกวิชาและห้องเรียน</h1>
        <p className="text-gray-600">เพิ่ม แก้ไข และลบแผนกวิชาและห้องเรียน</p>
      </div>

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
            <h3 className="text-lg font-medium mb-4">เพิ่มแผนกวิชาใหม่</h3>
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
                onClick={addDepartment}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                บันทึก
              </button>
              <button
                onClick={() => {
                  setShowAddDepartment(false);
                  setNewDepartment({ name: '', description: '' });
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
    </div>
  );
}
