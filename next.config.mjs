/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Temporarily enable to see all errors
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  // Exclude native modules that can't run on Vercel serverless
  serverExternalPackages: ['better-sqlite3'],
  allowedDevOrigins: [
    'local-origin.dev',
    '*.local-origin.dev',
    '10.0.45.125',
    '10.0.*.*',
  ],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=0'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
// "upgrade-insecure-requests", // Disabled: no SSL configured yet
            ].join('; ')
          }
        ]
      }
    ]
  }
}

export default nextConfig
