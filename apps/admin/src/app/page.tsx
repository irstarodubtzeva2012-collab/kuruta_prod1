'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import Link from 'next/link';

interface Stats {
  pendingModeration: number;
  activeDisputes: number;
  pendingPayouts: number;
  antiFraudSignals: number;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentQueue, setRecentQueue] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadStats();
      loadRecentQueue();
    }
  }, [user, loading]);

  const loadStats = async () => {
    try {
      const [queue, disputes, payouts, signals] = await Promise.all([
        apiClient.getModerationQueue({ status: 'pending', limit: 1000 }),
        apiClient.getDisputes('opened'),
        apiClient.getPayoutRequests('requested'),
        apiClient.getAntiFraudSignals({ status: 'pending' }),
      ]);

      setStats({
        pendingModeration: queue.total,
        activeDisputes: disputes.length,
        pendingPayouts: payouts.length,
        antiFraudSignals: signals.total,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadRecentQueue = async () => {
    try {
      const queue = await apiClient.getModerationQueue({ limit: 5 });
      setRecentQueue(queue.items);
    } catch (error) {
      console.error('Failed to load queue:', error);
    }
  };

  if (loading || !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
            Добро пожаловать, {user.displayName || user.email}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Роли: {user.roles.join(', ')}
          </p>
        </div>
        <button
          onClick={() => {
            useAuth().logout();
            router.push('/login');
          }}
          className="btn btn-secondary"
        >
          Выйти
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <Link href="/moderation" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Очередь модерации
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--primary)' }}>
                {stats.pendingModeration}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Ожидают проверки
              </div>
            </div>
          </Link>

          <Link href="/disputes" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Активные споры
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--error)' }}>
                {stats.activeDisputes}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Требуют разрешения
              </div>
            </div>
          </Link>

          <Link href="/finance/payouts" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Заявки на вывод
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--warning)' }}>
                {stats.pendingPayouts}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Ожидают обработки
              </div>
            </div>
          </Link>

          <Link href="/anti-fraud" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Антифрод сигналы
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--info)' }}>
                {stats.antiFraudSignals}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Требуют проверки
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <Link href="/moderation" className="btn btn-primary" style={{ justifyContent: 'center' }}>
          Модерация
        </Link>
        <Link href="/disputes" className="btn btn-primary" style={{ justifyContent: 'center' }}>
          Споры
        </Link>
        <Link href="/finance/payouts" className="btn btn-primary" style={{ justifyContent: 'center' }}>
          Выплаты
        </Link>
        <Link href="/anti-fraud" className="btn btn-primary" style={{ justifyContent: 'center' }}>
          Антифрод
        </Link>
        <Link href="/users" className="btn btn-primary" style={{ justifyContent: 'center' }}>
          Пользователи
        </Link>
      </div>

      {/* Recent Queue */}
      <div className="card">
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
          Последние задачи в очереди
        </h2>
        {recentQueue.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>Очередь пуста</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Тип</th>
                <th>Entity ID</th>
                <th>Статус</th>
                <th>Приоритет</th>
                <th>Создано</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {recentQueue.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="badge badge-info">{item.entityType}</span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    {item.entityId.substring(0, 8)}...
                  </td>
                  <td>
                    <span className={`badge ${
                      item.status === 'pending' ? 'badge-warning' :
                      item.status === 'approved' ? 'badge-success' :
                      item.status === 'rejected' ? 'badge-error' : 'badge-neutral'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.priority}</td>
                  <td>{new Date(item.createdAt).toLocaleString('ru-RU')}</td>
                  <td>
                    <Link href={`/moderation/${item.id}`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      Открыть
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
