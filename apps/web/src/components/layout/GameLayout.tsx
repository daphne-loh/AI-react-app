import React from 'react';
import MainNavigation from './MainNavigation';

interface GameLayoutProps {
  children: React.ReactNode;
}

const GameLayout: React.FC<GameLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-gray-50 flex flex-col overflow-hidden">
      <MainNavigation />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};

export default GameLayout;