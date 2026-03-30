'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Download, Loader2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || '';

interface OrderItem {
  beatTitle: string;
  licenseType: string;
  price: number;
  downloadToken: string;
  downloadCount: number;
  downloadExpires: string;
}

interface OrderStatus {
  id: string;
  status: string;
  buyer_name: string;
  buyer_email: string;
  total_amount: number;
  paid_at: string | null;
  items: OrderItem[];
}

function ResultContent() {
  const searchParams = useSearchParams();
  const rtnCode = searchParams.get('RtnCode');
  const merchantTradeNo = searchParams.get('MerchantTradeNo');

  // ECPay sends RtnCode=1 for success, everything else is fail
  // But result page may also be loaded directly without query params (e.g. after redirect)
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [tradeNo, setTradeNo] = useState<string | null>(null);

  useEffect(() => {
    // Try MerchantTradeNo from query param first, then sessionStorage
    const no = merchantTradeNo || sessionStorage.getItem('lastTradeNo');
    setTradeNo(no);
    if (!no) {
      setLoading(false);
      return;
    }

    const poll = async (attempts = 0) => {
      try {
        const res = await fetch(`${API_BASE}/orders/status/${no}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
          // If still pending and haven't tried too many times, retry
          if (data.status === 'pending' && attempts < 5) {
            setTimeout(() => poll(attempts + 1), 2000);
            return;
          }
        }
      } catch { /* silent */ }
      setLoading(false);
    };

    poll();
  }, [merchantTradeNo]);

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: '#7c3aed' }} />
          <p className="text-white">確認付款狀態中…</p>
        </div>
      </div>
    );
  }

  // Determine success: either RtnCode=1 from ECPay redirect, or order.status=paid from DB
  const isPaid = order?.status === 'paid' || rtnCode === '1';

  if (!tradeNo || (!order && !rtnCode)) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <XCircle size={56} className="mx-auto mb-4" style={{ color: '#f87171' }} />
          <h1 className="text-2xl font-bold text-white mb-2">找不到訂單</h1>
          <Link href="/beats" className="mt-4 inline-block text-sm" style={{ color: '#a78bfa' }}>返回瀏覽伴奏</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-xl mx-auto px-4 py-16">
        {isPaid ? (
          <>
            {/* Success */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                style={{ background: 'rgba(52,211,153,0.15)' }}>
                <CheckCircle size={44} style={{ color: '#34d399' }} />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">付款成功！</h1>
              <p style={{ color: '#8888aa' }}>
                下載連結已寄送至 <span className="text-white">{order?.buyer_email}</span>
              </p>
            </div>

            {/* Download links */}
            {order?.items && order.items.length > 0 && (
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'var(--bg-card)' }}>
                <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <h2 className="text-white font-semibold">你的下載連結</h2>
                  <p className="text-xs mt-0.5" style={{ color: '#555' }}>連結有效期 7 天，每個限下載 3 次</p>
                </div>
                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  {order.items.map((item) => {
                    const downloadUrl = `${SITE}/api/orders/download/${item.downloadToken}`.replace(/\/api\/api\//, '/api/');
                    const backendUrl = `${API_BASE}/orders/download/${item.downloadToken}`;
                    return (
                      <div key={item.downloadToken} className="flex items-center justify-between px-5 py-4 gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{item.beatTitle}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#8888aa' }}>{item.licenseType} License</p>
                        </div>
                        <a
                          href={backendUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg shrink-0 transition-all hover:scale-105"
                          style={{ background: 'rgba(124,58,237,0.25)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)' }}
                        >
                          <Download size={12} />
                          下載 ({3 - (item.downloadCount || 0)} 次剩餘)
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-8 text-center">
              <Link href="/beats" className="text-sm transition-colors hover:text-white" style={{ color: '#8888aa' }}>
                繼續瀏覽伴奏
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Failed */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                style={{ background: 'rgba(239,68,68,0.15)' }}>
                <XCircle size={44} style={{ color: '#f87171' }} />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">付款失敗</h1>
              <p style={{ color: '#8888aa' }}>請重新嘗試，或選擇其他付款方式</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/cart"
                className="block text-center py-3 rounded-xl font-semibold text-white transition-all"
                style={{ background: 'rgba(124,58,237,0.8)' }}>
                返回購物車重試
              </Link>
              <Link href="/beats"
                className="block text-center py-3 rounded-xl font-medium transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', color: '#8888aa' }}>
                繼續瀏覽
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CheckoutResultPage() {
  return (
    <Suspense fallback={
      <div className="pt-16 min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: '#7c3aed' }} />
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
