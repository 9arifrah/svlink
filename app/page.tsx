import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ExternalLink,
  Lock,
  Palette,
  Users,
  Shield,
  Zap,
  Globe,
  Star,
  Check,
  ArrowRight,
  Facebook,
  Twitter,
  Linkedin,
  Github,
  Mail,
  Send,
  Link2
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-brand-50/50 to-accent-50/30">
        {/* Animated gradient mesh overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-500/20 via-brand-600/20 to-accent-500/20 animate-pulse" style={{ animationDuration: '8s' }} />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating orbs - brand colors only */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-brand-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-accent-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:py-32">
          <div className="text-center">
            {/* Logo with floating animation */}
            <div className="mx-auto mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 shadow-xl shadow-brand-500/30 transition-transform duration-300 hover:scale-105 hover:rotate-3 animate-fade-in">
              <ExternalLink className="h-10 w-10 text-white" />
            </div>

            <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl bg-gradient-to-r from-slate-900 via-brand-700 to-accent-600 bg-clip-text text-transparent animate-fade-in" style={{ animationDelay: '0.1s' }}>
              svlink
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-xl text-slate-600 sm:text-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Platform link management profesional yang memungkinkan Anda mengatur,
              berbagi, dan menampilkan link penting dengan cara yang elegan dan personal.
            </p>

            <div className="mb-12 flex flex-col sm:flex-row justify-center gap-4 animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <Link href="/register">
                <Button
                  size="lg"
                  className="py-4 px-8 text-lg bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto"
                >
                  Mulai Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="py-4 px-6 text-lg border-2 border-brand-600 text-brand-700 hover:bg-brand-50 hover:text-brand-700 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto"
                >
                  Lihat Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="bg-white py-12">
        <div className="mx-auto max-w-4xl px-4">
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center gap-2 text-slate-600">
              <Check className="w-5 h-5 text-green-500" />
              <span>Gratis Selamanya</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Shield className="w-5 h-5 text-blue-500" />
              <span>Data Aman</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span>Setup 1 Menit</span>
            </div>
          </div>

          {/* User Count */}
          <p className="text-center text-slate-500 mb-8">
            Dipercaya oleh <span className="font-bold text-slate-900">1,000+</span> pengguna
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-slate-900">
              Mengapa svlink?
            </h2>
            <p className="text-xl text-slate-600">
              Fitur lengkap untuk memenuhi kebutuhan link management profesional Anda
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group border-2 border-slate-100 transition-all duration-300 hover:border-brand-300 hover:shadow-xl hover:-translate-y-1 animate-stagger-fade" style={{ animationDelay: '0s' }}>
              <CardHeader>
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-brand-500/30">
                  <Lock className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Kontrol Privasi</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-slate-600">
                  Atur visibilitas link sebagai publik atau privat. Link publik dapat diakses melalui halaman personal kustom Anda dengan URL unik.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group border-2 border-slate-100 transition-all duration-300 hover:border-accent-300 hover:shadow-xl hover:-translate-y-1 animate-stagger-fade" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 shadow-lg shadow-accent-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-accent-500/30">
                  <Palette className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Personalisasi</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-slate-600">
                  Kustomisasi halaman publik dengan tema warna, logo, judul halaman, dan deskripsi profil sesuai gaya brand Anda.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group border-2 border-slate-100 transition-all duration-300 hover:border-brand-300 hover:shadow-xl hover:-translate-y-1 animate-stagger-fade" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 shadow-lg shadow-brand-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-brand-500/30">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Multi-User</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-slate-600">
                  Dukungan multi-user dengan kategori personal. Setiap user memiliki space terpisah untuk mengelola linknya.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group border-2 border-slate-100 transition-all duration-300 hover:border-accent-300 hover:shadow-xl hover:-translate-y-1 animate-stagger-fade" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent-400 to-brand-500 shadow-lg shadow-accent-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-accent-500/30">
                  <Globe className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">URL Kustom</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-slate-600">
                  Dapatkan halaman publik dengan URL kustom yang mudah diingat. Bagikan link Anda dengan professional.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group border-2 border-slate-100 transition-all duration-300 hover:border-brand-300 hover:shadow-xl hover:-translate-y-1 animate-stagger-fade" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-rose-500/30">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Cepat & Efisien</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-slate-600">
                  Interface yang cepat dan responsif. Tambah, edit, atau hapus link dalam detik dengan pengalaman user yang smooth.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group border-2 border-slate-100 transition-all duration-300 hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <CardHeader>
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-indigo-500/30">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Aman & Terpercaya</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-slate-600">
                  Data Anda dilindungi dengan enkripsi modern. Authentication secure dan backup regular untuk ketenangan pikiran.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Preview/Demo Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Seperti Ini Halaman Publik Anda
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Bagikan semua link penting Anda dalam satu halaman elegan yang bisa dikustomisasi
            </p>
          </div>
          
          {/* Mockup Browser Frame */}
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
            {/* Browser Chrome */}
            <div className="bg-slate-100 px-4 py-3 flex items-center gap-2 border-b">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-slate-500 bg-white px-3 py-1 rounded-md">svlink.com/yourname</span>
              </div>
            </div>
            
            {/* Mock Public Page Content */}
            <div className="p-8 bg-gradient-to-br from-brand-50 to-white">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-brand-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl font-bold text-brand-600">Y</span>
                </div>
                <h3 className="font-bold text-slate-900">Your Name</h3>
                <p className="text-sm text-slate-500">Developer & Creator</p>
              </div>
              <div className="space-y-3">
                {['Portfolio Website', 'GitHub Profile', 'Blog', 'LinkedIn'].map((name, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow cursor-pointer">
                    <span className="text-sm font-medium text-slate-700">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-slate-900">
              Cara Kerja
            </h2>
            <p className="text-xl text-slate-600">
              Tiga langkah simple untuk mulai mengelola link Anda
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-3xl font-bold text-white shadow-xl shadow-blue-500/20">
                  1
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-slate-900">
                  Buat Akun
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Daftar gratis dalam hitungan detik. Tidak perlu kartu kredit atau komitmen.
                </p>
              </div>
              <div className="hidden md:block md:absolute md:right-0 md:top-24 md:-translate-y-1/2 md:translate-x-1/2">
                <ArrowRight className="h-8 w-8 text-slate-300" />
              </div>
            </div>

            <div className="relative">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-3xl font-bold text-white shadow-xl shadow-blue-500/20">
                  2
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-slate-900">
                  Kelola Link
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Tambah link, atur kategori, dan tentukan visibilitas. Interface yang intuitive dan powerful.
                </p>
              </div>
              <div className="hidden md:block md:absolute md:right-0 md:top-24 md:-translate-y-1/2 md:translate-x-1/2">
                <ArrowRight className="h-8 w-8 text-slate-300" />
              </div>
            </div>

            <div className="relative">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-3xl font-bold text-white shadow-xl shadow-blue-500/20">
                  3
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-slate-900">
                  Bagikan
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Share halaman publik Anda dengan URL kustom. Professional dan mudah diakses oleh semua.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-24 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-grid-white/[0.2] [background-size:32px_32px]" />
        </div>

        {/* Floating orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '1.5s' }} />

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-6 text-4xl font-bold text-white animate-fade-in">
            Siap Mengelola Link Anda dengan Profesional?
          </h2>
          <p className="mb-10 text-xl text-blue-100 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Bergabunglah dengan ribuan user yang sudah mempercayakan svlink untuk link management mereka.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Link href="/register">
              <Button
                size="lg"
                variant="secondary"
                className="h-14 px-8 text-lg bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 hover:border-white/50 hover:-translate-y-0.5 transition-all duration-300 text-white"
              >
                Daftar Sekarang - Gratis!
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg border-2 border-white/50 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-blue-600 hover:-translate-y-0.5 transition-all duration-300"
              >
                Sudah Punya Akun? Masuk
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                  <Link2 className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-white">svlink</span>
              </div>
              <p className="text-sm">Platform manajemen tautan profesional</p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-white mb-3">Produk</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/#features" className="hover:text-white transition-colors">Fitur</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Daftar Gratis</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Masuk</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="hover:text-white transition-colors">Syarat & Ketentuan</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Kebijakan Privasi</Link></li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold text-white mb-3">Ikuti Kami</h4>
              <div className="flex gap-3">
                <a href="https://github.com/9arifrah/svlink" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-slate-800 pt-6 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} svlink. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}