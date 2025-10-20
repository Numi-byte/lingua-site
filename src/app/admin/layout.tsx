import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { supabaseServerRSC } from '@/lib/supabaseServerRSC'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await supabaseServerRSC()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) redirect('/auth')

  const { data: rows } = await supabase.from('admins').select('email').eq('email', user.email).limit(1)
  if (!rows?.length) redirect('/auth')

  return <section className="space-y-6">{children}</section>
}
