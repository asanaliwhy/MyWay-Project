import { motion, AnimatePresence } from 'framer-motion'
import { OrgTopBar } from '../features/organization/components/OrgTopBar'
import { OrgSidebar } from '../features/organization/components/OrgSidebar'
import { Bell, Info, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react'
import { useNotifications } from '../features/notifications/context/NotificationContext'

export function NotificationsPage() {
    const { notifications, markAsRead, markAllAsRead, deleteNotification, unreadCount } = useNotifications()

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle size={20} className="text-amber-600" />
            case 'success': return <CheckCircle size={20} className="text-green-600" />
            case 'error': return <AlertTriangle size={20} className="text-red-600" />
            default: return <Info size={20} className="text-blue-600" />
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <OrgSidebar />
            <div className="md:pl-64 flex-1 flex flex-col min-h-screen">
                <OrgTopBar />
                <main className="flex-1 p-6 md:p-8 max-w-3xl mx-auto w-full">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                            {unreadCount > 0 && (
                                <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-bold">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium hover:underline"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence>
                            {notifications.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Bell size={24} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No notifications</h3>
                                    <p className="text-gray-500 dark:text-gray-400">You're all caught up!</p>
                                </motion.div>
                            ) : (
                                notifications.map((notif, index) => (
                                    <motion.div
                                        key={notif.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => markAsRead(notif.id)}
                                        className={`p-4 rounded-xl border shadow-sm flex gap-4 transition-all cursor-pointer group ${notif.read
                                            ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-75'
                                            : 'bg-white dark:bg-gray-800 border-indigo-200 dark:border-indigo-900 ring-1 ring-indigo-50 dark:ring-indigo-900/20'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-full flex-shrink-0 h-fit ${notif.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20' :
                                            notif.type === 'success' ? 'bg-green-50 dark:bg-green-900/20' :
                                                notif.type === 'error' ? 'bg-red-50 dark:bg-red-900/20' :
                                                    'bg-blue-50 dark:bg-blue-900/20'
                                            }`}>
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className={`font-semibold ${notif.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                                    {notif.title}
                                                </h3>
                                                {!notif.read && (
                                                    <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                                                )}
                                            </div>
                                            <p className={`text-sm mt-0.5 ${notif.read ? 'text-gray-500 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>
                                                {notif.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-xs text-gray-400 dark:text-gray-500">{notif.time}</p>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        deleteNotification(notif.id)
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                                                    title="Remove"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    )
}
