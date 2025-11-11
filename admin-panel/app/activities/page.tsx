'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { User } from '@supabase/supabase-js'

type Activity = {
  id: string
  title: string
  description: string
  activity_type: string
  location: string
  start_time: string
  end_time: string
  status: string
  requires_photo: boolean
  created_at: string
  creator: {
    first_name: string
    last_name: string
  } | null
}

export default function ActivitiesPage() {
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activity_type: 'general',
    location: '',
    start_time: '',
    end_time: '',
    requires_photo: false,
  })

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);

      await loadActivities();

      setLoading(false);
    }
    loadInitialData();
  }, [router])

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          id,
          title,
          description,
          activity_type,
          location,
          start_time,
          end_time,
          status,
          requires_photo,
          created_at,
          creator:profiles(first_name, last_name)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        throw error;
      }
      setActivities(data || [])
    } catch (error: any) {
      console.error('Error loading activities:', error)
      toast.error(`ไม่สามารถโหลดข้อมูลกิจกรรมได้: ${error.message}`);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.start_time || !formData.end_time || !user) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน')
      return
    }

    try {
      const activityData = {
        ...formData,
        creator_id: user.id,
        status: 'active', // Default status
      }

      let error;
      if (editingActivity) {
        // Update existing activity
        const { error: updateError } = await supabase
          .from('activities')
          .update(activityData)
          .eq('id', editingActivity.id)
        error = updateError;
      } else {
        // Create new activity
        const { error: insertError } = await supabase
          .from('activities')
          .insert([activityData])
        error = insertError;
      }

      if (error) {
        throw error;
      }

      toast.success(editingActivity ? 'อัปเดตกิจกรรมสำเร็จ' : 'สร้างกิจกรรมสำเร็จ');

      setShowCreateForm(false)
      setEditingActivity(null)
      setFormData({
        title: '',
        description: '',
        activity_type: 'general',
        location: '',
        start_time: '',
        end_time: '',
        requires_photo: false,
      })
      
      await loadActivities()

    } catch (error: any) {
      console.error('Error saving activity:', error)
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  }

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity)
    setFormData({
      title: activity.title,
      description: activity.description,
      activity_type: activity.activity_type,
      location: activity.location,
      start_time: new Date(activity.start_time).toISOString().substring(0, 16),
      end_time: new Date(activity.end_time).toISOString().substring(0, 16),
      requires_photo: activity.requires_photo,
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (activityId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบกิจกรรมนี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      return
    }

    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId)

      if (error) {
        throw error;
      }

      toast.success('ลบกิจกรรมสำเร็จ')
      await loadActivities()
    } catch (error: any) {
      console.error('Error deleting activity:', error)
      toast.error(`เกิดข้อผิดพลาดในการลบ: ${error.message}`);
    }
  }

  const toggleActivityStatus = async (activityId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      
      const { error } = await supabase
        .from('activities')
        .update({ status: newStatus })
        .eq('id', activityId)

      if (error) {
        throw error;
      }

      toast.success('อัปเดตสถานะสำเร็จ')
      await loadActivities()
    } catch (error: any) {
      console.error('Error updating activity status:', error)
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">จัดการกิจกรรม</h1>
        <button
          onClick={() => {
            setEditingActivity(null);
            setFormData({
              title: '',
              description: '',
              activity_type: 'general',
              location: '',
              start_time: '',
              end_time: '',
              requires_photo: false,
            });
            setShowCreateForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          สร้างกิจกรรมใหม่
        </button>
      </div>

      {/* Activities List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">กิจกรรม</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เวลา</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สร้างโดย</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activities.map((activity) => (
              <tr key={activity.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                  <div className="text-sm text-gray-500">{activity.location}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    activity.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {activity.status === 'active' ? 'กำลังเปิด' : 'ปิดใช้งาน'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(activity.start_time).toLocaleString('th-TH')} - {new Date(activity.end_time).toLocaleString('th-TH')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {activity.creator?.first_name} {activity.creator?.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => router.push(`/activities/${activity.id}/live`)} className="text-indigo-600 hover:text-indigo-900">Live</button>
                  <button onClick={() => handleEdit(activity)} className="text-blue-600 hover:text-blue-900">แก้ไข</button>
                  <button onClick={() => toggleActivityStatus(activity.id, activity.status)} className={activity.status === 'active' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}>{activity.status === 'active' ? 'ปิด' : 'เปิด'}</button>
                  <button onClick={() => handleDelete(activity.id)} className="text-red-600 hover:text-red-900">ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {activities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">ไม่พบกิจกรรม</p>
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingActivity ? 'แก้ไขกิจกรรม' : 'สร้างกิจกรรมใหม่'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingActivity(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อกิจกรรม *</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทกิจกรรม</label>
                    <select value={formData.activity_type} onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="general">ทั่วไป</option>
                      <option value="morning_assembly">เข้าแถวเช้า</option>
                      <option value="sports">กีฬา</option>
                      <option value="meeting">ประชุม</option>
                      <option value="ceremony">พิธีการ</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">สถานที่</label>
                    <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">เวลาเริ่ม *</label>
                    <input type="datetime-local" required value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">เวลาสิ้นสุด *</label>
                    <input type="datetime-local" required value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input type="checkbox" id="requires_photo" checked={formData.requires_photo} onChange={(e) => setFormData({ ...formData, requires_photo: e.target.checked })} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="requires_photo" className="ml-2 block text-sm text-gray-900">ต้องการรูปภาพยืนยัน</label>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button type="button" onClick={() => { setShowCreateForm(false); setEditingActivity(null); }} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">ยกเลิก</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{editingActivity ? 'อัปเดต' : 'สร้าง'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
