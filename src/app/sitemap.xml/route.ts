const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const paths = ['/', '/assessment', '/book', '/pricing', '/dashboard']

export function GET() {
  const urls = paths.map(p => `<url><loc>${base}${p}</loc></url>`).join('')
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' }})
}
