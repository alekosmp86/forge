import { QueryProvider } from './providers/QueryProvider';
import { useCurrentUser } from './hooks/useCurrentUser';
import { LoginForm } from './features/auth/LoginForm';
import { Button } from './components/ui/Button/Button';
import { ButtonVariant, ButtonSize } from './components/ui/Button/types';
import { LogOut, ShieldCheck, User } from 'lucide-react';
import './globals.css';

function MainContent() {
  const { data: currentUser, isLoading } = useCurrentUser();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('forge_auth_token');
      window.location.reload();
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: 'var(--color-text-secondary)' }}>
        Loading session...
      </div>
    );
  }

  if (!currentUser) {
    return <LoginForm />;
  }

  return (
    <div style={{ padding: 'var(--space-8)', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <ShieldCheck style={{ color: 'var(--color-primary-600)' }} size={28} />
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)' }}>Vitacore Dashboard</h1>
        </div>
        <Button variant={ButtonVariant.SECONDARY} size={ButtonSize.SM} onClick={handleLogout} style={{ width: 'auto' }}>
          <LogOut size={16} style={{ marginRight: 'var(--space-2)' }} /> Sign out
        </Button>
      </header>

      <main style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <User style={{ width: '3rem', height: '3rem', color: 'var(--color-primary-600)' }} />
          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)' }}>{currentUser.name || 'Signed In User'}</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>{currentUser.email}</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--color-neutral-100)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            <strong>Role:</strong> <code style={{ backgroundColor: 'var(--color-neutral-200)', padding: '0.2rem 0.4rem', borderRadius: 'var(--radius-sm)' }}>{currentUser.role}</code>
          </p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
            <strong>User ID:</strong> {currentUser.id}
          </p>
        </div>
      </main>
    </div>
  );
}

export function App() {
  return (
    <QueryProvider>
      <MainContent />
    </QueryProvider>
  );
}

export default App;
