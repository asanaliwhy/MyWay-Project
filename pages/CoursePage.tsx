import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { CourseSidebar } from '../components/CourseSidebar'
import { CourseTopBar } from '../components/CourseTopBar'
import { CourseHeader } from '../components/CourseHeader'
import { CourseOverview } from '../components/CourseOverview'
import { ModuleAccordion } from '../components/ModuleAccordion'
import { AssignmentsView } from '../components/AssignmentsView'
import { DiscussionsView } from '../components/DiscussionsView'
import { Course, UserRole } from '../types/course'
import { useAuth } from '../context/AuthContext'

export function CoursePage() {
  const { courseId } = useParams()
  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [role] = useState<UserRole>((user?.role as UserRole) || 'STUDENT')

  const fetchCourseData = useCallback(async () => {
    if (!courseId) return
    try {
      // Mock comprehensive course data
      const mockCourses: Record<string, Course> = {
        'course-cs101': {
          id: 'course-cs101',
          title: 'Introduction to Computer Science',
          code: 'CS101',
          instructor: 'Prof. John Doe',
          duration: '12 weeks',
          description: 'Learn the fundamentals of programming and computer science',
          objectives: [
            'Master programming fundamentals',
            'Understand data structures and algorithms',
            'Build real-world applications',
          ],
          progress: 35,
          modules: [
            {
              id: 'mod1',
              title: 'Introduction to Programming',
              description: 'Learn the basics of programming',
              lessons: [
                { id: 'L1', title: 'Variables and Data Types', type: 'video', duration: '15:30', completed: true },
                { id: 'L2', title: 'Control Flow', type: 'reading', duration: '10:00', completed: false },
              ],
            },
            {
              id: 'mod2',
              title: 'Data Structures',
              description: 'Arrays, Lists, and Hash Maps',
              lessons: [
                { id: 'L3', title: 'Arrays', type: 'video', duration: '20:15', completed: false },
                { id: 'L4', title: 'Linked Lists', type: 'video', duration: '18:45', completed: false },
              ],
            },
          ],
          assignments: [
            { id: 'A1', title: 'Hello World Program', dueDate: '2026-02-15', status: 'Submitted', grade: 95 },
            { id: 'A2', title: 'Data Structure Quiz', dueDate: '2026-02-22', status: 'In Progress', grade: undefined },
          ],
        },
        'course-math221': {
          id: 'course-math221',
          title: 'Linear Algebra',
          code: 'MATH221',
          instructor: 'Prof. Jane Smith',
          duration: '10 weeks',
          description: 'Master vectors, matrices, and linear transformations',
          objectives: [
            'Understand vector spaces',
            'Master matrix operations',
            'Apply linear transformations',
          ],
          progress: 20,
          modules: [
            {
              id: 'mod1',
              title: 'Vectors',
              description: 'Introduction to vectors',
              lessons: [
                { id: 'L1', title: 'Vector Basics', type: 'video', duration: '25:00', completed: true },
              ],
            },
          ],
          assignments: [
            { id: 'A1', title: 'Vector Operations', dueDate: '2026-02-10', status: 'Not Started', grade: undefined },
          ],
        },
        'course-cs50': {
          id: 'course-cs50',
          title: 'Introduction to Computer Science',
          code: 'CS50',
          instructor: 'Prof. David Malan',
          duration: '12 weeks',
          description: 'Harvard\'s introduction to computer science',
          objectives: [
            'Learn fundamental CS concepts',
            'Build practical projects',
            'Master problem solving',
          ],
          progress: 45,
          modules: [
            {
              id: 'mod1',
              title: 'Week 0: Scratch',
              description: 'Introduction to programming with Scratch',
              lessons: [
                { id: 'L1', title: 'Scratch Basics', type: 'video', duration: '90:00', completed: true },
              ],
            },
            {
              id: 'mod2',
              title: 'Week 1: C',
              description: 'Introduction to C programming',
              lessons: [
                { id: 'L2', title: 'C Language Basics', type: 'video', duration: '120:00', completed: false },
              ],
            },
          ],
          assignments: [
            { id: 'A1', title: 'Problem Set 0', dueDate: '2026-02-05', status: 'Submitted', grade: 100 },
            { id: 'A2', title: 'Problem Set 1', dueDate: '2026-02-12', status: 'In Progress', grade: undefined },
          ],
        },
        'course-ml': {
          id: 'course-ml',
          title: 'Machine Learning Crash Course',
          code: 'ML101',
          instructor: 'Google AI Team',
          duration: '8 weeks',
          description: 'Learn machine learning with Google experts',
          objectives: [
            'Understand ML fundamentals',
            'Build ML models',
            'Deploy ML applications',
          ],
          progress: 60,
          modules: [
            {
              id: 'mod1',
              title: 'Introduction to ML',
              description: 'What is Machine Learning?',
              lessons: [
                { id: 'L1', title: 'ML Basics', type: 'video', duration: '30:00', completed: true },
                { id: 'L2', title: 'Types of ML', type: 'reading', duration: '15:00', completed: true },
              ],
            },
            {
              id: 'mod2',
              title: 'Neural Networks',
              description: 'Deep learning fundamentals',
              lessons: [
                { id: 'L3', title: 'Neural Network Basics', type: 'video', duration: '45:00', completed: false },
              ],
            },
          ],
          assignments: [
            { id: 'A1', title: 'ML Model Training', dueDate: '2026-02-20', status: 'Submitted', grade: 92 },
            { id: 'A2', title: 'Neural Network Project', dueDate: '2026-02-27', status: 'Not Started', grade: undefined },
          ],
        },
      };

      const mockCourse = mockCourses[courseId];
      if (mockCourse) {
        setCourse(mockCourse);
      }
    } catch (err) {
      console.error('Failed to fetch course:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData()
  }, [fetchCourseData])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-medium text-gray-500">Course not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <CourseSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        role={role}
      />

      <div className="md:pl-64 flex flex-col min-h-screen">
        <CourseTopBar
          courseName={course.title}
          orgName="Astana IT University"
        />

        <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
          <CourseHeader course={course} role={role} />

          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <CourseOverview course={course} />}

            {activeTab === 'modules' && (
              <div className="max-w-5xl">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Course Modules
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Interact with AI-powered study packs and quizzes
                  </p>
                </div>

                {course.modules.map((module: any, index: number) => (
                  <ModuleAccordion
                    key={module.id}
                    module={module}
                    courseId={course.id}
                    index={index}
                    role={role}
                    onRefresh={fetchCourseData}
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
