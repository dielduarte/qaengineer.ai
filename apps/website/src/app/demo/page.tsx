import { Suspense } from 'react';
import { Login } from './Login';

export default function DemoPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
