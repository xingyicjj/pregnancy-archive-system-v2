import React, { useState } from 'react';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { PasswordResetPage } from './PasswordResetPage';

type AuthMode = 'login' | 'register' | 'passwordReset';

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <>
      {mode === 'login' && (
        <LoginPage
          onSwitchToRegister={() => setMode('register')}
          onSwitchToPasswordReset={() => setMode('passwordReset')}
        />
      )}
      {mode === 'register' && (
        <RegisterPage onSwitchToLogin={() => setMode('login')} />
      )}
      {mode === 'passwordReset' && (
        <PasswordResetPage
          onBackToLogin={() => setMode('login')}
          onResetSuccess={() => setMode('login')}
        />
      )}
    </>
  );
}
