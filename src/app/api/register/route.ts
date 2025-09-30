import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const jwt = require('jsonwebtoken')

export interface UserCreate {
  name: string
  email: string
  password: string
  role: string
}

export interface UserReturn extends UserCreate {
  id: number
}

export interface userCreateToken {
  name: string
  email: string
}

export interface UserWithToken {
  id: number
  name: string
  email: string
  token: string
  role: string
}

const createPassword = (password: string) => {
  const newHash = createHash('md5').update(password).digest('hex')

  return newHash
}

const newToken = (data: userCreateToken) => {
  const token = jwt.sign({ data }, 'teste-ronan', {
    expiresIn: '7d',
    algorithm: 'HS256',
  })
  return token
}

export async function POST(req: Request) {
  const { name, email, password, role } = await req.json()

  try {
    const decrypt = createPassword(password)
    const register: UserReturn = await prisma.user.create({
      data: {
        name,
        email,
        password: decrypt,
        role,
      },
    })

    const { password: _, ...userWithoutPassword } = register
    const token = newToken(userWithoutPassword)

    return NextResponse.json(
      { ...userWithoutPassword, token },

      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        message: 'error',
        error,
      },
      { status: 500 },
    )
  }
}
