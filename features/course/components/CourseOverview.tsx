import React, { Children } from 'react'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle, FileText } from 'lucide-react'
import { Course } from '../types/course'
interface CourseOverviewProps {
  course: Course
}
export function CourseOverview({ course }: CourseOverviewProps) {
  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    show: {
      opacity: 1,
      y: 0,
    },
  }
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-4xl space-y-8"
    >
      {/* Description */}
      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
        <p className="text-gray-600 leading-relaxed mb-6">
          {course.description}
        </p>

        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Learning Objectives
        </h4>
        <ul className="space-y-2">
          {course.objectives.map((obj, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-600">
              <CheckCircle
                size={18}
                className="text-indigo-600 mt-0.5 flex-shrink-0"
              />
              <span>{obj}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Upcoming */}
      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h3>
        <div className="space-y-3">
          {course.assignments.slice(0, 3).map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-gray-400" />
                <div>
                  <h4 className="font-medium text-gray-900">
                    {assignment.title}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                    <Calendar size={14} />
                    <span>Due {assignment.dueDate}</span>
                  </div>
                </div>
              </div>
              <span className="text-sm text-gray-500">{assignment.status}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
