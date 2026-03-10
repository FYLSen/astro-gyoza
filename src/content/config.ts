import { z, defineCollection } from 'astro:content'

const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    lastMod: z.date().optional(),
    summary: z.string().optional(),
    cover: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    comments: z.boolean().default(true),
    draft: z.boolean().default(false),
    sticky: z.number().default(0),
    password: z.string().optional(),
    aisummary: z.boolean().default(true),
    license: z
      .object({
        name: z.string(),
        url: z.union([z.string(), z.literal('')]).optional(),
        description: z.string(),
      })
      .optional(),
  }),
})

const specCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    comments: z.boolean().default(true),
  }),
})

// Use defineCollection without specifying a schema for arrays
const photosCollection = defineCollection({
  type: 'data',
})

const friendsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    description: z.string(),
    avatar: z.string(),
    link: z.string().url(),
  }),
})

const sayingsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    sayings: z.array(
      z.object({
        content: z.string(),
        author: z.string(),
        source: z.string().optional(),
        illustration: z.string(),
        date: z.string(),
      }),
    ),
  }),
})

export const collections = {
  posts: postsCollection,
  spec: specCollection,
  sayings: sayingsCollection,
  photos: photosCollection,
  friends: friendsCollection,
}
