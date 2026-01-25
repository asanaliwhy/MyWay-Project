import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, GraduationCap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function SignInPage() {
    const navigate = useNavigate()
    const { login, isLoading } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        try {
            await login(formData.email, formData.password)
            navigate('/organizations')
        } catch (err) {
            setError('Invalid email or password')
        }
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 font-sans">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-900 text-white mb-4 shadow-lg">
                        <GraduationCap size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">MyWay</h1>
                    <p className="text-gray-500 text-sm">Learn smarter. Learn your way.</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                        Sign in to your account
                    </h2>
                    <p className="text-gray-500 text-sm mb-6">
                        Welcome back! Please enter your details.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email address
                            </label>
                            <input
                                type="email"
                                placeholder="name@school.edu"
                                required
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all placeholder:text-gray-400"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all placeholder:text-gray-400"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
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

                        <div className="flex justify-end">
                            <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                                Forgot password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#1E293B] hover:bg-[#0F172A] text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-70"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 text-sm">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                            Google
                        </button>
                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 text-sm">
                            <img src="https://www.svgrepo.com/show/355117/microsoft.svg" className="w-5 h-5" alt="Microsoft" />
                            Microsoft
                        </button>
                    </div>

                    <p className="mt-8 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-700">
                            Sign up
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-8 flex items-center justify-center gap-4 text-xs text-gray-500">
                    <a href="#" className="hover:text-gray-900">Privacy Policy</a>
                    <span>•</span>
                    <a href="#" className="hover:text-gray-900">Terms of Service</a>
                    <span>•</span>
                    <span>© 2025 MyWay</span>
                </div>
            </motion.div>
        </div>
    )
}
