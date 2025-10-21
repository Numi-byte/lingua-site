import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://linguaby.org'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/auth',
          '/dashboard',
          '/admin',
          '/api',   // do not crawl API
          '/_next', // Next internals
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: 'https://linguaby.org',
  }
}
