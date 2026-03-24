import { useState } from 'react'
import { Outlet } from 'react-router-dom'
// framer-motion available for future animations

import { AppSidebar } from '../components/layout/AppSidebar'

const spring = { type: 'spring', stiffness: 300, damping: 30 }

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Sidebar */}
      <AppSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      {/* Main Content */}
      <motion.main
        className="min-h-screen"
        initial={false}
        animate={{ 
          marginLeft: sidebarCollapsed ? 80 : 256,
          paddingTop: 0
        }}
        transition={spring}
      >
        <Outlet />
      </motion.main>
    </div>
  )
}