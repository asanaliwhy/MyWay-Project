import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Brain, Zap, Check, X } from 'lucide-react'
import { StudyPack } from '../types'
import { QuizSession } from '../../study-mode/components/QuizSession'
import { FlashcardSession } from '../../study-mode/components/FlashcardSession'

interface StudyPackGeneratorProps {
    studyPack: StudyPack
    onQuizComplete?: (score: number, total: number) => void
    onFlashcardComplete?: (known: number, unknown: number) => void
}

export function StudyPackGenerator({ studyPack, onQuizComplete, onFlashcardComplete }: StudyPackGeneratorProps) {
    const [activeTab, setActiveTab] = useState<'summary' | 'quiz' | 'flashcards'>('summary')
    const [showQuiz, setShowQuiz] = useState(false)
    const [showFlashcards, setShowFlashcards] = useState(false)

    const tabs = [
        { id: 'summary', label: 'Summary', icon: BookOpen },
        { id: 'quiz', label: 'Quiz', icon: Brain },
        { id: 'flashcards', label: 'Flashcards', icon: Zap }
    ]

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === tab.id
                                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Icon size={20} />
                                <span>{tab.label}</span>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Content */}
            <div className="p-6">
                {activeTab === 'summary' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="prose dark:prose-invert max-w-none"
                    >
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            📚 Summary
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {studyPack.summary}
                        </p>
                    </motion.div>
                )}

                {activeTab === 'quiz' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {!showQuiz ? (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                                    <Brain size={40} className="text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Ready to test your knowledge?
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    {studyPack.quiz.questions.length} questions • Est. 5-10 minutes
                                </p>
                                <button
                                    onClick={() => setShowQuiz(true)}
                                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                                >
                                    Start Quiz
                                </button>
                            </div>
                        ) : (
                            <QuizSession
                                quiz={studyPack.quiz}
                                studyPackId={studyPack.id}
                                onComplete={(score, total) => {
                                    setShowQuiz(false)
                                    onQuizComplete?.(score, total)
                                }}
                                onCancel={() => setShowQuiz(false)}
                            />
                        )}
                    </motion.div>
                )}

                {activeTab === 'flashcards' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {!showFlashcards ? (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
                                    <Zap size={40} className="text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Master the concepts!
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    {studyPack.flashcards.length} flashcards • Swipe to learn
                                </p>
                                <button
                                    onClick={() => setShowFlashcards(true)}
                                    className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                                >
                                    Start Studying
                                </button>
                            </div>
                        ) : (
                            <FlashcardSession
                                flashcards={studyPack.flashcards}
                                studyPackId={studyPack.id}
                                onComplete={(known, unknown) => {
                                    setShowFlashcards(false)
                                    onFlashcardComplete?.(known, unknown)
                                }}
                                onCancel={() => setShowFlashcards(false)}
                            />
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    )
}
