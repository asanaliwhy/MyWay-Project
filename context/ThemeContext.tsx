import React, { createContext, useContext, useEffect, useState, useLayoutEffect } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
    theme: Theme
    isDarkMode: boolean // The actual calculated state
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'myway-theme-preference'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme
            return saved || 'system'
        }
        return 'system'
    })

    const [isDarkMode, setIsDarkMode] = useState(false)

    // Calculate actual dark mode status
    useEffect(() => {
        const root = window.document.documentElement

        const applyTheme = (isDark: boolean) => {
            setIsDarkMode(isDark)
            if (isDark) {
                root.classList.add('dark')
            } else {
                root.classList.remove('dark')
            }
        }

        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
            applyTheme(mediaQuery.matches)

            const handler = (e: MediaQueryListEvent) => applyTheme(e.matches)
            mediaQuery.addEventListener('change', handler)
            return () => mediaQuery.removeEventListener('change', handler)
        } else {
            applyTheme(theme === 'dark')
        }
    }, [theme])

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme)
        localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    }

    const toggleTheme = () => {
        setTheme(isDarkMode ? 'light' : 'dark')
    }

    return (
        <ThemeContext.Provider value={{ theme, isDarkMode, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
