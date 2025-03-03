import CryptoJS from 'crypto-js'
import { toHtml } from 'hast-util-to-html'

const ITERATIONS = 100000 // PBKDF2 迭代次数
const KEY_SIZE = 256 / 32 // 密钥长度 (256 bits)

export function rehypeEncryption() {
  return (tree, file) => {
    const frontmatter = file.data?.astro?.frontmatter
    if (!frontmatter?.password) return

    // 1. 获取完整的HTML内容
    const rawHtml = toHtml(tree)

    // 2. 生成随机 salt 和 iv
    const salt = CryptoJS.lib.WordArray.random(16)
    const iv = CryptoJS.lib.WordArray.random(16)

    // 3. 使用 PBKDF2 派生密钥
    const key = CryptoJS.PBKDF2(frontmatter.password, salt, {
      keySize: KEY_SIZE,
      iterations: ITERATIONS,
      hasher: CryptoJS.algo.SHA256,
    })

    // 4. 使用 AES-CBC 模式加密
    const encrypted = CryptoJS.AES.encrypt(rawHtml, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })

    // 5. 计算内容的 HMAC
    const hmac = CryptoJS.HmacSHA256(encrypted.toString(), key)

    // 6. 将所有参数转换为 Base64/Hex
    const encryptedBase64 = encrypted.toString()
    const ivHex = iv.toString(CryptoJS.enc.Hex)
    const saltHex = salt.toString(CryptoJS.enc.Hex)
    const hmacHex = hmac.toString(CryptoJS.enc.Hex)

    // 7. 创建新的加密节点
    const encryptedNode = {
      type: 'element',
      tagName: 'div',
      properties: {
        id: 'encrypted-content',
        'data-encrypted': encryptedBase64,
        'data-iv': ivHex,
        'data-salt': saltHex,
        'data-hmac': hmacHex,
      },
      children: [],
    }

    // 8. 将加密节点包装在 article 中
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
