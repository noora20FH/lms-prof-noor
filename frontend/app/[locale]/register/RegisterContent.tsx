"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import { Link, useRouter } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
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
export default function RegisterContent() {
  const searchParams = useSearchParams();

  const selectedRole = searchParams.get("role");
  const router = useRouter();
  const t = useTranslations("Auth.register");
  const common = useTranslations("Common");

  const [name, setName] = useState("");
  const [nim, setNim] = useState("");
  const [kelas, setKelas] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      setLoading(false);
      return;
    }

    try {
      await csrf();

      await api.post("/api/register", {
        name,
        nim,
        class_: kelas,
        email,
        password,
        password_confirmation: confirmPassword,
        role: "student",
      });

      setSuccess(t("success"));

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      console.error("Register error:", err);
      setError(getErrorMessage(err, t("errorFallback")));
    } finally {
      setLoading(false);
    }
  };
  // Seluruh state, fungsi register, dan JSX register Anda
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F172B] via-[#0D542B] to-[#004F3B] p-4">
      <div className="fixed right-4 top-4 z-10">
        <LanguageSwitcher compact />
      </div>

      <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl shadow-2xl border-0">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#0D542B] to-[#004F3B] rounded-2xl flex items-center justify-center text-3xl mb-4">
            📚
          </div>

          <CardTitle className="text-3xl font-bold text-gray-900">
            {t("title")}
          </CardTitle>

          <CardDescription className="text-gray-600">
            {t("description")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">{common("fullName")}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nim">NIM</Label>
              <Input
                id="nim"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kelas">{common("class")}</Label>
              <Input
                id="kelas"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{common("email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{common("password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {common("confirmPassword")}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
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
                  {t("loading")}
                </>
              ) : (
                t("submit")
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">{t("hasAccount")} </span>
            <Link
              href="/login"
              className="font-medium text-[#0D542B] hover:underline"
            >
              {t("loginLink")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
