'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause, ShoppingCart, ArrowLeft, Music, MessageCircle, Check } from 'lucide-react';
import { getBeat, Beat } from '@/lib/api';
import { usePlayerStore, useCartStore } from '@/lib/store';
import { incrementPlay } from '@/lib/api';

const LICENSE_INFO = {
  basic:     { label: 'Basic',     color: '#60a5fa', includes: ['MP3 320kbps', '有限發行 (2,500)', '非獨家授權'] },
  premium:   { label: 'Premium',   color: '#a78bfa', includes: ['WAV + MP3', '無限發行', '非獨家授權', '廣播授權'] },
  exclusive: { label: 'Exclusive', color: '#fbbf24', includes: ['所有格式', '獨家買斷', '商業授權', 'Stems 分軌'] },
};

export default function BeatDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [beat, setBeat] = useState<Beat | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLicense, setSelectedLicense] = useState<string>('');
  const [added, setAdded] = useState(false);

  const { currentTrack, isPlaying, play, pause, resume } = usePlayerStore();
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!id) return;
    getBeat(id).then((data) => {
      setBeat(data);
      const cheapest = data.licenses?.filter(l => l.is_available).sort((a, b) => a.price - b.price)[0];
      if (cheapest) setSelectedLicense(cheapest.id);
    }).catch(() => router.push('/beats')).finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return (
    <div className="pt-16 min-h-screen flex items-center justify-center" style={{ background: '#080810' }}>
      <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
    </div>
  );

  if (!beat) return null;

  const isCurrentTrack = currentTrack?.id === beat.id;
  const isActive = isCurrentTrack && isPlaying;

  const handlePlay = () => {
    if (isCurrentTrack) { isPlaying ? pause() : resume(); return; }
    incrementPlay(beat.id).catch(() => {});
    play({ id: beat.id, title: beat.title, producerName: beat.producer.name, coverUrl: beat.cover_url || null, previewUrl: beat.preview_url, genre: beat.genre, bpm: beat.bpm });
  };

  const handleAddToCart = () => {
    const lic = beat.licenses?.find(l => l.id === selectedLicense);
    if (!lic) return;
    addItem({ beatId: beat.id, licenseId: lic.id, beatTitle: beat.title, producerName: beat.producer.name, coverUrl: beat.cover_url || null, licenseType: lic.type, price: lic.price });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const selectedLic = beat.licenses?.find(l => l.id === selectedLicense);

  return (
    <div className="pt-16 min-h-screen" style={{ background: '#080810' }}>
      {/* Background glow */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full animate-glow-pulse"
          style={{ background: 'radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-8">
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-sm mb-8 transition-colors"
          style={{ color: '#8888aa' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#8888aa'}>
          <ArrowLeft size={16} /> 返回
        </button>

        <div className="grid md:grid-cols-[320px_1fr] gap-8">
          {/* Cover */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer" onClick={handlePlay}
              style={{ boxShadow: isCurrentTrack ? '0 0 40px rgba(124,58,237,0.3)' : '0 20px 40px rgba(0,0,0,0.5)' }}>
              {beat.cover_url ? (
                <Image src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${beat.cover_url}`}
                  alt={beat.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.5),#0a0a14)' }}>
                  <Music size={64} style={{ color: '#a78bfa', opacity: 0.5 }} />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                <div className="w-16 h-16 rounded-full flex items-center justify-center btn-glow">
                  {isActive ? <Pause size={28} fill="white" className="text-white" /> : <Play size={28} fill="white" className="text-white ml-1" />}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {beat.genre && <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>{beat.genre}</span>}
              {beat.bpm && <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: '#8888aa' }}>{beat.bpm} BPM</span>}
              {beat.key && <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: '#8888aa' }}>Key: {beat.key}</span>}
              {beat.mood && <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: '#8888aa' }}>{beat.mood}</span>}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-2">{beat.title}</h1>
              <Link href={`/producers/${beat.producer.id}`}
                className="flex items-center gap-2 text-sm hover:text-white transition-colors w-fit"
                style={{ color: '#a78bfa' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
                  {beat.producer.name[0]}
                </div>
                {beat.producer.name}
              </Link>
            </div>

            {/* License selector */}
            {beat.licenses?.filter(l => l.is_available).length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">選擇授權方案</h3>
                {beat.licenses.filter(l => l.is_available).map((lic) => {
                  const info = LICENSE_INFO[lic.type];
                  const isSelected = selectedLicense === lic.id;
                  return (
                    <button key={lic.id} onClick={() => setSelectedLicense(lic.id)}
                      className="w-full text-left p-4 rounded-2xl transition-all"
                      style={{
                        background: isSelected ? `${info.color}18` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isSelected ? `${info.color}60` : 'rgba(255,255,255,0.07)'}`,
                      }}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-sm" style={{ color: isSelected ? info.color : '#fff' }}>{info.label}</div>
                          <div className="mt-1.5 space-y-0.5">
                            {info.includes.map((item) => (
                              <div key={item} className="flex items-center gap-1.5 text-xs" style={{ color: '#8888aa' }}>
                                <Check size={10} style={{ color: info.color }} /> {item}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black" style={{ color: info.color }}>
                            NT${lic.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex gap-3">
              <button onClick={handlePlay}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                {isActive ? <><Pause size={16} /> 暫停</> : <><Play size={16} /> 試聽</>}
              </button>

              {selectedLic && !beat.is_sold_out && (
                <button onClick={handleAddToCart}
                  className="btn-glow flex-1 flex items-center justify-center gap-2 py-3 text-white rounded-xl font-bold text-sm">
                  {added ? <><Check size={16} /> 已加入購物車</> : <><ShoppingCart size={16} /> 加入購物車 · NT${selectedLic.price.toLocaleString()}</>}
                </button>
              )}
            </div>

            {/* Contact */}
            <Link href={`/producers/${beat.producer.id}`}
              className="flex items-center gap-2 text-sm transition-colors w-fit"
              style={{ color: '#8888aa' }}>
              <MessageCircle size={14} />
              聯絡 {beat.producer.name} 詢問客製化編曲
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
