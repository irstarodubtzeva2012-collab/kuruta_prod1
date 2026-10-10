'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import Link from 'next/link';

export default function Disputes() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [disputes, setDisputes] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('opened');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadDisputes();
    }
  }, [user, loading, statusFilter]);

  const loadDisputes = async () => {
    setLoadingData(true);
    try {
      const data = await apiClient.getDisputes(statusFilter || undefined);
      setDisputes(data);
    } catch (error) {
      console.error('Failed to load disputes:', error);
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
            Споры
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Управление спорами между пользователями
          </p>
        </div>
        <Link href="/" className="btn btn-secondary">
          ← Назад
        </Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div>
          <label className="form-label">Статус</label>
          <select
            className="form-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ maxWidth: '300px' }}
          >
            <option value="opened">Открытые</option>
            <option value="investigating">На рассмотрении</option>
            <option value="resolved_creator">Разрешены (в пользу креатора)</option>
            <option value="resolved_executor">Разрешены (в пользу исполнителя)</option>
            <option value="resolved_partial">Разрешены (частично)</option>
            <option value="closed">Закрытые</option>
            <option value="">Все</option>
          </select>
        </div>
      </div>

      {/* Disputes Table */}
      <div className="card">
        {loadingData ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner"></div>
          </div>
        ) : disputes.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
            Споры не найдены
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Тип</th>
                <th>Статус</th>
                <th>Причина</th>
                <th>Открыт</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((dispute) => (
                <tr key={dispute.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    {dispute.id.substring(0, 8)}...
                  </td>
                  <td>
                    <span className="badge badge-info">{dispute.relatedType}</span>
                  </td>
                  <td>
                    <span className={`badge ${
                      dispute.status === 'opened' ? 'badge-warning' :
                      dispute.status === 'investigating' ? 'badge-info' :
                      dispute.status.startsWith('resolved') ? 'badge-success' :
                      dispute.status === 'closed' ? 'badge-neutral' : 'badge-neutral'
                    }`}>
                      {dispute.status}
                    </span>
                  </td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {dispute.reason}
                  </td>
                  <td>{new Date(dispute.createdAt).toLocaleString('ru-RU')}</td>
                  <td>
                    <Link
                      href={`/disputes/${dispute.id}`}
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
