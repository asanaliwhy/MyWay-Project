import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface PlaceholderPageProps {
    title: string
    description?: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-8">
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                {description && <p className="text-gray-600 mt-2">{description}</p>}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center border-dashed"
            >
                <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{title} Feature</h2>
                <p className="text-gray-500 max-w-md">
                    This feature is part of the roadmap for AntiGravity Lab. It will be implemented in the upcoming sprint.
                </p>
            </motion.div>
        </div>
    )
}
