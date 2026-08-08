import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './dashboard.css';

export const DashboardLayout = ({ children, title = 'Dashboard', rightSidebar = null }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="dashboard-shell">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="dashboard-main">
        <Topbar
          title={title}
          onMenuToggle={() => setMobileOpen(!mobileOpen)}
        />

        <main className="dashboard-viewport">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`dashboard-content-layout ${rightSidebar ? 'has-right-sidebar' : ''}`}
          >
            <div className="dashboard-primary-content">
              {children}
            </div>

            {rightSidebar && (
              <aside className="dashboard-right-sidebar">
                {rightSidebar}
              </aside>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
