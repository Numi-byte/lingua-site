// ---------- Shared types ----------
export type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
export type LevelBand = CEFR | 'C2'

export type MCQ = {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  weight?: number // default 1
  band: LevelBand
}

export type ReadingPassage = {
  id: string
  title: string
  text: string
  questions: MCQ[]
}

export type WritingPrompt = {
  id: string
  prompt: string
  keywords: string[]
  targetWords: number
}

// ---------- Scoring ----------
export function scoreMCQ(answers: Record<string, number | null>, bank: MCQ[]) {
  let score = 0
  let max = 0
  bank.forEach(q => {
    const w = q.weight ?? 1
    max += w
    const a = answers[q.id]
    if (typeof a === 'number' && a === q.correctIndex) score += w
  })
  return { score, max }
}

export function scoreWriting(userText: string, prompt: WritingPrompt) {
  const text = (userText || '').trim()
  if (!text) return { score: 0, max: 10, details: { lengthPts: 0, keywordsPts: 0, words: 0 } }

  const words = text.split(/\s+/).filter(Boolean).length
  const lengthPts = Math.min(5, Math.round((words / prompt.targetWords) * 5))

  const lower = text.toLowerCase()
  let kwMatches = 0
  prompt.keywords.forEach(k => {
    const rx = new RegExp(`\\b${escapeRegExp(k.toLowerCase())}[a-zà-ü]*\\b`, 'i')
    if (rx.test(lower)) kwMatches++
  })
  const keywordsPts = Math.min(5, kwMatches)

  const score = Math.max(0, Math.min(10, lengthPts + keywordsPts))
  return { score, max: 10, details: { lengthPts, keywordsPts, words } }
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Total ~70 (40 G/V + ~20 Reading + 10 Writing)
export function mapToCEFR(total: number): CEFR {
  if (total <= 12) return 'A1'
  if (total <= 24) return 'A2'
  if (total <= 38) return 'B1'
  if (total <= 55) return 'B2'
  return 'C1'
}
