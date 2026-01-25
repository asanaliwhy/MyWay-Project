import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  ThumbsUp,
  Reply,
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react'
interface DiscussionReply {
  id: string
  author: string
  authorRole: 'Student' | 'Teacher' | 'TA'
  avatar: string
  content: string
  timestamp: string
  likes: number
}
interface Discussion {
  id: string
  title: string
  author: string
  authorRole: 'Student' | 'Teacher' | 'TA'
  avatar: string
  content: string
  timestamp: string
  replies: number
  likes: number
  replyList?: DiscussionReply[]
}
const mockDiscussions: Discussion[] = [
  {
    id: 'd1',
    title: 'Question about backpropagation algorithm',
    author: 'Sarah Mitchell',
    authorRole: 'Student',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    content:
      'Can someone explain how the chain rule is applied in backpropagation? I understand the concept but struggling with the mathematical implementation.',
    timestamp: '2 hours ago',
    replies: 5,
    likes: 12,
    replyList: [
      {
        id: 'r1',
        author: 'Dr. Sarah Chen',
        authorRole: 'Teacher',
        avatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        content:
          'Great question! The chain rule in backpropagation works by computing gradients layer by layer. Let me break it down step by step...',
        timestamp: '1 hour ago',
        likes: 8,
      },
      {
        id: 'r2',
        author: 'Mike Johnson',
        authorRole: 'TA',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
        content:
          'I found this visualization really helpful when I was learning: [link]. It shows how gradients flow backwards through the network.',
        timestamp: '45 min ago',
        likes: 5,
      },
    ],
  },
  {
    id: 'd2',
    title: 'Project collaboration - looking for team members',
    author: 'Alex Rivera',
    authorRole: 'Student',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    content:
      'Looking for 2-3 people to collaborate on the final project. Interested in building a recommendation system. Anyone want to join?',
    timestamp: '5 hours ago',
    replies: 8,
    likes: 6,
  },
  {
    id: 'd3',
    title: 'Recommended resources for neural networks',
    author: 'Dr. Sarah Chen',
    authorRole: 'Teacher',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    content:
      "I've compiled a list of excellent resources for understanding neural networks. These include video lectures, interactive demos, and research papers.",
    timestamp: '1 day ago',
    replies: 15,
    likes: 34,
  },
  {
    id: 'd4',
    title: 'Assignment 2 clarification needed',
    author: 'Emma Davis',
    authorRole: 'Student',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    content:
      'For the linear regression lab, are we supposed to implement gradient descent from scratch or can we use library functions?',
    timestamp: '2 days ago',
    replies: 3,
    likes: 9,
  },
]
export function DiscussionsView() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const getRoleBadge = (role: 'Student' | 'Teacher' | 'TA') => {
    const styles = {
      Teacher: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      TA: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
      Student: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    }
    return styles[role]
  }
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Discussions</h2>
        <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          New Discussion
        </button>
      </div>

      {/* Discussions List */}
      <div className="space-y-4">
        {mockDiscussions.map((discussion, index) => (
          <motion.div
            key={discussion.id}
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: index * 0.05,
            }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-colors"
          >
            {/* Main Discussion */}
            <div className="p-5">
              <div className="flex gap-4">
                <img
                  src={discussion.avatar}
                  alt={discussion.author}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {discussion.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {discussion.author}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${getRoleBadge(discussion.authorRole)}`}
                        >
                          {discussion.authorRole}
                        </span>
                        <span className="text-gray-500 dark:text-gray-500">•</span>
                        <span className="text-gray-500 dark:text-gray-500">
                          {discussion.timestamp}
                        </span>
                      </div>
                    </div>
                    <button className="text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    {discussion.content}
                  </p>

                  <div className="flex items-center gap-4 text-sm">
                    <button className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      <ThumbsUp size={16} />
                      <span>{discussion.likes}</span>
                    </button>
                    <button
                      onClick={() =>
                        setExpandedId(
                          expandedId === discussion.id ? null : discussion.id,
                        )
                      }
                      className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <MessageSquare size={16} />
                      <span>{discussion.replies} replies</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      <Reply size={16} />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Replies */}
            <AnimatePresence>
              {expandedId === discussion.id && discussion.replyList && (
                <motion.div
                  initial={{
                    height: 0,
                    opacity: 0,
                  }}
                  animate={{
                    height: 'auto',
                    opacity: 1,
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
                >
                  <div className="p-5 space-y-4">
                    {discussion.replyList.map((reply) => (
                      <div key={reply.id} className="flex gap-3">
                        <img
                          src={reply.avatar}
                          alt={reply.author}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2 mb-2 text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {reply.author}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${getRoleBadge(reply.authorRole)}`}
                            >
                              {reply.authorRole}
                            </span>
                            <span className="text-gray-500 dark:text-gray-500">•</span>
                            <span className="text-gray-500 dark:text-gray-500">
                              {reply.timestamp}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">
                            {reply.content}
                          </p>
                          <button className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            <ThumbsUp size={14} />
                            <span>{reply.likes}</span>
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Reply Input */}
                    <div className="flex gap-3 pt-2">
                      <img
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
                        alt="You"
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1">
                        <textarea
                          placeholder="Write a reply..."
                          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          rows={2}
                        />
                        <div className="flex justify-end mt-2">
                          <button className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                            Post Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
