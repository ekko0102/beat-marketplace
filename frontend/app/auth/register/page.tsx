'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Disc3, Check } from 'lucide-react';
import { register } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, producer } = await register(name, email, password);
      localStorage.setItem('token', token);
      localStorage.setItem('producerName', producer.name);
      localStorage.setItem('producerId', producer.id);
      router.push('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || '註冊失敗，請再試一次');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4" style={{ background: '#080810' }}>
      {/* Background glow */}
      <div className="fixed top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full pointer-events-none animate-glow-pulse"
        style={{ background: 'radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 70%)', filter: 'blur(60px)' }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}>
            <Disc3 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">成為製作人</h1>
          <p className="text-sm mt-1" style={{ color: '#8888aa' }}>建立帳號，開始銷售你的伴奏</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-8 rounded-3xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-white block mb-2">製作人名稱</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              placeholder="你的藝名或品牌名稱"
              className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>

          <div>
            <label className="text-sm font-medium text-white block mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>

          <div>
            <label className="text-sm font-medium text-white block mb-2">密碼</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              placeholder="至少 8 個字元" minLength={8}
              className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>

          {/* What you get */}
          <div className="py-3 px-4 rounded-xl space-y-2"
            style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
            {['上傳並販售伴奏', '設定 Basic / Premium / Exclusive 授權', '接受街口、LinePay、信用卡付款', '管理訂單與客製化詢問'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs" style={{ color: '#a78bfa' }}>
                <Check size={12} /> {item}
              </div>
            ))}
          </div>

          <button type="submit" disabled={loading}
            className="w-full btn-glow py-3.5 text-white font-bold rounded-2xl text-sm disabled:opacity-50 transition-all">
            {loading
              ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 註冊中...</span>
              : '立即建立帳號'}
          </button>

          <p className="text-center text-sm" style={{ color: '#8888aa' }}>
            已有帳號？{' '}
            <Link href="/auth/login" className="font-medium transition-colors" style={{ color: '#a78bfa' }}>
              立即登入
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
