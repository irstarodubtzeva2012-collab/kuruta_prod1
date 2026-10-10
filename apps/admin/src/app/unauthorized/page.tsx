import Link from 'next/link';

export default function Unauthorized() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
    }}>
      <div className="card" style={{ textAlign: 'center', maxWidth: '500px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'var(--error)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          color: 'white',
          fontSize: '40px',
        }}>
          ⚠
        </div>
        
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>
          Доступ запрещён
        </h1>
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          У вас нет прав для доступа к административной панели.
          <br />
          Доступ разрешён только для ролей: moderator, admin, finance.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link href="/login" className="btn btn-primary">
            Вернуться на страницу входа
          </Link>
          <Link href="/" className="btn btn-secondary">
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
