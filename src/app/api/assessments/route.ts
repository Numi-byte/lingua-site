import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export const runtime = 'nodejs'

const resendKey = process.env.RESEND_API_KEY
const resend = resendKey ? new Resend(resendKey) : null

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, targetLanguage, total, cefr, answers } = body
    if (!email || !targetLanguage || total == null || !cefr) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { error } = await supabase.from('assessments').insert({
      email,
      target_language: targetLanguage,
      total_score: total,
      cefr_estimate: cefr,
      answers
    })
    if (error) {
      console.error(error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    // Email (non-blocking)
    if (resend) {
      resend.emails.send({
        from: 'Lingua <onboarding@resend.dev>',
        to: email,
        subject: `Your ${targetLanguage} assessment result: ${cefr}`,
        html: `
          <div style="font-family:Inter,system-ui,Segoe UI,Arial">
            <h2>Assessment Result</h2>
            <p>Language: <b>${targetLanguage}</b></p>
            <p>Estimated level: <b>${cefr}</b> (score ${total}/70)</p>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/book" style="background:#3c6cf7;color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none">Book free class</a></p>
          </div>`
      }).catch(console.error)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
