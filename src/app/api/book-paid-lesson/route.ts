// src/app/api/book-paid-lesson/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const { email, whenISO } = await req.json()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // check balance
  const { data: bal } = await supabase
    .from('credit_balances')
    .select('credits')
    .eq('email', email)
    .maybeSingle()

  if ((bal?.credits ?? 0) < 1) {
    return NextResponse.json({ error: 'Not enough credits' }, { status: 402 })
  }

  // TODO: create calendar event via your provider and get bookingId
  const bookingId = crypto.randomUUID()

  // deduct credit
  const { error } = await supabase.from('credit_ledger').insert({
    email,
    delta_credits: -1,
    source: `booking:${bookingId}`,
    notes: `Booked ${whenISO}`,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, bookingId })
}
