import { useAuth0 } from '@auth0/auth0-react'
// framer-motion available for future animations
import { 
  CheckCircle, 
  User, 
  Heart, 
  MessageCircle, 
  IdCard, 
  Shield, 
  Users,
  ArrowRight,
  Sparkles,
  Home,
  Star
} from 'lucide-react'
import { Navbar } from '../components/layout/Navbar'
import { Button } from '../components/ui'

// Spring animation config
const spring = { type: 'spring', stiffness: 300, damping: 30 }

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: spring }
}

export default function Landing() {
  const { loginWithRedirect } = useAuth0()

  const steps = [
    { icon: User, title: 'Create Profile', desc: 'Share your lifestyle, budget & preferences', color: 'primary' },
    { icon: Heart, title: 'Get Matched', desc: 'Our algorithm finds compatible roommates', color: 'accent' },
    { icon: MessageCircle, title: 'Connect', desc: 'Chat and find your perfect fit', color: 'success' }
  ]

  const trust = [
    { icon: IdCard, title: 'ID Verified', desc: 'All users verify identity before matching' },
    { icon: Shield, title: 'Background Checks', desc: 'Optional checks for peace of mind' },
    { icon: Users, title: 'Social Proof', desc: 'Link social accounts to build trust' }
  ]

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary-400 rounded-full blur-3xl opacity-20 -z-10" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-400 rounded-full blur-3xl opacity-15 -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left - Content */}
            <motion.div 
              className="space-y-8"
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>10,000+ roommates matched</span>
              </motion.div>

              <motion.h1 
                variants={fadeUp}
                className="text-5xl lg:text-6xl font-bold text-surface-900 leading-tight"
              >
                Find Your
                <span className="block text-primary-500">Perfect Roommate</span>
              </motion.h1>
              
              <motion.p variants={fadeUp} className="text-xl text-surface-600 max-w-lg leading-relaxed">
                Match with verified roommates who share your lifestyle and budget. No more awkward Craigslist posts.
              </motion.p>
              
              <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })}
                  className="group"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  See How It Works
                </Button>
              </motion.div>
              
              <motion.div variants={fadeUp} className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2 text-surface-600">
                  <CheckCircle className="w-5 h-5 text-success-500" />
                  <span>Free to join</span>
                </div>
                <div className="flex items-center gap-2 text-surface-600">
                  <CheckCircle className="w-5 h-5 text-success-500" />
                  <span>Verified profiles</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right - Card Preview */}
            <motion.div 
              className="hidden lg:block relative"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, delay: 0.4 }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-linear-to-br from-primary-400 to-accent-500 rounded-3xl blur-3xl opacity-25 scale-95" />
              
              {/* Main card */}
              <motion.div 
                className="relative bg-white rounded-3xl shadow-xl p-6 border border-surface-200"
                whileHover={{ y: -8 }}
                transition={spring}
              >
                {/* Profile header */}
                <div className="flex items-center gap-4 mb-5">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face" 
                    alt="Profile"
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-surface-900">Sarah M.</h3>
                      <span className="px-2 py-0.5 bg-success-100 text-success-700 rounded-full text-xs font-medium">Verified</span>
                    </div>
                    <p className="text-surface-500 text-sm">San Francisco, CA</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-500">94%</div>
                    <div className="text-xs text-surface-500">Match</div>
                  </div>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {['Early Bird', 'Non-Smoker', 'Pet Lover', 'Clean'].map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-surface-100 text-surface-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* Budget */}
                <div className="flex items-center justify-between py-4 border-t border-surface-100">
                  <div>
                    <div className="text-sm text-surface-500">Monthly Budget</div>
                    <div className="text-lg font-semibold text-surface-900">$800 - $1,200</div>
                  </div>
                  <Button size="sm">View Profile</Button>
                </div>

                {/* Floating cards */}
                <motion.div 
                  className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-3 border border-surface-100"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-primary-500" />
                    <span className="text-sm font-medium">3 new matches!</span>
                  </div>
                </motion.div>

                <motion.div 
                  className="absolute -bottom-3 -left-3 bg-white rounded-xl shadow-lg px-3 py-2 border border-surface-100"
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={spring}
          >
            <h2 className="text-4xl font-bold text-surface-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-surface-600 max-w-2xl mx-auto">
              Find your ideal roommate in three simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                className="relative text-center p-8 rounded-3xl bg-surface-50 hover:bg-white hover:shadow-xl transition-all duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.1 }}
                whileHover={{ y: -8 }}
              >
                {/* Step number */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-200 text-surface-500 flex items-center justify-center text-sm font-bold group-hover:bg-primary-500 group-hover:text-white transition-colors">
                  {i + 1}
                </div>
                
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
                  step.color === 'primary' ? 'bg-primary-100' :
                  step.color === 'accent' ? 'bg-accent-100' : 'bg-success-100'
                }`}>
                  <step.icon className={`w-8 h-8 ${
                    step.color === 'primary' ? 'text-primary-600' :
                    step.color === 'accent' ? 'text-accent-600' : 'text-success-600'
                  }`} />
                </div>
                <h3 className="text-xl font-semibold text-surface-900 mb-2">{step.title}</h3>
                <p className="text-surface-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-24 bg-surface-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={spring}
          >
            <h2 className="text-4xl font-bold text-surface-900 mb-4">
              Safety First
            </h2>
            <p className="text-xl text-surface-600 max-w-2xl mx-auto">
              Every user goes through our verification process
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {trust.map((item, i) => (
              <motion.div
                key={item.title}
                className="bg-white p-8 rounded-3xl shadow-sm border border-surface-100 hover:shadow-xl hover:border-primary-200 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <div className="w-14 h-14 mb-6 bg-primary-100 rounded-2xl flex items-center justify-center">
                  <item.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-surface-900 mb-2">{item.title}</h3>
                <p className="text-surface-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary-600">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={spring}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Find Your Roommate?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of people who found their perfect living situation through Flately.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })}
              className="bg-white text-primary-600 hover:bg-surface-100"
            >
              Get Started — It's Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-surface-900 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">F</span>
                </div>
                <span className="text-xl font-bold text-white">Flately</span>
              </div>
              <p className="text-surface-400 text-sm">
                Find your perfect roommate with verified profiles and smart matching.
              </p>
            </div>
            
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'FAQ'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies'] }
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-white font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-surface-400 hover:text-white transition-colors text-sm">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="pt-8 border-t border-surface-800 text-center">
            <p className="text-surface-500 text-sm">© 2026 Flately. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
