// @ts-nocheck
import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { apiRequest } from '@/services/api'

const DEMO_PROFILES = [
  { id: '1', name: 'Alex Chen', age: 26, occupation: 'UX Designer', score: 92, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBl8S4G5HYkQXeUmvA0eG5nQZm4zRRGdvYf9ZcGLMyH2oFBsO2matVvTI0xpitgvkp2wKE1TIa6spbG-A8LVOciFbNKQraztVsts0HYDEcOeSLQVZ0YYPYFlYv8GBiny8jYTWpEtS7OWP9b16hJiYiyDmxfVT831EccAIXqpe_UnoGPL3QJV3BX_YLXpmsv6TTT0tVMJNbAQpVXncvm1yFrFnzPXEUQqxSiXXjcs0M1725LbqSYCTPONH2Eo-uZBKYuzT4e0_QYpg', bio: 'Quiet professional looking for a clean, modern space. I work from home 2 days a week and usually spend weekends hiking or at coffee shops. Early riser, respectful of boundaries, and always pay rent on time.', budget: '$1,200 - $1,500', moveIn: 'Oct 1st, 2023', duration: '12 Months+', location: 'Williamsburg', city: 'Brooklyn, NY', school: 'NYU', tags: ['Vegetarian', 'Early Bird', 'Board Games', 'Cyclist'], cleanliness: 3, guests: 'RARELY', pets: 'NONE', smoking: 'NEVER' },
  { id: '2', name: 'Sarah Jones', age: 28, occupation: 'Architect', score: 88, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQT-8dVxzTk03islnxYTEvFJT7RX4HG1DBc16SJMm7pviHawOUO8OeZlJPNig-jgl5XL49hj5gN5Fw4D-8S_yuRcqVT1ioXMF5FCNfs-vMpzwilIgwlwiciLHiEpN8hxu6NddWA16tNcK0SRKBgVULQMYTI-CIaldyzvhlGYFztjDE6RdPixRSZ5lTu7u_3tOk_7oteQELQvnZHnWjnRAZspxca93LNJHmYfAQul9JIdSgGVLF84kxBSZc-0H-jP5fVmtAkgPlrw' },
  { id: '3', name: 'Mike Ross', age: 31, occupation: 'Software Engineer', score: 85, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsxI_wJveLVo1DqbElkBnjKCS4iI9BublEUTeeHdpUjY20zlYH8EahSikYGmfN21hwxWaR4ogSj7It00ec_1jAAlLeOOiFqdVLXm8uBPq9hjFduUd5r2cPeETfHWsW0-xdB4uIunVSPurZk1QNQTvtzi9pzrV7xsTOpKTpWw_FtVL-3WxunyTN3LuCxVkhcidYdorZzrGskuADwfd_oqcybE2-T62jLD9UI-uFEQNAWvdh0yVwokDOpcICZJ8s9cv4Ison3fGQSQ' },
  { id: '4', name: 'Emily Blunt', age: 25, occupation: 'Marketing', score: 82, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAq41sfGKXQEkE467XcmYd93FqtXSmHWfQpCPH32LfF3xaxMmKNe2vcWyh_ZdCY3MEq8hlqU1ndVotVCyZe-8Kyr75tsQmPDf5LqKXRTsdJghYmpIVzOIz6bwKX-crRCroNW52QPFIh9dCoH-Qz13e_LLyVg5J14c4U4e1oVDy_3_LeqZu6_ufnctmxtMWU9QImCz79q3uCvdprruRlhaKcuDIRECbLi5VQ8efgDT2DliRdzOLKsj-veka33ErkxkheRo4z-_Wrg' },
  { id: '5', name: 'David Kim', age: 29, occupation: 'Chef', score: 79, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcdg6B-rya0JwR7nG8lU0w9f9yWOxsegF-FCKB6y3Tsn2CawL_3f9uIOIodcZnTdqmw6pLVeOFbVm1TBCiHmtwUaHD4E9fIz_lPiaDuA0duOCaxVj4PC5f5XlncKCmXyKLzFXBIZhqzGtpF3P5fQk5kG5NlBzgsfOMe3op8_d-JHKzrg0J1pEZziXMzHMK-xtdQbqIUH8LAQ2tNxaoTSglvm3lhubxoGEa3BTKdO71-lkDEItE4nDcemLOc-Y8TVwnwg8giGVQiw' },
]

export default function DiscoveryPage() {
  const { getAccessTokenSilently } = useAuth0()
  const [profiles, setProfiles] = useState(DEMO_PROFILES)
  const [selectedId, setSelectedId] = useState(DEMO_PROFILES[0].id)
  const selected = profiles.find(p => p.id === selectedId) || profiles[0]

  useEffect(() => {
    let isMounted = true
    apiRequest('/discovery', {}, getAccessTokenSilently)
      .then(data => { if (isMounted && data?.length > 0) setProfiles(data) })
      .catch(() => {})
    return () => { isMounted = false }
  }, [getAccessTokenSilently])

  const handlePass = () => { setProfiles(profiles.filter(p => p.id !== selectedId)); setSelectedId(profiles[1]?.id || '') }
  const handleConnect = async () => {
    try { await apiRequest(`/matches/connect/${selectedId}`, { method: 'POST' }, getAccessTokenSilently) } catch {}
    handlePass()
  }

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* Queue Panel */}
      <section className="w-[360px] flex flex-col bg-white border-r border-neutral-200 overflow-hidden shrink-0">
        <div className="p-4 border-b border-neutral-200 space-y-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[20px]">search</span>
            <input className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534] placeholder:text-gray-400 font-mono transition-shadow" placeholder="Search criteria..." type="text" />
          </div>
          <div className="flex items-center justify-between pt-1">
            <h3 className="font-bold text-[11px] tracking-wider text-gray-500 uppercase">Queue ({profiles.length})</h3>
            <button className="flex items-center gap-1 text-[11px] font-bold uppercase text-gray-500 hover:text-[#166534] transition-colors">
              <span className="material-symbols-outlined text-[16px]">tune</span> Filters
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {profiles.map((p, i) => (
            <div key={p.id} onClick={() => setSelectedId(p.id)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer relative group transition-all ${
                p.id === selectedId ? 'bg-mint border border-[#166534] shadow-sm' : 'border border-transparent hover:border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              {p.id === selectedId && <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#166534] rounded-r" />}
              <div className={`bg-center bg-no-repeat bg-cover rounded-full size-11 shrink-0 border transition-all ${
                p.id === selectedId ? 'border-[#166534]/20' : 'border-neutral-200 grayscale group-hover:grayscale-0'
              }`} style={{ backgroundImage: `url('${p.img}')` }} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className={`text-sm truncate ${p.id === selectedId ? 'font-bold text-neutral-900' : 'font-medium text-neutral-900'}`}>{p.name}</p>
                  <span className={`font-mono text-xs ${p.id === selectedId ? 'text-[#166534] font-bold' : 'text-gray-400 font-medium'}`}>{p.score}%</span>
                </div>
                <p className={`text-xs truncate mt-0.5 font-mono ${p.id === selectedId ? 'text-[#166534]/70' : 'text-gray-500'}`}>{p.occupation} • {p.age}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Profile Detail */}
      <section className="flex-1 flex flex-col bg-white relative overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto w-full p-8 pb-32">
            <div className="flex gap-8 mb-10">
              <div className="shrink-0">
                <div className="bg-center bg-no-repeat bg-cover rounded-lg size-32 border border-neutral-200" style={{ backgroundImage: `url('${selected.img}')` }} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start border-b border-neutral-200 pb-6 mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">{selected.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm font-mono">
                      <span className="flex items-center gap-1.5 text-neutral-800"><span className="material-symbols-outlined text-[18px]">cake</span> {selected.age}</span>
                      <span className="w-px h-4 bg-neutral-300" />
                      <span className="flex items-center gap-1.5 text-neutral-800"><span className="material-symbols-outlined text-[18px]">work</span> {selected.occupation}</span>
                      {selected.school && <><span className="w-px h-4 bg-neutral-300" /><span className="flex items-center gap-1.5 text-neutral-800"><span className="material-symbols-outlined text-[18px]">school</span> {selected.school}</span></>}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Compatibility</span>
                    <div className="font-mono text-4xl font-bold text-[#166534] tracking-tighter">{selected.score}%</div>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm max-w-2xl font-medium">{selected.bio || 'Looking for a clean, respectful roommate to share a great space.'}</p>
                {selected.tags && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {selected.tags.map(t => <span key={t} className="inline-flex items-center rounded-lg border border-neutral-200 px-3 py-1 text-xs font-semibold text-gray-600 bg-neutral-50 font-mono">{t}</span>)}
                  </div>
                )}
              </div>
            </div>

            {/* Data Grid */}
            <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
              <div className="grid grid-cols-2">
                <div className="p-8 border-b border-r border-neutral-200">
                  <div className="flex items-center gap-2 mb-4 text-gray-400 uppercase tracking-widest text-[10px] font-bold">
                    <span className="material-symbols-outlined text-[16px]">payments</span> Monthly Budget
                  </div>
                  <div className="font-mono text-2xl font-bold text-neutral-900">{selected.budget || '$1,000 - $1,500'}<span className="text-lg text-gray-400 font-normal">/mo</span></div>
                  <div className="mt-4"><span className="inline-flex items-center rounded border border-[#166534]/20 px-2 py-1 text-[10px] font-bold text-[#166534] bg-mint uppercase tracking-wide">Includes Utilities</span></div>
                </div>
                <div className="p-8 border-b border-neutral-200">
                  <div className="flex items-center gap-2 mb-4 text-gray-400 uppercase tracking-widest text-[10px] font-bold">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span> Timeline
                  </div>
                  <div className="grid gap-4">
                    <div className="flex justify-between items-baseline border-b border-dashed border-neutral-200 pb-2">
                      <span className="text-sm text-gray-500 font-medium">Move-in</span>
                      <span className="font-mono text-lg font-bold text-neutral-900">{selected.moveIn || 'Flexible'}</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-sm text-gray-500 font-medium">Duration</span>
                      <span className="font-mono text-sm font-bold text-neutral-900">{selected.duration || '6+ Months'}</span>
                    </div>
                  </div>
                </div>
                <div className="p-8 border-r border-neutral-200 bg-neutral-50/30">
                  <div className="flex items-center gap-2 mb-6 text-gray-400 uppercase tracking-widest text-[10px] font-bold">
                    <span className="material-symbols-outlined text-[16px]">home_health</span> Lifestyle
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 font-medium">Cleanliness</span>
                      <div className="flex gap-1">{[1,2,3,4].map(i => <div key={i} className={`w-6 h-1.5 rounded-sm ${i <= (selected.cleanliness || 3) ? 'bg-[#166534]' : 'bg-neutral-200'}`} />)}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 font-medium">Guests</span>
                      <span className="font-mono text-[10px] font-bold border border-neutral-200 bg-white px-2 py-0.5 rounded text-gray-600">{selected.guests || 'SOMETIMES'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 font-medium">Pets</span>
                      <span className="font-mono text-[10px] font-bold border border-neutral-200 bg-white px-2 py-0.5 rounded text-gray-600">{selected.pets || 'NONE'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 font-medium">Smoking</span>
                      <span className="font-mono text-[10px] font-bold border border-neutral-200 bg-white px-2 py-0.5 rounded text-gray-600">{selected.smoking || 'NEVER'}</span>
                    </div>
                  </div>
                </div>
                <div className="relative h-full min-h-[200px] group overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCu7x3ZCH9-wPrGGOZDBkib3Ua9q42BmmEqZ_7LZUhFbLncEwbdVropNGXiYNPNYTv4CpOqIAy5jZI5i4mWSuVEzlk7-_6OgHbUTuRy3HVKb2evj5kq937BD7WZAm038HgRR9HznMTBxft20C80ZbKW1nufEPPEMBPZJPxmUx_noTYTAXdKh05ndJVf21qWVMvaRR39R7aHN1uhumyA7p4otpmRr7NTvMcMdr8scJfEns9gd_YASJrP1Z0XYNsi7fEjxqpk0cRePg')" }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/40 to-transparent p-6 flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-1 text-white/90 uppercase tracking-widest text-[10px] font-bold">
                      <span className="material-symbols-outlined text-[14px]">location_on</span> Preferred Area
                    </div>
                    <p className="text-white font-bold text-lg tracking-tight">{selected.location || 'Downtown'}</p>
                    <p className="text-white/80 text-xs font-mono mt-1">{selected.city || 'New York, NY'} • +2mi radius</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-neutral-200 p-4 md:px-8 md:py-5 flex justify-between items-center z-20">
          <div className="flex items-center gap-3 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
            <button className="flex items-center gap-1 hover:text-[#166534] transition-colors py-2 px-3 hover:bg-neutral-50 rounded">
              <span className="border border-gray-300 rounded w-5 h-5 flex items-center justify-center text-xs">←</span> Prev
            </button>
            <div className="h-4 w-px bg-neutral-200" />
            <button className="flex items-center gap-1 hover:text-[#166534] transition-colors py-2 px-3 hover:bg-neutral-50 rounded">
              Next <span className="border border-gray-300 rounded w-5 h-5 flex items-center justify-center text-xs">→</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handlePass} className="h-12 px-8 rounded-lg border-2 border-neutral-200 text-neutral-900 font-bold hover:bg-neutral-50 transition-colors uppercase tracking-wide text-xs flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">close</span> Pass
            </button>
            <button onClick={handleConnect} className="h-12 px-8 rounded-lg bg-[#166534] text-white font-bold hover:bg-[#14532d] transition-colors uppercase tracking-wide text-xs shadow-sm flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check</span> Connect
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
