import React, { createContext, useContext, useState, useEffect } from 'react'

export type NotificationType = 'info' | 'warning' | 'success' | 'error'

export interface Notification {
    id: string
    title: string
    message: string
    type: NotificationType
    time: string
    read: boolean
    createdAt: number // timestamp for sorting
}

interface NotificationContextType {
    notifications: Notification[]
    unreadCount: number
    markAsRead: (id: string) => void
    markAllAsRead: () => void
    deleteNotification: (id: string) => void
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider')
    }
    return context
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([])

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('myway_notifications')
        if (saved) {
            try {
                setNotifications(JSON.parse(saved))
            } catch (e) {
                console.error('Failed to parse notifications', e)
            }
        } else {
            // Initial mock data if empty
            const initialData: Notification[] = [
                {
                    id: '1',
                    title: 'New Course Available',
                    message: 'Physics 101: Gravity & Motion is now live.',
                    type: 'info',
                    time: '2 hours ago',
                    read: false,
                    createdAt: Date.now() - 7200000
                },
                {
                    id: '2',
                    title: 'Assignment Due Soon',
                    message: 'Free Fall Lab Report is due tomorrow at 11:59 PM.',
                    type: 'warning',
                    time: '5 hours ago',
                    read: false,
                    createdAt: Date.now() - 18000000
                },
                {
                    id: '3',
                    title: 'Submission Graded',
                    message: 'Your quiz "Introduction to Free Fall" has been graded.',
                    type: 'success',
                    time: '1 day ago',
                    read: false,
                    createdAt: Date.now() - 86400000
                },
            ]
            setNotifications(initialData)
            localStorage.setItem('myway_notifications', JSON.stringify(initialData))
        }
    }, [])

    // Save to localStorage whenever notifications change
    useEffect(() => {
        if (notifications.length > 0) {
            localStorage.setItem('myway_notifications', JSON.stringify(notifications))
        }
    }, [notifications])

    const unreadCount = notifications.filter(n => !n.read).length

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    }

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    const addNotification = (data: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
        const newNotification: Notification = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            read: false,
            createdAt: Date.now()
        }
        setNotifications(prev => [newNotification, ...prev])
    }

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            addNotification
        }}>
            {children}
        </NotificationContext.Provider>
    )
}
