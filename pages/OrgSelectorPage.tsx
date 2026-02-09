import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Loader2, AlertCircle, Trash2, CheckCircle2, X } from 'lucide-react'
import { OrgSidebar } from '../features/organization/components/OrgSidebar'
import { OrgTopBar } from '../features/organization/components/OrgTopBar'
import { OrgCard } from '../features/organization/components/OrgCard'
import { Organization } from '../features/organization/types'
import apiClient from '../lib/axios-client'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/context/AuthContext'

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

type ToastState = {
  title: string
  message?: string
  tone: 'success' | 'error'
}

export function OrgSelectorPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const accountRole = (user?.role || '').toUpperCase()
  const canCreateOrganization = (user?.role || '').toUpperCase() === 'ORGANIZER'
  const [deleteTarget, setDeleteTarget] = useState<Organization | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createBusy, setCreateBusy] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  const normalizeOrganizationName = (rawName: string) => {
    const name = (rawName || '').trim()
    const key = name.toLowerCase()

    if (accountRole === 'STUDENT' || accountRole === 'TEACHER') {
      if (key === 'sads' || key === 'myqway') return 'Google Learning'
      if (key === 'nb' || key === 'drhf') return 'Stanford University'
    }

    return name
  }

  const buildRolePreviewOrganizations = (): Organization[] => {
    const role = (localStorage.getItem('preview_role') || 'STUDENT').toUpperCase()

    const base: Organization[] = [
      {
        id: 'dbb3b2a0-42c2-40f4-b209-1736e655977a',
        name: 'Stanford University',
        role: role === 'TEACHER' ? 'TEACHER' : role === 'ORGANIZER' ? 'ORGANIZER' : 'STUDENT',
        memberCount: 15420,
        activity: { points: [20, 45, 60, 55, 80, 75, 90], trend: 'up', label: 'Growing' },
        color: '#8C1515',
        isPreview: true,
      },
      {
        id: 'e155d5d3-75f5-43a7-e532-40691988200d',
        name: 'Google Learning',
        role: role === 'TEACHER' ? 'TEACHER' : role === 'ORGANIZER' ? 'ORGANIZER' : 'STUDENT',
        memberCount: 8500,
        activity: { points: [25, 40, 55, 60, 75, 80, 92], trend: 'up', label: 'Trending' },
        color: '#4285F4',
        isPreview: true,
      },
    ]

    if (role === 'TEACHER') {
      base.push({
        id: 'c144c4c2-64e4-42f6-d421-39580877199c',
        name: 'Harvard Faculty Hub',
        role: 'TEACHER',
        memberCount: 2200,
        activity: { points: [40, 55, 50, 75, 70, 82, 85], trend: 'neutral', label: 'Stable' },
        color: '#A41034',
        isPreview: true,
      })
    }

    return base
  }

  const fetchOrgs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // 1) Try real backend organizations first
      try {
        const res = await apiClient.get('/organizations')
        const realOrgs = (res.data || []).map((org: any) => ({
          id: String(org.id),
          name: normalizeOrganizationName(String(org.name)),
          role: (org.role || 'STUDENT') as Organization['role'],
          canDelete: canCreateOrganization && ((org.role || '').toUpperCase() === 'ORGANIZER'),
          plan: org.plan,
          memberCount: 0,
          color: '#4F46E5',
          activity: {
            points: [40, 48, 52, 49, 61, 66, 72],
            trend: 'up' as const,
            label: 'Live',
          },
        }))

        // If no real organizations, provide role-based preview orgs so student/teacher can still enter catalogs.
        if (realOrgs.length === 0) {
          setOrganizations(buildRolePreviewOrganizations())
          return
        }

        setOrganizations(realOrgs)
        return
      } catch (backendErr) {
        console.warn('Backend organizations fetch failed, falling back to preview data', backendErr)
      }

      // 2) Fallback preview organizations
      setOrganizations(buildRolePreviewOrganizations())

      // In a real scenario with mixed mode, we might want to also fetch real ones 
      // and append them, but for now we keep the requested preview set.
    } catch (err) {
      console.error('Failed to fetch orgs:', err);
      setError('Could not load organizations.');
    } finally {
      setLoading(false);
    }
  }, [accountRole, canCreateOrganization]);

  useEffect(() => {
    fetchOrgs()
  }, [fetchOrgs])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const pushToast = (next: ToastState) => setToast(next)

  const handleCreateOrg = () => {
    if (!canCreateOrganization) {
      pushToast({
        tone: 'error',
        title: 'Access denied',
        message: 'Only organizer role can create organizations.',
      })
      return
    }

    setCreateName('')
    setCreateOpen(true)
  }

  const confirmCreateOrganization = async () => {
    const name = createName.trim()
    if (!name) {
      pushToast({
        tone: 'error',
        title: 'Name required',
        message: 'Please enter an organization name.',
      })
      return
    }

    setCreateBusy(true)
    try {
      await apiClient.post('/organizations', { name })
      setCreateOpen(false)
      setCreateName('')
      await fetchOrgs()
      pushToast({
        tone: 'success',
        title: 'Organization created',
        message: `"${name}" is ready to use.`,
      })
    } catch (err) {
      pushToast({ tone: 'error', title: 'Create failed', message: 'Failed to create organization.' })
    } finally {
      setCreateBusy(false)
    }
  }

  const handleSelectOrganization = async (org: Organization) => {
    if (org.isPreview) {
      localStorage.setItem('active_org_id', org.id)
      localStorage.setItem('preview_role', org.role)
      navigate(`/organizations/${org.id}`)
      return
    }

    try {
      await apiClient.post(`/organizations/${org.id}/switch`)
      localStorage.setItem('active_org_id', org.id)
      navigate(`/organizations/${org.id}`)
    } catch (err: any) {
      // If user is not yet a member, try joining then switch again.
      if (err?.response?.status === 403) {
        try {
          await apiClient.post(`/organizations/${org.id}/join`)
          await apiClient.post(`/organizations/${org.id}/switch`)
          localStorage.setItem('active_org_id', org.id)
          navigate(`/organizations/${org.id}`)
          return
        } catch (joinErr) {
          console.error('Join organization failed:', joinErr)
        }
      }

      pushToast({ tone: 'error', title: 'Switch failed', message: 'Failed to switch organization.' })
    }
  }

  const handleDeleteOrganization = (org: Organization) => {
    if (!canCreateOrganization) {
      pushToast({
        tone: 'error',
        title: 'Access denied',
        message: 'Only organizer role can delete organizations.',
      })
      return
    }

    setDeleteTarget(org)
  }

  const confirmDeleteOrganization = async () => {
    if (!deleteTarget) return

    setDeleteBusy(true)

    try {
      try {
        await apiClient.delete(`/organizations/${deleteTarget.id}`)
      } catch (err: any) {
        // Fallback for environments where DELETE route is not exposed yet.
        if (err?.response?.status === 404) {
          await apiClient.post(`/organizations/${deleteTarget.id}/delete`)
        } else {
          throw err
        }
      }

      const activeOrgId = localStorage.getItem('active_org_id')
      if (activeOrgId === deleteTarget.id) {
        localStorage.removeItem('active_org_id')
      }
      fetchOrgs()
      pushToast({
        tone: 'success',
        title: 'Organization deleted',
        message: `"${deleteTarget.name}" was removed successfully.`,
      })
    } catch (err: any) {
      console.error('Delete organization failed:', err)
      const message = err?.response?.data?.error || 'Failed to delete organization.'
      pushToast({ tone: 'error', title: 'Delete failed', message })
    } finally {
      setDeleteBusy(false)
      setDeleteTarget(null)
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
                    <OrgCard
                      org={org}
                      onSelect={handleSelectOrganization}
                      onDelete={canCreateOrganization ? handleDeleteOrganization : undefined}
                    />
                  </motion.div>
                ))}

                {canCreateOrganization && (
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
                )}
              </>
            )}
          </motion.div>
        </main>
      </div>

      {createOpen && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="w-full max-w-md rounded-2xl border border-indigo-200/60 dark:border-indigo-900/40 bg-white dark:bg-gray-900 shadow-2xl"
          >
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create organization</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start a new workspace for your members and courses.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!createBusy) {
                    setCreateOpen(false)
                    setCreateName('')
                  }
                }}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                disabled={createBusy}
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault()
                void confirmCreateOrganization()
              }}
              className="p-5"
            >
              <label htmlFor="create-org-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organization name
              </label>
              <input
                id="create-org-name"
                type="text"
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
                placeholder="e.g. Google Learning"
                maxLength={80}
                autoFocus
                disabled={createBusy}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
              />

              <div className="flex justify-end gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => {
                    setCreateOpen(false)
                    setCreateName('')
                  }}
                  disabled={createBusy}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createBusy}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {createBusy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="w-full max-w-md rounded-2xl border border-red-200/60 dark:border-red-900/40 bg-white dark:bg-gray-900 shadow-2xl"
          >
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 flex items-center justify-center">
                  <Trash2 size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete organization?</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This action removes courses, members, and related data.</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                disabled={deleteBusy}
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5">
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 mb-5">
                {deleteTarget.name}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleteBusy}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteOrganization}
                  disabled={deleteBusy}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {deleteBusy ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-5 right-5 z-[80] w-[min(92vw,360px)]"
        >
          <div className={`rounded-xl border shadow-lg px-4 py-3 ${toast.tone === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
            <div className="flex items-start gap-3">
              <div className={toast.tone === 'success' ? 'text-emerald-600 dark:text-emerald-300 mt-0.5' : 'text-red-600 dark:text-red-300 mt-0.5'}>
                {toast.tone === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              </div>
              <div className="min-w-0">
                <p className={toast.tone === 'success' ? 'text-emerald-900 dark:text-emerald-100 font-semibold' : 'text-red-900 dark:text-red-100 font-semibold'}>{toast.title}</p>
                {toast.message && (
                  <p className={toast.tone === 'success' ? 'text-emerald-800/90 dark:text-emerald-200/90 text-sm mt-0.5' : 'text-red-800/90 dark:text-red-200/90 text-sm mt-0.5'}>{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => setToast(null)}
                className="ml-auto p-1 rounded text-gray-500 hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div >
  )
}
