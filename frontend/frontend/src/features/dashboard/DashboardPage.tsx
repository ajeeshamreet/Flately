// @ts-nocheck
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { apiRequest } from '@/services/api'

const SIGNALS = [
  { id: 1, name: 'Sarah Jenkins', time: '09:42', msg: 'Hey, are you still looking for a room in Zone 1? I have a spacious...', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJnN3sDpHUf7S-YkmZpa2YU5Hrmd6MsJLBUdoLPM-3UkRPsEsoca0Jw7lrM_hwxX8UV9hxG9ee4iyEI-Hx1d1Uch1zIl5GIhVgSi591CYHMq_Z3bejbVqQp4MnOZDyW9py-wLDtrsINft1LTN2tHYKWBtY8DyI5n7di3TGeSiPfuwoI-4Nm8O0OMTRAQag_gz0MsuPS3FYTspgAK29Ze7TfBYPZveHXK0cB3BfaLRLIlqkAOqP1Xrh3Da-nPa12r9Do9IwUkpYqQ' },
  { id: 2, name: 'Mike Thompson', time: '09:15', msg: 'I have a cat, hope that is not a dealbreaker for the shared space.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcTifPA0vXk_1bpmU5HVWCD32n3nEyZdMns3ZYTAldVgH4bD66mykQsezMUSmhXNWZ9ZMWGYIamZx-Vab7GfG6zVh1tqC7pukSq_XQADnkl8xvOGQ5-KQIN8OtrSgTE5vqRsfFfWGFhFBZb1KEv4j8sr-deLMLCGCDW9wH2Z4SJFjrST7z7jvGylG1GD-LczO9WYRNXkY4dQ53-cw-OsSqNarZFNcZMHlGLJXw9YE41uSiIdtwkEbokV1YY0OBQpNoPxEr2Djr5g', bold: true },
  { id: 3, name: 'Elena Rodriguez', time: 'YESTERDAY', msg: 'The lease starts on the 1st of next month.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCY43iEUOGAB7FdgLVWlGoVkRS-xeLKJ4TkXLlIVwftnEN0_8hi1nJAAJ936_DFsjWbQBkNvqw9cG0pLiOQCa2rB-ai3BkDTu7jv4MhUUlR-HjI3Rcuzl6EqQdgkdG7z-PR0vpCS5JsrhyjrapQyiwlU_bqvGTT3YVcCNIs5jsSuEmvSnNxIilevFnkkmb6QRI0hD0D0O4fZh6c6HjYrZFm6SA8-wMaz91C1tP0_NqOuXlpC4sfCUCubrcs0mkJQIRYAoz3xZJJlQ' },
  { id: 4, name: 'David Kim', time: 'MON', msg: 'Is the parking spot included in the rent?', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBT1Gh4qqZReRStI275GPAFgbl95t6lvBa_0xiZeS0uIVY3t0BHJfaWMhNnUiae5z3YeS2LhXzXmgN_qZ8W_Y-dcUzKmI0U_v0G57Rx54tTBuJEj6VfKc3zhMoZr3fTOJPaVGWRheEebOWm-JMasEBmN0Z4f_abN0hXpFLAw1cTaT1RsV5Fw-NIltJl0mu-wkaqW1AOF0ksz2zHSQ-e5sWaImO7IdHdpsx5lurhx0r6V0OmmtjhPaS-IuN8yhk3M17x6NcSOkKf7w' },
]

const CRITERIA_LOC = [
  { label: 'Zone 1 or Zone 2', type: 'MUST', checked: true },
  { label: 'Max Rent $1,400', type: 'MUST', checked: true },
  { label: 'Utilities Included', type: 'OPTIONAL', checked: false },
]

const CRITERIA_LIFE = [
  { label: 'Non-Smoker', type: 'MUST', checked: true },
  { label: 'Pet Friendly (Cats)', type: 'MUST', checked: true },
  { label: 'LGBTQ+ Friendly', type: 'MUST', checked: true },
]

function CriteriaRow({ item }) {
  if (!item.checked) {
    return (
      <div className="flex items-center justify-between group p-2 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-default opacity-60 hover:opacity-100">
        <div className="flex items-center gap-3">
          <div className="size-5 rounded border border-slate-300 flex items-center justify-center bg-transparent" />
          <span className="text-sm text-slate-500 line-through decoration-slate-400">{item.label}</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{item.type}</span>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-between group p-2 rounded-md hover:bg-mint border border-transparent hover:border-emerald-100 transition-all cursor-default">
      <div className="flex items-center gap-3">
        <div className="size-5 rounded border border-emerald-200 flex items-center justify-center bg-mint text-[#166534]">
          <span className="material-symbols-outlined text-[16px] font-bold">check</span>
        </div>
        <span className="text-sm font-medium text-slate-700">{item.label}</span>
      </div>
      <span className="text-[10px] font-mono text-[#166534] bg-mint px-1.5 py-0.5 rounded border border-emerald-100">{item.type}</span>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-canvas">
      {/* Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-neutral-border bg-white/50 backdrop-blur-sm z-10 sticky top-0">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">Dashboard</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-mono shadow-sm">
            <span className="size-2 rounded-full bg-[#166534] animate-pulse" />
            <span className="text-[#166534] font-bold">SYSTEM: ONLINE</span>
          </div>
          <button className="size-8 flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm transition-colors">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[1400px] mx-auto h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full pb-10">

            {/* Col 1 — Incoming Signals */}
            <div className="flex flex-col bg-white border border-neutral-border rounded-md overflow-hidden shadow-sm h-full max-h-[calc(100vh-8rem)]">
              <div className="px-4 py-3 border-b border-neutral-border flex justify-between items-center bg-white">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Incoming Signals</h3>
                <span className="text-[10px] font-mono bg-mint text-[#166534] px-1.5 py-0.5 rounded border border-emerald-100">5 NEW</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {SIGNALS.map(s => (
                  <div key={s.id} className="group flex gap-3 p-3 border-b border-slate-100 hover:bg-mint cursor-pointer transition-colors relative">
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#166534] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="size-9 rounded bg-slate-200 flex-shrink-0 bg-cover bg-center border border-slate-200" style={{ backgroundImage: `url('${s.img}')` }} />
                    <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm font-semibold text-slate-900 truncate group-hover:text-[#166534] transition-colors">{s.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{s.time}</span>
                      </div>
                      <p className={`text-xs truncate leading-relaxed ${s.bold ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>{s.msg}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-neutral-border bg-slate-50/50">
                <Link to="/app/chat" className="block w-full py-2 text-xs font-medium text-slate-600 hover:text-[#166534] border border-slate-200 rounded-md bg-white hover:bg-mint transition-colors shadow-sm text-center">View All Messages</Link>
              </div>
            </div>

            {/* Col 2 — Stats */}
            <div className="flex flex-col gap-6">
              {/* Profile Visibility */}
              <div className="bg-white border border-neutral-border rounded-md p-5 flex flex-col justify-between shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Profile Visibility</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-mono font-medium text-slate-900 tracking-tighter">1,284</span>
                      <span className="text-xs font-mono text-[#166534] flex items-center bg-mint px-1 py-0.5 rounded">
                        <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 12%
                      </span>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-slate-100 rounded-md border border-slate-200 text-[10px] font-mono text-slate-500">7 DAYS</div>
                </div>
                {/* Chart */}
                <div className="h-16 w-full mb-4">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
                    <line stroke="#f1f5f9" strokeDasharray="2 2" strokeWidth="0.5" x1="0" x2="100" y1="0" y2="0" />
                    <line stroke="#f1f5f9" strokeDasharray="2 2" strokeWidth="0.5" x1="0" x2="100" y1="20" y2="20" />
                    <line stroke="#f1f5f9" strokeDasharray="2 2" strokeWidth="0.5" x1="0" x2="100" y1="40" y2="40" />
                    <polyline fill="none" points="0,35 15,25 30,30 45,15 60,20 75,5 90,12 100,2" stroke="#166534" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    <polygon fill="rgba(22,101,52,0.05)" points="0,35 15,25 30,30 45,15 60,20 75,5 90,12 100,2 100,40 0,40" />
                    <circle fill="#166534" stroke="white" strokeWidth="2" cx="100" cy="2" r="3.5" />
                  </svg>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wide mb-1">Conversion</span>
                    <span className="text-xl font-mono text-slate-900">4.2%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wide mb-1">Avg. Time</span>
                    <span className="text-xl font-mono text-slate-900">1m 42s</span>
                  </div>
                </div>
              </div>

              {/* Match Efficiency */}
              <div className="bg-white border border-neutral-border rounded-md overflow-hidden flex-1 shadow-sm">
                <div className="px-4 py-3 border-b border-neutral-border bg-white">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Match Efficiency</h3>
                </div>
                <div className="p-4 flex flex-col gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Response Rate</span>
                      <span className="text-sm font-mono font-bold text-[#166534]">92.8%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-100">
                      <div className="bg-[#166534] h-full rounded-full" style={{ width: '92.8%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Profile Completion</span>
                      <span className="text-sm font-mono font-bold text-[#166534]">100%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-100">
                      <div className="bg-[#166534] h-full rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Col 3 — Algorithm Criteria */}
            <div className="flex flex-col bg-white border border-neutral-border rounded-md overflow-hidden shadow-sm h-full">
              <div className="px-4 py-3 border-b border-neutral-border bg-white flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Algorithm Criteria</h3>
                <button className="text-xs text-[#166534] font-bold hover:underline">Edit</button>
              </div>
              <div className="p-4 flex flex-col gap-1 flex-1 overflow-y-auto">
                <div className="mb-4">
                  <h4 className="text-[10px] font-mono text-slate-400 uppercase mb-2 font-bold tracking-wider">Location &amp; Budget</h4>
                  <div className="space-y-2">
                    {CRITERIA_LOC.map((c, i) => <CriteriaRow key={i} item={c} />)}
                  </div>
                </div>
                <div className="h-px bg-slate-100 my-1 w-full" />
                <div className="mt-2">
                  <h4 className="text-[10px] font-mono text-slate-400 uppercase mb-2 font-bold tracking-wider">Lifestyle</h4>
                  <div className="space-y-2">
                    {CRITERIA_LIFE.map((c, i) => <CriteriaRow key={i} item={c} />)}
                  </div>
                </div>
              </div>
              {/* Map */}
              <div className="mt-auto border-t border-neutral-border">
                <div className="bg-slate-200 h-36 w-full relative bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer group" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCNYdwaEYN4hF3iKT3tuDfghJa-iH4i_AxQP-auZnUVpJJvXp8wlvsaU95bavc5DNtsrIgCNtgLW_WQ9afdhDgeG4njF3guC1G6PZHxJDQ-EjxVLsXOXQLHtiF1euJ44ZDKW7NgplV94LCGWIGvcxdpHcI62mP1nNcaMZ36yXBvmtzKM1pJ_eJLXOuvPvkx33T1jIE6wvmjFBUz6lA2K81bmKTUx7ZBTznVJKs2CzhfihifxPDcyve1pngA4A7qwpg3UtZ4vQWX9Q')" }}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  <div className="absolute bottom-3 left-3 bg-white px-2 py-1 rounded border border-slate-300 text-[10px] font-mono shadow-sm group-hover:border-[#166534] group-hover:text-[#166534] transition-colors">Radius: 5km</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
