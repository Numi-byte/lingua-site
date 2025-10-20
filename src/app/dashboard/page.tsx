import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseServerRSC } from '@/lib/supabaseServerRSC'
import PortalButton from '@/components/dashboard/PortalButton'
import UpdateNameForm from '@/components/dashboard/UpdateNameForm'
import { CalendarClock, FileText, GraduationCap, Layers, School, ShieldCheck, Sparkles } from 'lucide-react'

type CEFR = 'A1'|'A2'|'B1'|'B2'|'C1'|'C2'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const db = await supabaseServerRSC()
  const { data: { user } } = await db.auth.getUser()
  if (!user?.email) redirect('/auth')
  const email = user.email!

  // ---- Load core data (all optional-safe) ----
  const [{ data: assessments }, { data: purchases }, creditBalance, enrollments, resources] = await Promise.all([
    db.from('assessments').select('*').eq('email', email).order('created_at', { ascending: false }).limit(10),
    db.from('purchases').select('*').eq('email', email).order('created_at', { ascending: false }).limit(10),
    getCreditBalance(db, email),
    getEnrollments(db, email),
    getResources(db, email),
  ])

  const lastAssessment = assessments?.[0] ?? null
  const myCEFR = (lastAssessment?.cefr_estimate as CEFR | undefined) ?? undefined
  const myLang = (lastAssessment?.target_language as 'Italian' | 'German' | undefined) ?? undefined

  return (
    <div className="space-y-8">
      {/* Greeting / hero */}
      <section className="card p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs">
              <Sparkles size={14} /> Welcome back
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              {user.user_metadata?.full_name ? `Hi, ${user.user_metadata.full_name}!` : 'Your learning hub'}
            </h1>
            <p className="mt-1 text-neutral-700 text-sm">
              Track your assessment, cohorts, resources, and payments. Book your free class any time.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Link href="/book" className="btn btn-primary"><CalendarClock size={16} /> Book free class</Link>
            <Link href="/pricing" className="btn btn-ghost"><School size={16} /> Join a cohort</Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <KpiCard label="Level (estimate)" value={myCEFR ?? '—'} hint={myLang ? `in ${myLang}` : 'Take assessment'} href="/assessment" />
          <KpiCard label="Credits" value={creditBalance?.toString() ?? '0'} hint="1:1 credits (if any)" />
          <KpiCard label="Purchases" value={String(purchases?.length ?? 0)} hint="Recent Stripe payments" />
        </div>
      </section>

      {/* Enrollments + Upcoming */}
      <section className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">My Cohorts</h2>
            <Link href="/pricing" className="btn btn-ghost">Find a cohort</Link>
          </div>

          <div className="mt-3 space-y-3">
            {enrollments.length === 0 && (
              <Empty
                title="No cohorts yet"
                text="Join an A1–B2 group or the weekend pronunciation workshop."
                action={{ href: '/pricing', label: 'Browse cohorts' }}
              />
            )}

            {enrollments.map((e) => (
              <div key={e.enrollment_id} className="rounded-xl border border-black/10 bg-white/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm text-neutral-500">{e.language} • {e.level}</div>
                    <div className="font-semibold">{e.label}</div>
                    <div className="text-sm text-neutral-600">Starts {fmtDate(e.start_date)} • {e.schedule}</div>
                  </div>
                  <span className="badge">{e.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Curriculum preview (from last assessment) */}
        <aside className="card p-6 h-fit">
          <h3 className="text-lg font-semibold">Curriculum preview</h3>
          <p className="mt-1 text-sm text-neutral-600">
            Based on your latest assessment {myCEFR ? <>(<b>{myCEFR}</b>)</> : '(none yet)'}.
          </p>

          {myCEFR ? (
            <CurriculumPreview cefr={myCEFR} />
          ) : (
            <Empty
              title="No level yet"
              text="Take the assessment to unlock your recommended curriculum."
              action={{ href: '/assessment', label: 'Take assessment' }}
            />
          )}
        </aside>
      </section>

      {/* Results + Resources */}
      <section className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Assessment history</h2>
            <Link href="/assessment" className="btn btn-ghost">Retake</Link>
          </div>

          <div className="mt-3 space-y-2">
            {(assessments ?? []).map((a: any) => (
              <div key={a.id} className="rounded-xl border border-black/10 bg-white/70 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-neutral-600">{fmtDateTime(a.created_at)}</div>
                  <div className="text-sm">Lang: <b>{a.target_language}</b> • CEFR: <b>{a.cefr_estimate}</b> • Score: <b>{a.total_score}</b></div>
                </div>
              </div>
            ))}
            {!assessments?.length && (
              <Empty title="No assessments" text="Start with a quick CEFR test (7 minutes)." action={{ href: '/assessment', label: 'Take assessment' }} />
            )}
          </div>
        </div>

        {/* Materials */}
        <aside className="card p-6 h-fit">
          <h3 className="text-lg font-semibold">Study resources</h3>
          <p className="mt-1 text-sm text-neutral-600">Hand-picked links & files for your cohorts/level.</p>

          <div className="mt-3 space-y-2">
            {resources.length ? resources.map(r => (
              <a key={r.id} href={r.url} target="_blank" className="block rounded-xl border border-black/10 bg-white/70 p-3 hover:bg-neutral-50">
                <div className="flex items-center gap-2">
                  <FileText size={16} />
                  <div>
                    <div className="text-sm font-medium">{r.title}</div>
                    <div className="text-xs text-neutral-500">{r.language} • {r.level} {r.cohort_label ? `• ${r.cohort_label}` : ''}</div>
                  </div>
                </div>
              </a>
            )) : (
              <EmptySmall text="No resources yet — they’ll appear when you join a cohort." />
            )}
          </div>
        </aside>
      </section>

      {/* Billing & Settings */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Billing & payments</h2>
            <PortalButton />
          </div>
          <div className="mt-3 space-y-2">
            {(purchases ?? []).map((p: any) => (
              <div key={p.session_id} className="rounded-xl border border-black/10 bg-white/70 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-neutral-600">{fmtDateTime(p.created_at)}</div>
                  <div className="text-sm">
                    {p.currency?.toUpperCase()} {(p.amount_total/100).toFixed(2)} • {p.price_id}
                  </div>
                </div>
              </div>
            ))}
            {!purchases?.length && <EmptySmall text="No purchases yet." />}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold">Account</h2>
          <p className="text-sm text-neutral-600">Update your profile and privacy preferences.</p>

          <div className="mt-4 grid gap-3">
            <Row label="Email" value={email} />
            <UpdateNameForm defaultName={user.user_metadata?.full_name ?? ''} />
            <div className="rounded-xl border border-black/10 bg-white/70 p-3">
              <div className="text-xs text-neutral-500 mb-1">Privacy</div>
              <div className="text-sm">Your data is protected. You can request deletion anytime.</div>
              <div className="mt-2">
                <Link className="btn btn-ghost" href="/contact"><ShieldCheck size={16} /> Contact support</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ---------- helpers & small components ---------- */

function KpiCard({ label, value, hint, href }: { label: string; value: string; hint?: string; href?: string }) {
  const body = (
    <div className="rounded-xl border border-black/10 bg-white/70 p-3">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
      {hint && <div className="text-xs text-neutral-500">{hint}</div>}
    </div>
  )
  return href ? <Link href={href}>{body}</Link> : body
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white/70 p-3">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="text-sm">{value || '—'}</div>
    </div>
  )
}

function Empty({ title, text, action }: { title: string; text: string; action?: { href: string; label: string } }) {
  return (
    <div className="rounded-xl border border-dashed border-black/10 bg-white/60 p-6 text-center">
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-sm text-neutral-600">{text}</div>
      {action && <Link className="btn btn-ghost mt-3" href={action.href}>{action.label}</Link>}
    </div>
  )
}
function EmptySmall({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-black/10 bg-white/60 p-3 text-sm text-neutral-600 text-center">{text}</div>
}

function CurriculumPreview({ cefr }: { cefr: CEFR }) {
  const curriculum = CURR[cefr] || CURR.A1
  return (
    <div className="mt-3 space-y-3">
      {curriculum.weeks.map((w, i) => (
        <div key={i} className="rounded-xl border border-black/10 bg-white/70 p-3">
          <div className="text-sm font-semibold">{w.title}</div>
          <ul className="mt-1 list-disc pl-5 text-sm text-neutral-700 space-y-1">
            {w.bullets.map((b, j) => <li key={j}>{b}</li>)}
          </ul>
        </div>
      ))}
      <div className="rounded-xl border border-black/10 bg-white/70 p-3">
        <div className="text-xs text-neutral-500 mb-1">Outcomes</div>
        <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
          {curriculum.outcomes.map((o, i) => <li key={i}>{o}</li>)}
        </ul>
      </div>
    </div>
  )
}

const CURR: Record<CEFR, { weeks: { title: string; bullets: string[] }[]; outcomes: string[] }> = {
  A1: {
    weeks: [
      { title: 'Week 1 · Survival basics', bullets: ['Greetings & introductions', 'Present tense (to be / to have)', 'Pronunciation essentials'] },
      { title: 'Week 2 · Everyday life', bullets: ['Numbers, prices, time', 'Ordering food & drinks', 'Simple Q&A'] },
      { title: 'Week 3 · Routines', bullets: ['Daily routine verbs', 'Prepositions', 'Making simple plans'] },
      { title: 'Week 4 · Mini projects', bullets: ['Describe your day', 'Role plays: café / transport', 'Review & next steps'] },
    ],
    outcomes: ['Handle daily needs', 'Understand simple phrases', 'Write short messages'],
  },
  A2: {
    weeks: [
      { title: 'Week 1 · Past & routine', bullets: ['Past tense basics', 'Time expressions', 'Talking about last weekend'] },
      { title: 'Week 2 · Practical language', bullets: ['Shopping & services', 'Directions & transport', 'Requesting information'] },
      { title: 'Week 3 · Experiences', bullets: ['Describing people & places', 'Likes/dislikes with reasons', 'Linking words'] },
      { title: 'Week 4 · Storytelling', bullets: ['Short narratives in past', 'Email / message writing', 'Review'] },
    ],
    outcomes: ['Describe experiences', 'Understand short texts', 'Write connected sentences'],
  },
  B1: {
    weeks: [
      { title: 'Week 1 · Fluency tools', bullets: ['Opinions & preferences', 'Contrast/sequence linkers', 'Pronunciation drill'] },
      { title: 'Week 2 · Problem-solving', bullets: ['Complaints & issues', 'Clarification strategies', 'Listening: gist & detail'] },
      { title: 'Week 3 · Conversations', bullets: ['Agree/disagree politely', 'Speculation & suggestions', 'Accuracy boosters'] },
      { title: 'Week 4 · Mini debates', bullets: ['Short presentations', 'Moderated discussion', 'Action plan'] },
    ],
    outcomes: ['Hold conversations', 'Explain opinions simply', 'Handle travel situations'],
  },
  B2: {
    weeks: [
      { title: 'Week 1 · Advanced control', bullets: ['Nuanced opinions', 'Complex connectors', 'Pronunciation fine-tuning'] },
      { title: 'Week 2 · Abstract topics', bullets: ['Hypotheticals', 'Summarizing arguments', 'Reading for stance'] },
      { title: 'Week 3 · Accuracy focus', bullets: ['Typical advanced errors', 'Collocations & register', 'Fast speech strategies'] },
      { title: 'Week 4 · Output polish', bullets: ['Presentations & feedback', 'Extended writing scaffolds', 'C1 readiness'] },
    ],
    outcomes: ['Discuss abstract topics', 'Understand complex texts', 'Produce clear, detailed output'],
  },
  C1: {
    weeks: [
      { title: 'Week 1 · Range & register', bullets: ['Formal vs informal strategies', 'Idiomatic control', 'Intonation nuance'] },
      { title: 'Week 2 · Dense input', bullets: ['Advanced reading', 'Lecture listening', 'Note-taking'] },
      { title: 'Week 3 · Argumentation', bullets: ['Counterarguments', 'Hedging & framing', 'Discourse markers'] },
      { title: 'Week 4 · Mastery review', bullets: ['Mock tasks', 'Error profile & fixes', 'Next steps (C2)'] },
    ],
    outcomes: ['Advanced accuracy & range', 'Coherent long turns', 'Near-native strategies'],
  },
  C2: { weeks: [], outcomes: [] },
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString() } catch { return d }
}
function fmtDateTime(d: string | null) {
  if (!d) return '—'
  try { return new Date(d).toLocaleString() } catch { return d }
}

/* ---------- Data fetch helpers (safe on missing tables) ---------- */

async function getCreditBalance(db: any, email: string): Promise<number | null> {
  try {
    // If you created a view `credit_balances(email, credits)`
    const { data, error } = await db.from('credit_balances').select('credits').eq('email', email).limit(1).maybeSingle()
    if (error) return 0
    return data?.credits ?? 0
  } catch { return 0 }
}

async function getEnrollments(db: any, email: string): Promise<Array<{
  enrollment_id: string
  status: string
  start_date: string | null
  schedule: string | null
  label: string
  level: string
  language: string
}>> {
  try {
    const { data, error } = await db
      .from('enrollments_view') // try a view first if you made it
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
    if (!error && data) return data

    // fallback: join enrollments + cohorts manually if view not present
    const { data: enr } = await db.from('enrollments').select('*').eq('email', email).order('created_at', { ascending: false })
    if (!enr?.length) return []
    const cohortIds = [...new Set(enr.map((e: any) => e.cohort_id))]
    const { data: cohorts } = await db.from('cohorts').select('*').in('id', cohortIds)
    return enr.map((e: any) => {
      const c = cohorts?.find((x: any) => x.id === e.cohort_id)
      return {
        enrollment_id: e.id,
        status: e.status ?? 'confirmed',
        start_date: c?.start_date ?? null,
        schedule: c?.schedule ?? null,
        label: c?.label ?? 'Cohort',
        level: c?.level ?? 'A1',
        language: c?.language ?? 'Italian',
      }
    })
  } catch {
    return []
  }
}

async function getResources(db: any, email: string): Promise<Array<{
  id: string, title: string, url: string, language: string, level: string, cohort_label?: string
}>> {
  try {
    // resources linked to user's cohorts or level
    const { data: enr } = await db.from('enrollments').select('cohort_id').eq('email', email)
    const cohortIds = enr?.map((e: any) => e.cohort_id).filter(Boolean) || []
    const { data: r1 } = cohortIds.length
      ? await db.from('resources').select('id,title,url,language,level,cohort_id').in('cohort_id', cohortIds)
      : { data: [] }

    // Also level-based generic resources from latest assessment
    const { data: a } = await db.from('assessments').select('target_language,cefr_estimate').eq('email', email).order('created_at', { ascending: false }).limit(1)
    const { data: r2 } = a?.length
      ? await db.from('resources').select('id,title,url,language,level,cohort_id').eq('language', a[0].target_language).eq('level', a[0].cefr_estimate)
      : { data: [] }

    const ids = new Set<string>()
    const all = [...(r1||[]), ...(r2||[])]
      .filter(r => (ids.has(r.id) ? false : (ids.add(r.id), true)))

    if (!all.length) return []

    // attach cohort labels
    const cohortIds2 = [...new Set(all.map((r: any) => r.cohort_id).filter(Boolean))]
    if (!cohortIds2.length) return all

    const { data: cohorts } = await db.from('cohorts').select('id,label').in('id', cohortIds2)
    return all.map((r: any) => ({ ...r, cohort_label: cohorts?.find((c: any) => c.id === r.cohort_id)?.label }))
  } catch {
    return []
  }
}
