'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

// Import logic demo statis (terpisah)
import { demoAccounts } from '@/lib/demo-accounts';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // ==================== LOGIN STATIS (menggunakan data dari lib/demo-accounts.ts) ====================
    const { professor, student } = demoAccounts;

    if (email === professor.email && password === professor.password) {
      localStorage.setItem('token', 'static-demo-token-professor');
      router.push(professor.redirectTo);   // ← /professor/dashboard
      setLoading(false);
      return;
    }

    if (email === student.email && password === student.password) {
      localStorage.setItem('token', 'static-demo-token-student');
      router.push(student.redirectTo);     // ← /student/dashboard
      setLoading(false);
      return;
    }

    // Jika salah
    setError('Email atau password salah. Gunakan akun demo di bawah.');
    setLoading(false);
    // ============================================================================================

    // ==================== KODE DINAMIS LARAVEL (jangan dihapus) ====================
    /*
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/login`,
        { email, password },
        { withCredentials: true }
      );

      localStorage.setItem('token', response.data.token);
      
      const role = response.data.user.role;
      if (role === 'professor') {
        router.push('/professor/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal. Cek email/password!');
    } finally {
      setLoading(false);
    }
    */
    // =========================================================================
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F172B] via-[#0D542B] to-[#004F3B] p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl shadow-2xl border-0">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#0D542B] to-[#004F3B] rounded-2xl flex items-center justify-center text-3xl mb-4">
            📚
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">LMS Portal</CardTitle>
          <CardDescription className="text-gray-600">
            Masuk ke akun Anda
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
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
                  Logging in...
                </>
              ) : (
                'Masuk'
              )}
            </Button>
          </form>

          {/* Info Demo Accounts */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl text-xs border border-gray-200">
            <p className="font-medium text-gray-700 mb-2">🔑 Akun Demo (untuk testing):</p>
            <p><strong>Professor:</strong> {demoAccounts.professor.email}</p>
            <p><strong>Student:</strong> {demoAccounts.student.email}</p>
            <p className="text-gray-500 mt-1">Password: <span className="font-mono">password</span></p>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Belum punya akun? </span>
            <Link href="/register" className="font-medium text-[#0D542B] hover:underline">
              Daftar sekarang
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