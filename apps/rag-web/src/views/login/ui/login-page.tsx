import React from 'react';

import { LoginForm } from '@/features/auth';

export function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  );
}
