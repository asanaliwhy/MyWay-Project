// Study Pack Types
export interface Material {
    id: string
    title: string
    type: 'youtube' | 'document'
    sourceUrl?: string
    content: string
    status: 'queued' | 'processing' | 'ready' | 'failed'
    createdAt: string
    moduleId: string
    courseId: string
}

export interface StudyPack {
    id: string
    materialId: string
    summary: string
    quiz: Quiz
    flashcards: Flashcard[]
    createdAt: string
    status: 'queued' | 'processing' | 'ready' | 'failed'
}

export interface Quiz {
    id: string
    questions: QuizQuestion[]
}

export interface QuizQuestion {
    id: string
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
}

export interface Flashcard {
    id: string
    front: string
    back: string
    known?: boolean
}

export interface QuizAttempt {
    id: string
    quizId: string
    studyPackId: string
    userId: string
    answers: number[]
    score: number
    totalQuestions: number
    completedAt: string
    timeSpent: number // seconds
}

export interface FlashcardSession {
    id: string
    flashcardSetId: string
    studyPackId: string
    userId: string
    results: FlashcardResult[]
    completedAt: string
}

export interface FlashcardResult {
    flashcardId: string
    known: boolean
}

export type ImportStatus = 'idle' | 'uploading' | 'queued' | 'processing' | 'ready' | 'failed'
