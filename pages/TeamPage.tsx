import React from 'react'
import { motion } from 'framer-motion'
import { OrgTopBar } from '../features/organization/components/OrgTopBar'
import { OrgSidebar } from '../features/organization/components/OrgSidebar'
import { UserPlus, MoreHorizontal, Mail } from 'lucide-react'

export function TeamPage() {
    const members = [
        { id: 1, name: 'Alex Johnson', role: 'Admin', email: 'alex@example.com', status: 'Active' },
        { id: 2, name: 'Sarah Chen', role: 'Educator', email: 'sarah@example.com', status: 'Active' },
        { id: 3, name: 'Mike Smith', role: 'Student', email: 'mike@example.com', status: 'Offline' },
        { id: 4, name: 'Emily Davis', role: 'Student', email: 'emily@example.com', status: 'Active' },
    ]

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <OrgSidebar />
            <div className="md:pl-64 flex-1 flex flex-col min-h-screen">
                <OrgTopBar />
                <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Members</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your organization's members</p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                            <UserPlus size={18} />
                            <span>Invite Member</span>
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Member</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {members.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-gray-200 dark:border-gray-700">
                                                    {member.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{member.role}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                {member.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-gray-600 p-1">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    )
}
