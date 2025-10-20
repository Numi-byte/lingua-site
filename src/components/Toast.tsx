'use client'
import { create } from 'zustand'

type T = { id: number, text: string }
const useToast = create<{list:T[], push:(t:string)=>void, remove:(id:number)=>void}>(set=>({
  list: [],
  push: (text) => set(s => ({ list: [...s.list, { id: Date.now(), text }] })),
  remove: (id) => set(s => ({ list: s.list.filter(x=>x.id!==id) }))
}))
export const toast = { show: (t:string)=>useToast.getState().push(t) }

export default function ToastHost() {
  const { list, remove } = useToast()
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {list.map(t=>(
        <div key={t.id} className="card px-4 py-3 flex items-center gap-3 bg-white/90">
          <div className="text-sm">{t.text}</div>
          <button className="text-xs ml-2" onClick={()=>remove(t.id)} aria-label="Close">✕</button>
        </div>
      ))}
    </div>
  )
}
