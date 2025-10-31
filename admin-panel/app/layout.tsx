import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import ConditionalNavigation from '../components/ConditionalNavigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'RVC Admin Panel - ระบบจัดการกิจกรรมนักเรียน',
  description: 'แผงควบคุมผู้ดูแลระบบจัดการการเข้าแถวและกิจกรรมนักเรียน',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <ConditionalNavigation />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}