import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Loader2, AlertCircle } from 'lucide-react'
import { OrgSidebar } from '../features/organization/components/OrgSidebar'
import { OrgTopBar } from '../features/organization/components/OrgTopBar'
import { OrgCard } from '../features/organization/components/OrgCard'
import { Organization } from '../features/organization/types'
import apiClient from '../lib/axios-client'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 50, damping: 15 },
  },
}

export function OrgSelectorPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrgs = useCallback(async () => {
    try {
      // Mock data instead of API call
      const mockOrganizations: Organization[] = [
        {
          id: 'org-stanford',
          name: 'Stanford University',
          role: 'STUDENT',
          memberCount: 15420,
          activity: {
            points: [20, 45, 60, 55, 80, 75, 90],
            trend: 'up',
            label: 'Growing',
          },
          color: '#8C1515',
        },
        {
          id: 'org-mit',
          name: 'MIT',
          role: 'STUDENT',
          memberCount: 11520,
          activity: {
            points: [30, 50, 45, 70, 65, 85, 88],
            trend: 'up',
            label: 'Excellent',
          },
          color: '#A31F34',
        },
        {
          id: 'org-harvard',
          name: 'Harvard University',
          role: 'TEACHER',
          memberCount: 22000,
          activity: {
            points: [40, 55, 50, 75, 70, 82, 85],
            trend: 'neutral',
            label: 'Stable',
          },
          color: '#A41034',
        },
        {
          id: 'org-google',
          name: 'Google Learning',
          role: 'STUDENT',
          memberCount: 8500,
          activity: {
            points: [25, 40, 55, 60, 75, 80, 92],
            trend: 'up',
            label: 'Trending',
          },
          color: '#4285F4',
        },
      ];
      setOrganizations(mockOrganizations);
    } catch (err) {
      console.error('Failed to fetch orgs:', err);
      setError('Could not load organizations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrgs()
  }, [fetchOrgs])

  const handleCreateOrg = async () => {
    const name = prompt('Enter Organization Name:')
    if (!name) return
    try {
      await apiClient.post('/orgs', { name })
      fetchOrgs()
    } catch (err) {
      alert('Failed to create organization')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <OrgSidebar />

      <div className="md:pl-64 flex flex-col min-h-screen">
        <OrgTopBar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Organizations</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your team and projects</p>
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium text-lg">Finding your organizations...</p>
              </div>
            ) : error ? (
              <div className="col-span-full flex items-center justify-center py-12 px-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-800 dark:text-red-400 font-bold text-lg mb-2">Error Loading Data</p>
                  <p className="text-red-600 dark:text-red-500 max-w-sm mb-6">{error}</p>
                  <button onClick={() => fetchOrgs()} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Try Again</button>
                </div>
              </div>
            ) : (
              <>
                {organizations.map((org) => (
                  <motion.div key={org.id} variants={itemVariants}>
                    <OrgCard org={org} />
                  </motion.div>
                ))}

                <motion.button
                  onClick={handleCreateOrg}
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
              </>
            )}
          </motion.div>
        </main>
      </div>
    </div >
  )
}
