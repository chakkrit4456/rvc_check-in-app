import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

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
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
