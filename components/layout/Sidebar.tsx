'use client';

import { cn } from '../../lib/utils';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { type ReactNode } from 'react';
import Image from 'next/image';
import GridBackground from '../ui/grid-background';
import { useBackground } from '../../contexts/BackgroundContext';



const HomeIcon = ({ className }: { className?: string }) => (
  <Image
    src="/home-icon.svg"
    alt="Home"
    width={20}
    height={20}
    className={className}
  />
);

const DiscoverIcon = ({ className }: { className?: string }) => (
  <Image
    src="/discover-icon.svg"
    alt="Discover"
    width={20}
    height={20}
    className={className}
  />
);

const LibraryIcon = ({ className }: { className?: string }) => (
  <Image
    src="/library-icon.svg"
    alt="Library"
    width={20}
    height={20}
    className={className}
  />
);

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { showGridBackground } = useBackground();

  const navLinks = [
    {
      icon: HomeIcon,
      href: '/',
      active: pathname === '/' || pathname.startsWith('/search/'),
      label: 'Home',
    },
    {
      icon: DiscoverIcon,
      href: '/discover',
      active: pathname.startsWith('/discover'),
      label: 'Discover',
    },
    {
      icon: LibraryIcon,
      href: '/library',
      active: pathname.startsWith('/library'),
      label: 'Library',
    },
  ];

  return (
    <div className="relative">
      {/* Full Screen Grid Background */}
      {showGridBackground && (
        <div className="fixed inset-0 z-0">
          <GridBackground />
        </div>
      )}
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-[60] lg:flex lg:w-32 lg:flex-col">
        <div className={cn(
          "flex grow flex-col gap-y-6 overflow-y-auto px-2 py-6",
          showGridBackground ? "bg-sidebar/80 backdrop-blur-sm" : "bg-sidebar"
        )}>
          {/* Logo Section */}
          <div className="flex items-center justify-center py-2">
            <Link href="/" className="cursor-pointer">
              <Image
                src="/perplexity-color.svg"
                alt="Perplexity"
                width={60}
                height={60}
                className="flex-shrink-0 hover:opacity-90 transition-opacity"
              />
            </Link>
          </div>
          {/* Navigation Links */}
          <nav className="flex flex-col gap-y-2">
            {navLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className={cn(
                  'relative flex flex-col items-center gap-y-1 w-full py-3 px-2 rounded-xl cursor-pointer hover:bg-sidebar-accent duration-200 transition-all group',
                  link.active
                    ? 'text-sidebar-foreground'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground',
                )}
              >
                <link.icon className={cn(
                  'transition-transform duration-200 flex-shrink-0',
                  link.active ? 'scale-110' : 'group-hover:scale-105'
                )} />
                <span className="text-xs font-medium text-center">{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Profile at bottom */}
          <div className="mt-auto">
            <div className="flex flex-col items-center gap-y-1 w-full py-3 px-2">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                    userButtonPopoverCard: "w-64",
                    userButtonPopoverActions: "flex flex-col gap-2"
                  }
                }}
                showName={false}
              />
              <span className="text-xs font-medium text-sidebar-foreground/70 text-center">Account</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 w-full z-50 flex flex-row items-center gap-x-6 bg-white dark:bg-gray-900 px-4 py-3 shadow-lg lg:hidden border-t border-gray-200 dark:border-gray-700">
        {navLinks.map((link, i) => (
          <Link
            href={link.href}
            key={i}
            className={cn(
              'relative flex flex-col items-center space-y-1 text-center w-full py-2',
              link.active
                ? 'text-sidebar-primary'
                : 'text-sidebar-foreground/60',
            )}
          >
            {link.active && (
              <div className="absolute top-0 -mt-3 h-1 w-8 rounded-b-lg bg-sidebar-primary" />
            )}
            <link.icon className={cn(
              'transition-transform duration-200',
              link.active ? 'scale-110' : ''
            )} />
            <p className="text-xs font-medium">{link.label}</p>
          </Link>
        ))}
      </div>

      {/* Main Content with Layout */}
      <main className={cn(
        "lg:pl-32 min-h-screen pb-20 lg:pb-0 relative z-10",
        showGridBackground ? "bg-transparent" : ""
      )} style={showGridBackground ? {} : { backgroundColor: '#fcfcf9' }}>
        <div className="max-w-screen-lg lg:mx-auto mx-4">{children}</div>
      </main>
    </div>
  );
};

export default Sidebar;