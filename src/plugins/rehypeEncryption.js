import { toHtml } from 'hast-util-to-html'

const ITERATIONS = 333333
const KEY_LENGTH = 256
const SALT_LENGTH = 16
const IV_LENGTH = 12

const bufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer)
  const binaryStr = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '')
  return btoa(binaryStr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function rehypeEncryption() {
  return async (tree, file) => {
    const frontmatter = file.data?.astro?.frontmatter
    if (!frontmatter?.password) return

    const rawHtml = toHtml(tree)

    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(frontmatter.password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey'],
    )

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: KEY_LENGTH },
      false,
      ['encrypt'],
    )

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      new TextEncoder().encode(rawHtml),
    )

    const encryptedBase64 = bufferToBase64(encrypted)
    const ivBase64 = bufferToBase64(iv)
    const saltBase64 = bufferToBase64(salt)

    const encryptedNode = {
      type: 'element',
      tagName: 'div',
      properties: {
        id: 'encrypted-content',
        'data-encrypted': encryptedBase64,
        'data-iv': ivBase64,
        'data-salt': saltBase64,
      },
      children: [],
    }

    tree.children = [
      {
        type: 'element',
        tagName: 'article',
        properties: {
          id: 'markdown-wrapper',
          className: ['markdown'],
        },
        children: [encryptedNode],
      },
    ]
  }
}
