import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CheckCircle,
    ArrowRight,
    BookOpen,
    BarChart,
    Users,
    Clock,
    Award,
    MessageCircle,
    Menu,
    X,
    GraduationCap
} from 'lucide-react'

export function HomePage() {
    const navigate = useNavigate()
    const [isMenuOpen, setIsMenuOpen] = React.useState(false)

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
        setIsMenuOpen(false)
    }

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* Navigation */}
            <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="bg-[#1e3a8a] p-2 rounded-lg">
                                <GraduationCap className="text-white w-6 h-6" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">MyWay</span>
                        </div>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-8">
                            <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-[#1e3a8a] font-medium">Solutions</button>
                            <button onClick={() => navigate('/organizations')} className="text-gray-600 hover:text-[#1e3a8a] font-medium">Institutions</button>
                            <button onClick={() => scrollToSection('pricing')} className="text-gray-600 hover:text-[#1e3a8a] font-medium">Pricing</button>
                            <button onClick={() => scrollToSection('about')} className="text-gray-600 hover:text-[#1e3a8a] font-medium">About</button>
                        </div>

                        {/* Auth Buttons */}
                        <div className="hidden md:flex items-center gap-4">
                            <button
                                onClick={() => navigate('/signin')}
                                className="px-6 py-2.5 bg-[#1e3a8a] text-white rounded-lg font-medium hover:bg-[#172554] transition-colors"
                            >
                                Sign Up
                            </button>
                            <button
                                onClick={() => navigate('/signin')}
                                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            >
                                Sign In
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                {isMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-gray-100 py-4 px-4 bg-white shadow-lg absolute w-full">
                        <div className="flex flex-col gap-4">
                            <button onClick={() => scrollToSection('features')} className="text-left text-gray-600 font-medium">Solutions</button>
                            <button onClick={() => navigate('/organizations')} className="text-left text-gray-600 font-medium">Institutions</button>
                            <button onClick={() => scrollToSection('pricing')} className="text-left text-gray-600 font-medium">Pricing</button>
                            <button onClick={() => scrollToSection('about')} className="text-left text-gray-600 font-medium">About</button>
                            <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
                                <button onClick={() => navigate('/signin')} className="w-full py-3 bg-[#1e3a8a] text-white rounded-lg font-medium">
                                    Sign Up
                                </button>
                                <button onClick={() => navigate('/signin')} className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium">
                                    Sign In
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-8">
                                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                Trusted by 100+ Institutions
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
                                MyWay: new way<br />of <span className="text-[#1e3a8a]">Learning</span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                                Our comprehensive learning management system provides the tools, analytics, and content needed to deliver world-class education at scale.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-10">
                                <button
                                    onClick={() => navigate('/organizations')}
                                    className="px-8 py-4 bg-[#1e3a8a] text-white rounded-lg font-semibold text-lg hover:bg-[#172554] transition-all flex items-center justify-center gap-2"
                                >
                                    Request Demo
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => scrollToSection('features')}
                                    className="px-8 py-4 bg-white text-[#1e3a8a] border-2 border-gray-200 rounded-lg font-semibold text-lg hover:border-[#1e3a8a] transition-all"
                                >
                                    View Curriculum
                                </button>
                            </div>

                            <div className="flex gap-8 text-sm text-gray-600 font-medium">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-[#1e3a8a] w-5 h-5" />
                                    ISO 27001 Certified
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-[#1e3a8a] w-5 h-5" />
                                    99.9% Uptime
                                </div>
                            </div>
                        </div>

                        {/* Dashboard Mockup */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-100 rounded-3xl transform rotate-3 scale-95 opacity-50 blur-3xl"></div>
                            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 relative overflow-hidden">
                                <div className="bg-gray-50 rounded-xl border border-gray-200 aspect-[4/3] relative flex flex-col">
                                    {/* Mock Header */}
                                    <div className="h-12 border-b border-gray-200 bg-white flex items-center px-4 gap-2">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                        </div>
                                        <div className="ml-4 flex-1 bg-gray-100 h-6 rounded px-3 text-xs flex items-center text-gray-400">
                                            portal.edu-tech.com/dashboard
                                        </div>
                                    </div>
                                    {/* Mock Content */}
                                    <div className="flex-1 p-6 flex gap-6">
                                        <div className="w-1/4 space-y-3">
                                            <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-8 bg-blue-50 rounded w-full"></div>
                                            <div className="h-2 bg-gray-100 rounded w-full"></div>
                                            <div className="h-2 bg-gray-100 rounded w-5/6"></div>
                                        </div>
                                        <div className="flex-1 space-y-6">
                                            <div className="flex gap-4">
                                                <div className="flex-1 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                    <div className="w-8 h-8 bg-blue-100 rounded mb-2"></div>
                                                    <div className="h-4 bg-blue-900 rounded w-2/3"></div>
                                                </div>
                                                <div className="flex-1 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                    <div className="w-8 h-8 bg-green-100 rounded mb-2"></div>
                                                    <div className="h-4 bg-green-900 rounded w-2/3"></div>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                                <div className="h-2 bg-gray-100 rounded w-full"></div>
                                                <div className="h-2 bg-gray-100 rounded w-full"></div>
                                                <div className="h-2 bg-gray-100 rounded w-5/6"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section id="about" className="bg-[#1e3a8a] py-20 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
                        <div>
                            <div className="text-4xl lg:text-5xl font-bold mb-2">125,000+</div>
                            <div className="text-blue-200">Students Enrolled</div>
                        </div>
                        <div>
                            <div className="text-4xl lg:text-5xl font-bold mb-2">500+</div>
                            <div className="text-blue-200">Partner Institutions</div>
                        </div>
                        <div>
                            <div className="text-4xl lg:text-5xl font-bold mb-2">3,200+</div>
                            <div className="text-blue-200">Courses Available</div>
                        </div>
                        <div>
                            <div className="text-4xl lg:text-5xl font-bold mb-2">98%</div>
                            <div className="text-blue-200">Satisfaction Rate</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="text-blue-600 font-semibold uppercase tracking-wider text-sm">Key Features</span>
                        <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-6">Everything you need to succeed</h2>
                        <p className="text-xl text-gray-600">
                            Our platform is built on three pillars: accessibility, quality, and community. Experience education reimagined for the modern world.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                        {/* Feature 1 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                                <BookOpen className="text-blue-600 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Interactive Learning</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Engage with dynamic content including video lectures, quizzes, and hands-on projects designed to reinforce learning.
                            </p>
                        </div>
                        {/* Feature 2 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                                <BarChart className="text-blue-600 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Progress Tracking</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Monitor student performance with detailed analytics and customizable reports to identify areas for improvement.
                            </p>
                        </div>
                        {/* Feature 3 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                                <Users className="text-blue-600 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Instructors</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Learn from industry leaders and academic experts who bring real-world experience into the virtual classroom.
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 4 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                                <Clock className="text-blue-600 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Flexible Schedule</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Access course materials 24/7, allowing students and professionals to learn at their own pace and convenience.
                            </p>
                        </div>
                        {/* Feature 5 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                                <Award className="text-blue-600 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Accredited Certification</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Earn recognized certificates upon course completion to validate skills and enhance professional credentials.
                            </p>
                        </div>
                        {/* Feature 6 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                                <MessageCircle className="text-blue-600 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Community Support</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Join a vibrant community of learners and mentors for peer-to-peer support, networking, and collaboration.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-blue-600 font-semibold uppercase tracking-wider text-sm">Pricing Plans</span>
                        <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-6">Choose the perfect plan</h2>
                        <p className="text-xl text-gray-600">
                            Flexible pricing options for institutions of all sizes.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Plan 1 */}
                        <div className="p-8 border border-gray-200 rounded-2xl hover:border-blue-600 transition-colors bg-white">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
                            <p className="text-gray-500 mb-6">Perfect for small teams</p>
                            <div className="text-4xl font-bold text-gray-900 mb-6">$0<span className="text-lg text-gray-500 font-normal">/mo</span></div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-gray-600"><CheckCircle size={18} className="text-green-500" /> Up to 50 students</li>
                                <li className="flex items-center gap-3 text-gray-600"><CheckCircle size={18} className="text-green-500" /> Basic Analytics</li>
                                <li className="flex items-center gap-3 text-gray-600"><CheckCircle size={18} className="text-green-500" /> Community Support</li>
                            </ul>
                            <button onClick={() => navigate('/signin')} className="w-full py-3 bg-gray-50 text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-colors">Start for Free</button>
                        </div>
                        {/* Plan 2 */}
                        <div className="p-8 border-2 border-blue-600 rounded-2xl bg-blue-50/50 relative">
                            <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-bold">Popular</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Growth</h3>
                            <p className="text-gray-500 mb-6">For growing institutions</p>
                            <div className="text-4xl font-bold text-gray-900 mb-6">$49<span className="text-lg text-gray-500 font-normal">/mo</span></div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-gray-600"><CheckCircle size={18} className="text-green-500" /> Up to 500 students</li>
                                <li className="flex items-center gap-3 text-gray-600"><CheckCircle size={18} className="text-green-500" /> Advanced Analytics</li>
                                <li className="flex items-center gap-3 text-gray-600"><CheckCircle size={18} className="text-green-500" /> Email Support</li>
                            </ul>
                            <button onClick={() => navigate('/signin')} className="w-full py-3 bg-[#1e3a8a] text-white font-bold rounded-lg hover:bg-[#172554] transition-colors">Get Started</button>
                        </div>
                        {/* Plan 3 */}
                        <div className="p-8 border border-gray-200 rounded-2xl hover:border-blue-600 transition-colors bg-white">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
                            <p className="text-gray-500 mb-6">For large universities</p>
                            <div className="text-4xl font-bold text-gray-900 mb-6">Custom</div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-gray-600"><CheckCircle size={18} className="text-green-500" /> Unlimited students</li>
                                <li className="flex items-center gap-3 text-gray-600"><CheckCircle size={18} className="text-green-500" /> Custom Integrations</li>
                                <li className="flex items-center gap-3 text-gray-600"><CheckCircle size={18} className="text-green-500" /> 24/7 Priority Support</li>
                            </ul>
                            <button onClick={() => navigate('/signin')} className="w-full py-3 bg-gray-50 text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-colors">Contact Sales</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Trusted by Educators and Learners</h2>
                    <p className="text-center text-gray-600 text-xl max-w-2xl mx-auto mb-16">
                        Join thousands of institutions that trust us with their educational journey.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Testimonial 1 */}
                        <div className="p-8 border border-gray-200 bg-white rounded-2xl hover:shadow-lg transition-shadow">
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                "The structured approach to learning has completely transformed how our faculty delivers content. Student engagement has increased by 40% since implementation."
                            </p>
                            <div className="flex items-center gap-4">
                                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" alt="Dr. Sarah Mitchell" className="w-12 h-12 rounded-full object-cover" />
                                <div>
                                    <div className="font-bold text-gray-900">Dr. Sarah Mitchell</div>
                                    <div className="text-sm text-gray-500">Dean of Engineering, Tech University</div>
                                </div>
                            </div>
                        </div>
                        {/* Testimonial 2 */}
                        <div className="p-8 border border-gray-200 bg-white rounded-2xl hover:shadow-lg transition-shadow">
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                "As a professional looking to upskill, I found the platform incredibly intuitive. The quality of instruction matches what I'd expect from a top-tier university."
                            </p>
                            <div className="flex items-center gap-4">
                                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80" alt="James Wilson" className="w-12 h-12 rounded-full object-cover" />
                                <div>
                                    <div className="font-bold text-gray-900">James Wilson</div>
                                    <div className="text-sm text-gray-500">Senior Developer, Global Systems Inc.</div>
                                </div>
                            </div>
                        </div>
                        {/* Testimonial 3 */}
                        <div className="p-8 border border-gray-200 bg-white rounded-2xl hover:shadow-lg transition-shadow">
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                "The analytics dashboard gives us insights we never had before. We can now proactively support students who might be falling behind."
                            </p>
                            <div className="flex items-center gap-4">
                                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" alt="Elena Rodriguez" className="w-12 h-12 rounded-full object-cover" />
                                <div>
                                    <div className="font-bold text-gray-900">Elena Rodriguez</div>
                                    <div className="text-sm text-gray-500">Academic Director, Future Academy</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-[#1e3a8a] py-24">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">Ready to transform your institution?</h2>
                    <p className="text-blue-100 text-xl max-w-2xl mx-auto mb-10">
                        Get started today with a free consultation. Our team will help you tailor a solution that fits your specific needs and goals.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-8 py-4 bg-white text-[#1e3a8a] rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
                        >
                            Get Started
                        </button>
                        <button
                            className="px-8 py-4 bg-[#2e4ea8] text-white border border-blue-400 rounded-lg font-bold text-lg hover:bg-[#345cc2] transition-colors"
                        >
                            Contact Sales
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white pt-20 pb-10 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                        <div>
                            <h4 className="font-bold text-gray-900 mb-6">Product</h4>
                            <ul className="space-y-4 text-gray-600">
                                <li><button onClick={() => scrollToSection('features')} className="hover:text-[#1e3a8a] text-left">Features</button></li>
                                <li><a href="#" className="hover:text-[#1e3a8a]">Integrations</a></li>
                                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-[#1e3a8a] text-left">Pricing</button></li>
                                <li><a href="#" className="hover:text-[#1e3a8a]">Security</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-6">Company</h4>
                            <ul className="space-y-4 text-gray-600">
                                <li><button onClick={() => scrollToSection('about')} className="hover:text-[#1e3a8a] text-left">About Us</button></li>
                                <li><a href="#" className="hover:text-[#1e3a8a]">Careers</a></li>
                                <li><a href="#" className="hover:text-[#1e3a8a]">Blog</a></li>
                                <li><a href="#" className="hover:text-[#1e3a8a]">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-6">Resources</h4>
                            <ul className="space-y-4 text-gray-600">
                                <li><a href="#" className="hover:text-[#1e3a8a]">Documentation</a></li>
                                <li><a href="#" className="hover:text-[#1e3a8a]">Help Center</a></li>
                                <li><a href="#" className="hover:text-[#1e3a8a]">Guides</a></li>
                                <li><a href="#" className="hover:text-[#1e3a8a]">API Status</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-6">Legal</h4>
                            <ul className="space-y-4 text-gray-600">
                                <li><a href="#" className="hover:text-[#1e3a8a]">Privacy</a></li>
                                <li><a href="#" className="hover:text-[#1e3a8a]">Terms</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-100 pt-8 text-center text-gray-500 text-sm">
                        © 2024 MyWay. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    )
}
