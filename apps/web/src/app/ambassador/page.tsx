'use client';

import { StatsSkeleton } from '@/components/Skeleton';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function AmbassadorDashboard() {
  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['balance'],
    queryFn: () => api.getBalance(),
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => api.getMyTasks(),
  });

  if (balanceLoading || tasksLoading) {
    return <StatsSkeleton />;
  }

  const activeTasks = tasks?.filter((t: any) => t.status === 'in_progress').length || 0;
  const completedTasks = tasks?.filter((t: any) => t.status === 'approved').length || 0;
  const totalEarnings = tasks
    ?.filter((t: any) => t.status === 'approved')
    .reduce((sum: number, t: any) => sum + Number(t.campaign?.taskReward || 0), 0) || 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Дашборд Амбассадора</h1>
        <p className="text-primary/60">Обзор вашей активности</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="text-sm text-primary/60 mb-2">Баланс</div>
          <div className="text-3xl font-bold">{balance?.balance || '0'} ₽</div>
        </div>
        <div className="card">
          <div className="text-sm text-primary/60 mb-2">Активные задания</div>
          <div className="text-3xl font-bold">{activeTasks}</div>
        </div>
        <div className="card">
          <div className="text-sm text-primary/60 mb-2">Завершённые</div>
          <div className="text-3xl font-bold">{completedTasks}</div>
        </div>
        <div className="card">
          <div className="text-sm text-primary/60 mb-2">Всего заработано</div>
          <div className="text-3xl font-bold">{totalEarnings} ₽</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/ambassador/tasks" className="btn btn-primary">
            ✅ Доступные задания
          </a>
          <a href="/ambassador/my-tasks" className="btn btn-secondary">
            📝 Мои задания
          </a>
        </div>
      </div>

      {/* Active Tasks */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Активные задания</h2>
        {tasks && tasks.filter((t: any) => t.status === 'in_progress').length > 0 ? (
          <div className="space-y-3">
            {tasks
              .filter((t: any) => t.status === 'in_progress')
              .slice(0, 5)
              .map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-3 border border-border rounded-button">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-primary/60">
                      {task.campaign?.title}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{task.campaign?.taskReward} ₽</div>
                    <span className="badge badge-warning">В работе</span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-primary/60 text-center py-8">Нет активных заданий</p>
        )}
      </div>
    </div>
  );
}
