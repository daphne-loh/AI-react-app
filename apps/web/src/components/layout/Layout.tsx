import React from 'react';
import MainNavigation from './MainNavigation';
import Breadcrumb from './Breadcrumb';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainNavigation />
      <Breadcrumb />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;