'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu as MenuIcon, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '../context/userContext'
import { useLogout } from '../helpers/useLogout'

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useUser()
  const { logout } = useLogout()

  const menuItems = [
    { href: '/comandas', label: 'Criar Comanda' },
    { href: '/clientes', label: 'Clientes' },
    { href: '/produtos', label: 'Produtos' },
    { href: '/consumos', label: 'Comandas' },
    { href: '/bailes', label: 'Bailes' },
    // { href: '/relatorios', label: 'Relatórios' },
  ]

  return (
    <nav className="bg-gray-100 p-4 shadow-md">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">Sistema</h1>

        {/* Botão hamburguer */}
        <button
          className="md:hidden text-gray-800"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <MenuIcon size={28} />}
        </button>

        {/* Menu desktop */}
        <ul className="hidden md:flex gap-6">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-gray-800 hover:text-blue-500 font-medium"
              >
                {item.label}
              </Link>
            </li>
          ))}

          {/* Se logado mostra botão Sair, senão mostra Login */}
          <li>
            {user?.token ? (
              <button
                onClick={logout}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Sair
              </button>
            ) : (
              <Link
                href="/login"
                className="text-gray-800 hover:text-blue-500 font-medium"
              >
                Logar
              </Link>
            )}
          </li>
        </ul>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4 mt-4 md:hidden"
          >
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-gray-800 hover:text-blue-500 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              {user?.token ? (
                <button
                  onClick={() => {
                    logout()
                    setIsOpen(false)
                  }}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Sair
                </button>
              ) : (
                <Link
                  href="/login"
                  className="text-gray-800 hover:text-blue-500 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Logar
                </Link>
              )}
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </nav>
  )
}
