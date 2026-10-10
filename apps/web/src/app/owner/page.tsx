'use client';

import { StatsSkeleton } from '@/components/Skeleton';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function OwnerDashboard() {
  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['balance'],
    queryFn: () => api.getBalance(),
  });

  const { data: deals, isLoading: dealsLoading } = useQuery({
    queryKey: ['deals', 'owner'],
    queryFn: () => api.getMyDeals('owner'),
  });

  if (balanceLoading || dealsLoading) {
    return <StatsSkeleton />;
  }

  const activeDeals = deals?.filter((d: any) => d.status === 'in_progress').length || 0;
  const completedDeals = deals?.filter((d: any) => d.status === 'completed').length || 0;
  const totalEarnings = deals
    ?.filter((d: any) => d.status === 'completed')
    .reduce((sum: number, d: any) => sum + Number(d.totalAmount || 0), 0) || 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Дашборд Владельца</h1>
        <p className="text-primary/60">Обзор ваших рекламных мест и сделок</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="text-sm text-primary/60 mb-2">Баланс</div>
          <div className="text-3xl font-bold">{balance?.balance || '0'} ₽</div>
        </div>
        <div className="card">
          <div className="text-sm text-primary/60 mb-2">Активные сделки</div>
          <div className="text-3xl font-bold">{activeDeals}</div>
        </div>
        <div className="card">
          <div className="text-sm text-primary/60 mb-2">Завершённые сделки</div>
          <div className="text-3xl font-bold">{completedDeals}</div>
        </div>
        <div className="card">
          <div className="text-sm text-primary/60 mb-2">Всего заработано</div>
          <div className="text-3xl font-bold">{totalEarnings} ₽</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/owner/slots" className="btn btn-primary">
            📢 Мои рекламные места
          </a>
          <a href="/owner/deals" className="btn btn-secondary">
            📋 Сделки
          </a>
          <a href="/owner/platforms" className="btn btn-secondary">
            🏢 Мои площадки
          </a>
        </div>
      </div>

      {/* Recent Deals */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Последние сделки</h2>
        {deals && deals.length > 0 ? (
          <div className="space-y-3">
            {deals.slice(0, 5).map((deal: any) => (
              <div key={deal.id} className="flex items-center justify-between p-3 border border-border rounded-button">
                <div>
                  <div className="font-medium">{deal.adSlot?.title || 'Рекламное место'}</div>
                  <div className="text-sm text-primary/60">
                    Покупатель: {deal.buyer?.displayName || deal.buyer?.email}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{deal.totalAmount} ₽</div>
                  <span className={`badge ${
                    deal.status === 'completed' ? 'badge-success' :
                    deal.status === 'in_progress' ? 'badge-warning' :
                    'badge-info'
                  }`}>
                    {deal.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-primary/60 text-center py-8">Нет сделок</p>
        )}
      </div>
    </div>
  );
}
