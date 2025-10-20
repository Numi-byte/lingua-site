import { NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabaseService'
import { supabaseServerRSC } from '@/lib/supabaseServerRSC'

export async function POST(req: Request) {
  const body = await req.json().catch(()=>null)
  if (!body) return NextResponse.json({ error: 'Bad JSON' }, { status: 400 })
  const { email, delta, notes } = body as { email?: string; delta?: number; notes?: string }
  if (!email || !Number.isFinite(delta)) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // Authz: must be admin
  const supaRSC = await supabaseServerRSC()
  const { data: { user } } = await supaRSC.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: rows } = await supaRSC.from('admins').select('email').eq('email', user.email).limit(1)
  if (!rows?.length) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = supabaseService()
  const { error } = await db.from('credit_ledger').insert({
    email, delta_credits: delta, source: `manual:${user.email}`, notes: notes ?? null
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
