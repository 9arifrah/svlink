export interface PasswordStrength {
  score: number // 0-4
  label: string
  color: string
  criteria: PasswordStrengthCriteria[]
}

export interface PasswordStrengthCriteria {
  label: string
  met: boolean
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: '',
      color: 'bg-slate-200',
      criteria: []
    }
  }

  const criteria: PasswordStrengthCriteria[] = [
    { label: 'Minimal 8 karakter', met: password.length >= 8 },
    { label: 'Huruf kapital (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'Huruf kecil (a-z)', met: /[a-z]/.test(password) },
    { label: 'Angka (0-9)', met: /[0-9]/.test(password) },
    { label: 'Karakter spesial (!@#$%^&*)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
  ]

  const score = criteria.filter(c => c.met).length

  // Map 0-5 score to 4 levels: Lemah, Sedang, Kuat, Sangat Kuat
  let label: string
  let color: string

  if (score <= 1) {
    label = 'Lemah'
    color = 'bg-red-500'
  } else if (score === 2) {
    label = 'Sedang'
    color = 'bg-yellow-500'
  } else if (score === 3) {
    label = 'Kuat'
    color = 'bg-green-500'
  } else {
    label = 'Sangat Kuat'
    color = 'bg-blue-500'
  }

  return { score, label, color, criteria }
}
