'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'

export default function AdminLink() {
  const supabase = supabaseBrowser()
  const [isAdmin, setIsAdmin] = useState(false)
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return
      const { data } = await supabase.from('admins').select('email').eq('email', user.email).limit(1)
      setIsAdmin(!!data?.length)
    })()
  }, [])
  if (!isAdmin) return null
  return <Link href="/admin" className="btn btn-ghost">Admin</Link>
}
