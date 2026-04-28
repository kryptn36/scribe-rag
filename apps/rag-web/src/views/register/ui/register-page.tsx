import React from 'react';

import { RegisterForm } from '@/features/auth';

export function RegisterPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <RegisterForm />
    </div>
  );
}
