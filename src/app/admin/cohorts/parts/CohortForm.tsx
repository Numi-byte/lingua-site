'use client'

import { useMemo, useState } from 'react'
import { CalendarClock, Save } from 'lucide-react'

const WEEKDAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] as const
type Wd = typeof WEEKDAYS[number]
type Status = 'open'|'closed'|'finished'

/** Build price options from env – VALUE is the raw price id only */
const PRICE_OPTIONS: { label: string; id: string | null }[] = [
  { label: '— No price (draft)', id: null },
  { label: `A1 — ${process.env.NEXT_PUBLIC_PRICE_A1 ?? 'missing'}`, id: process.env.NEXT_PUBLIC_PRICE_A1 ?? null },
  { label: `A2 — ${process.env.NEXT_PUBLIC_PRICE_A2 ?? 'missing'}`, id: process.env.NEXT_PUBLIC_PRICE_A2 ?? null },
  { label: `B1 — ${process.env.NEXT_PUBLIC_PRICE_B1 ?? 'missing'}`, id: process.env.NEXT_PUBLIC_PRICE_B1 ?? null },
  { label: `B2 — ${process.env.NEXT_PUBLIC_PRICE_B2 ?? 'missing'}`, id: process.env.NEXT_PUBLIC_PRICE_B2 ?? null },
  { label: `Weekend Pronunciation — ${process.env.NEXT_PUBLIC_PRICE_WEEKEND_PRON ?? 'missing'}`, id: process.env.NEXT_PUBLIC_PRICE_WEEKEND_PRON ?? null },
  { label: `Free Class — ${process.env.NEXT_PUBLIC_PRICE_FREECLASS ?? 'missing'}`, id: process.env.NEXT_PUBLIC_PRICE_FREECLASS ?? null },
].filter(o => o.id === null || o.id?.startsWith('price_') || o.id?.startsWith('pr_'))

/** Clean up anything like "NEXT_PUBLIC_PRICE_A1=price_123" → "price_123" */
function extractPriceId(input?: string | null): string | null {
  if (!input) return null
  const s = String(input).trim()
  const candidate = s.includes('=') ? s.slice(s.lastIndexOf('=') + 1).trim() : s
  if (candidate.startsWith('price_') || candidate.startsWith('pr_')) return candidate
  return null
}

type Props = {
  onSaved?: () => void
}

