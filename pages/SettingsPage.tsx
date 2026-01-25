import React, { useState } from 'react'
import { OrgTopBar } from '../components/OrgTopBar'
import { OrgSidebar } from '../components/OrgSidebar'
import { User, Bell, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export function SettingsPage() {
    const [emailNotifs, setEmailNotifs] = useState(true)
    const { isDarkMode, toggleTheme } = useTheme()

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex font-sans text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <OrgSidebar />
            <div className="md:pl-64 flex-1 flex flex-col min-h-screen">
                <OrgTopBar />
                <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 transition-colors duration-200">
                        {/* Account Section */}
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <User size={20} className="text-gray-400 dark:text-gray-500" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Preferences</h2>
                            </div>
                            <div className="space-y-4 max-w-lg pl-7">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                                    <select className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500">
                                        <option>English (United States)</option>
                                        <option>Spanish</option>
                                        <option>French</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Bell size={20} className="text-gray-400 dark:text-gray-500" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
                            </div>
                            <div className="pl-7 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Receive weekly summaries and assignment alerts</p>
                                    </div>
                                    <button
                                        onClick={() => setEmailNotifs(!emailNotifs)}
                                        className={`w-11 h-6 rounded-full transition-colors relative ${emailNotifs ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                                    >
                                        <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${emailNotifs ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Appearance */}
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Moon size={20} className="text-gray-400 dark:text-gray-500" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
                            </div>
                            <div className="pl-7">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Reduce eye strain at night</p>
                                    </div>
                                    <button
                                        onClick={toggleTheme}
                                        className={`w-11 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                                    >
                                        <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
