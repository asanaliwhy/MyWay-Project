import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText,
    HelpCircle,
    Layers,
    ChevronLeft,
    CheckCircle,
    Loader2,
    AlertCircle,
    Sparkles
} from 'lucide-react'
import apiClient from '../../lib/axios-client'
import { OrgTopBar } from '../../features/organization/components/OrgTopBar'
import { useAuth } from '../../features/auth/context/AuthContext'
import { InstructorReviewPanel } from '../../features/ai-tutor/components/InstructorReviewPanel'
import { StudentLearningPackPanel } from '../../features/ai-tutor/components/StudentLearningPackPanel'
import { StudyPackGenerator } from '../../features/ai-tutor/components/StudyPackGenerator'
import { useStudyPacks } from '../../features/ai-tutor/context/StudyPackContext'

const prettifyLessonId = (materialId: string) =>
    materialId
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (m) => m.toUpperCase())

const buildSeedStudyPack = (materialId: string) => {
    const lowerId = materialId.toLowerCase()
    const lessonTitle = prettifyLessonId(materialId)
    const isCloud = lowerId.includes('cloud')
    const fallbackVideoUrl = isCloud ? 'https://www.youtube.com/watch?v=mxT233EdY5c' : ''

    const summary = isCloud
        ? 'Cloud computing delivers on-demand infrastructure, platform, and software services over the internet. The lesson focuses on service models (IaaS, PaaS, SaaS), deployment patterns (public, private, hybrid), and why organizations adopt cloud for agility, scalability, and reliability.\n\nA strong cloud foundation requires understanding compute, storage, networking, IAM, and monitoring. Teams should design for high availability, least-privilege security, and cost governance to build resilient, efficient cloud systems.'
        : 'This lesson introduces the core ideas and practical workflow for the topic. Focus on definitions, key components, and how they connect in real scenarios.\n\nAs you study, identify the main concepts, compare alternatives, and remember implementation trade-offs so you can apply the material confidently in assignments and projects.'

    return {
        source: 'seed',
        id: `seed-${materialId}`,
        materialId,
        material: {
            title: lessonTitle,
            videoUrl: fallbackVideoUrl,
            transcript: isCloud
                ? 'Cloud computing provides scalable resources on demand. Service models include IaaS for infrastructure control, PaaS for managed development, and SaaS for ready-to-use applications.\n\nCore architecture topics include virtual machines, containers, object/block storage, and virtual networking. Reliability is achieved through multi-zone deployments, auto scaling, and observability.\n\nSecurity and governance remain central: IAM roles, encryption in transit/at rest, and cost controls such as budgets, quotas, and tagging policies.'
                : 'This lesson covers foundational concepts, practical examples, and applied reasoning.\n\nRead the content carefully, then test your understanding with the quiz and flashcards.'
        },
        summary,
        quizzes: [
            {
                id: `quiz-${materialId}`,
                questions: isCloud
                    ? [
                        {
                            id: `${materialId}-q1`,
                            question: 'Which service model gives you the most control over operating systems and runtime setup?',
                            options: ['SaaS', 'PaaS', 'IaaS', 'FaaS'],
                            correctAnswer: 2,
                            explanation: 'IaaS provides virtualized infrastructure and greater control over OS and middleware.'
                        },
                        {
                            id: `${materialId}-q2`,
                            question: 'What is the primary goal of auto scaling in cloud environments?',
                            options: ['Increase manual operations', 'Match capacity to demand', 'Disable monitoring', 'Reduce availability'],
                            correctAnswer: 1,
                            explanation: 'Auto scaling adjusts compute capacity to workload demand for performance and cost efficiency.'
                        },
                        {
                            id: `${materialId}-q3`,
                            question: 'Which practice best supports cloud cost governance?',
                            options: ['No tagging strategy', 'Use budgets and resource tagging', 'Disable billing alerts', 'Single-region hardcoding'],
                            correctAnswer: 1,
                            explanation: 'Budgets, alerts, and tagging are key controls for tracking and optimizing cloud spend.'
                        }
                    ]
                    : [
                        {
                            id: `${materialId}-q1`,
                            question: 'What should you focus on first in a new lesson?',
                            options: ['Memorize random facts', 'Understand core concepts and terminology', 'Skip examples', 'Ignore definitions'],
                            correctAnswer: 1,
                            explanation: 'Foundational understanding helps you apply everything else correctly.'
                        },
                        {
                            id: `${materialId}-q2`,
                            question: 'Which approach improves retention most effectively?',
                            options: ['Passive reading only', 'Practice with questions and recall', 'Avoid summaries', 'Study without structure'],
                            correctAnswer: 1,
                            explanation: 'Active recall and practice are reliable methods for long-term retention.'
                        }
                    ]
            }
        ],
        flashcards: isCloud
            ? [
                { id: `${materialId}-f1`, front: 'IaaS', back: 'Infrastructure as a Service provides virtualized compute, storage, and networking resources with high control.' },
                { id: `${materialId}-f2`, front: 'PaaS', back: 'Platform as a Service offers managed runtime and development tooling, reducing infrastructure overhead.' },
                { id: `${materialId}-f3`, front: 'SaaS', back: 'Software as a Service delivers complete applications over the web with minimal setup for users.' },
                { id: `${materialId}-f4`, front: 'High Availability', back: 'Designing systems to remain operational through redundancy, failover, and fault-tolerant architecture.' }
            ]
            : [
                { id: `${materialId}-f1`, front: 'Core Concept', back: 'A foundational idea that explains how the lesson topic works.' },
                { id: `${materialId}-f2`, front: 'Application', back: 'Using the concept in a practical scenario or problem-solving context.' }
            ]
    }
}

