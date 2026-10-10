'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import Link from 'next/link';

export default function ModerationItem() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const queueId = params.id as string;

  const [queueItem, setQueueItem] = useState<any>(null);
  const [entityData, setEntityData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [decision, setDecision] = useState('');
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, loading]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      // Загружаем элемент очереди
      const queue = await apiClient.getModerationQueue({ limit: 1000 });
      const item = queue.items.find((i: any) => i.id === queueId);
      
      if (!item) {
        setError('Элемент не найден');
        return;
      }

      setQueueItem(item);

      // Загружаем данные сущности
      if (item.entityType === 'campaign') {
        const campaign = await apiClient.getCampaign(item.entityId);
        setEntityData(campaign);
      } else if (item.entityType === 'task') {
        const task = await apiClient.getTask(item.entityId);
        setEntityData(task);
      } else if (item.entityType === 'dispute') {
        const dispute = await apiClient.getDispute(item.entityId);
        setEntityData(dispute);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Ошибка загрузки данных');
    } finally {
      setLoadingData(false);
    }
  };

  const handleApprove = async () => {
    if (!decision) {
      setError('Укажите решение');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      if (queueItem.entityType === 'campaign') {
        await apiClient.approveCampaign(queueItem.entityId);
      } else if (queueItem.entityType === 'task') {
        await apiClient.approveTask(queueItem.entityId, comment);
      }

      await apiClient.approveModerationItem(queueId, decision, comment);
      router.push('/moderation');
    } catch (err: any) {
      setError(err.message || 'Ошибка обработки');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!decision || !comment) {
      setError('Укажите решение и комментарий');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      if (queueItem.entityType === 'campaign') {
        await apiClient.rejectCampaign(queueItem.entityId, comment);
      } else if (queueItem.entityType === 'task') {
        await apiClient.rejectTask(queueItem.entityId, comment);
      }

      await apiClient.rejectModerationItem(queueId, decision, comment);
      router.push('/moderation');
    } catch (err: any) {
      setError(err.message || 'Ошибка обработки');
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

  if (error && !queueItem) {
    return (
      <div className="container" style={{ paddingTop: '40px' }}>
        <div className="alert alert-error">{error}</div>
        <Link href="/moderation" className="btn btn-secondary">← Назад</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
            Задача модерации
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {queueItem?.entityType} • {queueItem?.entityId}
          </p>
        </div>
        <Link href="/moderation" className="btn btn-secondary">
          ← Назад
        </Link>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Entity Data */}
      {entityData && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
            Данные сущности
          </h2>

          {queueItem.entityType === 'campaign' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Название:</strong> {entityData.title}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Описание:</strong> {entityData.description}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Бюджет:</strong> {entityData.budget} ₽
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Количество заданий:</strong> {entityData.taskCount}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Статус:</strong> <span className="badge badge-info">{entityData.status}</span>
              </div>
              {entityData.requirements && (
                <div style={{ marginBottom: '16px' }}>
                  <strong>Требования:</strong>
                  <pre style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px', marginTop: '8px', fontSize: '12px' }}>
                    {JSON.stringify(entityData.requirements, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {queueItem.entityType === 'task' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Название:</strong> {entityData.title}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Описание:</strong> {entityData.description}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Статус:</strong> <span className="badge badge-info">{entityData.status}</span>
              </div>
              {entityData.proofData && (
                <div style={{ marginBottom: '16px' }}>
                  <strong>Доказательства:</strong>
                  <pre style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px', marginTop: '8px', fontSize: '12px' }}>
                    {JSON.stringify(entityData.proofData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {queueItem.entityType === 'dispute' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Причина:</strong> {entityData.reason}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Описание:</strong> {entityData.description}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Статус:</strong> <span className="badge badge-warning">{entityData.status}</span>
              </div>
              {entityData.evidence && (
                <div style={{ marginBottom: '16px' }}>
                  <strong>Доказательства:</strong>
                  <pre style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px', marginTop: '8px', fontSize: '12px' }}>
                    {JSON.stringify(entityData.evidence, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Decision Form */}
      <div className="card">
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
          Решение модератора
        </h2>

        <div className="form-group">
          <label className="form-label">Решение *</label>
          <input
            type="text"
            className="form-input"
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder="Например: approved, rejected"
            required
          />
        </div>

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

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleApprove}
            className="btn btn-success"
            disabled={processing}
          >
            {processing ? 'Обработка...' : '✓ Одобрить'}
          </button>
          <button
            onClick={handleReject}
            className="btn btn-error"
            disabled={processing}
          >
            {processing ? 'Обработка...' : '✗ Отклонить'}
          </button>
        </div>
      </div>
    </div>
  );
}
