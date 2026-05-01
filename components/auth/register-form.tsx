'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Lock, Mail, User, Check, X, AlertCircle } from 'lucide-react'
import { getPasswordStrength } from '@/lib/password-strength'

export function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const errorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [error])

  const getErrorMessage = (response: Response, data: any): string => {
    if (response.status === 429) {
      return 'Terlalu banyak percobaan. Silakan coba lagi nanti.'
    }
    if (response.status === 400) {
      const msg = data.error?.toLowerCase() || ''
      if (msg.includes('email')) return 'Format email tidak valid'
      if (msg.includes('password')) return 'Password terlalu lemah'
      return data.error || 'Terjadi kesalahan, coba lagi'
    }
    return 'Terjadi kesalahan, coba lagi'
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok')
      return
    }

    if (formData.password.length < 6) {
      setError('Password harus minimal 6 karakter')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(getErrorMessage(response, data))
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      console.error('[v0] Registration error:', err)
      setError('Terjadi kesalahan. Silakan coba lagi.')
      setLoading(false)
    }
  }

  return (
    <Card className="w-full border-slate-200/60 shadow-soft-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl text-slate-900">Registrasi</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="displayName" className="text-xs sm:text-sm text-slate-700">Nama Tampilan</Label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                id="displayName"
                type="text"
                placeholder="Nama Anda"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="pl-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="email" className="text-xs sm:text-sm text-slate-700">Email</Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                id="email"
                type="email"
                placeholder="contoh@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="pl-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="password" className="text-xs sm:text-sm text-slate-700">Password</Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="pl-10 pr-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Kekuatan Password</span>
                  <span
                    className={`font-medium ${
                      passwordStrength.score <= 1
                        ? 'text-red-600'
                        : passwordStrength.score === 2
                        ? 'text-yellow-600'
                        : passwordStrength.score === 3
                        ? 'text-green-600'
                        : 'text-blue-600'
                    }`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
                <ul className="space-y-1 text-xs text-slate-600">
                  {passwordStrength.criteria.map((criterion, i) => (
                    <li key={i} className="flex items-center gap-2">
                      {criterion.met ? (
                        <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                      )}
                      <span className={criterion.met ? 'text-green-700' : 'text-slate-500'}>
                        {criterion.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="confirmPassword" className="text-xs sm:text-sm text-slate-700">Konfirmasi Password</Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Ulangi password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="pl-10 pr-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div ref={errorRef} className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm animate-scale-in">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-4 sm:mt-6 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}