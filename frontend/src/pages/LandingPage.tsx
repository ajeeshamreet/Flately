import { Link } from 'react-router-dom'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-slate-900">
      <header className="sticky top-0 z-20 border-b border-neutral-border/80 bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Flately</p>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a href="#how-it-works" className="transition hover:text-primary">
              How it works
            </a>
            <a href="#trust" className="transition hover:text-primary">
              Safety
            </a>
            <a href="#faq" className="transition hover:text-primary">
              FAQ
            </a>
            <Link to="/login" className="font-semibold text-slate-700 transition hover:text-primary">
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-[-18%] top-[-28%] h-140 w-140 rounded-full bg-[radial-gradient(circle,rgba(15,76,92,0.2),rgba(15,76,92,0))]" />
          <div className="pointer-events-none absolute right-[-16%] top-[-18%] h-120 w-120 rounded-full bg-[radial-gradient(circle,rgba(218,165,32,0.14),rgba(218,165,32,0))]" />
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-18 pt-16 md:pt-24 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Roommate Matching Rebuilt</p>
              <h1 className="mt-5 max-w-2xl text-5xl font-semibold leading-tight md:text-6xl">
                Find a flatmate who actually fits your life.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
                Flately ranks real people by lifestyle compatibility, budget alignment, and housing intent so you can stop scrolling and start moving.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/start"
                  className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
                >
                  Start compatibility questionnaire
                </Link>
                <Link
                  to="/login"
                  className="rounded-xl border border-neutral-border bg-surface px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-semibold text-primary transition hover:text-primary-dark"
                >
                  Skip to account creation
                </Link>
              </div>
              <p className="mt-5 text-sm text-slate-500">Trusted by renters and hosts across 12 cities.</p>
            </div>

            <aside className="rounded-3xl border border-neutral-border bg-surface p-6 shadow-[0_34px_80px_-50px_rgba(15,76,92,0.6)] md:p-7">
              <div className="rounded-2xl border border-neutral-border bg-canvas p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Live Match Snapshot</p>
                <div className="mt-4 grid gap-3">
                  <div className="rounded-xl border border-neutral-border bg-surface px-3 py-2">
                    <p className="text-xs text-slate-500">Profile compatibility</p>
                    <p className="text-2xl font-semibold text-primary">92%</p>
                  </div>
                  <div className="rounded-xl border border-neutral-border bg-surface px-3 py-2">
                    <p className="text-xs text-slate-500">Lifestyle overlap</p>
                    <p className="text-lg font-medium text-slate-800">Night-owl • Non-smoker • Pet-friendly</p>
                  </div>
                  <div className="rounded-xl border border-neutral-border bg-surface px-3 py-2">
                    <p className="text-xs text-slate-500">Budget fit</p>
                    <p className="font-mono text-sm text-slate-800">$950 - $1,250 (Downtown)</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-neutral-border bg-canvas px-3 py-2">
                  <p className="text-xs text-slate-500">Verified users</p>
                  <p className="mt-1 text-lg font-semibold">18k+</p>
                </div>
                <div className="rounded-xl border border-neutral-border bg-canvas px-3 py-2">
                  <p className="text-xs text-slate-500">Avg. first match</p>
                  <p className="mt-1 text-lg font-semibold">27 mins</p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-neutral-border bg-surface">
          <div className="mx-auto w-full max-w-6xl px-6 py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">How it works</p>
            <h2 className="mt-4 text-3xl font-semibold">Three steps from profile to move-in shortlist.</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <article className="rounded-2xl border border-neutral-border bg-canvas p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Step 01</p>
                <h3 className="mt-2 text-xl font-semibold">Set your baseline</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Add budget, schedule, social preferences, and room status once.
                </p>
              </article>
              <article className="rounded-2xl border border-neutral-border bg-canvas p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Step 02</p>
                <h3 className="mt-2 text-xl font-semibold">Review ranked matches</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  See compatibility-backed profiles instead of random listing noise.
                </p>
              </article>
              <article className="rounded-2xl border border-neutral-border bg-canvas p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Step 03</p>
                <h3 className="mt-2 text-xl font-semibold">Chat and confirm fit</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Move to real conversations only after mutual interest.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="trust" className="mx-auto w-full max-w-6xl px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Safety and trust</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold">Identity-first profiles, transparent matching, and cleaner conversations.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-neutral-border bg-surface p-5">
              <h3 className="text-lg font-semibold">Verified identity</h3>
              <p className="mt-2 text-sm text-slate-600">Profiles are tied to validated account ownership before matching.</p>
            </div>
            <div className="rounded-2xl border border-neutral-border bg-surface p-5">
              <h3 className="text-lg font-semibold">Compatibility scoring</h3>
              <p className="mt-2 text-sm text-slate-600">See why someone is a fit across habits, budget, and social cadence.</p>
            </div>
            <div className="rounded-2xl border border-neutral-border bg-surface p-5">
              <h3 className="text-lg font-semibold">Mutual chat only</h3>
              <p className="mt-2 text-sm text-slate-600">Messaging opens after both sides opt in, reducing spam and awkward starts.</p>
            </div>
          </div>
        </section>

        <section id="faq" className="border-y border-neutral-border bg-surface">
          <div className="mx-auto w-full max-w-6xl px-6 py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">FAQ</p>
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <article className="rounded-2xl border border-neutral-border bg-canvas p-5">
                <h3 className="text-base font-semibold">Is Flately free to use?</h3>
                <p className="mt-2 text-sm text-slate-600">Yes. You can create a profile, match, and chat without paid lock-in.</p>
              </article>
              <article className="rounded-2xl border border-neutral-border bg-canvas p-5">
                <h3 className="text-base font-semibold">How long does onboarding take?</h3>
                <p className="mt-2 text-sm text-slate-600">Most users finish in under three minutes with profile and preference setup.</p>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-border bg-canvas">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Flately. Match smarter, move easier.</p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#how-it-works" className="hover:text-primary">How it works</a>
            <a href="#trust" className="hover:text-primary">Safety</a>
            <a href="mailto:support@flately.app" className="hover:text-primary">Support</a>
            <Link to="/login" className="hover:text-primary">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
