'use client'
import { useRouter } from 'next/navigation'
import { useUser } from '@/app/context/userContext'

export function useLogout() {
  const { logout: logoutUser } = useUser()
  const router = useRouter()

  const logout = async () => {
    await logoutUser()
    router.push('/login')
  }

  return { logout }
}
