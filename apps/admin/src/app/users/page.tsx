'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import Link from 'next/link';

export default function Users() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [blockReason, setBlockReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadUsers();
    }
  }, [user, loading]);

  const loadUsers = async () => {
    setLoadingData(true);
    try {
      const data = await apiClient.getUsers(50, 0);
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleBlock = async () => {
    if (!selectedUser || !blockReason) return;

    setProcessing(true);
    try {
      await apiClient.blockUser(selectedUser.id, blockReason);
      alert('Пользователь заблокирован');
      setSelectedUser(null);
      setBlockReason('');
      loadUsers();
    } catch (error: any) {
      alert(error.message || 'Ошибка блокировки');
    } finally {
      setProcessing(false);
    }
  };

  const handleUnblock = async (userId: string) => {
    if (!confirm('Разблокировать пользователя?')) return;

    setProcessing(true);
    try {
      await apiClient.unblockUser(userId);
      alert('Пользователь разблокирован');
      loadUsers();
    } catch (error: any) {
      alert(error.message || 'Ошибка разблокировки');
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
            Пользователи
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Управление пользователями системы
          </p>
        </div>
        <Link href="/" className="btn btn-secondary">
          ← Назад
        </Link>
      </div>

      {/* Users Table */}
      <div className="card">
        {loadingData ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner"></div>
          </div>
        ) : users.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
            Пользователи не найдены
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Имя</th>
                <th>Роли</th>
                <th>Статус</th>
                <th>Регистрация</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.displayName || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {u.roles?.map((role: string) => (
                        <span key={role} className="badge badge-info">{role}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      u.status === 'active' ? 'badge-success' :
                      u.status === 'blocked' ? 'badge-error' :
                      'badge-neutral'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString('ru-RU')}</td>
                  <td>
                    {u.status === 'blocked' ? (
                      <button
                        onClick={() => handleUnblock(u.id)}
                        className="btn btn-success"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        disabled={processing}
                      >
                        Разблокировать
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="btn btn-error"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        Заблокировать
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Block Modal */}
      {selectedUser && (
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
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
              Блокировка пользователя
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <strong>Email:</strong> {selectedUser.email}
            </div>

            <div className="form-group">
              <label className="form-label">Причина блокировки *</label>
              <textarea
                className="form-textarea"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Укажите причину блокировки..."
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleBlock}
                className="btn btn-error"
                disabled={processing || !blockReason}
              >
                {processing ? 'Обработка...' : 'Заблокировать'}
              </button>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setBlockReason('');
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
