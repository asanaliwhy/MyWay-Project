import React from 'react'
import { motion } from 'framer-motion'
import { OrgTopBar } from '../components/OrgTopBar'
import { OrgSidebar } from '../components/OrgSidebar'
import { BarChart2, TrendingUp, Clock, Award } from 'lucide-react'

export function AnalyticsPage() {
    const stats = [
        { label: 'Total Learning Time', value: '32h 15m', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Completed Modules', value: '12', icon: Award, color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'Current Streak', value: '5 Days', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Average Score', value: '92%', icon: BarChart2, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    ]

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <OrgSidebar />
            <div className="md:pl-64 flex-1 flex flex-col min-h-screen">
                <OrgTopBar />
                <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Analytics Dashboard</h1>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-lg ${stat.bg} dark:bg-opacity-10`}>
                                        <stat.icon size={20} className={stat.color} />
                                    </div>
                                    <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                        +12%
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Activity Chart Placeholder */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8"
                    >
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Learning Activity</h2>
                        <div className="h-64 flex items-end gap-2 justify-between px-2">
                            {[65, 45, 75, 55, 80, 70, 90].map((height, i) => (
                                <div key={i} className="w-full bg-gray-50 dark:bg-gray-900/50 rounded-t-lg relative group">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="absolute bottom-0 w-full bg-indigo-500 dark:bg-indigo-600 rounded-t-lg group-hover:bg-indigo-600 dark:group-hover:bg-indigo-400 transition-colors"
                                    />
                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 dark:text-gray-500">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    )
}
