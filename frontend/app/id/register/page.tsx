import { Suspense } from "react";

import RegisterContent from "./RegisterContent";

function RegisterFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-gray-500">
        Memuat halaman registrasi...
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterContent />
    </Suspense>
  );
}