import { NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabaseService'
import { supabaseServerRSC } from '@/lib/supabaseServerRSC'

export async function POST(req: Request) {
  const body = await req.json().catch(()=>null)
  if (!body) return NextResponse.json({ error: 'Bad JSON' }, { status: 400 })
  const { email, note } = body as { email?: string; note?: string }
  if (!email || !note?.trim()) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // must be admin
  const rsc = await supabaseServerRSC()
  const { data: { user } } = await rsc.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: rows } = await rsc.from('admins').select('email').eq('email', user.email).limit(1)
  if (!rows?.length) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = supabaseService()
  const { error } = await db.from('student_notes').insert({ email, note })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
