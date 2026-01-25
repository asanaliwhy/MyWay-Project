import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, GraduationCap, ArrowRight, User, BookOpen, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { UserRole } from '../types/auth'

export function SignUpPage() {
    const navigate = useNavigate()
    const { register, isLoading } = useAuth()
    const [showPassword, setShowPassword] = useState(false)

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Student' as UserRole
    })

    // Decoration stars
    const StarIcon = ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 0L61.2257 38.7743L100 50L61.2257 61.2257L50 100L38.7743 61.2257L0 50L38.7743 38.7743L50 0Z" stroke="currentColor" strokeWidth="2" />
        </svg>
    )

    const handleRoleSelect = (role: UserRole) => {
        setFormData({ ...formData, role })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match")
            return
        }

        try {
            await register({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                role: formData.role
            })
            navigate('/organizations')
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-hidden relative">
            {/* Background Decorations - Left */}
            <div className="hidden lg:block absolute left-10 top-1/3 opacity-20 text-indigo-400">
                <BookOpen size={120} strokeWidth={1} />
            </div>

            {/* Main Content */}
            <div className="w-full flex flex-col items-center justify-center p-4 z-10 my-8">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-900 text-white mb-3 shadow-lg">
                        <GraduationCap size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">MyWay</h1>
                    <p className="text-gray-500 text-sm">Learn smarter. Learn your way.</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
                >
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Create your account</h2>
                    <p className="text-gray-500 text-sm mb-6">Get started with MyWay today.</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'Student', icon: User, label: 'Student' },
                                    { id: 'Teacher', icon: BookOpen, label: 'Teacher' },
                                    { id: 'Organizer', icon: Users, label: 'Organizer' }
                                ].map((role) => (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => handleRoleSelect(role.id as UserRole)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${formData.role === role.id
                                                ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                                                : 'border-gray-200 hover:border-indigo-300 text-gray-600'
                                            }`}
                                    >
                                        <role.icon size={20} className="mb-1.5" />
                                        <span className="text-xs font-medium">{role.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Names */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
                            <input
                                type="text"
                                placeholder="John"
                                required
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all placeholder:text-gray-400"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                            <input
                                type="text"
                                placeholder="Doe"
                                required
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all placeholder:text-gray-400"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                            <input
                                type="email"
                                placeholder="name@school.edu"
                                required
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all placeholder:text-gray-400"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a password"
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all placeholder:text-gray-400"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Confirm your password"
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all placeholder:text-gray-400"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <input type="checkbox" required className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                            <p className="text-xs text-gray-600">
                                I agree to the <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#1E293B] hover:bg-[#0F172A] text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-70"
                        >
                            {isLoading ? 'Creating account...' : 'Create account'}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-2 bg-white text-gray-500">
                                    Or sign up with
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button type="button" className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 text-sm">
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
                                Google
                            </button>
                            <button type="button" className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 text-sm">
                                <img src="https://www.svgrepo.com/show/355117/microsoft.svg" className="w-4 h-4" alt="Microsoft" />
                                Microsoft
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/signin" className="font-semibold text-indigo-700 hover:text-indigo-800 inline-flex items-center gap-1">
                            Sign in <ArrowRight size={14} />
                        </Link>
                    </div>
                </motion.div>

                {/* Footer */}
                <div className="mt-8 flex items-center justify-center gap-4 text-xs text-gray-400">
                    <a href="#" className="hover:text-gray-600">Privacy Policy</a>
                    <span>•</span>
                    <a href="#" className="hover:text-gray-600">Terms of Service</a>
                    <span>•</span>
                    <span>© 2025 MyWay</span>
                </div>
            </div>

            {/* Background Decorations - Right */}
            <div className="hidden lg:block absolute right-[-5%] top-1/4 text-teal-300 opacity-80 pointer-events-none">
                <StarIcon className="w-64 h-64" />
            </div>
            <div className="hidden lg:block absolute right-[15%] top-1/2 text-teal-300 opacity-60 pointer-events-none">
                <StarIcon className="w-12 h-12" />
            </div>
            <div className="hidden lg:block absolute right-[5%] top-[15%] text-teal-300 opacity-60 pointer-events-none">
                <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </div>
        </div>
    )
}
