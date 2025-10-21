import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://linguaby.org'
  const now = new Date()

  const pages = [
    { url: '/',           changeFrequency: 'weekly', priority: 0.9 },
    { url: '/pricing',    changeFrequency: 'weekly', priority: 0.8 },
    { url: '/assessment', changeFrequency: 'weekly', priority: 0.8 },
    { url: '/book',       changeFrequency: 'weekly', priority: 0.7 },
    // private pages intentionally not listed
  ]

  return pages.map(p => ({
    url: `${base}${p.url}`,
    lastModified: now,
    changeFrequency: p.changeFrequency as MetadataRoute.Sitemap[number]['changeFrequency'],
    priority: p.priority,
  }))
}
