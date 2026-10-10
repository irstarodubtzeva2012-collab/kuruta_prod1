'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import Link from 'next/link';

export default function AntiFraud() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [signals, setSignals] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    severity: '',
    status: 'pending',
  });
  const [loadingData, setLoadingData] = useState(true);
  const [selectedSignal, setSelectedSignal] = useState<any>(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadSignals();
    }
  }, [user, loading, filters]);

  const loadSignals = async () => {
    setLoadingData(true);
    try {
      const data = await apiClient.getAntiFraudSignals(filters);
      setSignals(data.items || []);
    } catch (error) {
      console.error('Failed to load signals:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleReview = async () => {
    if (!selectedSignal || !reviewStatus) return;

    setProcessing(true);
    try {
      await apiClient.reviewAntiFraudSignal(selectedSignal.id, reviewStatus, reviewComment);
      alert('Сигнал обработан');
      setSelectedSignal(null);
      setReviewStatus('');
      setReviewComment('');
      loadSignals();
    } catch (error: any) {
      alert(error.message || 'Ошибка обработки');
    } finally {
      setProcessing(false);
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
            Антифрод сигналы
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Мониторинг подозрительной активности
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
            <label className="form-label">Severity</label>
            <select
              className="form-input"
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
            >
              <option value="">Все</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="form-label">Статус</label>
            <select
              className="form-input"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="pending">Ожидают проверки</option>
              <option value="confirmed">Подтверждены</option>
              <option value="dismissed">Отклонены</option>
              <option value="">Все</option>
            </select>
          </div>
        </div>
      </div>

      {/* Signals Table */}
      <div className="card">
        {loadingData ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner"></div>
          </div>
        ) : signals.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
            Сигналы не найдены
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Тип</th>
                <th>Severity</th>
                <th>Заголовок</th>
                <th>Пользователь</th>
                <th>Статус</th>
                <th>Дата</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {signals.map((signal) => (
                <tr key={signal.id}>
                  <td>
                    <span className="badge badge-info">{signal.type}</span>
                  </td>
                  <td>
                    <span className={`badge ${
                      signal.severity === 'critical' ? 'badge-error' :
                      signal.severity === 'high' ? 'badge-warning' :
                      signal.severity === 'medium' ? 'badge-info' :
                      'badge-neutral'
                    }`}>
                      {signal.severity}
                    </span>
                  </td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {signal.title}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    {signal.userId ? signal.userId.substring(0, 8) + '...' : '-'}
                  </td>
                  <td>
                    <span className={`badge ${
                      signal.status === 'pending' ? 'badge-warning' :
                      signal.status === 'confirmed' ? 'badge-error' :
                      signal.status === 'dismissed' ? 'badge-success' :
                      'badge-neutral'
                    }`}>
                      {signal.status}
                    </span>
                  </td>
                  <td>{new Date(signal.createdAt).toLocaleString('ru-RU')}</td>
                  <td>
                    <button
                      onClick={() => setSelectedSignal(signal)}
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Проверить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Review Modal */}
      {selectedSignal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div className="card" style={{ maxWidth: '700px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
              Проверка сигнала
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <strong>Тип:</strong> <span className="badge badge-info">{selectedSignal.type}</span>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <strong>Severity:</strong> <span className={`badge ${
                selectedSignal.severity === 'critical' ? 'badge-error' :
                selectedSignal.severity === 'high' ? 'badge-warning' :
                'badge-info'
              }`}>{selectedSignal.severity}</span>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <strong>Заголовок:</strong>
              <div style={{ marginTop: '8px', padding: '12px', background: 'var(--bg)', borderRadius: '8px' }}>
                {selectedSignal.title}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <strong>Описание:</strong>
              <div style={{ marginTop: '8px', padding: '12px', background: 'var(--bg)', borderRadius: '8px' }}>
                {selectedSignal.description}
              </div>
            </div>

            {selectedSignal.metadata && (
              <div style={{ marginBottom: '20px' }}>
                <strong>Метаданные:</strong>
                <pre style={{ marginTop: '8px', padding: '12px', background: 'var(--bg)', borderRadius: '8px', fontSize: '12px', overflow: 'auto' }}>
                  {JSON.stringify(selectedSignal.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Статус *</label>
              <select
                className="form-input"
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
                required
              >
                <option value="">Выберите статус</option>
                <option value="confirmed">Подтвердить (нарушение)</option>
                <option value="dismissed">Отклонить (ложное срабатывание)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Комментарий</label>
              <textarea
                className="form-textarea"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Объясните ваше решение..."
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleReview}
                className="btn btn-primary"
                disabled={processing || !reviewStatus}
              >
                {processing ? 'Обработка...' : 'Сохранить'}
              </button>
              <button
                onClick={() => {
                  setSelectedSignal(null);
                  setReviewStatus('');
                  setReviewComment('');
                }}
                className="btn btn-secondary"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
