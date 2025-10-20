export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

type ResourceInsert = {
  title: string
  url: string
  language: 'Italian' | 'German'
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  cohort_id?: string | null
}

export async function GET() {
  const db = supabaseAdmin()
  const { data, error } = await db
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  let body: ResourceInsert
  try {
    body = (await req.json()) as ResourceInsert
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Basic validation
  if (!body?.title || !body?.url || !body?.language || !body?.level) {
    return NextResponse.json(
      { error: 'Missing required fields: title, url, language, level' },
      { status: 400 }
    )
  }

  // Optional: very light URL check
  try {
    new URL(body.url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  const db = supabaseAdmin()
  const { error } = await db
    .from('resources')
    .insert({
      title: body.title,
      url: body.url,
      language: body.language,
      level: body.level,
      cohort_id: body.cohort_id ?? null,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
