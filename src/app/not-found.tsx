export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="card p-6">
        <h1 className="text-xl font-semibold mb-2">Page not found</h1>
        <p className="text-sm text-neutral-600 mb-3">
          The page you’re looking for doesn’t exist.
        </p>
        <a href="/" className="btn btn-primary">Go home</a>
      </div>
    </div>
  )
}
