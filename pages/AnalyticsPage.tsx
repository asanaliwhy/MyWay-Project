import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { OrgTopBar } from '../features/organization/components/OrgTopBar'
import { OrgSidebar } from '../features/organization/components/OrgSidebar'
import { BarChart2, TrendingUp, Clock, Award, Loader2, BookOpen, Target } from 'lucide-react'

export function AnalyticsPage() {
    const [stats, setStats] = useState<any[]>([])
    const [courseProgress, setCourseProgress] = useState<any[]>([])
    const [activityBars, setActivityBars] = useState<number[]>([])
    const [weeklyGoal, setWeeklyGoal] = useState({ completed: 0, target: 0 })
    const [loading, setLoading] = useState(true)
    const maxActivity = Math.max(1, ...activityBars)
    const activityPoints = activityBars
        .map((value, index) => {
            const x = activityBars.length > 1 ? (index / (activityBars.length - 1)) * 100 : 0
            const y = 100 - (value / maxActivity) * 100
            return `${x},${y}`
        })
        .join(' ')

    useEffect(() => {
        const fetchAnalytics = () => {
            try {
                // Analytics dashboard seed data aligned with current course catalog and student progress
                const analyticsSeed = {
                    totalAttempts: 126,
                    avgScore: 84.2,
                    totalLearningTime: '64h 20m',
                    currentStreak: 12,
                    weeklyGoal: { completed: 9, target: 12 },
                    activity: [72, 56, 81, 69, 88, 77, 91],
                    courses: [
                        { code: 'CS101', course: 'Introduction to Computer Science', progress: 72, avgScore: 91, studyHours: 18.5, streak: 6, status: 'On Track' },
                        { code: 'MATH221', course: 'Linear Algebra', progress: 58, avgScore: 83, studyHours: 14.2, streak: 4, status: 'Steady' },
                        { code: 'STAT110', course: 'Probability', progress: 46, avgScore: 79, studyHours: 11.6, streak: 3, status: 'Needs Push' },
                        { code: 'CLOUD101', course: 'Cloud Computing Fundamentals', progress: 39, avgScore: 81, studyHours: 9.1, streak: 2, status: 'Building Momentum' },
                        { code: 'AI250', course: 'AI Tutor Prompting Lab', progress: 63, avgScore: 88, studyHours: 10.8, streak: 5, status: 'Strong' },
                    ]
                };

                setStats([
                    { label: 'Total Learning Time', value: analyticsSeed.totalLearningTime, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', trend: '+6.2%', trendUp: true },
                    { label: 'Quiz Attempts', value: analyticsSeed.totalAttempts.toString(), icon: Award, color: 'text-purple-600', bg: 'bg-purple-100', trend: '+11.4%', trendUp: true },
                    { label: 'Current Streak', value: `${analyticsSeed.currentStreak} days`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100', trend: '+2 days', trendUp: true },
                    { label: 'Average Score', value: `${Math.round(analyticsSeed.avgScore)}%`, icon: BarChart2, color: 'text-indigo-600', bg: 'bg-indigo-100', trend: '-1.3%', trendUp: false },
                ]);

                setCourseProgress(analyticsSeed.courses)
                setActivityBars(analyticsSeed.activity)
                setWeeklyGoal(analyticsSeed.weeklyGoal)
            } catch (err) {
                console.error('Failed to fetch analytics:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        )
    }

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
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.trendUp
                                        ? 'text-green-600 bg-green-50 dark:bg-green-900/30'
                                        : 'text-amber-700 bg-amber-50 dark:bg-amber-900/30'
                                        }`}>
                                        {stat.trend}
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
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <div className="xl:col-span-2">
                                <div className="mb-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span>Daily study intensity</span>
                                    <span className="font-semibold">Sessions / day</span>
                                </div>
                                <div className="h-64 flex items-end gap-2 justify-between px-2">
                                    {activityBars.map((height, i) => (
                                        <div key={i} className="w-full h-full bg-gray-50 dark:bg-gray-900/50 rounded-t-lg relative group overflow-visible">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${height}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className="absolute bottom-0 w-full bg-indigo-500 dark:bg-indigo-600 rounded-t-lg group-hover:bg-indigo-600 dark:group-hover:bg-indigo-400 transition-colors"
                                            />
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-indigo-600 dark:text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {height}%
                                            </div>
                                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 dark:text-gray-500">
                                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50/70 dark:bg-gray-900/30">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Activity Diagram</h3>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">7-day trend</span>
                                </div>
                                <svg viewBox="0 0 100 100" className="w-full h-40 overflow-visible">
                                    <defs>
                                        <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
                                        </linearGradient>
                                    </defs>

                                    <polyline
                                        fill="none"
                                        stroke="#c7d2fe"
                                        strokeWidth="1"
                                        points="0,100 100,100"
                                    />

                                    {activityPoints && (
                                        <>
                                            <polygon
                                                fill="url(#activityGradient)"
                                                points={`0,100 ${activityPoints} 100,100`}
                                            />
                                            <polyline
                                                fill="none"
                                                stroke="#4f46e5"
                                                strokeWidth="2.5"
                                                points={activityPoints}
                                            />
                                        </>
                                    )}

                                    {activityBars.map((value, index) => {
                                        const cx = activityBars.length > 1 ? (index / (activityBars.length - 1)) * 100 : 0
                                        const cy = 100 - (value / maxActivity) * 100
                                        return (
                                            <circle
                                                key={`dot-${index}`}
                                                cx={cx}
                                                cy={cy}
                                                r="1.9"
                                                fill="#ffffff"
                                                stroke="#4f46e5"
                                                strokeWidth="1.4"
                                            />
                                        )
                                    })}
                                </svg>

                                <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                    <div className="flex items-center justify-between"><span>Peak day</span><span className="font-semibold">Sunday</span></div>
                                    <div className="flex items-center justify-between"><span>Average activity</span><span className="font-semibold">{Math.round(activityBars.reduce((a, b) => a + b, 0) / Math.max(1, activityBars.length))}%</span></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="xl:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
                        >
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Course Progress Alignment</h2>
                            <div className="space-y-4">
                                {courseProgress.map((course, idx) => (
                                    <div key={course.code} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div>
                                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">{course.code}</p>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">{course.course}</h3>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${course.progress >= 65
                                                ? 'text-green-700 bg-green-50 dark:bg-green-900/30'
                                                : course.progress >= 45
                                                    ? 'text-blue-700 bg-blue-50 dark:bg-blue-900/30'
                                                    : 'text-amber-700 bg-amber-50 dark:bg-amber-900/30'
                                                }`}>
                                                {course.status}
                                            </span>
                                        </div>

                                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${course.progress}%` }}
                                                transition={{ duration: 0.8, delay: 0.1 * idx }}
                                                className="h-full bg-indigo-600 rounded-full"
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-3 text-sm">
                                            <div className="text-gray-500 dark:text-gray-400">Progress <span className="font-semibold text-gray-900 dark:text-white">{course.progress}%</span></div>
                                            <div className="text-gray-500 dark:text-gray-400">Avg Score <span className="font-semibold text-gray-900 dark:text-white">{course.avgScore}%</span></div>
                                            <div className="text-gray-500 dark:text-gray-400">Study Time <span className="font-semibold text-gray-900 dark:text-white">{course.studyHours}h</span></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
                        >
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Weekly Goals</h2>

                            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-900/20 p-4 border border-indigo-100 dark:border-indigo-900/40 mb-5">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-semibold">
                                        <Target size={16} />
                                        Target Completion
                                    </div>
                                    <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{weeklyGoal.completed}/{weeklyGoal.target}</span>
                                </div>
                                <div className="h-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, Math.round((weeklyGoal.completed / Math.max(1, weeklyGoal.target)) * 100))}%` }}
                                        transition={{ duration: 0.8 }}
                                        className="h-full bg-indigo-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                        <BookOpen size={16} className="text-blue-600" />
                                        Lessons Completed
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-white">18</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                        <Award size={16} className="text-purple-600" />
                                        Quizzes Passed
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-white">14</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                        <TrendingUp size={16} className="text-green-600" />
                                        Best Daily Streak
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-white">12 days</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </main>
            </div>
        </div>
    )
}
