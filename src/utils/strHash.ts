/**
 * 生成字符串的哈希值
 * 注意：此哈希函数需要与爬虫中使用的哈希算法保持一致
 */
export const generateHash = (str: string) => {
  let hash = 0
  if (!str || str.length === 0) return hash.toString()

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // 转换为32位整数
  }

  // 确保哈希值为正数并转为16进制字符串
  return Math.abs(hash).toString(16)
}
