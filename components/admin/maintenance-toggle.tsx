'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export function MaintenanceToggle() {
  const [isMaintenance, setIsMaintenance] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function fetchStatus() {
    try {
      const res = await fetch('/api/admin/maintenance', { credentials: 'include' })
      const data = await res.json()
      if (res.ok) {
        setIsMaintenance(data.enabled)
      } else {
        setError(data.error || 'Gagal memuat status')
      }
    } catch {
      setError('Gagal terhubung ke server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  async function handleToggle() {
    setActionLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !isMaintenance }),
        credentials: 'include',
      })

      const data = await res.json()
      if (res.ok) {
        setIsMaintenance(!isMaintenance)
        setSuccess(
          !isMaintenance
            ? 'Mode maintenance diaktifkan'
            : 'Mode maintenance dinonaktifkan'
        )
      } else {
        setError(data.error || 'Terjadi kesalahan')
      }
    } catch {
      setError('Gagal terhubung ke server')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 backdrop-blur p-4 sm:p-6 shadow-soft-md">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 backdrop-blur p-4 sm:p-6 shadow-soft-md">
      <div className="mb-4 sm:mb-6 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg ${
            isMaintenance ? 'bg-red-600' : 'bg-green-600'
          }`}
        >
          <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Mode Maintenance</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {isMaintenance
              ? 'Platform sedang dalam maintenance'
              : 'Platform berjalan normal'}
          </p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-md px-3 py-2 border text-sm font-medium ${
            isMaintenance
              ? 'bg-red-900/30 border-red-700/50 text-red-400'
              : 'bg-green-900/30 border-green-700/50 text-green-400'
          }`}
        >
          <div
            className={`h-2 w-2 rounded-full ${
              isMaintenance ? 'bg-red-500' : 'bg-green-500'
            }`}
          />
          {isMaintenance ? 'Maintenance' : 'Online'}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-700/50 bg-red-900/20 p-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md border border-green-700/50 bg-green-900/20 p-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-400">{success}</p>
        </div>
      )}

      <div className="rounded-md border border-slate-700/50 bg-slate-700/30 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white">
              {isMaintenance ? 'Nonaktifkan Maintenance Mode' : 'Aktifkan Maintenance Mode'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isMaintenance
                ? 'Platform akan kembali normal dan user dapat mengakses'
                : 'Semua user akan dialihkan ke halaman maintenance'}
            </p>
          </div>
          <Button
            onClick={handleToggle}
            disabled={actionLoading}
            className={
              isMaintenance
                ? 'bg-green-600 hover:bg-green-700 whitespace-nowrap'
                : 'bg-red-600 hover:bg-red-700 whitespace-nowrap'
            }
          >
            {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isMaintenance ? 'Nonaktifkan' : 'Aktifkan'}
          </Button>
        </div>
      </div>
    </div>
  )
}
