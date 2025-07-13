'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

const ConditionalLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  
  // Check if current page is an authentication page
  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');
  
  if (isAuthPage) {
    // For auth pages, render children without sidebar
    return (
      <main className="min-h-screen" style={{ backgroundColor: '#fcfcf9' }}>
        {children}
      </main>
    );
  }
  
  // For all other pages, render with sidebar
  return <Sidebar>{children}</Sidebar>;
};

export default ConditionalLayout;