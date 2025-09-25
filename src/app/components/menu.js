import Link from 'next/link'

export default function Menu() {
  return (
    <nav className="bg-gray-100 p-4 shadow-md">
      <ul className="flex flex-wrap gap-4">
        <li>
          <Link
            href="/comandas"
            className="text-gray-800 hover:text-blue-500 font-medium"
          >
            Criar Comanda
          </Link>
        </li>
        <li>
          <Link
            href="/clientes"
            className="text-gray-800 hover:text-blue-500 font-medium"
          >
            Clientes
          </Link>
        </li>
        <li>
          <Link
            href="/produtos"
            className="text-gray-800 hover:text-blue-500 font-medium"
          >
            Produtos
          </Link>
        </li>
        <li>
          <Link
            href="/consumos"
            className="text-gray-800 hover:text-blue-500 font-medium"
          >
            Comandas
          </Link>
        </li>
        <li>
          <Link
            href="/bailes"
            className="text-gray-800 hover:text-blue-500 font-medium"
          >
            Bailes
          </Link>
        </li>
        {/* <li>
          <Link
            href="/comandas/gerenciar"
            className="text-gray-800 hover:text-blue-500 font-medium"
          >
            Editar Comandas
          </Link>
        </li> */}
        <li>
          <Link
            href="/relatorios"
            className="text-gray-800 hover:text-blue-500 font-medium"
          >
            Relatórios
          </Link>
        </li>
      </ul>
    </nav>
  )
}
