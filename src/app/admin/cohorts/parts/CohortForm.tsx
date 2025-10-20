'use client'
import { useMemo, useState } from 'react'
import { CalendarClock, Save } from 'lucide-react'

const WEEKDAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] as const
type Wd = typeof WEEKDAYS[number]

export default function CohortForm() {
  const [language, setLanguage] = useState<'Italian'|'German'>('Italian')
  const [level, setLevel] = useState<'A1'|'A2'|'B1'|'B2'|'C1'>('A1')
  const [startDate, setStartDate] = useState('')
  const [days, setDays] = useState<Wd[]>(['Mon','Wed'])
  const [time, setTime] = useState('19:00')
  const [duration, setDuration] = useState(60)
  const [timezone, setTimezone] = useState('Europe/Rome')
  const [capacity, setCapacity] = useState(8)
  const [priceId, setPriceId] = useState('')
  const [status, setStatus] = useState<'open'|'closed'|'finished'>('open')
  const [saving, setSaving] = useState(false)

  // Preview label/schedule (server will compute authoritative value too)
  const preview = useMemo(() => {
    const md = fmtMonthDay(startDate)
    const dayStr = joinDays(days)
    const label = `${level} ${md ? md + ' · ' : ''}${dayStr} ${time}`
    const schedule = `${dayStr} · ${time} (${timezone}) · Online`
    return { label, schedule }
  }, [level, startDate, days, time, timezone])

  function toggleDay(d: Wd) {
    setDays(prev => prev.includes(d) ? prev.filter(x=>x!==d) : [...prev, d])
  }

  async function submit() {
    if (!startDate) return alert('Choose a start date')
    if (!priceId) return alert('Enter Stripe price_id (price_...)')
    if (days.length === 0) return alert('Pick at least one weekday')

    setSaving(true)
    try {
      const res = await fetch('/api/admin/cohorts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          level,
          start_date: startDate,
          days,                    // <-- structured
          start_time: time,        // 'HH:MM'
          duration_min: duration,  // number
          timezone,
          capacity,
          status,
          price_id: priceId,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      location.reload()
    } catch (e: any) {
      alert(e.message || 'Error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
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
          <label className="label">Days (pick 1–3)</label>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map(d => (
              <button
                key={d}
                type="button"
                onClick={()=>toggleDay(d)}
                className={`btn ${days.includes(d) ? 'btn-primary' : 'btn-ghost'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Time + duration + TZ */}
        <div>
          <label className="label">Start time (24h)</label>
          <input className="input" value={time} onChange={e=>setTime(e.target.value)} placeholder="19:00" />
        </div>
        <div>
          <label className="label">Duration (minutes)</label>
          <input type="number" className="input" value={duration} onChange={e=>setDuration(Number(e.target.value)||60)} />
        </div>
        <div>
          <label className="label">Timezone</label>
          <input className="input" value={timezone} onChange={e=>setTimezone(e.target.value)} placeholder="Europe/Rome" />
        </div>

        {/* Capacity / Status / Stripe */}
        <div>
          <label className="label">Capacity</label>
          <input type="number" className="input" value={capacity} onChange={e=>setCapacity(Number(e.target.value)||8)} />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={status} onChange={e=>setStatus(e.target.value as any)}>
            <option>open</option><option>closed</option><option>finished</option>
          </select>
        </div>
        <div>
          <label className="label">Stripe price_id</label>
          <input className="input" value={priceId} onChange={e=>setPriceId(e.target.value)} placeholder="price_..." />
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
        <button className="btn btn-primary" onClick={submit} disabled={saving}>
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
