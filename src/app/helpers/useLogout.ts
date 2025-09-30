'use client'
import { useRouter } from 'next/navigation'
import { useUser } from '@/app/context/userContext'

export function useLogout() {
  const { changeUser } = useUser()
  const router = useRouter()

  const logout = () => {
    changeUser({ name: '', email: '', token: '', role: '' })
    localStorage.removeItem('user')
    router.push('/login')
  }

  return { logout }
}
