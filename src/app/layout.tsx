'use client'

import { usePathname } from 'next/navigation'
import { UserProvider } from './context/userContext'
import Menu from '../app/components/menu'
import './globals.css'
import { Geist, Geist_Mono } from 'next/font/google'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // páginas sem menu
  const hideMenu = ['/login', '/register'].includes(pathname)

  return (
    <html lang="en">
      <UserProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {!hideMenu && <Menu />}
          {children}
        </body>
      </UserProvider>
    </html>
  )
}
