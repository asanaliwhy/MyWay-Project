import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { OrgTopBar } from '../components/OrgTopBar'
import { OrgSidebar } from '../components/OrgSidebar'
import { Bell, Info, AlertTriangle, CheckCircle } from 'lucide-react'

export function NotificationsPage() {
    const notifications = [
        { id: 1, title: 'New Course Available', message: 'Physics 101: Gravity & Motion is now live.', type: 'info', time: '2 hours ago' },
        { id: 2, title: 'Assignment Due Soon', message: 'Free Fall Lab Report is due tomorrow at 11:59 PM.', type: 'warning', time: '5 hours ago' },
        { id: 3, title: 'Submission Graded', message: 'Your quiz "Introduction to Free Fall" has been graded.', type: 'success', time: '1 day ago' },
    ]

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle size={20} className="text-amber-600" />
            case 'success': return <CheckCircle size={20} className="text-green-600" />
            default: return <Info size={20} className="text-blue-600" />
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
            <OrgSidebar />
            <div className="md:pl-64 flex-1 flex flex-col min-h-screen">
                <OrgTopBar />
                <main className="flex-1 p-6 md:p-8 max-w-3xl mx-auto w-full">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Mark all as read</button>
                    </div>

                    <div className="space-y-4">
                        {notifications.map((notif, index) => (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <div className={`p-2 rounded-full flex-shrink-0 ${notif.type === 'warning' ? 'bg-amber-50' : notif.type === 'success' ? 'bg-green-50' : 'bg-blue-50'
                                    }`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                                    <p className="text-gray-600 text-sm mt-0.5">{notif.message}</p>
                                    <p className="text-xs text-gray-400 mt-2">{notif.time}</p>
                                </div>
                                <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                            </motion.div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    )
}
