'use client';

import { RoleSwitcher } from './RoleSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import Link from 'next/link';

export function Header() {
  const { user, logout } = useAuth();
  const { currentRole } = useRole();

  return (
    <header className="bg-white border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-accent font-bold text-sm font-display">K</span>
            </div>
            <span className="font-display font-bold text-lg">KURUTA</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Balance */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-background rounded-button">
              <span className="text-sm text-primary/60">Баланс:</span>
              <span className="text-sm font-semibold">1,250 ₽</span>
            </div>

            {/* Role Switcher */}
            <RoleSwitcher />

            {/* User menu */}
            <div className="flex items-center gap-2">
              <div className="text-right hidden md:block">
                <div className="text-sm font-medium">{user?.displayName || user?.email}</div>
                <div className="text-xs text-primary/60">{currentRole}</div>
              </div>
              <button
                onClick={logout}
                className="btn btn-secondary text-sm"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
