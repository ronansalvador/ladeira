'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu as MenuIcon, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false)

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
        {/* Logo / Título */}
        <h1 className="text-lg font-bold text-gray-800">Sistema</h1>

        {/* Botão hamburguer (mobile) */}
        <button
          className="md:hidden text-gray-800"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <MenuIcon size={28} />}
        </button>

        {/* Menu em telas grandes */}
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
        </ul>
      </div>

      {/* Menu mobile com animação */}
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -20 }} // começa invisível e levemente acima
            animate={{ opacity: 1, y: 0 }} // aparece deslizando para baixo
            exit={{ opacity: 0, y: -20 }} // desaparece deslizando para cima
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4 mt-4 md:hidden"
          >
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-gray-800 hover:text-blue-500 font-medium"
                  onClick={() => setIsOpen(false)} // fecha ao clicar
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </nav>
  )
}
