// 'use client'
// import { useState, useEffect } from 'react'
// import { useUser } from '../context/userContext'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { ToastContainer, toast } from 'react-toastify'
// import 'react-toastify/dist/ReactToastify.css'
// import PasswordInput from '../components/passwordInput'

// type User = {
//   id?: number
//   name: string
//   email: string
//   token: string
//   role: string
// }

// const RegisterPage = () => {
//   const [username, setUsername] = useState('')
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [passwordConfirmation, setPasswordConfirmation] = useState('')
//   const { user, changeUser } = useUser()
//   const router = useRouter()

//   const showToastError = (mensagem: string) => {
//     toast.error(mensagem, { position: 'top-right' })
//   }

//   const registrar = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (password !== passwordConfirmation) {
//       showToastError(
//         'As senhas não coincidem. Por favor, verifique e tente novamente.',
//       )
//       return
//     }
//     try {
//       const response = await fetch(`/api/register`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           name: username,
//           email,
//           password,
//           role: 'user',
//         }),
//       })

//       const data = await response.json()

//       if (!response.ok) {
//         showToastError(data.message || 'Erro ao registrar')
//         return
//       }

//       changeUser(data) // ✅ data já é o user retornado
//     } catch (error) {
//       if (error instanceof Error) {
//         console.error('Erro ao Registrar:', error.message)
//       }
//     }
//   }

//   useEffect(() => {
//     if (user?.name) {
//       router.push('/')
//     }
//   }, [user, router])

//   return (
//     <section className="section_page">
//       <ToastContainer />
//       <h1>Registro</h1>
//       <form onSubmit={registrar} className="form_login">
//         <input
//           type="text"
//           name="username"
//           id="username"
//           placeholder="Digite seu nome"
//           value={username}
//           onChange={({ target }) => setUsername(target.value)}
//           autoComplete="username"
//         />
//         <input
//           type="email"
//           name="email"
//           id="email"
//           placeholder="email@email.com"
//           value={email}
//           onChange={({ target }) => setEmail(target.value)}
//           autoComplete="username"
//         />
//         <PasswordInput
//           passwordValue={password}
//           placeholder="digite sua senha"
//           setPassword={setPassword}
//         />
//         <PasswordInput
//           passwordValue={passwordConfirmation}
//           placeholder="digite novamente sua senha"
//           setPassword={setPasswordConfirmation}
//         />
//         <div className="form_buttons">
//           <button type="submit">Registrar</button>
//           <Link href="/login">Fazer Login</Link>
//         </div>
//       </form>
//     </section>
//   )
// }

// export default RegisterPage
'use client'
import { useState, useEffect } from 'react'
import { useUser } from '../context/userContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import PasswordInput from '../components/passwordInput'

type User = {
  id?: number
  name: string
  email: string
  token: string
  role: string
}

const RegisterPage = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const { user, changeUser } = useUser()
  const router = useRouter()

  const showToastError = (mensagem: string) => {
    toast.error(mensagem, { position: 'top-right' })
  }

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== passwordConfirmation) {
      showToastError(
        'As senhas não coincidem. Por favor, verifique e tente novamente.',
      )
      return
    }
    try {
      const response = await fetch(`/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: username,
          email,
          password,
          role: 'user',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        showToastError(data.message || 'Erro ao registrar')
        return
      }

      changeUser(data)
    } catch (error) {
      if (error instanceof Error) {
        console.error('Erro ao Registrar:', error.message)
      }
    }
  }

  useEffect(() => {
    if (user?.name) {
      router.push('/')
    }
  }, [user, router])

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900 p-4">
      <ToastContainer />
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
          Registro
        </h1>

        <form onSubmit={registrar} className="flex flex-col gap-4">
          <input
            type="text"
            name="username"
            id="username"
            placeholder="Digite seu nome"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
            autoComplete="username"
            className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="email"
            name="email"
            id="email"
            placeholder="email@email.com"
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            autoComplete="username"
            className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <PasswordInput
            passwordValue={password}
            placeholder="digite sua senha"
            setPassword={setPassword}
          />

          <PasswordInput
            passwordValue={passwordConfirmation}
            placeholder="digite novamente sua senha"
            setPassword={setPasswordConfirmation}
          />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
            <button
              type="submit"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition-colors"
            >
              Registrar
            </button>
            <Link
              href="/login"
              className="w-full sm:w-auto text-center bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-800 dark:text-gray-100 font-medium px-5 py-2 rounded-lg transition-colors"
            >
              Fazer Login
            </Link>
          </div>
        </form>
      </div>
    </section>
  )
}

export default RegisterPage
