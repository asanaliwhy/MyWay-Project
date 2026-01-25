import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  FileText,
  ArrowRight,
} from 'lucide-react'
type AssignmentStatus = 'Not Started' | 'In Progress' | 'Submitted' | 'Graded'
type FilterType = 'all' | 'pending' | 'submitted' | 'graded'
interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  status: AssignmentStatus
  grade?: string
  maxPoints: number
  submittedDate?: string
}
const mockAssignments: Assignment[] = [
  {
    id: 'a1',
    title: 'Essay: The Future of AI',
    description:
      'Write a 1500-word essay discussing the potential future developments in artificial intelligence and their societal implications.',
    dueDate: 'Oct 15, 2025',
    status: 'Graded',
    grade: '92',
    maxPoints: 100,
    submittedDate: 'Oct 14, 2025',
  },
  {
    id: 'a2',
    title: 'Lab: Linear Regression',
    description:
      'Implement a linear regression model from scratch using Python. Submit your code and a brief report.',
    dueDate: 'Oct 22, 2025',
    status: 'Submitted',
    maxPoints: 100,
    submittedDate: 'Oct 21, 2025',
  },
  {
    id: 'a3',
    title: 'Project: Build a Classifier',
    description:
      'Create a machine learning classifier to categorize images. Use any framework of your choice.',
    dueDate: 'Oct 29, 2025',
    status: 'In Progress',
    maxPoints: 150,
  },
  {
    id: 'a4',
    title: 'Quiz: Neural Networks Basics',
    description:
      'Complete the online quiz covering fundamental concepts of neural networks.',
    dueDate: 'Nov 5, 2025',
    status: 'Not Started',
    maxPoints: 50,
  },
  {
    id: 'a5',
    title: 'Research Paper Review',
    description:
      'Read and summarize a recent AI research paper. Provide critical analysis and key takeaways.',
    dueDate: 'Nov 12, 2025',
    status: 'Not Started',
    maxPoints: 100,
  },
]
export function AssignmentsView() {
  const [filter, setFilter] = useState<FilterType>('all')
  const filteredAssignments = mockAssignments.filter((assignment) => {
    if (filter === 'all') return true
    if (filter === 'pending')
      return (
        assignment.status === 'Not Started' ||
        assignment.status === 'In Progress'
      )
    if (filter === 'submitted') return assignment.status === 'Submitted'
    if (filter === 'graded') return assignment.status === 'Graded'
    return true
  })
  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600'
    if (grade >= 80) return 'text-blue-600'
    if (grade >= 70) return 'text-amber-600'
    return 'text-red-600'
  }
  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Assignments</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track your progress and submit your work
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8">
        {[
          {
            id: 'all',
            label: 'All',
            count: mockAssignments.length,
          },
          {
            id: 'pending',
            label: 'Pending',
            count: mockAssignments.filter(
              (a) => a.status === 'Not Started' || a.status === 'In Progress',
            ).length,
          },
          {
            id: 'submitted',
            label: 'Submitted',
            count: mockAssignments.filter((a) => a.status === 'Submitted')
              .length,
          },
          {
            id: 'graded',
            label: 'Graded',
            count: mockAssignments.filter((a) => a.status === 'Graded').length,
          },
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setFilter(tab.id as FilterType)}
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === tab.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            {tab.label}
            <span
              className={`ml-2 ${filter === tab.id ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500'}`}
            >
              {tab.count}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Assignments Grid */}
      <motion.div
        className="space-y-4"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.3,
        }}
      >
        {filteredAssignments.map((assignment, index) => (
          <motion.div
            key={assignment.id}
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
            className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg dark:hover:border-gray-600 transition-all"
          >
            {/* Status Indicator Bar */}
            <div
              className={`absolute top-0 left-0 w-1 h-full rounded-l-xl ${assignment.status === 'Graded' ? 'bg-green-500' : assignment.status === 'Submitted' ? 'bg-blue-500' : assignment.status === 'In Progress' ? 'bg-amber-500' : 'bg-gray-300'}`}
            />

            <div className="flex gap-6">
              {/* Left: Assignment Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {assignment.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                      {assignment.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
                    <span>Due {assignment.dueDate}</span>
                  </div>

                  {assignment.submittedDate && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-gray-300" />
                      <div className="flex items-center gap-2 text-gray-500">
                        <CheckCircle size={16} className="text-green-500" />
                        <span>Submitted {assignment.submittedDate}</span>
                      </div>
                    </>
                  )}

                  <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                  <div className="text-gray-500 dark:text-gray-500">
                    {assignment.maxPoints} points
                  </div>
                </div>
              </div>

              {/* Right: Grade & Actions */}
              <div className="flex flex-col items-end justify-between gap-4">
                {assignment.grade ? (
                  <div className="text-right">
                    <div
                      className={`text-4xl font-bold ${getGradeColor(parseInt(assignment.grade))}`}
                    >
                      {assignment.grade}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      / {assignment.maxPoints}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
                    {assignment.status === 'Not Started' && (
                      <>
                        <Circle size={14} className="text-gray-400 dark:text-gray-500" />
                        <span>Not Started</span>
                      </>
                    )}
                    {assignment.status === 'In Progress' && (
                      <>
                        <Clock size={14} className="text-amber-500" />
                        <span className="text-amber-700 dark:text-amber-400">In Progress</span>
                      </>
                    )}
                    {assignment.status === 'Submitted' && (
                      <>
                        <CheckCircle size={14} className="text-blue-500" />
                        <span className="text-blue-700 dark:text-blue-400">Submitted</span>
                      </>
                    )}
                  </div>
                )}

                <motion.button
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${assignment.status === 'Graded' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'}`}
                >
                  {assignment.status === 'Graded' ? (
                    <>
                      <span>View Details</span>
                      <ArrowRight size={16} />
                    </>
                  ) : assignment.status === 'Submitted' ? (
                    <>
                      <span>View Submission</span>
                      <ArrowRight size={16} />
                    </>
                  ) : (
                    <>
                      <span>
                        {assignment.status === 'Not Started'
                          ? 'Start Assignment'
                          : 'Continue'}
                      </span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No assignments found</p>
          <p className="text-sm text-gray-400 mt-1">
            Try adjusting your filters
          </p>
        </div>
      )}
    </div>
  )
}
