export type UserRole = 'STUDENT' | 'TEACHER' | 'ORGANIZER'

export interface Lesson {
  id: string
  title: string
  duration: string
  completed: boolean
  type: 'video' | 'reading' | 'quiz'
}

export interface Module {
  id: string
  title: string
  description: string
  lessons: Lesson[]
  isLocked?: boolean
}

export interface Assignment {
  id: string
  title: string
  dueDate: string
  status: 'Not Started' | 'In Progress' | 'Submitted' | 'Graded'
  grade?: string
}


export interface SyllabusItem {
  week: number
  title: string
  description: string
  readings: string[]
}

export interface Course {
  id: string
  title: string
  code: string
  instructor: string
  duration: string
  description: string
  objectives: string[]
  progress: number // 0-100
  modules: Module[]
  assignments: Assignment[]
  syllabus: SyllabusItem[]
}
