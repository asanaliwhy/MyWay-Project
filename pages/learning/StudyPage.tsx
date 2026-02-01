import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText,
    HelpCircle,
    Layers,
    ChevronLeft,
    CheckCircle,
    Loader2,
    AlertCircle
} from 'lucide-react'
import apiClient from '../../lib/axios-client'
import { OrgTopBar } from '../../features/organization/components/OrgTopBar'

export function StudyPage() {
    const { materialId } = useParams()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<'summary' | 'quiz' | 'flashcards'>('summary')
    const [studyPack, setStudyPack] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchStudyPack = async () => {
            try {
                const response = await apiClient.get(`/ai/studypack/${materialId}`)
                setStudyPack(response.data)
            } catch (err) {
                console.error('Failed to fetch study pack:', err)
                setError('Study materials not found or still generating. Try again later.')
            } finally {
                setLoading(false)
            }
        }

        if (materialId) fetchStudyPack()
    }, [materialId])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Preparing your personalized study materials...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Oops!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }


    if (!loading && !error && !studyPack) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Content Unavailable</h2>
                    <button onClick={() => navigate(-1)} className="text-indigo-600 hover:underline">Go Back</button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans transition-colors duration-300">
            <OrgTopBar />

            <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8">
                {/* Breadcrumb & Title */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {studyPack?.material?.title || 'Study Session'}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Powered by AI Analysis</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
                    {[
                        { id: 'summary', label: 'Summary', icon: FileText },
                        { id: 'quiz', label: 'Quiz Interaction', icon: HelpCircle },
                        { id: 'flashcards', label: 'Flashcards', icon: Layers },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* content Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm min-h-[400px] overflow-hidden"
                    >
                        {activeTab === 'summary' && (
                            <div className="p-8 prose dark:prose-invert max-w-none">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <CheckCircle size={20} className="text-green-500" />
                                    Key Takeaways
                                </h2>
                                <ul className="space-y-4">
                                    {(studyPack?.summary?.content?.bullets || []).map((bullet: string, i: number) => (
                                        <li key={i} className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                                            {bullet}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-12 bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                                    <h3 className="text-indigo-900 dark:text-indigo-300 font-bold mb-2">Concept Deep Dive</h3>
                                    <p className="text-indigo-800 dark:text-indigo-400 leading-relaxed">
                                        {studyPack?.summary?.content?.summary}
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'quiz' && (
                            <QuizInteraction quiz={studyPack?.quizzes?.[0]} />
                        )}

                        {activeTab === 'flashcards' && (
                            <FlashcardInteraction flashcards={studyPack?.flashcards || []} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    )
}

function QuizInteraction({ quiz }: { quiz: any }) {
    const [currentIdx, setCurrentIdx] = useState(0)
    const [answers, setAnswers] = useState<any>({})
    const [isFinished, setIsFinished] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!quiz || !quiz.questions?.length) return <div className="p-8">No quiz questions found.</div>

    const handleSelect = (choice: string) => {
        setAnswers({ ...answers, [quiz.questions[currentIdx].id]: choice })
    }

    const handleFinish = async () => {
        setIsSubmitting(true)
        try {
            await apiClient.post('/analytics/quiz/attempt', {
                quizId: quiz.id,
                answers
            })
            setIsFinished(true)
        } catch (err) {
            alert('Failed to save score')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isFinished) {
        return (
            <div className="p-12 text-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Quiz Completed!</h2>
                <p className="text-gray-500 mb-8">Your analytics have been updated. Great work!</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold"
                >
                    Retake Quiz
                </button>
            </div>
        )
    }

    const q = quiz.questions[currentIdx]

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-12">
                <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Question {currentIdx + 1}/{quiz.questions.length}</span>
                <div className="h-2 w-48 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}></div>
                </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-10">{q.prompt}</h3>

            <div className="space-y-4">
                {(q.options as string[]).map((option) => (
                    <button
                        key={option}
                        onClick={() => handleSelect(option)}
                        className={`w-full text-left p-6 rounded-2xl border-2 transition-all ${answers[q.id] === option
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm'
                            : 'border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-900'
                            }`}
                    >
                        {option}
                    </button>
                ))}
            </div>

            <div className="mt-12 flex justify-between">
                <button
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx(currentIdx - 1)}
                    className="px-6 py-2.5 text-gray-500 font-medium disabled:opacity-30"
                >
                    Previous
                </button>
                {currentIdx === quiz.questions.length - 1 ? (
                    <button
                        disabled={!answers[q.id] || isSubmitting}
                        onClick={handleFinish}
                        className="px-8 py-2.5 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-100 dark:shadow-none flex items-center gap-2"
                    >
                        {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                        Finish & Submit
                    </button>
                ) : (
                    <button
                        disabled={!answers[q.id]}
                        onClick={() => setCurrentIdx(currentIdx + 1)}
                        className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none"
                    >
                        Next Question
                    </button>
                )}
            </div>
        </div>
    )
}

function FlashcardInteraction({ flashcards }: { flashcards: any[] }) {
    const [currentIdx, setCurrentIdx] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)

    if (!flashcards.length) return <div className="p-8">No flashcards found.</div>

    const card = flashcards[currentIdx]

    return (
        <div className="p-12 flex flex-col items-center">
            <div className="text-sm font-bold text-gray-400 mb-8 uppercase tracking-widest">Card {currentIdx + 1} of {flashcards.length}</div>

            <div
                className="relative w-full max-w-xl h-80 perspective-1000 cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <motion.div
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                    className="w-full h-full relative preserve-3d"
                >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-indigo-900 rounded-3xl p-12 flex items-center justify-center text-center shadow-sm">
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{card.front}</h4>
                    </div>
                    {/* Back */}
                    <div
                        className="absolute inset-0 backface-hidden bg-indigo-600 rounded-3xl p-12 flex items-center justify-center text-center text-white"
                        style={{ transform: 'rotateY(180deg)' }}
                    >
                        <p className="text-xl leading-relaxed">{card.back}</p>
                    </div>
                </motion.div>
            </div>

            <p className="mt-8 text-gray-400 text-sm">Click the card to flip</p>

            <div className="mt-12 flex gap-4">
                <button
                    onClick={() => { setCurrentIdx(Math.max(0, currentIdx - 1)); setIsFlipped(false) }}
                    className="p-4 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={() => { setCurrentIdx(Math.min(flashcards.length - 1, currentIdx + 1)); setIsFlipped(false) }}
                    className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none"
                >
                    Next Card
                </button>
            </div>

            <div className="mt-12 flex items-center gap-2">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Learning Status:</span>
                <span className="px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-600 text-xs font-bold rounded">In Progress</span>
            </div>
        </div>
    )
}
