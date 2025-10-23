'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('กรุณากรอกอีเมลและรหัสผ่าน')
      return
    }

    setLoading(true)

    try {
      // Use profile lookup instead of Supabase Auth
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single()

      if (error) {
        console.error('Profile lookup error:', error)
        
        // Fallback: Check if it's the admin email and allow login
        if (email === 'chakkritnb1123@gmail.com') {
          const fallbackAdmin = {
            id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
            student_id: 'admin',
            national_id: '66202040013',
            first_name: 'Chakkrit',
            last_name: 'Admin',
            gender: 'male',
            email: 'chakkritnb1123@gmail.com',
            phone: '0812345678',
            role: 'admin',
            is_active: true
          }

          // Store admin session in localStorage
          localStorage.setItem('admin_session', JSON.stringify({
            user: fallbackAdmin,
            timestamp: Date.now()
          }))

          toast.success('เข้าสู่ระบบสำเร็จ (Offline Mode)')
          router.push('/dashboard')
          return
        }
        
        toast.error('ไม่สามารถเชื่อมต่อฐานข้อมูลได้')
        return
      }

      if (!profile) {
        toast.error('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
        return
      }

      if (profile.role !== 'admin') {
        toast.error('คุณไม่มีสิทธิ์เข้าถึงแผงควบคุม')
        return
      }

      // Store admin session in localStorage
      localStorage.setItem('admin_session', JSON.stringify({
        user: profile,
        timestamp: Date.now()
      }))

      toast.success('เข้าสู่ระบบสำเร็จ')
      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      toast.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            เข้าสู่ระบบแอดมิน
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ระบบจัดการกิจกรรมนักเรียน
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                อีเมล
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="อีเมล"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                รหัสผ่าน
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="รหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              สำหรับผู้ดูแลระบบเท่านั้น
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}




