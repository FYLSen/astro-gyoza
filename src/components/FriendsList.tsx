import React from 'react'
import { motion } from 'framer-motion'
import FriendCard from './FriendCard'
import type { CollectionEntry } from 'astro:content'

interface FriendsListProps {
  friends: CollectionEntry<'friends'>[]
}

export default function FriendsList({ friends }: FriendsListProps): React.ReactElement {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <motion.ul
      className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 auto-rows-fr"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {friends.map((friend) => (
        <FriendCard key={friend.id} friend={friend.data} />
      ))}
    </motion.ul>
  )
}
