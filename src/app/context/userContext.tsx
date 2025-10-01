'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import saveUser from '../helpers/saveUser'
import { User } from '../types'

interface UserContextProps {
  user: User | null
  changeUser: (user: User | null) => void
  loading: boolean
  logout: () => void
}

const UserContext = createContext<UserContextProps>({
  user: null,
  changeUser: () => {},
  loading: true,
  logout: () => {},
})

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error)
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const changeUser = (newUser: User | null) => {
    setUser(newUser)
    if (newUser?.token) {
      saveUser(JSON.stringify(newUser))
    } else {
      localStorage.removeItem('user')
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <UserContext.Provider value={{ user, changeUser, loading, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
