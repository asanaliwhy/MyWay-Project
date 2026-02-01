import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Building2, BookOpen, Users, TrendingUp, Sparkles, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function HomePage() {
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuth()

    const features = [
        {
            icon: Building2,
            title: 'Organizations',
            description: 'Manage multiple organizations with ease',
            color: 'from-indigo-500 to-purple-600',
        },
        {
            icon: BookOpen,
            title: 'Courses',
            description: 'Access comprehensive learning materials',
            color: 'from-teal-500 to-cyan-600',
        },
        {
            icon: Users,
            title: 'Collaboration',
            description: 'Work together with your team',
            color: 'from-pink-500 to-rose-600',
        },
        {
            icon: TrendingUp,
            title: 'Analytics',
            description: 'Track progress and insights',
            color: 'from-orange-500 to-amber-600',
        },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors duration-300">
            {/* Header */}
            <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 transition-colors">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl shadow-lg">
                            <GraduationCap size={28} className="text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            MyWay
                        </span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4"
                    >
                        {isAuthenticated ? (
                            <button
                                onClick={() => navigate('/organizations')}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                            >
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                                    {user?.firstName?.charAt(0) || 'U'}
                                </div>
                                <span>Go to Dashboard</span>
                                <ArrowRight size={16} />
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/signin')}
                                    className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow"
                                >
                                    Get Started
                                </button>
                            </>
                        )}
                    </motion.div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-6 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                        className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full font-medium text-sm mb-6"
                    >
                        <Sparkles size={16} />
                        <span>Your Learning Journey Starts Here</span>
                    </motion.div>

                    <h1 className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                        Welcome to{' '}
                        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                            MyWay
                        </span>
                    </h1>

                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Your personalized learning and organization management platform.
                        Connect, learn, and grow with powerful tools designed for modern education.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/organizations')}
                            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-3"
                        >
                            <Building2 size={24} />
                            <span>Explore Organizations</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/organizations')}
                            className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
                        >
                            <BookOpen size={24} />
                            <span>Browse Courses</span>
                        </motion.button>
                    </div>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700"
                        >
                            <div
                                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-md`}
                            >
                                <feature.icon size={28} className="text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-white shadow-2xl"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-5xl font-bold mb-2">100+</div>
                            <div className="text-indigo-200 text-lg">Active Courses</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2">5,000+</div>
                            <div className="text-indigo-200 text-lg">Students</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2">50+</div>
                            <div className="text-indigo-200 text-lg">Organizations</div>
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-20 transition-colors">
                <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-600 dark:text-gray-400">
                    <p>© 2026 MyWay. Built with passion for learning.</p>
                </div>
            </footer>
        </div>
    )
}
