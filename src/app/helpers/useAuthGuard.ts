// 'use client'
// import { useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { useUser } from '@/app/context/userContext'

// export function useAuthGuard() {
//   const { user } = useUser()
//   const router = useRouter()

//   useEffect(() => {
//     if (!user?.name) {
//       router.push('/login')
//     }
//   }, [user, router])
// }
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/app/context/userContext'

export function useAuthGuard(allowedRoles?: string[]) {
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    // se não estiver logado, manda pro login
    if (!user?.name) {
      router.push('/login')
      return
    }

    // se tiver roles permitidos e o user.role não estiver na lista, manda pro /
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.push('/')
    }
  }, [user, router, allowedRoles])
}
