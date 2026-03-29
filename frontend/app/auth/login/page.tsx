'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Music2 } from 'lucide-react';
import { login } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await login(email, password);
      localStorage.setItem('token', token);
      router.push('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || '登入失敗，請檢查帳號密碼');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Music2 size={40} className="text-purple-400 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white">製作人登入</h1>
          <p className="text-gray-400 text-sm mt-1">管理你的作品與訂單</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1A1A1A] rounded-2xl p-8 border border-[#333] space-y-5">
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm text-gray-400 block mb-1.5">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-4 py-3 bg-[#242424] border border-[#444] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 text-sm"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1.5">密碼</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-4 py-3 bg-[#242424] border border-[#444] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors"
          >
            {loading ? '登入中...' : '登入'}
          </button>

          <p className="text-center text-sm text-gray-400">
            還沒有帳號？{' '}
            <Link href="/auth/register" className="text-purple-400 hover:text-purple-300">
              立即註冊
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
