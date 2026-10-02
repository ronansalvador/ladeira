'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import saveUser from '../helpers/saveUser'
import { User } from '../types'

interface UserContextProps {
  user: User | null
  changeUser: (user: User | null) => void
  loading: boolean
  logout: () => Promise<void>
}

const UserContext = createContext<UserContextProps>({
  user: null,
  changeUser: () => {},
  loading: true,
  logout: async () => {},
})

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as User & { token?: string }
        delete parsedUser.token
        setUser(parsedUser)
        localStorage.setItem('user', JSON.stringify(parsedUser))
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error)
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const changeUser = (newUser: User | null) => {
    setUser(newUser)
    if (newUser?.name) {
      saveUser(JSON.stringify(newUser))
    } else {
      localStorage.removeItem('user')
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
    } catch {
      // Limpa o estado local mesmo se a rede estiver indisponível.
    } finally {
      setUser(null)
      localStorage.removeItem('user')
    }
  }

  return (
    <UserContext.Provider value={{ user, changeUser, loading, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
