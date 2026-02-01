import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Clock, ArrowRight, RotateCcw } from 'lucide-react'
import { Quiz, QuizAttempt } from '../../ai-tutor/types'

interface QuizSessionProps {
    quiz: Quiz
    studyPackId: string
    onComplete: (score: number, total: number) => void
    onCancel: () => void
}

export function QuizSession({ quiz, studyPackId, onComplete, onCancel }: QuizSessionProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
        new Array(quiz.questions.length).fill(null)
    )
    const [showResults, setShowResults] = useState(false)
    const [timeSpent, setTimeSpent] = useState(0)
    const [startTime] = useState(Date.now())

    useEffect(() => {
        if (!showResults) {
            const timer = setInterval(() => {
                setTimeSpent(Math.floor((Date.now() - startTime) / 1000))
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [showResults, startTime])

    const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
        const newAnswers = [...selectedAnswers]
        newAnswers[questionIndex] = answerIndex
        setSelectedAnswers(newAnswers)
    }

    const handleSubmit = () => {
        setShowResults(true)

        // Calculate score
        let correct = 0
        quiz.questions.forEach((q, i) => {
            if (selectedAnswers[i] === q.correctAnswer) {
                correct++
            }
        })

        // Save attempt to localStorage
        const attempt: QuizAttempt = {
            id: `quiz-attempt-${Date.now()}`,
            quizId: quiz.id,
            studyPackId,
            userId: 'current-user',
            answers: selectedAnswers.filter(a => a !== null) as number[],
            score: correct,
            totalQuestions: quiz.questions.length,
            completedAt: new Date().toISOString(),
            timeSpent
        }

        const attempts = JSON.parse(localStorage.getItem('quizAttempts') || '[]')
        attempts.push(attempt)
        localStorage.setItem('quizAttempts', JSON.stringify(attempts))
    }

    const score = quiz.questions.filter((q, i) => selectedAnswers[i] === q.correctAnswer).length
    const percentage = Math.round((score / quiz.questions.length) * 100)

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (showResults) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
                {/* Results Header */}
                <div className="text-center py-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
                    <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${percentage >= 80 ? 'bg-green-100 dark:bg-green-900/30' :
                        percentage >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                            'bg-red-100 dark:bg-red-900/30'
                        }`}>
                        <span className={`text-4xl font-bold ${percentage >= 80 ? 'text-green-600 dark:text-green-400' :
                            percentage >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-red-600 dark:text-red-400'
                            }`}>
                            {percentage}%
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {percentage >= 80 ? '🎉 Excellent!' :
                            percentage >= 60 ? '👍 Good job!' :
                                '💪 Keep practicing!'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        You scored {score} out of {quiz.questions.length} • Time: {formatTime(timeSpent)}
                    </p>
                </div>

                {/* Question Review */}
                <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 dark:text-white">Review Your Answers</h4>
                    {quiz.questions.map((question, qIndex) => {
                        const userAnswer = selectedAnswers[qIndex]
                        const isCorrect = userAnswer === question.correctAnswer

                        return (
                            <div
                                key={question.id}
                                className={`p-4 rounded-xl border-2 ${isCorrect
                                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                                    : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                                    }`}
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <div className={`p-2 rounded-lg ${isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                                        }`}>
                                        {isCorrect ? (
                                            <Check size={20} className="text-green-600 dark:text-green-400" />
                                        ) : (
                                            <X size={20} className="text-red-600 dark:text-red-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-white mb-3">
                                            {qIndex + 1}. {question.question}
                                        </p>
                                        <div className="space-y-2">
                                            {question.options.map((option, oIndex) => {
                                                const isUserAnswer = userAnswer === oIndex
                                                const isCorrectAnswer = oIndex === question.correctAnswer

                                                return (
                                                    <div
                                                        key={oIndex}
                                                        className={`px-4 py-2 rounded-lg text-sm ${isCorrectAnswer
                                                            ? 'bg-green-100 dark:bg-green-900/20 text-green-900 dark:text-green-100 font-medium'
                                                            : isUserAnswer
                                                                ? 'bg-red-100 dark:bg-red-900/20 text-red-900 dark:text-red-100'
                                                                : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                                            }`}
                                                    >
                                                        {option}
                                                        {isCorrectAnswer && ' ✓'}
                                                        {isUserAnswer && !isCorrectAnswer && ' ✗'}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                                <span className="font-semibold">Explanation:</span> {question.explanation}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setShowResults(false)
                            setCurrentQuestion(0)
                            setSelectedAnswers(new Array(quiz.questions.length).fill(null))
                            setTimeSpent(0)
                        }}
                        className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={20} />
                        Retake Quiz
                    </button>
                    <button
                        onClick={() => onComplete(score, quiz.questions.length)}
                        className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        Continue Learning
                        <ArrowRight size={20} />
                    </button>
                </div>
            </motion.div>
        )
    }

    const question = quiz.questions[currentQuestion]
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

    return (
        <div className="space-y-6">
            {/* Progress Bar */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Question {currentQuestion + 1} of {quiz.questions.length}
                    </span>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock size={16} />
                        {formatTime(timeSpent)}
                    </div>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                    />
                </div>
            </div>

            {/* Question */}
            <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
            >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {question.question}
                </h3>

                <div className="space-y-3">
                    {question.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswerSelect(currentQuestion, index)}
                            className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all ${selectedAnswers[currentQuestion] === index
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100'
                                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedAnswers[currentQuestion] === index
                                    ? 'border-indigo-500 bg-indigo-500'
                                    : 'border-gray-300 dark:border-gray-600'
                                    }`}>
                                    {selectedAnswers[currentQuestion] === index && (
                                        <Check size={16} className="text-white" />
                                    )}
                                </div>
                                <span>{option}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Navigation */}
            <div className="flex gap-3">
                {currentQuestion > 0 && (
                    <button
                        onClick={() => setCurrentQuestion(curr => curr - 1)}
                        className="px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Previous
                    </button>
                )}
                <button
                    onClick={onCancel}
                    className="px-6 py-3 rounded-xl text-gray-600 dark:text-gray-400 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    Cancel
                </button>
                <div className="flex-1" />
                {currentQuestion < quiz.questions.length - 1 ? (
                    <button
                        onClick={() => setCurrentQuestion(curr => curr + 1)}
                        disabled={selectedAnswers[currentQuestion] === null}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        Next
                        <ArrowRight size={20} />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={selectedAnswers.some(a => a === null)}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        Submit Quiz
                        <Check size={20} />
                    </button>
                )}
            </div>
        </div>
    )
}
