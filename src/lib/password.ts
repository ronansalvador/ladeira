import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)
const KEY_LENGTH = 64

export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer
  return `scrypt$${salt.toString('hex')}$${derivedKey.toString('hex')}`
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, saltHex, hashHex] = storedHash.split('$')

  if (algorithm === 'scrypt' && saltHex && hashHex) {
    try {
      const expected = Buffer.from(hashHex, 'hex')
      const actual = (await scrypt(
        password,
        Buffer.from(saltHex, 'hex'),
        expected.length,
      )) as Buffer
      return {
        valid:
          expected.length === actual.length &&
          timingSafeEqual(expected, actual),
        needsRehash: false,
      }
    } catch {
      return { valid: false, needsRehash: false }
    }
  }

  // Compatibilidade temporária: migra hashes MD5 legados no próximo login válido.
  if (/^[a-f\d]{32}$/i.test(storedHash)) {
    const legacyHash = createHash('md5').update(password).digest()
    const expected = Buffer.from(storedHash, 'hex')
    const valid = timingSafeEqual(expected, legacyHash)
    return { valid, needsRehash: valid }
  }

  return { valid: false, needsRehash: false }
}
