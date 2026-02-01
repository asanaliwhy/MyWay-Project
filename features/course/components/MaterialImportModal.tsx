import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Youtube,
    Link,
    Loader2,
    CheckCircle,
    AlertCircle,
    X,
    Sparkles,
    ArrowRight
} from 'lucide-react'
import { useStudyPacks } from '../../ai-tutor/context/StudyPackContext'

interface MaterialImportModalProps {
    isOpen: boolean
    onClose: () => void
    courseId: string
    moduleId: string
    onSuccess: () => void
}

export function MaterialImportModal({ isOpen, onClose, courseId, moduleId, onSuccess }: MaterialImportModalProps) {
    const { addMaterial, addStudyPack } = useStudyPacks()
    const [url, setUrl] = useState('')
    const [title, setTitle] = useState('')
    const [transcript, setTranscript] = useState('')
    const [status, setStatus] = useState<'idle' | 'fetching' | 'generating' | 'success' | 'error'>('idle')
    const [error, setError] = useState('')

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('fetching')
        setError('')

        try {
            // Validate inputs
            if (!title.trim()) {
                throw new Error('Please enter a title for the material')
            }

            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
            if (!youtubeRegex.test(url)) {
                throw new Error('Please enter a valid YouTube URL')
            }

            setStatus('generating')

            // Import material and generate study pack with Gemini AI
            const { processMaterial, generateStudyPack } = await import('../../ai-tutor/api/StudyPackService')

            // Process material (will use manual transcript if provided, otherwise placeholder)
            const material = await processMaterial(
                title.trim(),
                'youtube',
                url,
                moduleId,
                courseId,
                transcript.trim() || undefined
            )

            // Generate study pack with Gemini AI
            const studyPack = await generateStudyPack(material)
            console.log('Study pack generated:', studyPack)

            // Save to context
            addMaterial(material)
            addStudyPack(studyPack)

            setStatus('success')
            setTimeout(() => {
                onSuccess()
                onClose()
                setStatus('idle')
                setUrl('')
                setTitle('')
                setTranscript('')
            }, 1500)
        } catch (err: any) {
            console.error(err)
            setStatus('error')
            setError(err.message || 'Failed to process video. Please try again.')
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
            >
                {/* Header */}
                <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Import Learning Material</h2>
                        <p className="text-gray-500 text-sm">Transform any video into a full study pack</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    {status === 'idle' || status === 'error' ? (
                        <form onSubmit={handleImport} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Material Title *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Introduction to React Hooks"
                                    required
                                    className="w-full px-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500 dark:text-white outline-none transition-all shadow-inner"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Youtube size={16} className="text-red-500" />
                                    YouTube Video URL *
                                </label>
                                <div className="relative">
                                    <Link size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="url"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        required
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500 dark:text-white outline-none transition-all shadow-inner"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Video Transcript (Optional)
                                </label>
                                <textarea
                                    placeholder="Paste the video transcript here if you have it. Otherwise, leave blank."
                                    rows={6}
                                    className="w-full px-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500 dark:text-white outline-none transition-all shadow-inner resize-none"
                                    value={transcript}
                                    onChange={(e) => setTranscript(e.target.value)}
                                />
                                <p className="text-xs text-gray-500">
                                    💡 Tip: Providing the transcript helps generate better study materials!
                                </p>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/50">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                            >
                                Ingest & Process
                                <ArrowRight size={20} />
                            </button>
                        </form>
                    ) : (
                        <div className="py-12 flex flex-col items-center text-center">
                            <div className="relative mb-8">
                                {status === 'success' ? (
                                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                        <CheckCircle size={40} className="text-green-600" />
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Loader2 size={80} className="text-indigo-600 animate-spin" />
                                        <Sparkles size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400 animate-pulse" />
                                    </div>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {status === 'fetching' && 'Accessing Video Data...'}
                                {status === 'generating' && 'AI is Crafting Study Pack...'}
                                {status === 'success' && 'Ready to Learn!'}
                            </h3>
                            <p className="text-gray-500 max-w-xs mx-auto">
                                {status === 'fetching' && 'Retrieving transcript and validating source.'}
                                {status === 'generating' && 'Creating summaries, quizzes and flashcards based on content.'}
                                {status === 'success' && 'Study material has been added to your course module.'}
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
