'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/store';

const LICENSE_LABELS: Record<string, string> = {
  basic: 'Basic License',
  premium: 'Premium License',
  exclusive: 'Exclusive License',
};

export default function CartPage() {
  const { items, removeItem, total } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={48} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-white text-xl font-semibold mb-2">購物車是空的</h2>
          <p className="text-gray-400 mb-6">去挑選一些喜歡的伴奏吧！</p>
          <Link href="/beats" className="px-6 py-3 bg-purple-700 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors">
            瀏覽伴奏
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-8">購物車</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Items */}
          <div className="md:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={`${item.beatId}-${item.licenseId}`}
                className="flex items-center gap-4 bg-[#1A1A1A] rounded-xl p-4 border border-[#333]">
                {item.coverUrl ? (
                  <Image
                    src={`http://localhost:4000${item.coverUrl}`}
                    alt={item.beatTitle}
                    width={56} height={56}
                    className="rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-purple-900 flex items-center justify-center shrink-0 text-xl">🎵</div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{item.beatTitle}</p>
                  <p className="text-gray-400 text-sm truncate">{item.producerName}</p>
                  <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded mt-1 inline-block">
                    {LICENSE_LABELS[item.licenseType] || item.licenseType}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-white font-bold">NT${item.price.toLocaleString()}</span>
                  <button onClick={() => removeItem(item.beatId, item.licenseId)}
                    className="text-gray-500 hover:text-red-400 transition-colors p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#333] h-fit">
            <h3 className="text-white font-semibold mb-4">訂單摘要</h3>
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={`${item.beatId}-${item.licenseId}`} className="flex justify-between text-sm">
                  <span className="text-gray-400 truncate mr-2">{item.beatTitle}</span>
                  <span className="text-gray-300 shrink-0">NT${item.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#333] pt-4 mb-6">
              <div className="flex justify-between text-white font-bold text-lg">
                <span>合計</span>
                <span>NT${total().toLocaleString()}</span>
              </div>
            </div>
            <button className="w-full py-3 bg-purple-700 hover:bg-purple-600 text-white rounded-xl font-semibold transition-colors">
              前往結帳
            </button>
            <Link href="/beats" className="block text-center text-sm text-gray-400 hover:text-white mt-3 transition-colors">
              繼續購物
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
