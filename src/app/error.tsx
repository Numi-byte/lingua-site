'use client'
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html>
      <body className="mx-auto max-w-2xl px-4 py-16">
        <div className="card p-6">
          <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-sm text-neutral-600 mb-3">{error.message}</p>
          <a href="/" className="btn btn-primary">Go home</a>
        </div>
      </body>
    </html>
  )
}
