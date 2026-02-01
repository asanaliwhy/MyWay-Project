import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '../types/auth'

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (userDetails: Omit<User, 'id' | 'avatar'> & { password: string }) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user data - always logged in
const mockUser: User = {
    id: 'mock-user-id',
    email: 'user@myway.com',
    firstName: 'Demo',
    lastName: 'User',
    role: 'STUDENT',
    avatar: 'https://ui-avatars.com/api/?name=Demo+User'
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(mockUser)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        // Auto-login with mock user
        setUser(mockUser)
        setIsLoading(false)
    }, [])

    // Stub functions - do nothing since auth is disabled
    const login = async (email: string, password: string) => {
        setUser(mockUser)
    }

    const register = async (userDetails: Omit<User, 'id' | 'avatar'> & { password: string }) => {
        setUser(mockUser)
    }

    const logout = () => {
        // Do nothing - stay logged in with mock user
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: true, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
