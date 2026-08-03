import { Suspense } from "react";

import LoginContent from "./LoginContent";

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-gray-500">
        Memuat halaman login...
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}