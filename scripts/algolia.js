new Crawler({
  appId: 'XXXX',
  apiKey: 'XXXX',
  maxUrls: null,
  indexPrefix: '',
  rateLimit: 8,
  renderJavaScript: true,
  startUrls: [
    'https://example.com/gallery/',
    'https://example.com/sayings/',
    'https://example.com/about/',
  ],
  discoveryPatterns: ['https://example.com/**'],
  schedule: 'at 09:01 on Wednesday',
  maxDepth: 10,
  actions: [
    {
      indexName: 'example',
      pathsToMatch: ['https://example.com/**'],
      recordExtractor: ({ $, url, helpers }) => {
        // 根据URL路径判断内容类型
        const urlPath = new URL(url).pathname
        // 生成字符串的哈希值 (简单版本)
        const generateHash = (str) => {
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

        // 博客文章
        if (urlPath.match(/^\/posts\/\d{4}\/\d{2}\/.+/)) {
          return helpers.docsearch({
            recordProps: {
              lvl0: {
                selectors: '',
                defaultValue: 'Post',
              },
              lvl1: 'header h1',
              lvl2: [
                'body:has(article h2) article h2',
                'body:not(:has(article h2)) ul.relative.overflow-y-auto.space-y-2 > li.relative > span[style*="width:20px"] ~ a span',
              ],
              lvl3: [
                'body:has(article h3) article h3',
                'body:not(:has(article h3)) ul.relative.overflow-y-auto.space-y-2 > li.relative > span[style*="width:16px"] ~ a span',
              ],
              lvl4: [
                'body:has(article h4) article h4',
                'body:not(:has(article h4)) ul.relative.overflow-y-auto.space-y-2 > li.relative > span[style*="width:14px"] ~ a span',
              ],
              lvl5: [
                'body:has(article h5) article h5',
                'body:not(:has(article h5)) ul.relative.overflow-y-auto.space-y-2 > li.relative > span[style*="width:8px"] ~ a span',
              ],
              lvl6: [
                'body:has(article h6) article h6',
                'body:not(:has(article h6)) ul.relative.overflow-y-auto.space-y-2 > li.relative > span[style*="width:4px"] ~ a span',
              ],
              content: ['article p, article li, #markdown-wrapper p, #markdown-wrapper li'],
              pageRank: 100,
              // 自定义属性用于过滤
              category: {
                selectors: "a[href^='/categories/']",
              },
              tags: {
                selectors: "a[href^='/tags/']",
              },
              date: {
                selectors:
                  'div.flex.flex-wrap.gap-2.text-sm.text-secondary.justify-center div span:first-child',
              },
              wordCount: {
                selectors:
                  "div.flex.flex-wrap.gap-2.text-sm.text-secondary.justify-center div:contains('字')",
              },
              readingTime: {
                selectors:
                  "div.flex.flex-wrap.gap-2.text-sm.text-secondary.justify-center div:contains('分钟')",
              },
              contentType: {
                defaultValue: 'post',
              },
            },
            aggregateContent: true,
            recordVersion: 'v3',
          })
        }
        // 图库页面
        else if (urlPath === '/gallery/') {
          // 从JSON-LD中提取照片数据
          let photos = []

          try {
            const jsonLdScript = $('script[type="application/ld+json"]').html()
            if (jsonLdScript) {
              const jsonData = JSON.parse(jsonLdScript)

              // 提取所有照片信息
              photos = jsonData.map((item) => {
                return {
                  url: item.contentUrl,
                  name: item.name || '',
                  description: item.description || '',
                  keywords: item.keywords || [],
                  location: item.contentLocation || '',
                  date: item.datePublished || '',
                  author: (item.creator && item.creator.name) || item.creditText || '',
                }
              })
            }
          } catch (e) {
            console.error('Error parsing JSON-LD:', e)
          }

          // 获取页面中的描述文本
          const galleryDescription = $('.max-w-\\[800px\\] p').text() || ''
          const galleryTitle = $('h1').text() || 'Gallery'

          // 创建记录数组
          let records = []

          // 添加gallery主页面的记录
          records.push({
            objectID: `gallery-main-${url}`,
            url: url,
            type: 'content',
            hierarchy: {
              lvl0: 'Gallery',
              lvl1: galleryTitle,
              lvl2: null,
              lvl3: null,
              lvl4: null,
              lvl5: null,
              lvl6: null,
            },
            content: galleryDescription,
            contentType: 'gallery',
            pageRank: 60,
          })

          // 为每张照片创建单独的记录
          photos.forEach((photo, index) => {
            // 构建照片的内容文本
            let photoContent = []

            if (photo.name) {
              photoContent.push(`标题: ${photo.name}`)
            }

            if (photo.description) {
              photoContent.push(`描述: ${photo.description}`)
            }

            if (photo.location) {
              photoContent.push(`位置: ${photo.location}`)
            }

            if (photo.date) {
              photoContent.push(`日期: ${photo.date}`)
            }

            if (photo.author) {
              photoContent.push(`作者: ${photo.author}`)
            }

            if (photo.keywords && photo.keywords.length > 0) {
              photoContent.push(`标签: ${photo.keywords.join(', ')}`)
            }

            // 创建唯一标识符
            const photoIdentifier = photo.url

            // 创建照片记录
            records.push({
              objectID: `gallery-photo-${url}-${index}`,
              url: `${url}?view=${generateHash(photoIdentifier)}`,
              type: 'content',
              hierarchy: {
                lvl0: 'Photo',
                lvl1: galleryTitle,
                lvl2: photo.name || `照片 ${index + 1}`,
                lvl3: null,
                lvl4: null,
                lvl5: null,
                lvl6: null,
              },
              content: photoContent.join('\n\n'),
              contentType: 'photo',
              pageRank: 90,
              // 保留字段用于前端定位和过滤
              photoUrl: photoIdentifier,
              photoTags: photo.keywords || [],
              photoLocation: photo.location || '',
              photoDate: photo.date || '',
            })
          })

          return records
        }

        // sayings页面
        else if (urlPath === '/sayings/') {
          // 从JSON-LD中提取sayings数据
          let sayings = []

          try {
            const jsonLdScript = $('script[type="application/ld+json"]').html()
            if (jsonLdScript) {
              const jsonData = JSON.parse(jsonLdScript)

              // 提取所有sayings信息
              sayings = jsonData.map((item) => {
                return {
                  url: item.contentUrl,
                  description: item.description || '',
                  date: item.datePublished || '',
                  author: (item.creator && item.creator.name) || item.creditText || '',
                  license: item.license || '',
                  copyrightNotice: item.copyrightNotice || '',
                }
              })
            }
          } catch (e) {
            console.error('Error parsing JSON-LD:', e)
          }

          // 获取页面中的描述文本
          const sayingsDescription = $('.max-w-\\[800px\\] p').text() || ''
          const sayingsTitle = $('h1').text() || 'Sayings'

          // 创建记录数组
          let records = []

          // 添加sayings主页面的记录
          records.push({
            objectID: `sayings-main-${url}`,
            url: url,
            type: 'content',
            hierarchy: {
              lvl0: 'Sayings',
              lvl1: sayingsTitle,
              lvl2: null,
              lvl3: null,
              lvl4: null,
              lvl5: null,
              lvl6: null,
            },
            content: sayingsDescription,
            contentType: 'sayings',
            pageRank: 20,
          })

          // 为每个saying创建单独的记录
          sayings.forEach((saying, index) => {
            // 构建saying的内容文本
            let sayingContent = []

            if (saying.description) {
              sayingContent.push(`内容: ${saying.description}`)
            }

            if (saying.date) {
              sayingContent.push(`日期: ${saying.date}`)
            }

            if (saying.author) {
              sayingContent.push(`作者: ${saying.author}`)
            }

            if (saying.copyrightNotice) {
              sayingContent.push(`版权: ${saying.copyrightNotice}`)
            }

            // 生成与前端一致的哈希ID
            const sayingHash = generateHash(saying.url || saying.contentUrl || `saying-${index}`)

            // 创建saying记录
            records.push({
              objectID: `saying-${url}-${index}`,
              url: `${url}?saying=${sayingHash}`,
              type: 'content',
              hierarchy: {
                lvl0: 'Saying',
                lvl1: sayingsTitle,
                lvl2: `Saying ${index + 1}`,
                lvl3: null,
                lvl4: null,
                lvl5: null,
                lvl6: null,
              },
              content: sayingContent.join('\n\n'),
              contentType: 'saying',
              pageRank: 70,
              // 保留字段用于前端过滤
              sayingUrl: saying.url,
              sayingDate: saying.date || '',
              sayingAuthor: saying.author || '',
              // 提取描述中的前20个字符作为预览
              sayingPreview: saying.description ? saying.description.substring(0, 20) + '...' : '',
            })
          })

          return records
        }

        // 其他所有页面
        else {
          let theCategories = 'Page'
          if (urlPath.match(/^\/about/)) {
            theCategories = 'About'
          }

          return helpers.docsearch({
            recordProps: {
              lvl0: {
                selectors: '',
                defaultValue: theCategories,
              },
              lvl1: ['header h1', 'article h1', 'main h1', 'h1', 'head > title'],
              lvl2: ['article h2', 'main h2', 'h2'],
              lvl3: ['article h3', 'main h3', 'h3'],
              lvl4: ['article h4', 'main h4', 'h4'],
              lvl5: ['article h5', 'main h5', 'h5'],
              lvl6: ['article h6', 'main h6', 'h6'],
              content: ['article p, article li', 'main p, main li', 'p, li'],
              pageRank: 10,
              contentType: {
                defaultValue: 'page',
              },
            },
            aggregateContent: true,
            recordVersion: 'v3',
          })
        }
      },
    },
  ],
  sitemaps: ['https://example.com/sitemap-index.xml', 'https://example.com/gallery/sitemap.xml'],
  initialIndexSettings: {
    example: {
      advancedSyntax: true,
      allowTyposOnNumericTokens: false,
      attributeCriteriaComputedByMinProximity: true,
      attributeForDistinct: 'url',
      attributesForFaceting: [
        'type',
        'lang',
        'contentType',
        'photoTags',
        'photoLocation',
        'category',
        'tags',
      ],
      attributesToHighlight: ['title', 'content', 'hierarchy'],
      attributesToRetrieve: [
        'hierarchy',
        'content',
        'anchor',
        'url',
        'url_without_anchor',
        'type',
        'contentType',
        'category',
        'tags',
        'date',
        'photoUrl',
        'photoTags',
        'photoLocation',
        'photoDate',
        'sayingUrl',
        'sayingDate',
        'sayingAuthor',
        'sayingPreview',
      ],
      attributesToSnippet: ['title:50', 'content:100', 'hierarchy:50'],
      camelCaseAttributes: ['title', 'content', 'hierarchy'],
      customRanking: ['desc(weight.pageRank)', 'desc(weight.level)', 'asc(weight.position)'],
      distinct: true,
      highlightPostTag: '</mark>',
      highlightPreTag: '<mark class="search-highlight">',
      ignorePlurals: true,
      minProximity: 1,
      minWordSizefor1Typo: 3,
      minWordSizefor2Typos: 7,
      ranking: ['words', 'filters', 'typo', 'attribute', 'proximity', 'exact', 'custom'],
      removeWordsIfNoResults: 'allOptional',
      searchableAttributes: [
        'content',
        'unordered(hierarchy.lvl0)',
        'unordered(hierarchy.lvl1)',
        'unordered(hierarchy.lvl2)',
        'unordered(hierarchy.lvl3)',
        'unordered(hierarchy.lvl4)',
        'unordered(hierarchy.lvl5)',
        'unordered(hierarchy.lvl6)',
      ],
    },
  },
  ignoreCanonicalTo: false,
  safetyChecks: { beforeIndexPublishing: { maxLostRecordsPercentage: 100 } },
  exclusionPatterns: [
    'https://example.com/',
    'https://example.com/search/**',
    'https://example.com/page/**',
    'https://example.com/tags/**',
    'https://example.com/archives/**',
    'https://example.com/categories/**',
    'https://example.com/friends/**',
  ],
  saveBackup: true,
})
