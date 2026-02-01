import { ChevronRight, Bell, Search, ChevronDown } from 'lucide-react'
import { useAuth } from '../../auth/context/AuthContext'
import { useNavigate } from 'react-router-dom'
interface CourseTopBarProps {
  courseName: string
  orgName: string
}
export function CourseTopBar({ courseName, orgName }: CourseTopBarProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm transition-colors duration-200">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <span className="hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer transition-colors whitespace-nowrap">
          {orgName}
        </span>
        <ChevronRight size={14} className="text-gray-400 dark:text-gray-600 flex-shrink-0" />
        <span className="hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer transition-colors whitespace-nowrap">
          Courses
        </span>
        <ChevronRight size={14} className="text-gray-400 dark:text-gray-600 flex-shrink-0" />
        <span className="font-medium text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900 px-2 py-0.5 rounded-md truncate max-w-[150px] sm:max-w-xs">
          {courseName}
        </span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center relative">
          <Search size={16} className="absolute left-3 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search course content..."
            className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-full bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 outline-none transition-all w-48 lg:w-64"
          />
        </div>

        <button className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
        </button>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>

        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-gray-200 dark:border-gray-700">
            {user?.firstName?.charAt(0) || 'U'}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
            {user?.firstName} {user?.lastName}
          </span>
          <ChevronDown size={14} className="text-gray-400 dark:text-gray-500 hidden sm:block" />
        </button>
      </div>
    </header>
  )
}
