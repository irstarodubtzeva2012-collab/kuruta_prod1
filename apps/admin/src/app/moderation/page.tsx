'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import Link from 'next/link';

export default function ModerationQueue() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [queue, setQueue] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    entityType: '',
    status: 'pending',
  });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadQueue();
    }
  }, [user, loading, filters]);

  const loadQueue = async () => {
    setLoadingData(true);
    try {
      const response = await apiClient.getModerationQueue(filters);
      setQueue(response.items);
    } catch (error) {
      console.error('Failed to load queue:', error);
    } finally {
      setLoadingData(false);
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
            Очередь модерации
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Управление задачами на проверке
          </p>
        </div>
        <Link href="/" className="btn btn-secondary">
          ← Назад
        </Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label className="form-label">Тип сущности</label>
            <select
              className="form-input"
              value={filters.entityType}
              onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
            >
              <option value="">Все</option>
              <option value="campaign">Кампании</option>
              <option value="task">Задания</option>
              <option value="ad_slot">Рекламные места</option>
              <option value="deal">Сделки</option>
              <option value="dispute">Споры</option>
              <option value="ambassador_verification">Верификация</option>
              <option value="anti_fraud">Антифрод</option>
            </select>
          </div>

          <div>
            <label className="form-label">Статус</label>
            <select
              className="form-input"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="pending">Ожидают</option>
              <option value="in_progress">В работе</option>
              <option value="approved">Одобрены</option>
              <option value="rejected">Отклонены</option>
              <option value="">Все</option>
            </select>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="card">
        {loadingData ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner"></div>
          </div>
        ) : queue.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
            Очередь пуста
          </p>
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
              {queue.map((item) => (
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
                      item.status === 'in_progress' ? 'badge-info' :
                      item.status === 'approved' ? 'badge-success' :
                      item.status === 'rejected' ? 'badge-error' : 'badge-neutral'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.priority}</td>
                  <td>{new Date(item.createdAt).toLocaleString('ru-RU')}</td>
                  <td>
                    <Link
                      href={`/moderation/${item.id}`}
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
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
