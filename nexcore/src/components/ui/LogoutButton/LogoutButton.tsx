'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button, ButtonVariant, ButtonSize } from '../Button';

interface LogoutButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  showIcon?: boolean;
}

export function LogoutButton({
  variant = ButtonVariant.GHOST,
  size = ButtonSize.SM,
  className,
  showIcon = true,
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
      router.refresh();
    } catch {
      // Fallback redirect
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      isLoading={isLoading}
      onClick={handleLogout}
      leftIcon={showIcon ? <LogOut size={16} /> : undefined}
      className={className}
    >
      Sign out
    </Button>
  );
}
