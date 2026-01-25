import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  FileText,
  Users,
  Settings,
  Shield,
  ChevronLeft,
  ChevronDown,
  GraduationCap,
} from 'lucide-react'

interface CourseSidebarProps {
  activeTab: string
  onTabChange: (id: string) => void
  role: 'Admin' | 'Student'
}

export function CourseSidebar({ activeTab, onTabChange, role }: CourseSidebarProps) {
  const navigate = useNavigate()
  const [isCoursesOpen, setIsCoursesOpen] = useState(false)

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'modules', label: 'Modules', icon: BookOpen },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'discussions', label: 'Discussions', icon: MessageSquare },
  ]

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col z-20 transition-colors duration-300">
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate('/organizations')}
        >
          <div className="p-1 rounded-md bg-gray-100 dark:bg-gray-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 transition-colors">
            <ChevronLeft size={18} className="text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">All Orgs</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
          >
            <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-gray-400 dark:text-gray-500'} />
            {item.label}
          </button>
        ))}

        {/* Other Courses Dropdown */}
        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setIsCoursesOpen(!isCoursesOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <GraduationCap size={20} className="text-gray-400 dark:text-gray-500" />
              <span>Other Courses</span>
            </div>
            <motion.div
              animate={{ rotate: isCoursesOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </button>

          <AnimatePresence>
            {isCoursesOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-gray-100/50 dark:bg-gray-900/50 rounded-lg mt-1 mx-2"
              >
                <button className="w-full text-left px-8 py-2 text-xs text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  AI Algorithms
                </button>
                <button className="w-full text-left px-8 py-2 text-xs text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Quantum Computing
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Role Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Your Role
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {role === 'Admin' ? 'Faculty Admin' : 'Course Student'}
          </p>
        </div>
      </div>
    </aside>
  )
}
