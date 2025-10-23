'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

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

  useEffect(() => {
    checkAuth()
    loadAnnouncements()
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

  const loadAnnouncements = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          creator:profiles(first_name, last_name)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading announcements:', error)
        toast.error('ไม่สามารถโหลดข้อมูลข่าวสารได้')
        return
      }

      setAnnouncements(data || [])
    } catch (error) {
      console.error('Error loading announcements:', error)
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.content) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็น')
      return
    }

    try {
      const announcementData = {
        ...formData,
        creator_id: JSON.parse(localStorage.getItem('admin_session') || '{}').user?.id,
        published_at: formData.is_published ? new Date().toISOString() : null
      }

      if (editingAnnouncement) {
        // Update existing announcement
        const { error } = await supabase
          .from('announcements')
          .update(announcementData)
          .eq('id', editingAnnouncement.id)

        if (error) {
          console.error('Error updating announcement:', error)
          toast.error('ไม่สามารถอัปเดตข่าวสารได้')
          return
        }

        toast.success('อัปเดตข่าวสารสำเร็จ')
      } else {
        // Create new announcement
        const { error } = await supabase
          .from('announcements')
          .insert([announcementData])

        if (error) {
          console.error('Error creating announcement:', error)
          toast.error('ไม่สามารถสร้างข่าวสารได้')
          return
        }

        toast.success('สร้างข่าวสารสำเร็จ')
      }

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
      loadAnnouncements()
    } catch (error) {
      console.error('Error saving announcement:', error)
      toast.error('เกิดข้อผิดพลาดในการบันทึก')
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
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบข่าวสารนี้?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcementId)

      if (error) {
        console.error('Error deleting announcement:', error)
        toast.error('ไม่สามารถลบข่าวสารได้')
        return
      }

      toast.success('ลบข่าวสารสำเร็จ')
      loadAnnouncements()
    } catch (error) {
      console.error('Error deleting announcement:', error)
      toast.error('เกิดข้อผิดพลาดในการลบ')
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
        console.error('Error updating announcement status:', error)
        toast.error('ไม่สามารถอัปเดตสถานะได้')
        return
      }

      toast.success('อัปเดตสถานะสำเร็จ')
      loadAnnouncements()
    } catch (error) {
      console.error('Error updating announcement status:', error)
      toast.error('เกิดข้อผิดพลาดในการอัปเดต')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'normal':
        return 'bg-blue-100 text-blue-800'
      case 'low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'general':
        return 'ทั่วไป'
      case 'activity':
        return 'กิจกรรม'
      case 'exam':
        return 'การสอบ'
      case 'holiday':
        return 'วันหยุด'
      default:
        return type
    }
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
              <h1 className="text-3xl font-bold text-gray-900">จัดการข่าวสาร</h1>
              <p className="text-gray-600">สร้าง แก้ไข และจัดการข่าวสารประกาศ</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                สร้างข่าวสารใหม่
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
        {/* Announcements List */}
        <div className="grid grid-cols-1 gap-6">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority === 'high' ? 'สำคัญ' : announcement.priority === 'normal' ? 'ปกติ' : 'ต่ำ'}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      announcement.is_published 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {announcement.is_published ? 'เผยแพร่แล้ว' : 'ร่าง'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-2 line-clamp-3">{announcement.content}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">ประเภท:</span> {getTypeLabel(announcement.announcement_type)}
                    </div>
                    <div>
                      <span className="font-medium">กลุ่มเป้าหมาย:</span> {announcement.target_audience === 'all' ? 'ทุกคน' : announcement.target_audience}
                    </div>
                    <div>
                      <span className="font-medium">สร้างเมื่อ:</span> {new Date(announcement.created_at).toLocaleString('th-TH')}
                    </div>
                    {announcement.published_at && (
                      <div>
                        <span className="font-medium">เผยแพร่เมื่อ:</span> {new Date(announcement.published_at).toLocaleString('th-TH')}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">สร้างโดย:</span> {announcement.creator?.first_name} {announcement.creator?.last_name}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="text-blue-600 hover:text-blue-900 text-sm"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => togglePublishStatus(announcement.id, announcement.is_published)}
                    className={`text-sm ${
                      announcement.is_published 
                        ? 'text-yellow-600 hover:text-yellow-900' 
                        : 'text-green-600 hover:text-green-900'
                    }`}
                  >
                    {announcement.is_published ? 'ยกเลิกเผยแพร่' : 'เผยแพร่'}
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {announcements.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">ยังไม่มีข่าวสาร</p>
          </div>
        )}
      </main>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingAnnouncement ? 'แก้ไขข่าวสาร' : 'สร้างข่าวสารใหม่'}
                </h3>
                <button
                  onClick={() => {
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
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    หัวข้อข่าวสาร *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เนื้อหา *
                  </label>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ประเภท
                    </label>
                    <select
                      value={formData.announcement_type}
                      onChange={(e) => setFormData({ ...formData, announcement_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="general">ทั่วไป</option>
                      <option value="activity">กิจกรรม</option>
                      <option value="exam">การสอบ</option>
                      <option value="holiday">วันหยุด</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ความสำคัญ
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">ต่ำ</option>
                      <option value="normal">ปกติ</option>
                      <option value="high">สำคัญ</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      กลุ่มเป้าหมาย
                    </label>
                    <select
                      value={formData.target_audience}
                      onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">ทุกคน</option>
                      <option value="students">นักเรียน</option>
                      <option value="teachers">ครู</option>
                      <option value="staff">เจ้าหน้าที่</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">
                    เผยแพร่ทันที
                  </label>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setEditingAnnouncement(null)
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingAnnouncement ? 'อัปเดต' : 'สร้าง'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


