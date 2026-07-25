import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '../Button/Button';
import { ButtonVariant, ButtonSize } from '../Button/types';
import { API_CONFIG } from '../../../config/api';

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
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await fetch(API_CONFIG.endpoints.logout, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      window.location.reload();
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
      style={{ width: 'auto' }}
    >
      Sign out
    </Button>
  );
}
