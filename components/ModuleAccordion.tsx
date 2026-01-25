import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  CheckCircle,
  Circle,
  Lock,
  PlayCircle,
  FileText,
  HelpCircle,
} from 'lucide-react'
import { Module, Lesson } from '../types/course'
interface ModuleAccordionProps {
  module: Module
  index: number
}
export function ModuleAccordion({ module, index }: ModuleAccordionProps) {
  const [isOpen, setIsOpen] = useState(index === 0)
  const completedLessons = module.lessons.filter((l) => l.completed).length
  const totalLessons = module.lessons.length
  const progressPercent = (completedLessons / totalLessons) * 100
  const getIcon = (type: Lesson['type']) => {
    switch (type) {
      case 'video':
        return <PlayCircle size={16} />
      case 'reading':
        return <FileText size={16} />
      case 'quiz':
        return <HelpCircle size={16} />
    }
  }
  const getTypeColor = (type: Lesson['type']) => {
    switch (type) {
      case 'video':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
      case 'reading':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
      case 'quiz':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
    }
  }
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: index * 0.1,
      }}
      className={`bg-white dark:bg-gray-800 border rounded-xl overflow-hidden mb-4 transition-all ${isOpen ? 'border-indigo-200 dark:border-indigo-900/50 shadow-md' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
    >
      {/* Module Header */}
      <button
        onClick={() => !module.isLocked && setIsOpen(!isOpen)}
        className={`w-full p-6 text-left transition-colors ${module.isLocked ? 'cursor-not-allowed opacity-60' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
      >
        <div className="flex items-start gap-4">
          {/* Module Number */}
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${module.isLocked ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500' : completedLessons === totalLessons ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'}`}
          >
            {completedLessons === totalLessons && !module.isLocked ? (
              <CheckCircle size={24} />
            ) : (
              index + 1
            )}
          </div>

          {/* Module Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3
                  className={`text-lg font-semibold mb-1 ${module.isLocked ? 'text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}
                >
                  {module.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{module.description}</p>
              </div>

              {module.isLocked ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-500 dark:text-gray-400">
                  <Lock size={14} />
                  <span>Locked</span>
                </div>
              ) : (
                <motion.div
                  animate={{
                    rotate: isOpen ? 180 : 0,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className="text-gray-400 dark:text-gray-600"
                >
                  <ChevronDown size={20} />
                </motion.div>
              )}
            </div>

            {/* Progress Bar */}
            {!module.isLocked && (
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${progressPercent}%`,
                    }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                    }}
                    className={`h-full rounded-full ${completedLessons === totalLessons ? 'bg-green-500' : 'bg-indigo-600'}`}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[4rem] text-right">
                  {completedLessons}/{totalLessons} done
                </span>
              </div>
            )}
          </div>
        </div>
      </button>

      {/* Lessons List */}
      <AnimatePresence>
        {isOpen && !module.isLocked && (
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
              duration: 0.3,
              ease: 'easeInOut',
            }}
            className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
          >
            <div className="p-4 space-y-2">
              {module.lessons.map((lesson, i) => (
                <motion.button
                  key={lesson.id}
                  initial={{
                    x: -10,
                    opacity: 0,
                  }}
                  animate={{
                    x: 0,
                    opacity: 1,
                  }}
                  transition={{
                    delay: i * 0.05,
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg transition-all ${lesson.completed ? 'bg-white dark:bg-gray-800 border border-green-100 dark:border-green-900/30 hover:border-green-200 dark:hover:border-green-800' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:shadow-sm'}`}
                >
                  {/* Completion Icon */}
                  <div className="flex-shrink-0">
                    {lesson.completed ? (
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                        <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors">
                        <Circle size={12} className="text-gray-300 dark:text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Lesson Info */}
                  <div className="flex-1 text-left min-w-0">
                    <h4
                      className={`font-medium mb-1 ${lesson.completed ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}
                    >
                      {lesson.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getTypeColor(lesson.type)}`}
                      >
                        {getIcon(lesson.type)}
                        <span className="capitalize">{lesson.type}</span>
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {lesson.duration}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  {!lesson.completed && (
                    <div className="flex-shrink-0">
                      <div className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                        Start
                      </div>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
