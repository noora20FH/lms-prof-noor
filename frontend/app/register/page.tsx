"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
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
import { Loader2, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [nim, setNim] = useState("");
  const [class_, setClass_] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok!");
      setLoading(false);
      return;
    }

    try {
      await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/sanctum/csrf-cookie`, {
        withCredentials: true,
      });

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/register`,
        {
          name,
          nim,
          class: class_,
          email,
          password,
          password_confirmation: confirmPassword,
          role: "student",
        },
        { withCredentials: true }
      );

      setSuccess("Registrasi berhasil! Mengalihkan ke halaman login...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      console.error("Register error:", err.response?.data);
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.email?.[0] ||
          "Registrasi gagal. Silakan coba lagi!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172B] via-[#0D542B] to-[#004F3B] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl shadow-2xl border-0">
        <CardHeader className="space-y-1 text-center pb-6">

          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#0D542B] to-[#004F3B] rounded-2xl flex items-center justify-center text-3xl mb-4">
            📚
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Portal Mahasiswa
          </CardTitle>
          <CardDescription className="text-gray-600">
            Buat akun baru untuk mengakses LMS
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 p-6">
          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-700">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" type="text" placeholder="" value={name} onChange={(e) => setName(e.target.value)} required className="h-12" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nim">NIM</Label>
              <Input id="nim" type="text" placeholder="" value={nim} onChange={(e) => setNim(e.target.value)} required className="h-12" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class_">Kelas</Label>
              <Input id="class_" type="text" placeholder="contoh: TL-1A" value={class_} onChange={(e) => setClass_(e.target.value)} required className="h-12" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="h-12" />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#0D542B] to-[#004F3B] hover:opacity-90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Mendaftar...
                </>
              ) : (
                "Daftar Sekarang"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-gray-600">Sudah punya akun? </span>
            <Link href="/login" className="font-medium text-[#0D542B] hover:underline">
              Masuk di sini
            </Link>
          </div>

          <div className="text-xs text-center text-gray-500">
            © 2026 LMS Prof. M. Noor Hidayat. All rights reserved.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}