export function StudyPage() {
    const { materialId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAuth()
    const { materials, getStudyPackByMaterialId } = useStudyPacks()

    const isInstructor = user?.role === 'TEACHER' || user?.role === 'ORGANIZER'

    const [activeTab, setActiveTab] = useState<'summary' | 'quiz' | 'flashcards' | 'review'>('summary')
    const [studyPack, setStudyPack] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const returnTo = (() => {
        const maybeState = location.state as { returnTo?: string } | null
        return maybeState?.returnTo || null
    })()

    const goBackToSource = () => {
        if (returnTo) {
            navigate(returnTo)
            return
        }
        navigate(-1)
    }

    const localMaterial = materialId ? materials.find((m) => m.id === materialId) : null
    const localStudyPack = materialId ? getStudyPackByMaterialId(materialId) : null

    useEffect(() => {
        setActiveTab(isInstructor ? 'review' : 'summary')
    }, [isInstructor])

    useEffect(() => {
        const fetchStudyPack = async () => {
            if (!materialId) {
                setError('Invalid material ID')
                setLoading(false)
                return
            }

            if (localMaterial && localStudyPack) {
                setStudyPack({
                    source: 'local',
                    id: localStudyPack.id,
                    materialId,
                    material: {
                        title: localMaterial.title,
                        videoUrl: localMaterial.sourceUrl || '',
                        transcript: localMaterial.content || '',
                    },
                    localStudyPack,
                })
                setLoading(false)
                return
            }

            try {
                const response = await apiClient.get(`/ai/studypack/${materialId}`)
                const packData = response.data
                setStudyPack({
                    source: 'backend',
                    id: packData?.id || `pack-${materialId}`,
                    materialId: materialId,
                    material: {
                        title: packData?.material?.title || 'Study Session',
                        videoUrl: packData?.material?.videoUrl || '',
                        transcript: packData?.material?.transcript || '',
                    },
                    summary: packData?.summary,
                    quizzes: packData?.quizzes || (packData?.quiz ? [packData.quiz] : []),
                    flashcards: packData?.flashcards || [],
                })
            } catch (err) {
                console.error('Failed to prepare study pack:', err)
                setStudyPack(buildSeedStudyPack(materialId))
            } finally {
                setLoading(false)
            }
        }

        fetchStudyPack()
    }, [materialId, localMaterial, localStudyPack])

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
                <div className="max-w-xl w-full rounded-2xl border border-red-200 dark:border-red-900/40 bg-white dark:bg-gray-800 p-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-red-500 mt-0.5" size={20} />
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Unable to open lecture</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{error}</p>
                            <button
                                onClick={goBackToSource}
                                className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }


    if (!loading && !error && !studyPack) {
        // ... empty state
    }

    const isLocalGenerated = Boolean(studyPack?.source === 'local' && studyPack?.localStudyPack)

    const summaryContent = studyPack?.summary?.content || {}
    const studentSummary = typeof studyPack?.summary === 'string'
        ? studyPack.summary
        : typeof summaryContent?.summary === 'string'
            ? summaryContent.summary
        : 'Summary will be available after AI processing and instructor review.'
    const studentKeyPoints = Array.isArray(summaryContent?.bullets)
        ? summaryContent.bullets.filter((x: unknown) => typeof x === 'string')
        : []

    const tabs = isLocalGenerated
        ? []
        : isInstructor
        ? [{ id: 'review', label: 'Review & Publish', icon: Sparkles }]
        : [
            { id: 'summary', label: 'Summary', icon: FileText },
            { id: 'quiz', label: 'Quiz Interaction', icon: HelpCircle },
            { id: 'flashcards', label: 'Flashcards', icon: Layers },
        ]

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans transition-colors duration-300">
            <OrgTopBar />

            <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8">
                {/* Breadcrumb & Title */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={goBackToSource}
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

                {/* Content Player & Transcript Section */}
                <div className="grid md:grid-cols-3 gap-8 mb-8">
                    <div className="md:col-span-2 space-y-6">
                        {/* Video Player or Content Placeholder */}
                        {studyPack?.material?.videoUrl ? (
                            <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-lg">
                                <iframe
                                    src={studyPack.material.videoUrl.replace('watch?v=', 'embed/')}
                                    title="Course Video"
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        ) : (
                            <div className="aspect-video bg-black rounded-2xl flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80)' }}></div>
                                <div className="relative z-10 w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer group-hover:scale-110 transition-transform">
                                    <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2"></div>
                                </div>
                            </div>
                        )}

                        {/* Transcript */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 h-96 overflow-y-auto">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 sticky top-0 bg-white dark:bg-gray-800 py-2">
                                <FileText size={18} className="text-indigo-600" />
                                Transcript / Text Content
                            </h3>
                            <div className="prose dark:prose-invert text-sm text-gray-600 dark:text-gray-300">
                                {studyPack?.material?.transcript ? (
                                    studyPack.material.transcript.split('\n\n').map((paragraph: string, i: number) => (
                                        <p key={i} className="mb-4 whitespace-pre-wrap">{paragraph}</p>
                                    ))
                                ) : (
                                    <p className="text-gray-400 italic">No transcript available for this lesson.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-1">
                        {isLocalGenerated ? (
                            <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/60 dark:bg-indigo-900/20 p-4 text-sm text-indigo-800 dark:text-indigo-200">
                                Generated study pack detected for this imported material. Use the interactive tabs below to open summary, quiz, and flashcards.
                            </div>
                        ) : (
                            <>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                                    {isInstructor ? 'AI Governance' : 'AI Study Helper'}
                                </h3>
                                {/* AI Tabs Vertical/Stacked */}
                                <div className="flex flex-col gap-2">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${activeTab === tab.id
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                                }`}
                                        >
                                            <tab.icon size={18} />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* AI Content Area (moved below/alongside) */}

                {/* content Area */}
                {isLocalGenerated ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm min-h-[400px] overflow-hidden">
                        <div className="p-6">
                            <StudyPackGenerator studyPack={studyPack.localStudyPack} />
                        </div>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm min-h-[400px] overflow-hidden"
                        >
                            {isInstructor && activeTab === 'review' && materialId && (
                                <div className="p-6">
                                    <InstructorReviewPanel
                                        materialId={materialId}
                                        fallbackVideoUrl={studyPack?.material?.videoUrl}
                                    />
                                </div>
                            )}

                            {!isInstructor && activeTab === 'summary' && (
                                <div className="p-6">
                                    <StudentLearningPackPanel
                                        summary={studentSummary}
                                        keyPoints={studentKeyPoints}
                                        videoUrl={studyPack?.material?.videoUrl}
                                    />
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
                )}
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
    const questionText = q?.prompt || q?.question || 'Question'

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-12">
                <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Question {currentIdx + 1}/{quiz.questions.length}</span>
                <div className="h-2 w-48 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}></div>
                </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-10">{questionText}</h3>

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
                className="relative w-full max-w-xl h-80 cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isFlipped ? `back-${card.id}` : `front-${card.id}`}
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute inset-0 rounded-3xl p-12 flex items-center justify-center text-center ${isFlipped
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-indigo-900 text-gray-900 dark:text-white shadow-sm'
                            }`}
                    >
                        {isFlipped ? (
                            <p className="text-xl leading-relaxed">{card.back}</p>
                        ) : (
                            <h4 className="text-2xl font-bold">{card.front}</h4>
                        )}
                    </motion.div>
                </AnimatePresence>
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
