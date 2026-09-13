"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, getErrorMessage } from "@/lib/api";

type ResetPasswordResponse = {
  message?: string;
};

export default function ResetPasswordContent() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const linkIsValid = useMemo(() => Boolean(token && email), [token, email]);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!linkIsValid) {
      setError(
        "Link reset password tidak valid atau tidak lengkap. Silakan minta link reset password yang baru."
      );
      return;
    }

    if (password.length < 8) {
      setError("Kata sandi baru minimal terdiri dari 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    try {
      setLoading(true);

      await api.post<ResetPasswordResponse>("/api/reset-password", {
        token,
        email,
        password,
        password_confirmation: confirmPassword,
      });

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Reset password error:", err);
      setError(
        getErrorMessage(
          err,
          "Link reset password tidak valid atau telah kedaluwarsa. Silakan minta link baru."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F172B] via-[#0D542B] to-[#004F3B] p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl shadow-2xl border-0">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#0D542B] to-[#004F3B] rounded-2xl flex items-center justify-center text-3xl mb-4">
            {success ? "✓" : "📚"}
          </div>

          <CardTitle className="text-3xl font-bold text-gray-900">
            {success ? "Kata Sandi Berhasil Diperbarui" : "Reset Password"}
          </CardTitle>

          <CardDescription className="text-gray-600">
            {success
              ? "Kata sandi akun LMS Anda telah berhasil diperbarui."
              : "Buat kata sandi baru untuk akun LMS Prof. Noor Anda."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="space-y-6">
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Silakan masuk kembali menggunakan kata sandi baru Anda.
                </AlertDescription>
              </Alert>

              <Button
                asChild
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#0D542B] to-[#004F3B] hover:opacity-90"
              >
                <Link href="/id/login">Masuk ke LMS</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {!linkIsValid && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Link reset password tidak valid atau tidak lengkap. Silakan minta
                    link reset password yang baru dari halaman login.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  aria-readonly="true"
                  className="h-12 bg-gray-50 text-gray-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Kata sandi baru</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  autoComplete="new-password"
                  required
                  disabled={!linkIsValid || loading}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Konfirmasi kata sandi</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  placeholder="Ulangi kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  autoComplete="new-password"
                  required
                  disabled={!linkIsValid || loading}
                  className="h-12"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#0D542B] to-[#004F3B] hover:opacity-90"
                disabled={!linkIsValid || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Atur Ulang Kata Sandi"
                )}
              </Button>

              <div className="text-center text-sm">
                <Link
                  href="/id/login"
                  className="font-medium text-[#0D542B] hover:underline"
                >
                  Kembali ke halaman login
                </Link>
              </div>
            </form>
          )}

          <div className="mt-8 text-xs text-center text-gray-500">
            © 2026 LMS Prof. M. Noor Hidayat. All rights reserved.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
