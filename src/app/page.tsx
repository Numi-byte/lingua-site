import Link from 'next/link'
import { CalendarClock, CheckCircle2, GraduationCap, MessageSquare, ShieldCheck, Sparkles, Users } from 'lucide-react'

export const metadata = {
  title: 'Lingua — Italian & German Cohorts • Free Assessment & Free Class',
  description:
    'Small-group Italian & German cohorts (A1–B2). Start with a free CEFR assessment and a free trial class. Native-level tutor, structured curriculum, friendly pacing.',
  openGraph: {
    title: 'Lingua — Italian & German Cohorts',
    description:
      'Small-group Italian & German cohorts (A1–B2). Free assessment + free class.',
    url: '/',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <>
      {/* Announcement Bar */}
      <div className="border-b border-black/5 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-2 text-center text-sm">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1">
            <Sparkles size={14} />
            <span className="font-medium">New:</span> Free CEFR assessment + free trial class for new students
          </span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(60%_50%_at_50%_0%,#000_20%,transparent_75%)]">
          <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-brand-500/15 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h1 className="text-pretty text-4xl font-bold tracking-tight md:text-5xl">
                Learn <span className="text-brand-600">Italian</span> or <span className="text-brand-600">German</span> in friendly, focused cohorts
              </h1>
              <p className="mt-3 text-lg text-neutral-700">
                Start with a quick placement test and a free class. Then join a small group at your level (A1–B2) with a native-level tutor.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/assessment" className="btn btn-primary">Take free assessment</Link>
                <Link href="/book" className="btn btn-ghost">Book free class</Link>
                <Link href="/pricing" className="btn btn-ghost">See packages</Link>
              </div>

              {/* Trust bullets */}
              <ul className="mt-6 grid gap-2 text-sm text-neutral-700 sm:grid-cols-2">
                <li className="inline-flex items-center gap-2">
                  <CheckCircle2 className="text-brand-600" size={16} />
                  CEFR-aligned curriculum (A1–B2)
                </li>
                <li className="inline-flex items-center gap-2">
                  <CheckCircle2 className="text-brand-600" size={16} />
                  Small groups (max 8)
                </li>
                <li className="inline-flex items-center gap-2">
                  <CheckCircle2 className="text-brand-600" size={16} />
                  Native-level tutor (C1)
                </li>
                <li className="inline-flex items-center gap-2">
                  <CheckCircle2 className="text-brand-600" size={16} />
                  Free assessment + free class
                </li>
              </ul>
            </div>

            {/* Hero Card */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold">Your next steps</h3>
              <ol className="mt-3 space-y-3 text-sm text-neutral-700">
                <Step icon={<GraduationCap size={16} />} title="1) Placement">
                  7-minute CEFR test (Italian or German) with instant result.
                </Step>
                <Step icon={<CalendarClock size={16} />} title="2) Free class">
                  Try a live mini-lesson and confirm your level with the tutor.
                </Step>
                <Step icon={<Users size={16} />} title="3) Join a cohort">
                  4-week groups for A1–B2, or weekend pronunciation workshop.
                </Step>
                <Step icon={<ShieldCheck size={16} />} title="4) Track progress">
                  Feedback after each session and a final progress note.
                </Step>
              </ol>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/assessment" className="btn btn-primary">Start now</Link>
                <Link href="/pricing" className="btn btn-ghost">Cohort options</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Levels preview */}
      <section className="mx-auto max-w-6xl px-4 pb-6">
        <h2 className="text-xl font-semibold">Choose your level</h2>
        <p className="mt-1 text-sm text-neutral-600">Same pricing for Italian 🇮🇹 and German 🇩🇪. We’ll recommend a level after your assessment.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <LevelCard level="A1" blurb="Survival language, present tense, everyday phrases." />
          <LevelCard level="A2" blurb="Past tenses, routines, asking for information." />
          <LevelCard level="B1" blurb="Fluency building, opinions, linking words." />
          <LevelCard level="B2" blurb="Complex grammar, abstract topics, accuracy." />
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          <ValueCard
            icon={<Users size={18} />}
            title="Small, social learning"
            text="Learn with 6–8 classmates. Speak often, get friendly feedback, and stay motivated."
          />
          <ValueCard
            icon={<MessageSquare size={18} />}
            title="Live, interactive lessons"
            text="No videos to binge. Real sessions with real practice and a clear weekly routine."
          />
          <ValueCard
            icon={<ShieldCheck size={18} />}
            title="Transparent progress"
            text="Short quizzes, end-of-cohort note, and next-level recommendation."
          />
        </div>
      </section>

      {/* Cohort CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="card p-6 md:p-8">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <h3 className="text-xl font-semibold">Ready to join the next cohort?</h3>
              <p className="mt-1 text-neutral-700 text-sm">
                A1–B2 4-week groups + Weekend Pronunciation Workshop. Same pricing for Italian and German.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/pricing" className="btn btn-primary">See dates & pricing</Link>
              <Link href="/book" className="btn btn-ghost">Book free class</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <h2 className="text-xl font-semibold">What learners say</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Testimonial
            quote="I finally speak without freezing. Small groups made a huge difference."
            name="Sara · Italian A2"
          />
          <Testimonial
            quote="Clear structure and lots of talking time. Loved the feedback after each class."
            name="Jonas · German B1"
          />
          <Testimonial
            quote="The free class convinced me. Went from A1 to A2 in eight weeks."
            name="Marta · Italian A2"
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="text-xl font-semibold">FAQ</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Faq q="Is the assessment really free?"
               a="Yes. It’s a quick CEFR placement with immediate feedback. No payment details asked." />
          <Faq q="What if the class level feels too easy or hard?"
               a="We’ll move you to a better-fitting cohort after your free class—no problem." />
          <Faq q="How many students per group?"
               a="We keep it small—usually 6–8 learners. Enough variety, plenty of talking time." />
          <Faq q="Can I switch language later?"
               a="Yes. Pricing is the same for Italian and German; you can switch at the next cohort." />
          <Faq q="Do you offer 1:1 lessons?"
               a="Our focus is small-group cohorts and workshops. Ask during your free class if you need 1:1 support." />
          <Faq q="Do I get a certificate?"
               a="You’ll receive a progress note and a level recommendation aligned to CEFR on request." />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/assessment" className="btn btn-primary">Take the assessment</Link>
          <Link href="/pricing" className="btn btn-ghost">See cohorts</Link>
        </div>
      </section>
    </>
  )
}

/* ----------------- tiny components for cleanliness ----------------- */

function Step({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <div className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg border border-black/10 bg-white/80">
        {icon}
      </div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-neutral-700">{children}</div>
      </div>
    </li>
  )
}

function LevelCard({ level, blurb }: { level: string; blurb: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">{level}</div>
        <span className="badge">4 weeks</span>
      </div>
      <p className="mt-2 text-sm text-neutral-700">{blurb}</p>
      <div className="mt-4 flex gap-2">
        <Link href="/assessment" className="btn btn-ghost">Check my level</Link>
        <Link href="/pricing" className="btn btn-primary">Join {level}</Link>
      </div>
    </div>
  )
}

function ValueCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-black/10 bg-white/80">
          {icon}
        </div>
        <div className="text-base font-semibold">{title}</div>
      </div>
      <p className="mt-2 text-sm text-neutral-700">{text}</p>
    </div>
  )
}

function Testimonial({ quote, name }: { quote: string; name: string }) {
  return (
    <figure className="card p-5">
      <blockquote className="text-sm text-neutral-800">“{quote}”</blockquote>
      <figcaption className="mt-2 text-xs text-neutral-500">{name}</figcaption>
    </figure>
  )
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="rounded-xl border border-black/10 bg-white/70 p-4">
      <summary className="cursor-pointer select-none text-sm font-medium">{q}</summary>
      <p className="mt-2 text-sm text-neutral-700">{a}</p>
    </details>
  )
}
