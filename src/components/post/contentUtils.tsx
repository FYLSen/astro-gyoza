export function processDecryptedContent($protectedContent: Element, $markdownWrapper: Element) {
  // 1. 获取所有原始标题
  const headings = Array.from($protectedContent.querySelectorAll('h1,h2,h3,h4,h5,h6'))

  // 2. 将内容移入 markdown-wrapper
  $markdownWrapper.innerHTML = $protectedContent.innerHTML

  // 3. 为所有标题添加必要的属性和结构
  const newHeadings = Array.from($markdownWrapper.querySelectorAll('h1,h2,h3,h4,h5,h6'))
  newHeadings.forEach((heading, index) => {
    const originalHeading = headings[index]
    if (originalHeading && originalHeading.id) {
      heading.id = originalHeading.id
    }
  })

  // 4. 移除原始加密内容
  $protectedContent.remove()
}
