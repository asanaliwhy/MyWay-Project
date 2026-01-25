import React from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { OrgSidebar } from '../components/OrgSidebar'
import { OrgTopBar } from '../components/OrgTopBar'
import { OrgCard } from '../components/OrgCard'
import { Organization } from '../types/organization'
// Mock Data
const organizations: Organization[] = [
  {
    id: '1',
    name: 'Acme Corp',
    role: 'Admin',
    memberCount: 24,
    activity: {
      points: [20, 45, 30, 60, 55, 80, 75],
      trend: 'up',
      label: 'High',
    },
    color: '#4f46e5', // indigo-600
  },
  {
    id: '2',
    name: 'TechStart Inc',
    role: 'Member',
    memberCount: 12,
    activity: {
      points: [40, 35, 45, 30, 40, 35, 40],
      trend: 'neutral',
      label: 'Medium',
    },
    color: '#0d9488', // teal-600
  },
  {
    id: '3',
    name: 'Design Studio',
    role: 'Admin',
    memberCount: 8,
    activity: {
      points: [10, 25, 40, 35, 60, 85, 90],
      trend: 'up',
      label: 'High',
    },
    color: '#db2777', // pink-600
  },
  {
    id: '4',
    name: 'Marketing Pro',
    role: 'Viewer',
    memberCount: 45,
    activity: {
      points: [80, 70, 60, 50, 40, 30, 20],
      trend: 'down',
      label: 'Low',
    },
    color: '#ea580c', // orange-600
  },
  {
    id: '5',
    name: 'Dev Team',
    role: 'Member',
    memberCount: 15,
    activity: {
      points: [30, 40, 35, 50, 45, 60, 55],
      trend: 'up',
      label: 'Medium',
    },
    color: '#2563eb', // blue-600
  },
  {
    id: '6',
    name: 'Creative Labs',
    role: 'Admin',
    memberCount: 6,
    activity: {
      points: [50, 60, 80, 70, 90, 85, 95],
      trend: 'up',
      label: 'High',
    },
    color: '#7c3aed', // violet-600
  },
]
const containerVariants = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}
const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 50,
      damping: 15,
    },
  },
}
export function OrgSelectorPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <OrgSidebar />

      <div className="md:pl-64 flex flex-col min-h-screen transition-all duration-300">
        <OrgTopBar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Organizations</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your team and projects</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {organizations.map((org) => (
              <motion.div key={org.id} variants={itemVariants}>
                <OrgCard org={org} />
              </motion.div>
            ))}

            {/* Add New Card Placeholder */}
            <motion.button
              variants={itemVariants}
              className="group flex flex-col items-center justify-center h-full min-h-[180px] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 flex items-center justify-center text-gray-400 dark:text-gray-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-3">
                <Plus size={24} />
              </div>
              <span className="font-medium text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                Create another organization
              </span>
            </motion.button>
          </motion.div>
        </main>
      </div>
    </div >
  )
}
