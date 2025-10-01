'use client'
import { useLogout } from '@/app/helpers/useLogout'
import { useAuthGuard } from '@/app/helpers/useAuthGuard'
import { useUser } from './context/userContext'

export default function Home() {
  useAuthGuard()
  const { user } = useUser()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Gafieira da Ladeira</h1>
      {user?.role == 'admin' ? (
        <>
          <p>{`${user.name} Bem-vindo(a)!`}</p>
        </>
      ) : (
        <>
          <p>Solicite acesso ao administrador do sistema!</p>
        </>
      )}
    </div>
  )
}
