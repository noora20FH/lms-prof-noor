import { Suspense } from "react";

import ResetPasswordContent from "./ResetPasswordContent";

function ResetPasswordFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-gray-500">Memuat halaman reset password...</p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
