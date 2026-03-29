'use client';
import { useEffect, useState } from 'react';
import { getProducers, Producer } from '@/lib/api';
import ProducerCard from '@/components/ProducerCard';

export default function ProducersPage() {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducers()
      .then(setProducers)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-2">製作人</h1>
        <p className="text-gray-400 mb-8">認識我們的音樂製作人，聆聽他們的作品</p>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-52 rounded-xl bg-[#1A1A1A] animate-pulse" />
            ))}
          </div>
        ) : producers.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-3">🎛️</p>
            <p>目前還沒有製作人，快來加入我們！</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {producers.map((p) => <ProducerCard key={p.id} producer={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
