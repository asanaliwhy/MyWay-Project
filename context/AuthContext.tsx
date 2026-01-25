import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, UserRole } from '../types/auth'
import apiClient from '../api/client'

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (userDetails: Omit<User, 'id' | 'avatar'> & { password: string }) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check local storage for existing session
        const storedUser = localStorage.getItem('myway_user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
        setIsLoading(false)
    }, [])

    const login = async (email: string, password: string) => {
        try {
            const response = await apiClient.post('/auth/login', { email, password });
            const { access_token, user } = response.data;

            // Normalize user data to match frontend types
            const cleanUser: User = {
                id: user.id,
                email: user.email,
                firstName: user.name.split(' ')[0],
                lastName: user.name.split(' ').slice(1).join(' ') || '',
                role: user.memberships?.[0]?.role || 'Student', // Default to first role
                avatar: `https://ui-avatars.com/api/?name=${user.name}`
            };

            setUser(cleanUser);
            localStorage.setItem('myway_user', JSON.stringify(cleanUser));
            localStorage.setItem('access_token', access_token);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    const register = async (userDetails: Omit<User, 'id' | 'avatar'> & { password: string }) => {
        try {
            const response = await apiClient.post('/auth/register', {
                email: userDetails.email,
                name: `${userDetails.firstName} ${userDetails.lastName}`,
                pass: userDetails.password
            });

            // Auto login after register
            await login(userDetails.email, userDetails.password);
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('myway_user')
        localStorage.removeItem('access_token')
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
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
