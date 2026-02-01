import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Plus, Search, Filter, Loader2, ArrowRight } from 'lucide-react'
import { OrgSidebar } from '../features/organization/components/OrgSidebar'
import { OrgTopBar } from '../features/organization/components/OrgTopBar'
import apiClient from '../lib/axios-client'

export function OrgCoursesPage() {
    const { orgId } = useParams()
    const navigate = useNavigate()
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    const fetchCourses = useCallback(async () => {
        try {
            // Mock course data for different organizations
            const mockCoursesByOrg: Record<string, any[]> = {
                'org-stanford': [
                    {
                        id: 'course-cs101',
                        title: 'Introduction to Computer Science',
                        code: 'CS101',
                        description: 'Learn the fundamentals of programming and computer science',
                        instructor: 'Prof. John Doe',
                        studentCount: 245,
                    },
                    {
                        id: 'course-math221',
                        title: 'Linear Algebra',
                        code: 'MATH221',
                        description: 'Master vectors, matrices, and linear transformations',
                        instructor: 'Prof. Jane Smith',
                        studentCount: 189,
                    },
                    {
                        id: 'course-phys121',
                        title: 'Mechanics',
                        code: 'PHYS121',
                        description: 'Classical mechanics and Newton\'s laws',
                        instructor: 'Prof. Robert Johnson',
                        studentCount: 156,
                    },
                ],
                'org-mit': [
                    {
                        id: 'course-6001',
                        title: 'Introduction to EECS',
                        code: '6.001',
                        description: 'Fundamentals of electrical engineering and computer science',
                        instructor: 'Prof. AI Researcher',
                        studentCount: 312,
                    },
                    {
                        id: 'course-8041',
                        title: 'Quantum Physics',
                        code: '8.04',
                        description: 'Introduction to quantum mechanics',
                        instructor: 'Prof. Quantum Expert',
                        studentCount: 142,
                    },
                ],
                'org-harvard': [
                    {
                        id: 'course-cs50',
                        title: 'Introduction to Computer Science',
                        code: 'CS50',
                        description: 'Harvard\'s introduction to computer science',
                        instructor: 'Prof. David Malan',
                        studentCount: 890,
                    },
                    {
                        id: 'course-stat110',
                        title: 'Probability',
                        code: 'STAT110',
                        description: 'Introduction to probability theory',
                        instructor: 'Prof. Joe Blitzstein',
                        studentCount: 378,
                    },
                ],
                'org-google': [
                    {
                        id: 'course-ml',
                        title: 'Machine Learning Crash Course',
                        code: 'ML101',
                        description: 'Learn machine learning with Google experts',
                        instructor: 'Google AI Team',
                        studentCount: 1250,
                    },
                    {
                        id: 'course-cloud',
                        title: 'Cloud Computing Fundamentals',
                        code: 'CLOUD101',
                        description: 'Master Google Cloud Platform basics',
                        instructor: 'Google Cloud Team',
                        studentCount: 892,
                    },
                ],
            };

            const orgCourses = mockCoursesByOrg[orgId || ''] || [];
            setCourses(orgCourses);
        } catch (err) {
            console.error('Failed to fetch courses:', err);
        } finally {
            setLoading(false);
        }
    }, [orgId]);

    useEffect(() => {
        if (orgId) fetchCourses()
    }, [orgId, fetchCourses])

    const handleCreateCourse = async () => {
        const title = prompt('Enter Course Title:')
        if (!title) return
        const code = prompt('Enter Course Code (e.g. CS101):')
        if (!code) return

        try {
            await apiClient.post('/courses', {
                orgId,
                title,
                code,
                description: 'New course created via MyWay platform.'
            })
            fetchCourses()
        } catch (err) {
            alert('Failed to create course')
        }
    }

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <OrgSidebar />

            <div className="md:pl-64 flex flex-col min-h-screen">
                <OrgTopBar />

                <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
                    {/* Header Actions */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Institution Courses</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Browse and manage learning programs</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative flex-1 md:w-64">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search courses..."
                                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-gray-600 dark:text-gray-400">
                                <Filter size={18} />
                            </button>
                            <button
                                onClick={handleCreateCourse}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 dark:shadow-none"
                            >
                                <Plus size={18} />
                                <span className="hidden sm:inline">New Course</span>
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-20 text-center">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                                <BookOpen size={40} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Courses Found</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8">Start by creating your first course in this organization.</p>
                            <button onClick={handleCreateCourse} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95">Create First Course</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCourses.map((course) => (
                                <motion.div
                                    key={course.id}
                                    whileHover={{ y: -4 }}
                                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all group"
                                >
                                    <div className="h-2 bg-indigo-600" />
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded text-xs font-bold uppercase tracking-wider">{course.code}</span>
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 overflow-hidden">
                                                        <img src={`https://i.pravatar.cc/100?img=${i + (parseInt(course.id.slice(0, 2), 16) % 50)}`} alt="Avatar" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{course.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-2">{course.description}</p>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Enrolled</span>
                                                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">12 Students</span>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/course/${course.id}`)}
                                                className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:gap-3 transition-all"
                                            >
                                                Open Course
                                                <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
