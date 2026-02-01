import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, RotateCcw, ArrowRight } from 'lucide-react'
import { Flashcard, FlashcardSession as FlashcardSessionType } from '../../ai-tutor/types'

interface FlashcardSessionProps {
    flashcards: Flashcard[]
    studyPackId: string
    onComplete: (known: number, unknown: number) => void
    onCancel: () => void
}

export function FlashcardSession({ flashcards, studyPackId, onComplete, onCancel }: FlashcardSessionProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [results, setResults] = useState<boolean[]>([])
    const [showSummary, setShowSummary] = useState(false)

    const currentCard = flashcards[currentIndex]
    const progress = ((currentIndex + 1) / flashcards.length) * 100

    const handleKnow = () => {
        const newResults = [...results, true]
        setResults(newResults)

        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(currentIndex + 1)
            setIsFlipped(false)
        } else {
            finishSession(newResults)
        }
    }

    const handleDontKnow = () => {
        const newResults = [...results, false]
        setResults(newResults)

        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(currentIndex + 1)
            setIsFlipped(false)
        } else {
            finishSession(newResults)
        }
    }

    const finishSession = (finalResults: boolean[]) => {
        setShowSummary(true)

        // Save session to localStorage
        const session: FlashcardSessionType = {
            id: `flashcard-session-${Date.now()}`,
            flashcardSetId: studyPackId,
            studyPackId,
            userId: 'current-user',
            results: flashcards.map((card, i) => ({
                flashcardId: card.id,
                known: finalResults[i]
            })),
            completedAt: new Date().toISOString()
        }

        const sessions = JSON.parse(localStorage.getItem('flashcardSessions') || '[]')
        sessions.push(session)
        localStorage.setItem('flashcardSessions', JSON.stringify(sessions))
    }

    const knownCount = results.filter(r => r).length
    const unknownCount = results.filter(r => !r).length
    const masteryRate = results.length > 0 ? Math.round((knownCount / results.length) * 100) : 0

    if (showSummary) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 space-y-6"
            >
                <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${masteryRate >= 80 ? 'bg-green-100 dark:bg-green-900/30' :
                    masteryRate >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        'bg-orange-100 dark:bg-orange-900/30'
                    }`}>
                    <span className={`text-4xl font-bold ${masteryRate >= 80 ? 'text-green-600 dark:text-green-400' :
                        masteryRate >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-orange-600 dark:text-orange-400'
                        }`}>
                        {masteryRate}%
                    </span>
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {masteryRate >= 80 ? '🎉 Great progress!' :
                            masteryRate >= 60 ? '👍 Keep it up!' :
                                '💪 Practice makes perfect!'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        You completed {flashcards.length} flashcards
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                            {knownCount}
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300">
                            Known
                        </div>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                        <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                            {unknownCount}
                        </div>
                        <div className="text-sm text-orange-700 dark:text-orange-300">
                            Need Review
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 max-w-md mx-auto">
                    <button
                        onClick={() => {
                            setCurrentIndex(0)
                            setIsFlipped(false)
                            setResults([])
                            setShowSummary(false)
                        }}
                        className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={20} />
                        Study Again
                    </button>
                    <button
                        onClick={() => onComplete(knownCount, unknownCount)}
                        className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        Continue
                        <ArrowRight size={20} />
                    </button>
                </div>
            </motion.div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Progress */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Card {currentIndex + 1} of {flashcards.length}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                            ✓ {knownCount}
                        </span>
                        <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                            ✗ {unknownCount}
                        </span>
                    </div>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                    />
                </div>
            </div>

            {/* Flashcard */}
            <div className="relative h-80 perspective-1000">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isFlipped ? 'back' : 'front'}
                        initial={{ rotateY: 90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: -90, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="absolute inset-0 cursor-pointer"
                    >
                        <div className={`h-full rounded-2xl shadow-2xl border-2 flex flex-col items-center justify-center p-8 ${isFlipped
                            ? 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800'
                            : 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800'
                            }`}>
                            <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">
                                {isFlipped ? 'Answer' : 'Question'}
                            </div>
                            <div className="text-center text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                                {isFlipped ? currentCard.back : currentCard.front}
                            </div>
                            <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                                {isFlipped ? 'Do you know this?' : 'Tap to reveal answer'}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={onCancel}
                    className="px-6 py-3 rounded-xl text-gray-600 dark:text-gray-400 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    Cancel
                </button>
                <div className="flex-1" />
                {isFlipped && (
                    <>
                        <button
                            onClick={handleDontKnow}
                            className="px-6 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
                        >
                            <X size={20} />
                            Don't Know
                        </button>
                        <button
                            onClick={handleKnow}
                            className="px-6 py-3 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
                        >
                            <Check size={20} />
                            I Know
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
