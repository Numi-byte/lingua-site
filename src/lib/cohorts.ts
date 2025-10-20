export type CohortRow = {
  id: string
  label: string
  language: 'Italian' | 'German'
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
  start_date: string | null
  schedule: string | null
  capacity: number | null
  status: 'open' | 'closed' | 'finished'
  price_id: string | null
}

export type SeatCounts = {
  enrolled: number
  held: number
  left: number
  soldOut: boolean
}

export function seatInfo(cohort: CohortRow, enrolled: number, held: number): SeatCounts {
  const cap = cohort.capacity ?? 0
  const left = Math.max(0, cap - enrolled - held)
  return { enrolled, held, left, soldOut: left <= 0 }
}
