import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import { userCreateToken } from '../register/route'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const jwt = require('jsonwebtoken')

const compareHash = (password: string, originalHash: string) => {
  const newHash = createHash('md5').update(password).digest('hex')

  return newHash === originalHash
}

const newToken = (data: userCreateToken) => {
  const token = jwt.sign({ data }, 'teste-ronan', {
    expiresIn: '7d',
    algorithm: 'HS256',
  })
  return token
}

export async function POST(req: Request) {
  const { email, password } = await req.json()

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (!user) {
      return NextResponse.json(
        {
          message: 'Login e/ou senha incorretos.',
        },
        { status: 404 },
      )
    }

    const hashOriginal = user.password
    const decrypt = compareHash(password, hashOriginal)
    if (decrypt !== true) {
      console.log('esta aqui')
      return NextResponse.json(
        {
          message: 'Login e/ou senha incorretos.',
        },
        { status: 404 },
      )
    }

    const { password: _, ...userWithoutPassword } = user
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
