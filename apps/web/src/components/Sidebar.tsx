'use client';

import { useRole } from '@/contexts/RoleContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const { currentRole } = useRole();
  const pathname = usePathname();

  const getNavigation = () => {
    switch (currentRole) {
      case 'creator':
        return [
          { name: 'Дашборд', href: '/creator', icon: '📊' },
          { name: 'Каталог', href: '/creator/catalog', icon: '🛒' },
          { name: 'Мои сделки', href: '/creator/deals', icon: '📋' },
          { name: 'Баланс', href: '/creator/balance', icon: '💰' },
        ];
      case 'ambassador':
        return [
          { name: 'Дашборд', href: '/ambassador', icon: '📊' },
          { name: 'Доступные задания', href: '/ambassador/tasks', icon: '✅' },
          { name: 'Мои задания', href: '/ambassador/my-tasks', icon: '📝' },
          { name: 'Баланс', href: '/ambassador/balance', icon: '💰' },
        ];
      case 'owner':
        return [
          { name: 'Дашборд', href: '/owner', icon: '📊' },
          { name: 'Мои площадки', href: '/owner/platforms', icon: '🏢' },
          { name: 'Рекламные места', href: '/owner/slots', icon: '📢' },
          { name: 'Сделки', href: '/owner/deals', icon: '📋' },
          { name: 'Баланс', href: '/owner/balance', icon: '💰' },
        ];
      default:
        return [];
    }
  };

  const navigation = getNavigation();

  return (
    <aside className="w-64 bg-white border-r border-border min-h-screen p-4">
      <nav className="space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-button text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-primary hover:bg-background'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
