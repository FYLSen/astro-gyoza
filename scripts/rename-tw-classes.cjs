const fs = require('fs')
const path = require('path')

const srcDir = path.join('/Users/xuesongwen/Documents/code/fylsen.com/src')

const replacements = [
  { match: /(?<!-)text-primary(?!-)/g, replace: 'text-text-primary' },
  { match: /(?<!-)text-secondary(?!-)/g, replace: 'text-text-secondary' },
  { match: /(?<!-)bg-primary(?!-)/g, replace: 'bg-bg-primary' },
  { match: /(?<!-)bg-secondary(?!-)/g, replace: 'bg-bg-secondary' },
  { match: /(?<!-)border-primary(?!-)/g, replace: 'border-border-primary' },
  { match: /(?<!-)bg-root(?!-)/g, replace: 'bg-bg-root' },
  { match: /(?<!-)text-root(?!-)/g, replace: 'text-bg-root' },
]

function processDirectory(directory) {
  const files = fs.readdirSync(directory)
  let changedFilesCount = 0

  for (const file of files) {
    const fullPath = path.join(directory, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      changedFilesCount += processDirectory(fullPath)
    } else if (/\.(astro|tsx|ts|jsx|js|css)$/.test(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8')
      let originalContent = content

      for (const { match, replace } of replacements) {
        content = content.replace(match, replace)
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8')
        changedFilesCount++
        console.log(`Updated: ${fullPath}`)
      }
    }
  }

  return changedFilesCount
}

const total = processDirectory(srcDir)
console.log(`Finished processing. Total files modified: ${total}`)
