import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import ConditionalNavigation from '../components/ConditionalNavigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'RVC Admin Panel - ระบบจัดการกิจกรรมนักศึกษาวิทยาลัยอาชีวศึกษาร้อยเอ็ด',
  description: 'แผงควบคุมผู้ดูแลระบบจัดการการเข้าแถวและกิจกรรม',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={`${inter.className} bg-gray-100`}>
        <div className="flex min-h-screen">
          <ConditionalNavigation />
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}