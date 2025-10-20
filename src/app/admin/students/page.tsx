import { supabaseService } from '@/lib/supabaseService'

export const dynamic = 'force-dynamic'

export default async function AdminStudents() {
  const db = supabaseService()
  const { data: students, error } = await db
    .from('profiles')
    .select('email, full_name, phone, target_language, timezone, created_at')
    .order('created_at', { ascending: false })

  if (error) return <div className="card p-6">DB error: {error.message}</div>

  return (
    <div className="card p-6">
      <h1 className="text-xl font-semibold mb-3">Students</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-600">
              <th className="py-2">Email</th>
              <th>Name</th>
              <th>Target</th>
              <th>Phone</th>
              <th>Timezone</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {students?.map((s, i) => (
              <tr key={i} className="border-t border-black/5">
                <td className="py-2">{s.email}</td>
                <td>{s.full_name}</td>
                <td>{s.target_language}</td>
                <td>{s.phone}</td>
                <td>{s.timezone}</td>
                <td>{new Date(s.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {!students?.length && <tr><td className="py-3" colSpan={6}>No profiles yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
