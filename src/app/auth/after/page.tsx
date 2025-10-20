import { redirect } from 'next/navigation'
import { supabaseServerRSC } from '@/lib/supabaseServerRSC'

export const dynamic = 'force-dynamic'

export default async function AfterLogin() {
  const supabase = await supabaseServerRSC()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) redirect('/auth')

  const { data: rows } = await supabase.from('admins').select('email').eq('email', user.email).limit(1)
  if (rows?.length) redirect('/admin')
  redirect('/dashboard')
}
