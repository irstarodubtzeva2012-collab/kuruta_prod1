'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import Link from 'next/link';

export default function Payouts() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [payouts, setPayouts] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('requested');
  const [loadingData, setLoadingData] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadPayouts();
    }
  }, [user, loading, statusFilter]);

  const loadPayouts = async () => {
    setLoadingData(true);
    try {
      const data = await apiClient.getPayoutRequests(statusFilter || undefined);
      setPayouts(data);
    } catch (error) {
      console.error('Failed to load payouts:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleComplete = async (payoutId: string) => {
    if (!confirm('Подтвердить выплату?')) return;

    setProcessing(payoutId);
    try {
      await apiClient.completePayout(payoutId);
      alert('Выплата подтверждена');
      loadPayouts();
    } catch (error: any) {
      alert(error.message || 'Ошибка подтверждения');
    } finally {
      setProcessing(null);
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
            Заявки на вывод
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Управление выплатами пользователям
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
            <option value="requested">Ожидают обработки</option>
            <option value="checking">На проверке</option>
            <option value="processing">В обработке</option>
            <option value="paid">Выплачены</option>
            <option value="error">С ошибкой</option>
            <option value="cancelled">Отменены</option>
            <option value="">Все</option>
          </select>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="card">
        {loadingData ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner"></div>
          </div>
        ) : payouts.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
            Заявки не найдены
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Сумма</th>
                <th>Метод</th>
                <th>Статус</th>
                <th>Дата</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    {payout.id.substring(0, 8)}...
                  </td>
                  <td style={{ fontWeight: '600' }}>
                    {Number(payout.amount).toLocaleString('ru-RU')} ₽
                  </td>
                  <td>
                    <span className="badge badge-info">{payout.paymentMethod}</span>
                  </td>
                  <td>
                    <span className={`badge ${
                      payout.status === 'requested' ? 'badge-warning' :
                      payout.status === 'processing' ? 'badge-info' :
                      payout.status === 'paid' ? 'badge-success' :
                      payout.status === 'error' ? 'badge-error' :
                      'badge-neutral'
                    }`}>
                      {payout.status}
                    </span>
                  </td>
                  <td>{new Date(payout.createdAt).toLocaleString('ru-RU')}</td>
                  <td>
                    {payout.status === 'requested' && (
                      <button
                        onClick={() => handleComplete(payout.id)}
                        className="btn btn-success"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        disabled={processing === payout.id}
                      >
                        {processing === payout.id ? 'Обработка...' : 'Подтвердить'}
                      </button>
                    )}
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
