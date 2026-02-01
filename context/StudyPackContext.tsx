import { createContext, useContext, useState, ReactNode } from 'react'
import { Material, StudyPack, QuizAttempt, FlashcardSession } from '../types/studyPack'

interface StudyPackContextType {
    materials: Material[]
    studyPacks: StudyPack[]
    quizAttempts: QuizAttempt[]
    flashcardSessions: FlashcardSession[]
    addMaterial: (material: Material) => void
    addStudyPack: (studyPack: StudyPack) => void
    getStudyPackByMaterialId: (materialId: string) => StudyPack | undefined
    getMaterialsByModuleId: (moduleId: string) => Material[]
    getStudyPacksByModuleId: (moduleId: string) => StudyPack[]
}

const StudyPackContext = createContext<StudyPackContextType | undefined>(undefined)

export function StudyPackProvider({ children }: { children: ReactNode }) {
    const [materials, setMaterials] = useState<Material[]>(() => {
        const stored = localStorage.getItem('materials')
        return stored ? JSON.parse(stored) : []
    })

    const [studyPacks, setStudyPacks] = useState<StudyPack[]>(() => {
        const stored = localStorage.getItem('studyPacks')
        return stored ? JSON.parse(stored) : []
    })

    const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(() => {
        const stored = localStorage.getItem('quizAttempts')
        return stored ? JSON.parse(stored) : []
    })

    const [flashcardSessions, setFlashcardSessions] = useState<FlashcardSession[]>(() => {
        const stored = localStorage.getItem('flashcardSessions')
        return stored ? JSON.parse(stored) : []
    })

    const addMaterial = (material: Material) => {
        setMaterials(prev => {
            const updated = [...prev, material]
            localStorage.setItem('materials', JSON.stringify(updated))
            return updated
        })
    }

    const addStudyPack = (studyPack: StudyPack) => {
        setStudyPacks(prev => {
            const updated = [...prev, studyPack]
            localStorage.setItem('studyPacks', JSON.stringify(updated))
            return updated
        })
    }

    const getStudyPackByMaterialId = (materialId: string) => {
        return studyPacks.find(sp => sp.materialId === materialId)
    }

    const getMaterialsByModuleId = (moduleId: string) => {
        return materials.filter(m => m.moduleId === moduleId)
    }

    const getStudyPacksByModuleId = (moduleId: string) => {
        const moduleMaterials = getMaterialsByModuleId(moduleId)
        const materialIds = moduleMaterials.map(m => m.id)
        return studyPacks.filter(sp => materialIds.includes(sp.materialId))
    }

    return (
        <StudyPackContext.Provider
            value={{
                materials,
                studyPacks,
                quizAttempts,
                flashcardSessions,
                addMaterial,
                addStudyPack,
                getStudyPackByMaterialId,
                getMaterialsByModuleId,
                getStudyPacksByModuleId
            }}
        >
            {children}
        </StudyPackContext.Provider>
    )
}

export function useStudyPacks() {
    const context = useContext(StudyPackContext)
    if (!context) {
        throw new Error('useStudyPacks must be used within StudyPackProvider')
    }
    return context
}
