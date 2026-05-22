import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/components/shared/QueryProvider'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Planning App',
  description: 'จัดการแผนและเป้าหมายของคุณ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className={geist.className}>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
