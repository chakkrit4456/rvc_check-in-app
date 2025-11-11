'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { User } from '@supabase/supabase-js'

type Announcement = {
  id: string
  title: string
  content: string
  announcement_type: string
  priority: string
  target_audience: string
  is_published: boolean
  published_at: string | null
  created_at: string
  creator: {
    first_name: string
    last_name: string
  } | null
}

export default function AnnouncementsPage() {
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    announcement_type: 'general',
    priority: 'normal',
    target_audience: 'all',
    is_published: false
  })

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          creator:profiles(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setAnnouncements(data || []);
    } catch (error: any) {
      console.error('Error loading announcements:', error);
      toast.error(`ไม่สามารถโหลดประกาศได้: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      await loadAnnouncements();
    }
    loadInitialData();
  }, [router, loadAnnouncements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.content || !user) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน')
      return
    }

    try {
      const announcementData = {
        ...formData,
        creator_id: user.id,
        published_at: formData.is_published ? new Date().toISOString() : null
      }

      let error;
      if (editingAnnouncement) {
        const { error: updateError } = await supabase
          .from('announcements')
          .update(announcementData)
          .eq('id', editingAnnouncement.id)
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('announcements')
          .insert([announcementData])
        error = insertError;
      }

      if (error) {
        throw error;
      }

      toast.success(editingAnnouncement ? 'อัปเดตประกาศสำเร็จ' : 'สร้างประกาศสำเร็จ');

      setShowCreateForm(false)
      setEditingAnnouncement(null)
      setFormData({
        title: '',
        content: '',
        announcement_type: 'general',
        priority: 'normal',
        target_audience: 'all',
        is_published: false
      })
      await loadAnnouncements()
    } catch (error: any) {
      console.error('Error saving announcement:', error)
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  }

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      announcement_type: announcement.announcement_type,
      priority: announcement.priority,
      target_audience: announcement.target_audience,
      is_published: announcement.is_published
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (announcementId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบประกาศนี้?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcementId)

      if (error) {
        throw error;
      }

      toast.success('ลบประกาศสำเร็จ')
      await loadAnnouncements()
    } catch (error: any) {
      console.error('Error deleting announcement:', error)
      toast.error(`เกิดข้อผิดพลาดในการลบ: ${error.message}`);
    }
  }

  const togglePublishStatus = async (announcementId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus
      const publishedAt = newStatus ? new Date().toISOString() : null
      
      const { error } = await supabase
        .from('announcements')
        .update({ 
          is_published: newStatus,
          published_at: publishedAt
        })
        .eq('id', announcementId)

      if (error) {
        throw error;
      }

      toast.success('อัปเดตสถานะการเผยแพร่สำเร็จ')
      await loadAnnouncements()
    } catch (error: any) {
      console.error('Error updating status:', error)
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
        <h1 className="text-3xl font-bold text-gray-900">จัดการประกาศ</h1>
        <button
          onClick={() => {
            setEditingAnnouncement(null);
            setFormData({
              title: '',
              content: '',
              announcement_type: 'general',
              priority: 'normal',
              target_audience: 'all',
              is_published: false
            });
            setShowCreateForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          สร้างประกาศใหม่
        </button>
      </div>

      {/* Announcements List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หัวข้อ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สร้างเมื่อ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {announcements.map((announcement) => (
              <tr key={announcement.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{announcement.title}</div>
                  <div className="text-sm text-gray-500">{announcement.announcement_type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${announcement.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {announcement.is_published ? 'เผยแพร่แล้ว' : 'ร่าง'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(announcement.created_at).toLocaleString('th-TH')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => handleEdit(announcement)} className="text-blue-600 hover:text-blue-900">แก้ไข</button>
                  <button onClick={() => togglePublishStatus(announcement.id, announcement.is_published)} className={announcement.is_published ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}>{announcement.is_published ? 'ยกเลิกเผยแพร่' : 'เผยแพร่'}</button>
                  <button onClick={() => handleDelete(announcement.id)} className="text-red-600 hover:text-red-900">ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {announcements.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">ไม่พบประกาศ</p>
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">{editingAnnouncement ? 'แก้ไขประกาศ' : 'สร้างประกาศใหม่'}</h3>
                <button onClick={() => { setShowCreateForm(false); setEditingAnnouncement(null); }} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อ *</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เนื้อหา *</label>
                  <textarea required value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={6} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
                    <select value={formData.announcement_type} onChange={(e) => setFormData({ ...formData, announcement_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="general">ทั่วไป</option>
                      <option value="activity">กิจกรรม</option>
                      <option value="exam">การสอบ</option>
                      <option value="holiday">วันหยุด</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ความสำคัญ</label>
                    <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="low">ต่ำ</option>
                      <option value="normal">ปกติ</option>
                      <option value="high">สำคัญ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">กลุ่มเป้าหมาย</label>
                    <select value={formData.target_audience} onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="all">ทุกคน</option>
                      <option value="students">นักเรียน</option>
                      <option value="teachers">ครู</option>
                      <option value="staff">เจ้าหน้าที่</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="is_published" checked={formData.is_published} onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">เผยแพร่ทันที</label>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button type="button" onClick={() => { setShowCreateForm(false); setEditingAnnouncement(null); }} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">ยกเลิก</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{editingAnnouncement ? 'อัปเดต' : 'สร้าง'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



