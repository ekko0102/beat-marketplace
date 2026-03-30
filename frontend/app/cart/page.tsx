'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingBag, Music } from 'lucide-react';
import { useCartStore } from '@/lib/store';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '');
const mediaUrl = (url?: string | null) => !url ? null : url.startsWith('http') ? url : `${API_BASE}${url}`;

const LICENSE_LABELS: Record<string, string> = {
  basic: 'Basic License',
  premium: 'Premium License',
  exclusive: 'Exclusive License',
};

export default function CartPage() {
  const { items, removeItem, total } = useCartStore();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <ShoppingBag size={48} className="mx-auto mb-4" style={{ color: '#333' }} />
          <h2 className="text-white text-xl font-semibold mb-2">購物車是空的</h2>
          <p className="mb-6" style={{ color: '#8888aa' }}>去挑選一些喜歡的伴奏吧！</p>
          <Link href="/beats"
            className="px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-105"
            style={{ background: 'rgba(124,58,237,0.8)' }}>
            瀏覽伴奏
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-8">購物車</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Items */}
          <div className="md:col-span-2 space-y-3">
            {items.map((item) => {
              const cover = mediaUrl(item.coverUrl);
              return (
                <div key={`${item.beatId}-${item.licenseId}`}
                  className="flex items-center gap-4 rounded-xl p-4"
                  style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {cover ? (
                    <Image src={cover} alt={item.beatTitle} width={56} height={56}
                      className="rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(124,58,237,0.2)' }}>
                      <Music size={20} style={{ color: '#a78bfa', opacity: 0.6 }} />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{item.beatTitle}</p>
                    <p className="text-sm truncate mt-0.5" style={{ color: '#8888aa' }}>{item.producerName}</p>
                    <span className="text-xs px-2 py-0.5 rounded-md mt-1 inline-block"
                      style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>
                      {LICENSE_LABELS[item.licenseType] || item.licenseType}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold" style={{ color: '#a78bfa' }}>NT${item.price.toLocaleString()}</span>
                    <button onClick={() => removeItem(item.beatId, item.licenseId)}
                      className="p-1.5 rounded-lg transition-all hover:scale-110"
                      style={{ color: '#555' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="rounded-xl p-6 h-fit" style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-white font-semibold mb-4">訂單摘要</h3>
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={`${item.beatId}-${item.licenseId}`} className="flex justify-between text-sm">
                  <span className="truncate mr-2" style={{ color: '#8888aa' }}>{item.beatTitle}</span>
                  <span className="shrink-0" style={{ color: '#ccc' }}>NT${item.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="pt-4 mb-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex justify-between text-white font-bold text-lg">
                <span>合計</span>
                <span>NT${total().toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={() => router.push('/checkout')}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:scale-105 active:scale-95"
              style={{ background: 'rgba(124,58,237,0.85)' }}>
              前往結帳
            </button>
            <Link href="/beats" className="block text-center text-sm mt-3 transition-colors hover:text-white"
              style={{ color: '#8888aa' }}>
              繼續購物
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
