'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import Link from 'next/link';

export default function DisputeDetail() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const disputeId = params.id as string;

  const [dispute, setDispute] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [resolution, setResolution] = useState('');
  const [comment, setComment] = useState('');
  const [refundPercentage, setRefundPercentage] = useState(50);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadDispute();
    }
  }, [user, loading]);

  const loadDispute = async () => {
    setLoadingData(true);
    try {
      const data = await apiClient.getDispute(disputeId);
      setDispute(data);
    } catch (error) {
      console.error('Failed to load dispute:', error);
      setError('Ошибка загрузки спора');
    } finally {
      setLoadingData(false);
    }
  };

  const handleResolve = async () => {
    if (!resolution || !comment) {
      setError('Заполните все поля');
      return;
    }

    if (resolution === 'partial_refund' && (refundPercentage < 0 || refundPercentage > 100)) {
      setError('Процент возврата должен быть от 0 до 100');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      await apiClient.resolveDispute(
        disputeId,
        resolution,
        comment,
        resolution === 'partial_refund' ? refundPercentage : undefined
      );
      router.push('/disputes');
    } catch (err: any) {
      setError(err.message || 'Ошибка разрешения спора');
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

  if (loadingData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="container" style={{ paddingTop: '40px' }}>
        <div className="alert alert-error">{error || 'Спор не найден'}</div>
        <Link href="/disputes" className="btn btn-secondary">← Назад</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
            Спор #{dispute.id.substring(0, 8)}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {dispute.relatedType} • {dispute.status}
          </p>
        </div>
        <Link href="/disputes" className="btn btn-secondary">
          ← Назад
        </Link>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Dispute Info */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
          Информация о споре
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div>
            <strong>Тип сущности:</strong>
            <div style={{ marginTop: '4px' }}>
              <span className="badge badge-info">{dispute.relatedType}</span>
            </div>
          </div>

          <div>
            <strong>ID сущности:</strong>
            <div style={{ marginTop: '4px', fontFamily: 'monospace', fontSize: '12px' }}>
              {dispute.relatedId}
            </div>
          </div>

          <div>
            <strong>Статус:</strong>
            <div style={{ marginTop: '4px' }}>
              <span className={`badge ${
                dispute.status === 'opened' ? 'badge-warning' :
                dispute.status === 'investigating' ? 'badge-info' :
                dispute.status.startsWith('resolved') ? 'badge-success' :
                'badge-neutral'
              }`}>
                {dispute.status}
              </span>
            </div>
          </div>

          <div>
            <strong>Дата открытия:</strong>
            <div style={{ marginTop: '4px' }}>
              {new Date(dispute.createdAt).toLocaleString('ru-RU')}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <strong>Причина:</strong>
          <div style={{ marginTop: '8px', padding: '12px', background: 'var(--bg)', borderRadius: '8px' }}>
            {dispute.reason}
          </div>
        </div>

        {dispute.description && (
          <div style={{ marginTop: '16px' }}>
            <strong>Описание:</strong>
            <div style={{ marginTop: '8px', padding: '12px', background: 'var(--bg)', borderRadius: '8px' }}>
              {dispute.description}
            </div>
          </div>
        )}

        {dispute.evidence && (
          <div style={{ marginTop: '16px' }}>
            <strong>Доказательства:</strong>
            <pre style={{ marginTop: '8px', padding: '12px', background: 'var(--bg)', borderRadius: '8px', fontSize: '12px', overflow: 'auto' }}>
              {JSON.stringify(dispute.evidence, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Resolution Form */}
      {(dispute.status === 'opened' || dispute.status === 'investigating') && (
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
            Разрешение спора
          </h2>

          <div className="form-group">
            <label className="form-label">Решение *</label>
            <select
              className="form-input"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              required
            >
              <option value="">Выберите решение</option>
              <option value="in_favor_of_creator">В пользу креатора (полный возврат)</option>
              <option value="in_favor_of_executor">В пользу исполнителя (полная выплата)</option>
              <option value="partial_refund">Частичный возврат</option>
            </select>
          </div>

          {resolution === 'partial_refund' && (
            <div className="form-group">
              <label className="form-label">Процент возврата: {refundPercentage}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={refundPercentage}
                onChange={(e) => setRefundPercentage(Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <span>0% (исполнителю)</span>
                <span>100% (креатору)</span>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Комментарий *</label>
            <textarea
              className="form-textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Объясните ваше решение..."
              required
            />
          </div>

          <button
            onClick={handleResolve}
            className="btn btn-primary"
            disabled={processing}
          >
            {processing ? 'Обработка...' : 'Разрешить спор'}
          </button>
        </div>
      )}

      {dispute.status !== 'opened' && dispute.status !== 'investigating' && (
        <div className="alert alert-info">
          Этот спор уже разрешён и не может быть изменён.
        </div>
      )}
    </div>
  );
}
