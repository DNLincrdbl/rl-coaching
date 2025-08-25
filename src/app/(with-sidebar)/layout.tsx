'use client';

import React from 'react';
import { FaChartLine, FaBook, FaCog } from 'react-icons/fa';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProfileMenu from '@/components/dashboard/ProfileMenu';

const menuItems = [
  {
    icon: FaChartLine,
    label: 'Statisztikák',
    href: '/dashboard',
  },
  {
    icon: FaBook,
    label: 'Kurzusok',
    href: '/courses',
  },
  {
    icon: FaCog,
    label: 'Beállítások',
    href: '/dashboard/settings',
  },
];

export default function WithSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0A0F1C]">
      {/* Fejléc */}
      <header className="fixed top-0 left-0 right-0 bg-[#0A0F1C]/50 backdrop-blur-lg border-b border-white/10 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="text-xl font-bold text-white">
              RL Coaching
            </Link>
            <ProfileMenu />
          </div>
        </div>
      </header>

      {/* Oldalsáv */}
      <aside className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-[#0A0F1C]/50 backdrop-blur-lg border-r border-white/10">
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Fő tartalom */}
      <main className="pt-16 pl-64">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
} 