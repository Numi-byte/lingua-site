// Server-only: fetch open cohorts + enrolled counts
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export type CohortRow = {
  id: string; label: string; language: 'Italian'|'German'; level: 'A1'|'A2'|'B1'|'B2'|'C1';
  start_date: string|null; schedule: string|null; capacity: number|null; status: 'open'|'closed'|'finished';
  price_id: string|null;
}
export async function getOpenCohorts() {
  const db = supabaseAdmin()
  const { data: cohorts } = await db.from('cohorts')
    .select('id,label,language,level,start_date,schedule,capacity,status,price_id')
    .eq('status','open')
    .order('start_date', { ascending: true })

  const { data: enr } = await db.from('enrollments').select('cohort_id')
  const counts = (enr ?? []).reduce<Record<string, number>>((acc, e: any) => {
    acc[e.cohort_id] = (acc[e.cohort_id] || 0) + 1; return acc
  }, {})

  return (cohorts ?? []).map(c => ({
    ...c,
    enrolled: counts[c.id] || 0,
    left: Math.max(0, (c.capacity ?? 0) - (counts[c.id] || 0))
  }))
}
