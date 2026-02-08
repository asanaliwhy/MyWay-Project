import React from 'react'
import { motion } from 'framer-motion'
import { Clock, User, BookOpen, PlayCircle } from 'lucide-react'
import { Course, UserRole } from '../types/course'
interface CourseHeaderProps {
  course: Course
  role: UserRole
}
export function CourseHeader({ course, role }: CourseHeaderProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
      className="mb-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 rounded-md">{course.code}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{course.instructor}</span>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{course.duration}</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            {course.title}
          </h1>

          {role === 'Student' && (
            <div className="max-w-md">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Course Progress</span>
                <span className="font-medium text-gray-900 dark:text-white">{course.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${course.progress}%`,
                  }}
                  transition={{
                    duration: 1,
                    delay: 0.3,
                    ease: 'easeOut',
                  }}
                  className="h-full bg-indigo-600 rounded-full"
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  )
}
