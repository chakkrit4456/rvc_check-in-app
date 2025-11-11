'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import toast from 'react-hot-toast'
import { BarChart, Bell, Calendar, LogOut, Users } from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Activities', href: '/activities', icon: Calendar },
  { name: 'Announcements', href: '/announcements', icon: Bell },
]

export default function ConditionalNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    fetchUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
      if(event === 'SIGNED_IN'){
        router.refresh()
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('ไม่สามารถออกจากระบบได้')
    } else {
      setUser(null)
      router.push('/login')
      toast.success('ออกจากระบบสำเร็จ')
    }
  }

  if (pathname === '/login' || !user) {
    return null
  }

  return (
    <aside className="w-64 bg-white shadow-md">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600">RVC Admin</h1>
      </div>
      <nav className="mt-6">
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200 ${
                  pathname.startsWith(item.href) ? 'bg-gray-100 text-blue-600' : ''
                }`}>


                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="absolute bottom-0 w-full p-6">
        {user && (
          <div className="text-sm text-gray-500 mb-4">
            <p className="font-semibold">{user.email}</p>
            <p>{user.app_metadata.role || '(ไม่มีบทบาท)'}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 rounded-md"
        >
          <LogOut className="h-5 w-5 mr-3" />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  )
}
