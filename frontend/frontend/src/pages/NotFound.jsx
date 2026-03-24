import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, Search } from 'lucide-react'

import { Button } from '@/components/ui'

const spring = { type: 'spring', stiffness: 300, damping: 30 }

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary-400 rounded-full blur-3xl opacity-10" />
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-accent-400 rounded-full blur-3xl opacity-10" />
      
      <motion.div 
        className="text-center relative z-10 max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        {/* 404 Illustration */}
        <motion.div 
          className="mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ ...spring, delay: 0.1 }}
        >
          <div className="relative inline-block">
            <span className="text-[150px] font-bold text-surface-200 leading-none">404</span>
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-primary-500" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.h1 
          className="text-3xl font-bold text-surface-900 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Page Not Found
        </motion.h1>
        
        <motion.p 
          className="text-surface-600 mb-8 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Oops! The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link to="/">
            <Button className="w-full sm:w-auto gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}