import { Card } from '@/components/ui/card'
import { AlertTriangle, Mail, ArrowLeft } from 'lucide-react'

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <Card className="w-full max-w-md shadow-soft-xl border-slate-700/50 bg-slate-800/50 backdrop-blur">
        <div className="p-6 sm:p-8 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-amber-600/20 border border-amber-600/30">
              <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-amber-500" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              SVLink sedang dalam maintenance
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300">
              Kami sedang melakukan pemeliharaan sistem. Silakan coba kembali nanti.
            </p>
          </div>

          {/* Contact */}
          <div className="rounded-lg border border-slate-700/50 bg-slate-700/30 p-4">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>Hubungi admin:</span>
              <a
                href="mailto:support@svlink.com"
                className="text-amber-400 hover:text-amber-300 transition-colors"
              >
                support@svlink.com
              </a>
            </div>
          </div>

          {/* Back Link */}
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke beranda
          </a>
        </div>
      </Card>
    </div>
  )
}
