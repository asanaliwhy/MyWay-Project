import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CourseSidebar } from '../components/CourseSidebar'
import { CourseTopBar } from '../components/CourseTopBar'
import { CourseHeader } from '../components/CourseHeader'
import { CourseOverview } from '../components/CourseOverview'
import { ModuleAccordion } from '../components/ModuleAccordion'
import { AssignmentsView } from '../components/AssignmentsView'
import { DiscussionsView } from '../components/DiscussionsView'
import { Course, UserRole } from '../types/course'
const mockCourse: Course = {
  id: 'gravity',
  title: 'Physics 101: Gravity & Motion',
  code: 'PHYS-101',
  instructor: 'Dr. Sarah Chen',
  duration: '12 weeks',
  description:
    'Explore the fundamental forces of the universe. Run interactive simulations on free-fall, drag, and orbital mechanics in our virtual lab. All modules are verified against standard physical models.',
  objectives: [
    'Master gravitational acceleration concepts',
    'Analyze drag coefficients in simulation',
    'Calculate orbital parameters',
    'Differentiate between verified physics and speculative hypotheses',
  ],
  progress: 25,
  modules: [
    {
      id: 'm1',
      title: 'Fundamentals of Gravity',
      description: 'Core concepts of gravitational force',
      lessons: [
        {
          id: 'l1',
          title: 'Introduction to Free Fall',
          type: 'video',
          duration: '10 min',
          completed: true,
        },
        {
          id: 'l2',
          title: 'Acceleration due to Gravity (g)',
          type: 'reading',
          duration: '15 min',
          completed: true,
        },
        {
          id: 'l3',
          title: 'Free Fall Simulation',
          type: 'quiz',
          duration: '20 min',
          completed: false,
        },
      ],
    },
    {
      id: 'm2',
      title: 'Atmospheric Drag',
      description: 'Understanding air resistance effects',
      lessons: [
        {
          id: 'l4',
          title: 'Air Resistance Concepts',
          type: 'video',
          duration: '15 min',
          completed: false,
        },
        {
          id: 'l5',
          title: 'Drag Coefficient Lab',
          type: 'reading',
          duration: '30 min',
          completed: false,
        },
      ],
    },
    {
      id: 'm3',
      title: 'Orbital Mechanics',
      description: 'Laws governing satellite motion',
      isLocked: true,
      lessons: [
        {
          id: 'l6',
          title: 'Kepler Laws',
          type: 'video',
          duration: '20 min',
          completed: false,
        },
      ],
    },
  ],
  assignments: [
    {
      id: 'a1',
      title: 'Free Fall Lab Report',
      dueDate: 'Oct 15, 2025',
      status: 'In Progress',
    },
    {
      id: 'a2',
      title: 'Orbital Simulation Analysis',
      dueDate: 'Oct 22, 2025',
      status: 'Not Started',
    },
  ],
}
export function CoursePage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [role] = useState<UserRole>('Student')
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <CourseSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        role={role}
      />

      <div className="md:pl-64 flex flex-col min-h-screen">
        <CourseTopBar
          courseName={mockCourse.title}
          orgName="Astana IT University"
        />

        <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
          <CourseHeader course={mockCourse} role={role} />

          <motion.div
            key={activeTab}
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.2,
            }}
          >
            {activeTab === 'overview' && <CourseOverview course={mockCourse} />}

            {activeTab === 'modules' && (
              <div className="max-w-5xl">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Course Modules
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Complete lessons to unlock new modules
                  </p>
                </div>

                {mockCourse.modules.map((module, index) => (
                  <ModuleAccordion
                    key={module.id}
                    module={module}
                    index={index}
                  />
                ))}
              </div>
            )}

            {activeTab === 'assignments' && <AssignmentsView />}

            {activeTab === 'discussions' && <DiscussionsView />}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
