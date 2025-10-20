'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { z } from 'zod'
import {
  itGrammarVocab, itReading, itWriting
} from '@/data/assessment/it'
import {
  deGrammarVocab, deReading, deWriting
} from '@/data/assessment/de'
import {
  MCQ, ReadingPassage, WritingPrompt,
  scoreMCQ, scoreWriting, mapToCEFR, CEFR
} from '@/data/assessment/common'
import {
  AlarmClock, ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Clock, Edit3, FileText, Info, Sparkles, Trophy, Undo2
} from 'lucide-react'

type Lang = 'Italian' | 'German'
type Step = 'intro' | 'gv' | 'reading' | 'writing' | 'review' | 'result'

// ---------- LocalStorage keys ----------
const keyFor = (email: string, lang: Lang) => `assess.v2.${email || 'anon'}:${lang}`

// ---------- Intro validation ----------
const introSchema = z.object({
  email: z.string().email(),
  lang: z.enum(['Italian', 'German'])
})

// ---------- Simple in-page alert ----------
function useBanner() {
  const [msg, setMsg] = useState<string | null>(null)
  return {
    Banner: () => msg ? (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{msg}</div>
    ) : null,
    show: (s: string) => setMsg(s),
    clear: () => setMsg(null)
  }
}

export default function AssessmentPage() {
  const [email, setEmail] = useState('')
  const [lang, setLang] = useState<Lang>('Italian')
  const [step, setStep] = useState<Step>('intro')

  // Build banks once per lang
  const banks = useMemo(() => {
    if (lang === 'Italian') {
      return { gv: sample(itGrammarVocab, 12), reading: itReading, writing: itWriting }
    }
    return { gv: sample(deGrammarVocab, 12), reading: deReading, writing: deWriting }
  }, [lang])

  // Answers + timers
  const [gvAnswers, setGvAnswers] = useState<Record<string, number | null>>({})
  const [readingAnswers, setReadingAnswers] = useState<Record<string, number | null>>({})
  const [writingText, setWritingText] = useState('')
  const [timer, setTimer] = useState<{ gv: number; reading: number; writing: number }>({ gv: 0, reading: 0, writing: 0 })
  const [activeTimer, setActiveTimer] = useState<keyof typeof timer | null>(null)
  const tRef = useRef<number | null>(null)

  // UI helpers
  const { Banner, show, clear } = useBanner()
  const totalGv = banks.gv.length
  const totalRd = banks.reading.reduce((s, p) => s + p.questions.length, 0)

  // ---- Autoset empty answers on bank change ----
  useEffect(() => {
    setGvAnswers(Object.fromEntries(banks.gv.map(q => [q.id, null])))
    const rIds = banks.reading.flatMap(p => p.questions.map(q => q.id))
    setReadingAnswers(Object.fromEntries(rIds.map(id => [id, null])))
    setWritingText('')
    setTimer({ gv: 0, reading: 0, writing: 0 })
    setActiveTimer(null)
    setStep('intro')
  }, [banks])

  // ---- Timers (soft, per-section) ----
  useEffect(() => {
    if (!activeTimer) return
    tRef.current && window.clearInterval(tRef.current)
    tRef.current = window.setInterval(() => {
      setTimer(prev => ({ ...prev, [activeTimer]: prev[activeTimer] + 1 }))
    }, 1000) as unknown as number
    return () => { if (tRef.current) window.clearInterval(tRef.current) }
  }, [activeTimer])

  // ---- Autosave & resume ----
  useEffect(() => {
    const saved = localStorage.getItem(keyFor(email, lang))
    if (saved) {
      try {
        const j = JSON.parse(saved)
        if (j && j.meta?.lang === lang) {
          setStep(j.step ?? 'intro')
          setGvAnswers(j.gvAnswers ?? {})
          setReadingAnswers(j.readingAnswers ?? {})
          setWritingText(j.writingText ?? '')
          setTimer(j.timer ?? { gv: 0, reading: 0, writing: 0 })
        }
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  useEffect(() => {
    const payload = { step, email, gvAnswers, readingAnswers, writingText, timer, meta: { lang } }
    localStorage.setItem(keyFor(email, lang), JSON.stringify(payload))
  }, [step, email, lang, gvAnswers, readingAnswers, writingText, timer])

  // ---- Navigation guards ----
  const start = () => {
    clear()
    const parsed = introSchema.safeParse({ email, lang })
    if (!parsed.success) return show('Please enter a valid email before starting.')
    setStep('gv'); setActiveTimer('gv')
  }
  const proceedReading = () => {
    clear()
    const answered = Object.values(gvAnswers).filter(x => typeof x === 'number').length
    if (answered < Math.ceil(totalGv * 0.7)) return show('Answer most Grammar/Vocab questions to continue.')
    setStep('reading'); setActiveTimer('reading')
  }
  const proceedWriting = () => {
    clear()
    const answered = Object.values(readingAnswers).filter(x => typeof x === 'number').length
    if (answered < Math.ceil(totalRd * 0.7)) return show('Answer most Reading questions to continue.')
    setStep('writing'); setActiveTimer('writing')
  }
  const proceedReview = () => {
    clear()
    if ((writingText || '').trim().split(/\s+/).filter(Boolean).length < 25) {
      return show('Write at least ~25 words for the micro-writing task.')
    }
    setStep('review'); setActiveTimer(null)
  }

  // ---- Submit (score + save) ----
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ cefr: CEFR; total: number; breakdown: any } | null>(null)

  const submitAll = async () => {
    clear()
    setSubmitting(true)
    try {
      const gv = scoreMCQ(gvAnswers, banks.gv)
      const rBank = banks.reading.flatMap(p => p.questions)
      const rd = scoreMCQ(readingAnswers, rBank)
      const wr = scoreWriting(writingText, banks.writing)
      const total = gv.score + rd.score + wr.score
      const cefr = mapToCEFR(total)

      const payload = {
        email,
        targetLanguage: lang,
        total,
        cefr,
        answers: {
          gv: { score: gv.score, max: gv.max, answers: gvAnswers, seconds: timer.gv },
          reading: { score: rd.score, max: rd.max, answers: readingAnswers, seconds: timer.reading },
          writing: { score: wr.score, max: wr.max, text: writingText, seconds: timer.writing },
          bankMeta: {
            gvIds: banks.gv.map(q => q.id),
            readingIds: banks.reading.map(p => p.id),
            writingId: banks.writing.id
          }
        }
      }

      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to save your assessment.')

      setResult({ cefr, total, breakdown: payload.answers })
      setStep('result')
      // Clear autosave on success
      localStorage.removeItem(keyFor(email, lang))
    } catch (e: any) {
      show(e?.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  // ---- Progress numbers ----
  const gvDone = Object.values(gvAnswers).filter(v => typeof v === 'number').length
  const rdDone = Object.values(readingAnswers).filter(v => typeof v === 'number').length
  const wrWords = (writingText || '').trim().split(/\s+/).filter(Boolean).length
  const stepIndex: Record<Step, number> = { intro: 0, gv: 1, reading: 2, writing: 3, review: 4, result: 5 }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
      {/* LEFT */}
      <div>
        <HeaderStepper
          current={stepIndex[step]}
          items={[
            { label: 'Intro' },
            { label: 'Grammar & Vocab', sub: `${gvDone}/${totalGv}` },
            { label: 'Reading', sub: `${rdDone}/${totalRd}` },
            { label: 'Writing', sub: `${wrWords} words` },
            { label: 'Review' },
            { label: 'Result' },
          ]}
        />

        <div className="mt-4 space-y-4">
          <Banner />

          {step === 'intro' && (
            <Card>
              <h1 className="text-2xl font-bold tracking-tight">Free CEFR Placement</h1>
              <p className="mt-1 text-neutral-700">
                3 sections · ~10–15 minutes · Instant result. Choose your language and add your email to save your result.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">Email</label>
                  <input className="input" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="label">Language</label>
                  <div className="flex gap-2">
                    <button className={`btn ${lang==='Italian'?'btn-primary':'btn-ghost'}`} onClick={()=>setLang('Italian')}>Italiano 🇮🇹</button>
                    <button className={`btn ${lang==='German'?'btn-primary':'btn-ghost'}`} onClick={()=>setLang('German')}>Deutsch 🇩🇪</button>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button className="btn btn-primary" onClick={start}><Sparkles size={16}/> Start assessment</button>
                <Link className="btn btn-ghost" href="/book"><Clock size={16}/> Book free class</Link>
              </div>
            </Card>
          )}

          {step === 'gv' && (
            <SectionShell
              title="Grammar & Vocabulary"
              subtitle="Choose the best option. You can use 1-3 keys to answer and ←/→ to move."
              time={timer.gv}
              onBack={() => { setStep('intro'); setActiveTimer(null) }}
              onNext={proceedReading}
            >
              <MCQPager
                bank={banks.gv}
                answers={gvAnswers}
                onChange={(id, idx)=>setGvAnswers(s=>({ ...s, [id]: idx }))}
              />
            </SectionShell>
          )}

          {step === 'reading' && (
            <SectionShell
              title="Reading"
              subtitle="Read each passage and answer the questions."
              time={timer.reading}
              onBack={() => { setStep('gv'); setActiveTimer('gv') }}
              onNext={proceedWriting}
            >
              {banks.reading.map(p => (
                <Passage key={p.id} passage={p} answers={readingAnswers} onChange={(id, idx)=>setReadingAnswers(s=>({ ...s, [id]: idx }))} />
              ))}
            </SectionShell>
          )}

          {step === 'writing' && (
            <SectionShell
              title="Micro-Writing"
              subtitle="Write 5–7 sentences. Live word-count below."
              time={timer.writing}
              onBack={() => { setStep('reading'); setActiveTimer('reading') }}
              onNext={proceedReview}
              nextLabel="Review answers"
            >
              <p className="text-sm text-neutral-700 mb-2">{banks.writing.prompt}</p>
              <textarea
                className="input"
                rows={7}
                value={writingText}
                onChange={e=>setWritingText(e.target.value)}
                placeholder={lang==='Italian'?'Scrivi qui…':'Schreibe hier…'}
              />
              <div className="mt-2 text-xs text-neutral-500">
                {wrWords} / ~{banks.writing.targetWords} words • Tip: include words like {banks.writing.keywords.slice(0,6).join(', ')}…
              </div>
            </SectionShell>
          )}

          {step === 'review' && (
            <Card>
              <h2 className="text-xl font-semibold">Review & submit</h2>
              <p className="text-sm text-neutral-600">Fix anything before you submit. Timers are soft (for your reference).</p>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Stat label="Grammar & Vocab" value={`${gvDone}/${totalGv}`} icon={<BookOpen size={16}/>} foot={`${fmtTime(timer.gv)}`} />
                <Stat label="Reading" value={`${rdDone}/${totalRd}`} icon={<FileText size={16}/>} foot={`${fmtTime(timer.reading)}`} />
                <Stat label="Writing words" value={`${wrWords}`} icon={<Edit3 size={16}/>} foot={`${fmtTime(timer.writing)}`} />
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button className="btn btn-ghost" onClick={()=>setStep('writing')}><Undo2 size={16}/> Back to writing</button>
                <button className="btn btn-primary" onClick={submitAll} disabled={submitting}>
                  {submitting ? 'Submitting…' : 'See my result'}
                </button>
              </div>
            </Card>
          )}

          {step === 'result' && result && (
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your result</h2>
                <span className="badge inline-flex items-center gap-1"><Trophy size={14}/> CEFR {result.cefr}</span>
              </div>
              <Gauge score={Math.round(result.total)} max={70} />
              <div className="mt-2 text-sm">Estimated level: <b>{result.cefr}</b> (score {Math.round(result.total)}/70)</div>

              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <Box label="Grammar & Vocab" value={`${result.breakdown.gv.score} / ${result.breakdown.gv.max}`} />
                <Box label="Reading" value={`${result.breakdown.reading.score} / ${result.breakdown.reading.max}`} />
                <Box label="Writing" value={`${result.breakdown.writing.score} / ${result.breakdown.writing.max}`} />
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/book" className="btn btn-primary"><CheckCircle2 size={16}/> Book free class</Link>
                <Link href="/pricing" className="btn btn-ghost">Join a cohort</Link>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* RIGHT (sticky help) */}
      <aside className="card p-6 h-fit sticky top-4">
        <h3 className="text-lg font-semibold">How it works</h3>
        <ol className="mt-3 list-decimal pl-5 text-sm text-neutral-700 space-y-1">
          <li>Grammar & vocabulary (~12 Qs)</li>
          <li>Reading (2 passages)</li>
          <li>Micro-writing (5–7 sentences)</li>
        </ol>

        <div className="mt-4 rounded-xl border border-black/10 bg-white/70 p-3 text-sm">
          <div className="flex items-center gap-2 font-medium"><Info size={16}/> Tips</div>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-neutral-700">
            <li>Use <b>1/2/3</b> to select options, <b>←/→</b> to move.</li>
            <li>Soft timer shows your pace (not enforced).</li>
            <li>Autosaves locally—come back anytime.</li>
          </ul>
        </div>

        <div className="mt-4 grid gap-2">
          <Link href="/pricing" className="btn btn-ghost">See cohorts</Link>
          <Link href="/book" className="btn btn-primary">Book free class</Link>
        </div>
      </aside>
    </div>
  )
}

/* -------------------- UI building blocks -------------------- */

function HeaderStepper({ current, items }: { current: number, items: { label: string; sub?: string }[] }) {
  const pct = Math.round((current / (items.length - 1)) * 100)
  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
      <div className="flex items-center justify-between text-xs text-neutral-600">
        {items.map((it, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-[11px] ${i <= current ? 'bg-brand-500' : 'bg-neutral-300'}`}>{i+1}</div>
            <div className="mt-1 font-medium">{it.label}</div>
            {it.sub && <div className="text-[11px] text-neutral-500">{it.sub}</div>}
          </div>
        ))}
      </div>
      <div className="mt-3 h-1 w-full rounded-full bg-neutral-200">
        <div className="h-1 rounded-full bg-brand-500 transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="card p-6">{children}</div>
}

function SectionShell({
  title, subtitle, time, onBack, onNext, nextLabel = 'Continue', children
}: { title: string; subtitle?: string; time?: number; onBack: ()=>void; onNext: ()=>void; nextLabel?: string; children?: React.ReactNode }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-neutral-600">{subtitle}</p>}
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs">
          <AlarmClock size={14} /> {fmtTime(time ?? 0)}
        </div>
      </div>

      <div className="mt-4">
        {children}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button className="btn btn-ghost" onClick={onBack}><ArrowLeft size={16}/> Back</button>
        <button className="btn btn-primary" onClick={onNext}><ArrowRight size={16}/> {nextLabel}</button>
      </div>
    </Card>
  )
}

/* MCQ pager with keyboard navigation */
function MCQPager({
  bank, answers, onChange
}: { bank: MCQ[]; answers: Record<string, number | null>; onChange: (id: string, idx: number)=>void }) {
  const [idx, setIdx] = useState(0)
  const q = bank[idx]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['1','2','3','4'].includes(e.key)) {
        const n = Number(e.key) - 1
        if (q.options[n] !== undefined) onChange(q.id, n)
      } else if (e.key === 'ArrowRight') {
        setIdx(i => Math.min(i+1, bank.length-1))
      } else if (e.key === 'ArrowLeft') {
        setIdx(i => Math.max(i-1, 0))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [q.id, q.options, bank.length, onChange])

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
        <span>Question {idx+1} of {bank.length}</span>
        <span>Use 1–{Math.min(4, q.options.length)} or ←/→</span>
      </div>
      <div className="rounded-xl border border-black/10 bg-white p-4">
        <div className="font-medium text-sm">{q.prompt}</div>
        <div className="mt-3 grid gap-2">
          {q.options.map((opt, i) => {
            const selected = answers[q.id] === i
            return (
              <button
                key={i}
                onClick={()=>onChange(q.id, i)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition
                ${selected ? 'bg-brand-500 text-white border-brand-500' : 'bg-white hover:bg-neutral-50 border-black/10'}`}
              >
                <span className="inline-flex items-center gap-2">
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-md text-[11px] ${selected ? 'bg-white/20 border-white/30' : 'bg-neutral-100 border-black/10'} border`}>
                    {String.fromCharCode(65+i)}
                  </span>
                  {opt}
                </span>
                {selected && <CheckCircle2 size={16} className="opacity-90" />}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button className="btn btn-ghost" onClick={()=>setIdx(i => Math.max(i-1, 0))}><ArrowLeft size={16}/> Previous</button>
        <button className="btn btn-ghost" onClick={()=>setIdx(i => Math.min(i+1, bank.length-1))}>Next <ArrowRight size={16}/></button>
      </div>
    </div>
  )
}

function Passage({
  passage, answers, onChange
}: { passage: ReadingPassage; answers: Record<string, number | null>; onChange: (id: string, idx: number)=>void }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-4 mb-4">
      <div className="font-semibold">{passage.title}</div>
      <p className="mt-1 text-sm text-neutral-700">{passage.text}</p>
      <ul className="mt-3 space-y-2">
        {passage.questions.map((q, i) => (
          <li key={q.id} className="rounded-xl border border-black/10 bg-white p-3">
            <div className="text-sm font-medium">{i+1}. {q.prompt}</div>
            <div className="mt-2 grid gap-2">
              {q.options.map((opt, idx) => {
                const selected = answers[q.id] === idx
                return (
                  <button
                    key={idx}
                    onClick={()=>onChange(q.id, idx)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition
                    ${selected ? 'bg-brand-500 text-white border-brand-500' : 'bg-white hover:bg-neutral-50 border-black/10'}`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className={`inline-flex h-5 w-5 items-center justify-center rounded-md text-[11px] ${selected ? 'bg-white/20 border-white/30' : 'bg-neutral-100 border-black/10'} border`}>
                        {String.fromCharCode(65+idx)}
                      </span>
                      {opt}
                    </span>
                    {selected && <CheckCircle2 size={16} className="opacity-90" />}
                  </button>
                )
              })}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Gauge({ score, max }: { score: number; max: number }) {
  const pct = Math.min(100, Math.round((score / max) * 100))
  return (
    <div className="mt-3">
      <div className="h-3 w-full rounded-full bg-neutral-200 overflow-hidden">
        <div className="h-3 bg-brand-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-xs text-neutral-600">{score}/{max} ({pct}%)</div>
    </div>
  )
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white/70 p-3">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}

function Stat({ label, value, foot, icon }: { label: string; value: string; foot?: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white/70 p-3">
      <div className="text-xs text-neutral-500 inline-flex items-center gap-2">{icon}{label}</div>
      <div className="text-lg font-semibold">{value}</div>
      {foot && <div className="text-xs text-neutral-500">{foot}</div>}
    </div>
  )
}

/* -------------------- utils -------------------- */

function sample<T>(arr: T[], n: number) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, Math.min(n, a.length))
}

function fmtTime(sec: number) {
  const m = Math.floor((sec ?? 0) / 60)
  const s = (sec ?? 0) % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
