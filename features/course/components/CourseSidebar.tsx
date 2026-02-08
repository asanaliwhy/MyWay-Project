import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  FileText,
  Shield,
  ChevronLeft,
} from 'lucide-react'

interface CourseSidebarProps {
  activeTab: string
  onTabChange: (id: string) => void
  role: 'ORGANIZER' | 'TEACHER' | 'STUDENT'
}

export function CourseSidebar({ activeTab, onTabChange, role }: CourseSidebarProps) {
  const navigate = useNavigate()

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'modules', label: 'Modules', icon: BookOpen },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'discussions', label: 'Discussions', icon: MessageSquare },
  ]

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col z-50 transition-colors duration-300 hidden md:flex">
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
            {role === 'ORGANIZER' ? 'Institution Admin' : role === 'TEACHER' ? 'Faculty Instructor' : 'Course Student'}
          </p>
        </div>
      </div>
    </aside>
  )
}
