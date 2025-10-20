import { Resend } from 'resend'

const resendKey = process.env.RESEND_API_KEY
if (!resendKey) console.warn('RESEND_API_KEY not set — emails will be skipped.')

const resend = resendKey ? new Resend(resendKey) : null

export async function sendAssessmentEmail(opts: {
  to: string
  cefr: string
  score: number
  lang: 'Italian' | 'German'
}) {
  if (!resend) return
  await resend.emails.send({
    from: 'Lingua By <support@linguaby.org>',
    to: opts.to,
    subject: `Your ${opts.lang} assessment result: ${opts.cefr}`,
    html: `
      <div style="font-family:Inter,system-ui,Segoe UI,Arial">
        <h2>Assessment Result</h2>
        <p>Language: <b>${opts.lang}</b></p>
        <p>Estimated level: <b>${opts.cefr}</b> (score ${opts.score}/10)</p>
        <p>Next step: book your free class to confirm your level and build your plan.</p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/book" style="background:#3c6cf7;color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none">Book free class</a></p>
      </div>
    `
  })
}

export async function sendPaymentEmail(opts: {
  to: string
  creditsGranted: number
  amount: number
  currency: string
  lang?: string
}) {
  if (!resend) return
  const amountStr = `${opts.currency.toUpperCase()} ${(opts.amount/100).toFixed(2)}`
  await resend.emails.send({
    from: 'Lingua By <support@linguaby.org>',
    to: opts.to,
    subject: `Payment received — ${opts.creditsGranted} credits added`,
    html: `
      <div style="font-family:Inter,system-ui,Segoe UI,Arial">
        <h2>Thanks for your purchase</h2>
        <p>We received <b>${amountStr}</b>${opts.lang ? ` for <b>${opts.lang}</b>` : ''}.</p>
        <p><b>${opts.creditsGranted}</b> lesson credits were added to your account.</p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/book?paid=1" style="background:#3c6cf7;color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none">Book a lesson</a></p>
        <p>Manage your account: <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard">Dashboard</a></p>
      </div>
    `
  })
}
