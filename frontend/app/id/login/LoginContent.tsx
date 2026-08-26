"use client";


import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api, csrf, getErrorMessage } from "@/lib/api";

type AuthUser = {
  id: number;
  name: string;
  email: string;
  nim?: string;
  class_?: string;
  role?: string;
};

type LoginResponse = {
  message?: string;
  user: AuthUser;
};

function dashboardPathByRole(role?: string) {
  if (role === "professor") return "/id/professor/dashboard";
  if (role === "student") return "/id/student/dashboard";
  if (role === "admin") return "/id/admin/dashboard";

  return null;
}

function normalizeRedirectTarget(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;

  const target = value === "/id" || value.startsWith("/id/")
    ? value
    : `/id${value}`;

  if (target.startsWith("/id/login") || target.startsWith("/id/register")) {
    return null;
  }

  return target;
}

export default function LoginContent() {
  const searchParams = useSearchParams();

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Seluruh state, fungsi login, dan JSX login Anda
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
  
      setLoading(true);
      setError("");
  
      try {
        await csrf();
  
        const { data } = await api.post<LoginResponse>("/api/login", {
          email,
          password,
        });
  
        const role = data.user?.role?.toLowerCase();
        const dashboardPath = dashboardPathByRole(role);
  
        if (!dashboardPath) {
          setError(`Peran pengguna tidak dikenali: ${data.user?.role ?? "-"}`);
          return;
        }
  
        const redirectTarget = normalizeRedirectTarget(searchParams.get("redirect"));
  
        router.replace(redirectTarget ?? dashboardPath);
        router.refresh();
      } catch (err) {
        console.error("Login error:", err);
        setError(getErrorMessage(err, "Login gagal. Silakan periksa email dan kata sandi Anda."));
      } finally {
        setLoading(false);
      }
    };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F172B] via-[#0D542B] to-[#004F3B] p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl shadow-2xl border-0">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#0D542B] to-[#004F3B] rounded-2xl flex items-center justify-center text-3xl mb-4">
            📚
          </div>

          <CardTitle className="text-3xl font-bold text-gray-900">
            {"Masuk"}
          </CardTitle>

          <CardDescription className="text-gray-600">
            {"Masuk ke akun LMS Anda"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{"Email"}</Label>
              <Input
                id="email"
                type="email"
                placeholder={"nama@email.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{"Kata sandi"}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#0D542B] to-[#004F3B] hover:opacity-90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {"Memproses..."}
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">{"Belum punya akun?"} </span>
            <Link
              href="/id/register"
              className="font-medium text-[#0D542B] hover:underline"
            >
              {"Daftar"}
            </Link>
          </div>

          <div className="mt-8 text-xs text-center text-gray-500">
            © 2026 LMS Prof. M. Noor Hidayat. All rights reserved.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}