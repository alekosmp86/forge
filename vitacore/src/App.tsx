import { QueryProvider } from './providers/QueryProvider';
import { useCurrentUser } from './hooks/useCurrentUser';
import { LoginForm } from './features/auth/LoginForm';
import { Dashboard } from './features/dashboard/Dashboard';
import './globals.css';

function MainContent() {
  const { data: currentUser, isLoading } = useCurrentUser();

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

  return <Dashboard currentUser={currentUser} />;
}

export function App() {
  return (
    <QueryProvider>
      <MainContent />
    </QueryProvider>
  );
}

export default App;