export default function CohortForm({ onSaved }: Props) {
  const [language, setLanguage]   = useState<'Italian'|'German'>('Italian')
  const [level, setLevel]         = useState<'A1'|'A2'|'B1'|'B2'|'C1'>('A1')
  const [startDate, setStartDate] = useState('')          // yyyy-mm-dd
  const [days, setDays]           = useState<Wd[]>(['Mon','Wed'])
  const [time, setTime]           = useState('19:00')     // HH:MM 24h
  const [duration, setDuration]   = useState(60)          // minutes
  const [timezone, setTimezone]   = useState('Europe/Rome')
  const [capacity, setCapacity]   = useState(8)
  const [priceId, setPriceId]     = useState<string>('')  // raw price id typed/pasted
  const [status, setStatus]       = useState<Status>('open')
  const [saving, setSaving]       = useState(false)
  const [errors, setErrors]       = useState<string[]>([])

  // Preview label/schedule (server will compute authoritative value too)
  const preview = useMemo(() => {
    const md = fmtMonthDay(startDate)
    const dayStr = joinDays(days)
    const label = `${level} ${md ? md + ' · ' : ''}${dayStr} ${time}`
    const schedule = `${dayStr} · ${time} (${timezone}) · Online`
    return { label, schedule }
  }, [level, startDate, days, time, timezone])

  function toggleDay(d: Wd) {
    setDays(prev => {
      if (prev.includes(d)) return prev.filter(x=>x!==d)
      if (prev.length >= 3) return prev // limit: 1–3 days
      return [...prev, d]
    })
  }

  function validate(): string[] {
    const errs: string[] = []
    if (!startDate) errs.push('Choose a start date.')
    else {
      const today = new Date(); today.setHours(0,0,0,0)
      const sd = new Date(startDate + 'T00:00:00')
      if (sd < today) errs.push('Start date must be today or later.')
    }
    if (!/^\d{2}:\d{2}$/.test(time)) errs.push('Start time must be HH:MM (24h).')
    if (days.length === 0) errs.push('Pick at least one weekday (max 3).')
    if (duration < 30 || duration > 180) errs.push('Duration must be between 30–180 minutes.')
    if (capacity < 0 || capacity > 1000) errs.push('Capacity must be between 0–1000.')
    const cleaned = extractPriceId(priceId)
    if (!cleaned) errs.push('Enter a valid Stripe price id (price_...).')
    return errs
  }

  async function submit() {
    const errs = validate()
    setErrors(errs)
    if (errs.length) return

    setSaving(true)
    try {
      const cleaned = extractPriceId(priceId)
      const res = await fetch('/api/admin/cohorts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          level,
          start_date: startDate,
          days,                    // structured array
          start_time: time,        // 'HH:MM'
          duration_min: duration,  // number
          timezone,
          capacity,
          status,
          price_id: cleaned,       // raw price id only
        }),
      })
      const j = await res.json().catch(()=> ({}))
      if (!res.ok) throw new Error(j.error || 'Failed to create cohort')
      onSaved?.()
      // Fallback if no callback provided
      if (!onSaved) location.reload()
    } catch (e: any) {
      setErrors([e.message || 'Error creating cohort'])
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
      {/* validation summary */}
      {errors.length > 0 && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <ul className="list-disc pl-5 space-y-1">
            {errors.map((e,i)=>(<li key={i}>{e}</li>))}
          </ul>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        {/* Language */}
        <div>
          <label className="label">Language</label>
          <select className="input" value={language} onChange={e=>setLanguage(e.target.value as any)}>
            <option>Italian</option><option>German</option>
          </select>
        </div>

        {/* Level */}
        <div>
          <label className="label">Level</label>
          <select className="input" value={level} onChange={e=>setLevel(e.target.value as any)}>
            <option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option>
          </select>
        </div>

        {/* Start date */}
        <div>
          <label className="label">Start date</label>
          <input type="date" className="input" value={startDate} onChange={e=>setStartDate(e.target.value)} />
        </div>

        {/* Weekdays */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between">
            <label className="label">Days</label>
            <div className="text-xs text-neutral-500">{days.length}/3 selected</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map(d => {
              const active = days.includes(d)
              const disabled = !active && days.length >= 3
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={active}
                  aria-label={`Toggle ${d}`}
                  onClick={()=>toggleDay(d)}
                  className={`btn ${active ? 'btn-primary' : 'btn-ghost'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={disabled}
                >
                  {d}
                </button>
              )
            })}
          </div>
        </div>

        {/* Time + duration + TZ */}
        <div>
          <label className="label">Start time (24h)</label>
          <input className="input" value={time} onChange={e=>setTime(e.target.value)} placeholder="19:00" />
        </div>
        <div>
          <label className="label">Duration (minutes)</label>
          <input
            type="number"
            className="input"
            min={30}
            max={180}
            step={5}
            value={duration}
            onChange={e=>setDuration(Number(e.target.value)||60)}
          />
        </div>
        <div>
          <label className="label">Timezone</label>
          <input
            className="input"
            list="tz-list"
            value={timezone}
            onChange={e=>setTimezone(e.target.value)}
            placeholder="Europe/Rome"
          />
          <datalist id="tz-list">
            <option value="Europe/Rome" />
            <option value="Europe/Berlin" />
            <option value="UTC" />
          </datalist>
        </div>

        {/* Capacity / Status */}
        <div>
          <label className="label">Capacity</label>
          <input
            type="number"
            className="input"
            min={0}
            max={1000}
            value={capacity}
            onChange={e=>setCapacity(Number(e.target.value)||0)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="label mb-1 block">Status</label>
          <div className="flex flex-wrap gap-2">
            {(['open','closed','finished'] as Status[]).map(s => (
              <button
                key={s}
                type="button"
                aria-pressed={status===s}
                onClick={()=>setStatus(s)}
                className={`btn ${status===s ? 'btn-primary' : 'btn-ghost'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Stripe price */}
        <div className="md:col-span-3">
          <label className="label">Stripe Price</label>
          <div className="grid gap-2 md:grid-cols-[1fr_1fr]">
            <select
              className="input"
              value={PRICE_OPTIONS.find(o=>o.id===extractPriceId(priceId))?.id ?? ''}
              onChange={(e)=> setPriceId(e.target.value)}
            >
              {PRICE_OPTIONS.map(o => (
                <option key={o.label} value={o.id ?? ''}>{o.label}</option>
              ))}
            </select>
            <input
              className="input"
              value={priceId}
              onChange={e=> setPriceId(e.target.value)}
              placeholder="Paste price_… (we auto-clean KEY=price_…)"
            />
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            We’ll store only the **raw** Stripe price id (e.g. <code>price_abc</code>). Pasting
            <code className="mx-1">NEXT_PUBLIC_PRICE_A1=price_abc</code> is okay—it will be cleaned.
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-3 rounded-xl border border-black/10 bg-white/70 p-3 text-sm">
        <div className="inline-flex items-center gap-2 text-xs text-neutral-500">
          <CalendarClock size={14}/> Preview (server will finalize)
        </div>
        <div className="font-medium">{preview.label}</div>
        <div className="text-neutral-600">{preview.schedule}</div>
      </div>

      <div className="mt-3">
        <button className="btn btn-primary inline-flex items-center gap-2" onClick={submit} disabled={saving}>
          <Save size={16}/> {saving ? 'Saving…' : 'Create cohort'}
        </button>
      </div>
    </div>
  )
}

function fmtMonthDay(iso: string) {
  if (!iso) return ''
  try {
    const d = new Date(iso + 'T00:00:00')
    return d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' })
  } catch { return '' }
}
function joinDays(days: readonly string[]) {
  if (days.length === 1) return days[0]
  if (days.length === 2) return `${days[0]} & ${days[1]}`
  return `${days.slice(0,-1).join(', ')} & ${days[days.length-1]}`
}
