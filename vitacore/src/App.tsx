import React from 'react';
import { AuthProvider } from './core/auth/AuthContext';
import { useAuth } from './core/auth/useAuth';
import { LoginForm } from './features/auth/LoginForm';
import { Button } from './components/ui/Button/Button';
import { LogOut, User, ShieldCheck } from 'lucide-react';
import './globals.css';

const MainContent: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#9ca3af' }}>
        Loading authentication state...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck style={{ color: '#6366f1' }} /> Vitacore Dashboard
        </h1>
        <Button variant="secondary" onClick={logout} style={{ width: 'auto' }}>
          <LogOut style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} /> Sign Out
        </Button>
      </header>

      <main style={{ backgroundColor: 'rgba(31, 41, 55, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <User style={{ width: '3rem', height: '3rem', color: '#6366f1' }} />
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>{user?.name || 'User'}</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{user?.email}</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}><strong>Role:</strong> {user?.role}</p>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}><strong>User ID:</strong> {user?.id}</p>
        </div>
      </main>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
