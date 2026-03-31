'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, Lock } from 'lucide-react';
import { useCartStore } from '@/lib/store';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '');
const mediaUrl = (url?: string | null) => !url ? null : url.startsWith('http') ? url : `${API_BASE}${url}`;

const LICENSE_LABELS: Record<string, string> = {
  basic: 'Basic License',
  premium: 'Premium License',
  exclusive: 'Exclusive License',
};

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const router = useRouter();

  const [hydrated, setHydrated] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ECPay auto-submit form
  const formRef = useRef<HTMLFormElement>(null);
  const [ecpayData, setEcpayData] = useState<{ url: string; params: Record<string, string> } | null>(null);

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (ecpayData && formRef.current) {
      formRef.current.submit();
    }
  }, [ecpayData]);

  if (!hydrated) return null;

  if (items.length === 0) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <ShoppingBag size={48} className="mx-auto mb-4" style={{ color: '#444' }} />
          <h2 className="text-white text-xl font-semibold mb-2">購物車是空的</h2>
          <Link href="/beats" className="mt-4 inline-block px-6 py-3 rounded-xl font-medium text-white transition-all"
            style={{ background: 'rgba(124,58,237,0.8)' }}>
            瀏覽伴奏
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${apiUrl}/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerName,
          buyerEmail,
          items: items.map((i) => ({ beatId: i.beatId, licenseId: i.licenseId })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || '建立訂單失敗');
        setLoading(false);
        return;
      }

      // Store tradeNo so result page can query status
      sessionStorage.setItem('lastTradeNo', data.tradeNo);
      clearCart();

      // Trigger ECPay auto-submit
      setEcpayData({ url: data.paymentUrl, params: data.params });
    } catch {
      setError('網路錯誤，請重試');
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* ECPay hidden auto-submit form */}
      {ecpayData && (
        <form ref={formRef} method="POST" action={ecpayData.url} style={{ display: 'none' }}>
          {Object.entries(ecpayData.params).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
        </form>
      )}

      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:text-white"
          style={{ color: '#8888aa' }}>
          <ArrowLeft size={14} /> 返回購物車
        </Link>

        <h1 className="text-2xl font-bold text-white mb-8">結帳</h1>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Left: buyer info form */}
          <div className="md:col-span-3">
            <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-white font-semibold mb-5">購買人資訊</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: '#8888aa' }}>姓名</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="你的姓名"
                    className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: '#8888aa' }}>Email（下載連結將寄至此信箱）</label>
                  <input
                    type="email"
                    required
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>

                {error && (
                  <p className="text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all"
                  style={{ background: loading ? 'rgba(124,58,237,0.4)' : 'rgba(124,58,237,0.9)', cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  <Lock size={14} />
                  {loading ? '處理中…' : '前往 ECPay 付款'}
                </button>

                <p className="text-xs text-center" style={{ color: '#444' }}>
                  付款由綠界科技 ECPay 提供，支援信用卡、ATM、超商付款
                </p>
              </form>
            </div>
          </div>

          {/* Right: order summary */}
          <div className="md:col-span-2">
            <div className="rounded-2xl p-5 sticky top-24" style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-white font-semibold mb-4">訂單內容</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => {
                  const cover = mediaUrl(item.coverUrl);
                  return (
                    <div key={`${item.beatId}-${item.licenseId}`} className="flex items-center gap-3">
                      {cover ? (
                        <Image src={cover} alt={item.beatTitle} width={40} height={40} className="rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-lg"
                          style={{ background: 'rgba(124,58,237,0.2)' }}>🎵</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.beatTitle}</p>
                        <p className="text-xs" style={{ color: '#8888aa' }}>{LICENSE_LABELS[item.licenseType] || item.licenseType}</p>
                      </div>
                      <span className="text-sm font-bold shrink-0" style={{ color: '#a78bfa' }}>NT${item.price.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
              <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>合計</span>
                  <span>NT${total().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
