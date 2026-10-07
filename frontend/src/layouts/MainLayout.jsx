import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--md-sys-color-background)] text-[var(--md-sys-color-on-background)] transition-colors">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
