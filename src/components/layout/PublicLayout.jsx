import React from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';

/**
 * PublicLayout — Wraps all public-facing pages with Navbar + Footer.
 * All public pages should use this to ensure consistency.
 * Dashboard pages use DashboardLayout instead.
 */
const PublicLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="page-main">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default PublicLayout;
