// @ts-nocheck
import { useAuth0 } from '@auth0/auth0-react'
import { Navbar } from '../components/layout/Navbar'

export default function Landing() {
  const { loginWithRedirect } = useAuth0()

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-mint text-[#166534] rounded-full text-sm font-medium border border-[#166534]/10">
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                <span>10,000+ roommates matched</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Find Your
                <span className="block text-[#166534]">Perfect Roommate</span>
              </h1>

              <p className="text-xl text-slate-500 max-w-lg leading-relaxed">
                Match with verified roommates who share your lifestyle and budget. No more awkward Craigslist posts.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })}
                  className="group px-8 py-3.5 bg-[#166534] text-white rounded-lg font-bold hover:bg-[#14532d] transition-colors shadow-lg shadow-[#166534]/20 flex items-center gap-2"
                >
                  Get Started Free
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
                <button
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-3.5 border-2 border-slate-200 text-slate-900 rounded-lg font-bold hover:bg-slate-50 transition-colors"
                >
                  See How It Works
                </button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="material-symbols-outlined text-[#166534] text-[20px]">check_circle</span>
                  <span className="text-sm font-medium">Free to join</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="material-symbols-outlined text-[#166534] text-[20px]">check_circle</span>
                  <span className="text-sm font-medium">Verified profiles</span>
                </div>
              </div>
            </div>

            {/* Right — Card */}
            <div className="hidden lg:block relative">
              <div className="relative bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
                <div className="flex items-center gap-4 mb-5">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face" alt="Profile" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">Sarah M.</h3>
                      <span className="px-2 py-0.5 bg-mint text-[#166534] rounded-full text-xs font-bold border border-[#166534]/10">Verified</span>
                    </div>
                    <p className="text-slate-500 text-sm font-mono">San Francisco, CA</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold font-mono text-[#166534]">94%</div>
                    <div className="text-xs text-slate-400 font-mono">Match</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-5">
                  {['Early Bird', 'Non-Smoker', 'Pet Lover', 'Clean'].map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold border border-slate-200">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between py-4 border-t border-slate-100">
                  <div>
                    <div className="text-sm text-slate-400 font-medium">Monthly Budget</div>
                    <div className="text-lg font-bold font-mono text-slate-900">$800 - $1,200</div>
                  </div>
                  <button className="px-4 py-2 bg-[#166534] text-white rounded-lg text-sm font-bold hover:bg-[#14532d] transition-colors">View Profile</button>
                </div>
                {/* Floating cards */}
                <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 border border-slate-200 animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#166534]">home</span>
                    <span className="text-sm font-bold">3 new matches!</span>
                  </div>
                </div>
                <div className="absolute -bottom-3 -left-3 bg-white rounded-xl shadow-lg px-3 py-2 border border-slate-200">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <span key={i} className="material-symbols-outlined text-yellow-400 text-[18px] icon-fill">star</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">Find your ideal roommate in three simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: 'person_add', title: 'Create Profile', desc: 'Share your lifestyle, budget & preferences' },
              { icon: 'favorite', title: 'Get Matched', desc: 'Our algorithm finds compatible roommates' },
              { icon: 'chat', title: 'Connect', desc: 'Chat and find your perfect fit' }
            ].map((step, i) => (
              <div key={step.title} className="relative text-center p-8 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 group border border-transparent hover:border-slate-200">
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold group-hover:bg-[#166534] group-hover:text-white transition-colors">{i + 1}</div>
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-mint">
                  <span className="material-symbols-outlined text-[32px] text-[#166534]">{step.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-500 font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section id="trust" className="py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Safety First</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">Every user goes through our verification process</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: 'badge', title: 'ID Verified', desc: 'All users verify identity before matching' },
              { icon: 'shield', title: 'Background Checks', desc: 'Optional checks for peace of mind' },
              { icon: 'group', title: 'Social Proof', desc: 'Link social accounts to build trust' }
            ].map(item => (
              <div key={item.title} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-[#166534]/20 transition-all duration-300">
                <div className="w-14 h-14 mb-6 bg-mint rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px] text-[#166534]">{item.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#166534]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Find Your Roommate?</h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">Join thousands of people who found their perfect living situation through Flately.</p>
          <button
            onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })}
            className="px-8 py-4 bg-white text-[#166534] rounded-lg font-bold text-lg hover:bg-slate-50 transition-colors shadow-xl inline-flex items-center gap-2"
          >
            Get Started — It's Free
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#166534] rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">F</span>
                </div>
                <span className="text-lg font-bold text-white">Flately</span>
              </div>
              <p className="text-slate-400 text-sm">Find your perfect roommate with verified profiles and smart matching.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'FAQ'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies'] }
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-sm">© 2026 Flately. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
